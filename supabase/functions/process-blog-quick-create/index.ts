import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_CATEGORIES = [
  "Análisis",
  "Due Diligence", 
  "Estrategia",
  "Financiación",
  "Fiscalidad",
  "M&A",
  "Private Equity",
  "Valoración"
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { raw_content } = await req.json();
    
    if (!raw_content || typeof raw_content !== "string") {
      return new Response(
        JSON.stringify({ error: "raw_content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Calculate reading time (average 200 words per minute)
    const wordCount = raw_content.split(/\s+/).length;
    const reading_time = Math.max(1, Math.ceil(wordCount / 200));

    // Call AI to extract metadata using tool calling
    const metadataResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Eres un experto en SEO y marketing de contenidos para Capittal, una firma de asesoramiento M&A en España. 
Tu tarea es analizar el contenido de un artículo y extraer/generar metadatos optimizados para SEO.

Contexto de Capittal:
- Especialistas en fusiones y adquisiciones (M&A) en España
- Trabajan con Private Equity, Search Funds y compradores corporativos
- Público objetivo: empresarios, inversores, directivos financieros

Instrucciones:
- El título debe extraerse de la primera línea si parece un título, o generarse a partir del contenido
- El slug debe ser SEO-friendly: sin tildes, solo minúsculas, palabras separadas por guiones
- El excerpt debe ser atractivo y resumir el valor del artículo en 150-200 caracteres
- La categoría debe ser una de las válidas: ${VALID_CATEGORIES.join(", ")}
- Los tags deben ser 5-7 términos relevantes para SEO
- Meta título: máximo 60 caracteres, incluir palabra clave principal
- Meta descripción: máximo 160 caracteres, call-to-action implícito`
          },
          {
            role: "user",
            content: `Analiza este contenido y extrae los metadatos:\n\n${raw_content.substring(0, 8000)}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "process_blog_content",
              description: "Procesa contenido en bruto y extrae/genera todos los metadatos del blog post",
              parameters: {
                type: "object",
                properties: {
                  title: { 
                    type: "string", 
                    description: "Título del artículo (extraído de la primera línea o refinado)" 
                  },
                  slug: { 
                    type: "string", 
                    description: "URL slug SEO-friendly en español (sin tildes, solo guiones y minúsculas)" 
                  },
                  excerpt: { 
                    type: "string", 
                    description: "Resumen atractivo de 150-200 caracteres que enganche al lector" 
                  },
                  category: { 
                    type: "string", 
                    enum: VALID_CATEGORIES,
                    description: "Categoría más apropiada para el contenido" 
                  },
                  tags: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "5-7 tags relevantes para SEO y categorización" 
                  },
                  meta_title: { 
                    type: "string", 
                    description: "Meta título SEO optimizado (máximo 60 caracteres)" 
                  },
                  meta_description: { 
                    type: "string", 
                    description: "Meta descripción SEO optimizada (máximo 160 caracteres)" 
                  }
                },
                required: ["title", "slug", "excerpt", "category", "tags", "meta_title", "meta_description"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "process_blog_content" } }
      }),
    });

    if (!metadataResponse.ok) {
      const errorText = await metadataResponse.text();
      console.error("AI gateway error (metadata):", metadataResponse.status, errorText);
      
      if (metadataResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Límite de peticiones excedido. Inténtalo de nuevo en unos minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (metadataResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA agotados. Contacta con el administrador." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${metadataResponse.status}`);
    }

    const aiResult = await metadataResponse.json();
    
    // Extract the tool call result
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "process_blog_content") {
      throw new Error("Invalid AI response: no tool call found");
    }

    const metadata = JSON.parse(toolCall.function.arguments);
    const extractedTitle = metadata.title || extractTitleFromContent(raw_content);

    // Now format the content with AI for professional HTML structure
    let processedContent: string;
    try {
      processedContent = await formatContentWithAI(raw_content, extractedTitle, LOVABLE_API_KEY);
    } catch (formatError) {
      console.error("AI content formatting failed, using basic parser:", formatError);
      processedContent = processContentToHtml(raw_content);
    }

    // Validate and sanitize the response
    const result = {
      title: extractedTitle,
      slug: sanitizeSlug(metadata.slug),
      excerpt: metadata.excerpt?.substring(0, 250) || "",
      content: processedContent,
      category: VALID_CATEGORIES.includes(metadata.category) ? metadata.category : "M&A",
      tags: Array.isArray(metadata.tags) ? metadata.tags.slice(0, 7) : [],
      meta_title: metadata.meta_title?.substring(0, 60) || extractedTitle?.substring(0, 60) || "",
      meta_description: metadata.meta_description?.substring(0, 160) || metadata.excerpt?.substring(0, 160) || "",
      reading_time
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("process-blog-quick-create error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function extractTitleFromContent(content: string): string {
  const lines = content.trim().split("\n");
  const firstLine = lines[0]?.trim();
  
  // If first line looks like a title (shorter than 150 chars, no period at end)
  if (firstLine && firstLine.length < 150 && !firstLine.endsWith(".")) {
    return firstLine;
  }
  
  return "Nuevo artículo";
}

async function formatContentWithAI(rawContent: string, title: string, apiKey: string): Promise<string> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content: `Eres un editor experto en formatear artículos profesionales de M&A, finanzas corporativas y Private Equity para Capittal.

Tu tarea es convertir texto en bruto a HTML semántico, bien estructurado y profesional.

REGLAS DE FORMATEO:

1. **Estructura general**:
   - NO incluyas el título principal (ya va en otro campo)
   - Empieza directamente con el contenido
   - Crea una estructura lógica: introducción → secciones → conclusión

2. **Headings**:
   - Usa <h2> para secciones principales (máximo 4-6 por artículo)
   - Usa <h3> para subsecciones dentro de un <h2>
   - Los headings deben ser descriptivos y claros

3. **Párrafos**:
   - Agrupa oraciones relacionadas en <p> coherentes (2-4 oraciones por párrafo)
   - NO hagas un párrafo por cada línea del original
   - Mantén la cohesión temática

4. **Listas**:
   - Usa <ul><li> para enumerar elementos (3+ items)
   - Usa listas cuando el contenido original enumere beneficios, pasos, características, etc.
   - Cada <li> debe ser conciso y claro

5. **Negritas**:
   - Usa <strong> para destacar conceptos clave, términos técnicos importantes o datos relevantes
   - Máximo 3-5 negritas por sección (no abuses)

6. **Formato prohibido**:
   - NO uses clases CSS ni estilos inline
   - NO uses <h1> (reservado para el título)
   - NO uses markdown, solo HTML puro
   - NO añadas contenido que no esté en el original

DEVUELVE SOLO EL HTML, sin explicaciones, sin bloques de código, sin markdown.`
        },
        {
          role: "user",
          content: `Título del artículo: "${title}"

Contenido a formatear profesionalmente:

${rawContent}`
        }
      ],
      max_tokens: 8000,
      temperature: 0.3 // Low temperature for consistent formatting
    }),
  });

  if (!response.ok) {
    throw new Error(`AI formatting error: ${response.status}`);
  }

  const data = await response.json();
  let formattedContent = data.choices?.[0]?.message?.content;

  if (!formattedContent) {
    throw new Error("No content returned from AI");
  }

  // Clean up any markdown code blocks the AI might have added
  formattedContent = formattedContent
    .replace(/^```html?\n?/gm, "")
    .replace(/\n?```$/gm, "")
    .trim();

  // Remove the title if AI included it (check for h1 or first h2 matching title)
  const titleRegex = new RegExp(`<h[12]>\\s*${escapeRegex(title)}\\s*</h[12]>\\n?`, "i");
  formattedContent = formattedContent.replace(titleRegex, "");

  return formattedContent;
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Spaces to hyphens
    .replace(/-+/g, "-") // Multiple hyphens to single
    .replace(/^-|-$/g, "") // Trim hyphens
    .substring(0, 80);
}

function processContentToHtml(content: string): string {
  const lines = content.trim().split("\n");
  let html = "";
  let inList = false;
  let skipFirstLine = false;
  
  // Check if first line is a title (we'll skip it as it goes in the title field)
  const firstLine = lines[0]?.trim();
  if (firstLine && firstLine.length < 150 && !firstLine.endsWith(".")) {
    skipFirstLine = true;
  }
  
  for (let i = skipFirstLine ? 1 : 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // Skip empty lines but close list if open
    if (!line) {
      if (inList) {
        html += "</ul>\n";
        inList = false;
      }
      continue;
    }
    
    // Headers (## or lines followed by empty line that look like headers)
    if (line.startsWith("## ")) {
      if (inList) { html += "</ul>\n"; inList = false; }
      html += `<h2>${line.substring(3)}</h2>\n`;
      continue;
    }
    
    if (line.startsWith("### ")) {
      if (inList) { html += "</ul>\n"; inList = false; }
      html += `<h3>${line.substring(4)}</h3>\n`;
      continue;
    }
    
    // Check for bold headers (lines that are short and look like section titles)
    if (line.length < 80 && !line.endsWith(".") && !line.startsWith("-") && !line.startsWith("•")) {
      // Check if next line exists and is empty or starts differently
      const nextLine = lines[i + 1]?.trim();
      if (!nextLine || (nextLine && !nextLine.startsWith("-") && !nextLine.startsWith("•"))) {
        if (inList) { html += "</ul>\n"; inList = false; }
        html += `<h3>${line}</h3>\n`;
        continue;
      }
    }
    
    // List items
    if (line.startsWith("- ") || line.startsWith("• ")) {
      if (!inList) {
        html += "<ul>\n";
        inList = true;
      }
      html += `<li>${line.substring(2)}</li>\n`;
      continue;
    }
    
    // Regular paragraphs
    if (inList) { html += "</ul>\n"; inList = false; }
    
    // Process inline formatting
    line = line
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/👉/g, "→");
    
    html += `<p>${line}</p>\n`;
  }
  
  if (inList) {
    html += "</ul>\n";
  }
  
  return html.trim();
}
