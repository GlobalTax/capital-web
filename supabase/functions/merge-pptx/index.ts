import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * merge-pptx: Merges a template PPTX with auto-generated operation slides.
 *
 * A PPTX is a ZIP containing XML files. We use JSZip to:
 * 1. Open the user's template PPTX
 * 2. Open the operations-only PPTX (generated client-side with pptxgenjs)
 * 3. Extract operation slides from the ops PPTX
 * 4. Insert them after the designated separator slides in the template
 * 5. Update all internal XML references (Content_Types, presentation.xml, .rels)
 * 6. Return the merged PPTX
 *
 * Template convention:
 * - Slides 1..N-1 = static slides (cover, index, separators interspersed)
 * - Last slide = closing
 * - sectionInsertPoints maps section keys to slide indices (1-based) in the template
 *   where operation slides should be inserted AFTER
 */

// We use esm.sh for JSZip with a pinned version for stability
import JSZip from 'https://esm.sh/jszip@3.10.1';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { templateUrl, operationsBase64, sectionInsertPoints, sectionSlideCounts: clientSlideCounts, skipSlides } = await req.json();

    if (!templateUrl || !operationsBase64 || !sectionInsertPoints) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: templateUrl, operationsBase64, sectionInsertPoints' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Download template PPTX
    const templateResp = await fetch(templateUrl);
    if (!templateResp.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to download template: ${templateResp.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const templateBuffer = await templateResp.arrayBuffer();
    const templateZip = await JSZip.loadAsync(templateBuffer);

    // 2. Parse operations PPTX
    const opsBytes = Uint8Array.from(atob(operationsBase64), c => c.charCodeAt(0));
    const opsZip = await JSZip.loadAsync(opsBytes);

    // 3. Analyze template structure
    const templateSlides = getSlideFiles(templateZip);
    const opsSlides = getSlideFiles(opsZip);

    if (opsSlides.length === 0) {
      // No operation slides to merge, return template as-is
      const result = await templateZip.generateAsync({ type: 'arraybuffer' });
      return new Response(result, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'Content-Disposition': 'attachment; filename="merged.pptx"',
        },
      });
    }

    // 4. Copy operation slide files, media, and relationships into template
    // We need to renumber slides and update all references

    const totalTemplateSlides = templateSlides.length;
    let currentSlideNum = totalTemplateSlides; // Will be incremented as we insert

    // Build insertion plan: for each insert point (sorted descending to avoid index shifts),
    // figure out which ops slides go there
    // sectionInsertPoints: { "sale_active": 3, "upcoming": 4, ... }
    // means insert after slide 3 in template for sale_active section, etc.

    // The ops PPTX has slides in order: section1 ops, section2 ops, etc.
    // We also receive sectionSlideCounts to know how many ops per section
    // Use client-provided slide counts or distribute evenly
    const sectionSlideCounts: Record<string, number> = clientSlideCounts || {};
    if (!clientSlideCounts) {
      const keys = Object.keys(sectionInsertPoints);
      const perSection = Math.floor(opsSlides.length / keys.length);
      const remainder = opsSlides.length % keys.length;
      keys.forEach((key, i) => {
        sectionSlideCounts[key] = perSection + (i < remainder ? 1 : 0);
      });
    }

    // Build the final slide order
    // Template slides: 1, 2, 3, ..., N
    // For each insert point (in order), splice in the corresponding ops slides

    // Sort insert points by their position (ascending)
    const insertEntries = Object.entries(sectionInsertPoints as Record<string, number>)
      .sort((a, b) => a[1] - b[1]);

    // Build final presentation by constructing new slide list
    const finalSlides: Array<{ source: 'template' | 'ops'; index: number }> = [];
    let opsOffset = 0;

    // Create a set of insert-after positions
    const insertMap = new Map<number, string>(); // slideNum -> sectionKey
    for (const [key, slideNum] of insertEntries) {
      insertMap.set(slideNum as number, key);
    }

    for (let i = 1; i <= totalTemplateSlides; i++) {
      finalSlides.push({ source: 'template', index: i });
      
      if (insertMap.has(i)) {
        const sectionKey = insertMap.get(i)!;
        const count = sectionSlideCounts[sectionKey] || 0;
        for (let j = 0; j < count; j++) {
          finalSlides.push({ source: 'ops', index: opsOffset + j + 1 });
        }
        opsOffset += count;
      }
    }

    // 5. Build the merged PPTX
    const mergedZip = new JSZip();

    // Copy everything from template except slides (we'll rebuild those)
    const slidePattern = /^ppt\/slides\/slide\d+\.xml$/;
    const slideRelPattern = /^ppt\/slides\/_rels\/slide\d+\.xml\.rels$/;

    for (const [path, file] of Object.entries(templateZip.files)) {
      if (slidePattern.test(path) || slideRelPattern.test(path)) continue;
      if ((file as any).dir) continue;
      const content = await (file as any).async('arraybuffer');
      mergedZip.file(path, content);
    }

    // Copy media files from ops PPTX (renaming to avoid conflicts)
    const templateMediaFiles = Object.keys(templateZip.files).filter(f => f.startsWith('ppt/media/'));
    let mediaCounter = templateMediaFiles.length + 1;
    const opsMediaMap = new Map<string, string>(); // old name -> new name

    for (const [path, file] of Object.entries(opsZip.files)) {
      if (path.startsWith('ppt/media/') && !(file as any).dir) {
        const ext = path.split('.').pop() || 'png';
        const newName = `ppt/media/image_ops${mediaCounter}.${ext}`;
        mediaCounter++;
        opsMediaMap.set(path.replace('ppt/media/', ''), newName.replace('ppt/media/', ''));
        const content = await (file as any).async('arraybuffer');
        mergedZip.file(newName, content);
      }
    }

    // Now write slides in final order
    for (let i = 0; i < finalSlides.length; i++) {
      const entry = finalSlides[i];
      const newSlideNum = i + 1;
      const newSlidePath = `ppt/slides/slide${newSlideNum}.xml`;
      const newSlideRelPath = `ppt/slides/_rels/slide${newSlideNum}.xml.rels`;

      if (entry.source === 'template') {
        const srcSlidePath = `ppt/slides/slide${entry.index}.xml`;
        const srcRelPath = `ppt/slides/_rels/slide${entry.index}.xml.rels`;

        const slideContent = await templateZip.file(srcSlidePath)?.async('arraybuffer');
        if (slideContent) mergedZip.file(newSlidePath, slideContent);

        const relContent = await templateZip.file(srcRelPath)?.async('arraybuffer');
        if (relContent) mergedZip.file(newSlideRelPath, relContent);
      } else {
        // ops slide
        const srcSlidePath = `ppt/slides/slide${entry.index}.xml`;
        const srcRelPath = `ppt/slides/_rels/slide${entry.index}.xml.rels`;

        let slideXml = await opsZip.file(srcSlidePath)?.async('string') || '';
        // Update media references if needed
        for (const [oldMedia, newMedia] of opsMediaMap.entries()) {
          slideXml = slideXml.replaceAll(oldMedia, newMedia);
        }
        mergedZip.file(newSlidePath, slideXml);

        let relXml = await opsZip.file(srcRelPath)?.async('string') || '';
        for (const [oldMedia, newMedia] of opsMediaMap.entries()) {
          relXml = relXml.replaceAll(oldMedia, newMedia);
        }
        if (relXml) {
          // Update slideLayout references to use template's layouts
          // ops slides reference slideLayout1.xml by default from pptxgenjs
          mergedZip.file(newSlideRelPath, relXml);
        }
      }
    }

    // 6. Update presentation.xml - rebuild slide list
    let presentationXml = await templateZip.file('ppt/presentation.xml')?.async('string') || '';
    
    // Replace the sldIdLst section
    const sldIdLstMatch = presentationXml.match(/<p:sldIdLst>([\s\S]*?)<\/p:sldIdLst>/);
    if (sldIdLstMatch) {
      let newSldIdLst = '<p:sldIdLst>';
      for (let i = 0; i < finalSlides.length; i++) {
        const id = 256 + i;
        newSldIdLst += `<p:sldId id="${id}" r:id="rId${i + 2}"/>`;
      }
      newSldIdLst += '</p:sldIdLst>';
      presentationXml = presentationXml.replace(/<p:sldIdLst>[\s\S]*?<\/p:sldIdLst>/, newSldIdLst);
    }
    mergedZip.file('ppt/presentation.xml', presentationXml);

    // 7. Update presentation.xml.rels
    let presRels = await templateZip.file('ppt/_rels/presentation.xml.rels')?.async('string') || '';
    
    // Remove existing slide relationships
    presRels = presRels.replace(/<Relationship[^>]*Target="slides\/slide\d+\.xml"[^>]*\/>/g, '');
    
    // Add new slide relationships before closing tag
    let newSlideRels = '';
    for (let i = 0; i < finalSlides.length; i++) {
      newSlideRels += `<Relationship Id="rId${i + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`;
    }
    presRels = presRels.replace('</Relationships>', newSlideRels + '</Relationships>');
    mergedZip.file('ppt/_rels/presentation.xml.rels', presRels);

    // 8. Update [Content_Types].xml
    let contentTypes = await templateZip.file('[Content_Types].xml')?.async('string') || '';
    // Remove existing slide overrides
    contentTypes = contentTypes.replace(/<Override[^>]*PartName="\/ppt\/slides\/slide\d+\.xml"[^>]*\/>/g, '');
    // Add new ones
    let newOverrides = '';
    for (let i = 1; i <= finalSlides.length; i++) {
      newOverrides += `<Override PartName="/ppt/slides/slide${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`;
    }
    contentTypes = contentTypes.replace('</Types>', newOverrides + '</Types>');
    mergedZip.file('[Content_Types].xml', contentTypes);

    // 9. Copy slideLayouts and slideMasters from ops if they don't exist in template
    // pptxgenjs uses its own layouts, we need to ensure they exist
    for (const [path, file] of Object.entries(opsZip.files)) {
      if ((path.startsWith('ppt/slideLayouts/') || path.startsWith('ppt/slideMasters/') || 
           path.startsWith('ppt/theme/')) && !(file as any).dir) {
        if (!templateZip.file(path)) {
          const content = await (file as any).async('arraybuffer');
          mergedZip.file(path, content);
        }
      }
    }

    // Generate final PPTX
    const mergedBuffer = await mergedZip.generateAsync({ type: 'arraybuffer' });
    
    // Convert to base64 for JSON response (more reliable than binary)
    const mergedBytes = new Uint8Array(mergedBuffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < mergedBytes.length; i += chunkSize) {
      const chunk = mergedBytes.subarray(i, Math.min(i + chunkSize, mergedBytes.length));
      binary += String.fromCharCode(...chunk);
    }
    const mergedBase64 = btoa(binary);

    return new Response(
      JSON.stringify({ mergedPptxBase64: mergedBase64 }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('merge-pptx error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getSlideFiles(zip: JSZip): string[] {
  return Object.keys(zip.files)
    .filter(f => /^ppt\/slides\/slide\d+\.xml$/.test(f))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/)?.[1] || '0');
      const numB = parseInt(b.match(/slide(\d+)/)?.[1] || '0');
      return numA - numB;
    });
}

async function parseRequestCounts(
  _req: Request,
  sectionInsertPoints: Record<string, number>,
  totalOpsSlides: number
): Promise<{ counts: Record<string, number> }> {
  // The client sends sectionSlideCounts alongside sectionInsertPoints
  // For now we try to extract from the original request body which was already parsed
  // This is a fallback that distributes evenly if counts aren't provided
  const keys = Object.keys(sectionInsertPoints);
  const perSection = Math.floor(totalOpsSlides / keys.length);
  const remainder = totalOpsSlides % keys.length;
  
  const counts: Record<string, number> = {};
  keys.forEach((key, i) => {
    counts[key] = perSection + (i < remainder ? 1 : 0);
  });
  
  return { counts };
}
