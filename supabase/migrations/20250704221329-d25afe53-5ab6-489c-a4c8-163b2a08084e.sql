-- Insertar templates de ejemplo
INSERT INTO public.landing_page_templates (name, description, type, template_html, template_config, display_order)
VALUES
  ('Lead Magnet Básico', 'Template para capturar leads con un recurso gratuito', 'lead_magnet', 
   '<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div class="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div class="text-center mb-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">{{title}}</h1>
          <p class="text-gray-600">{{description}}</p>
        </div>
        <form class="space-y-4">
          <input type="text" placeholder="Nombre completo" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required>
          <input type="email" placeholder="Email profesional" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required>
          <input type="text" placeholder="Empresa" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          <button type="submit" class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold">{{cta_text}}</button>
        </form>
      </div>
    </div>',
   '{"fields": ["title", "description", "cta_text"]}',
   1),
  
  ('Calculadora Valoración', 'Landing page para la calculadora de valoración', 'valuation',
   '<div class="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-6">
      <div class="max-w-lg w-full bg-white rounded-lg shadow-xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">{{title}}</h1>
          <p class="text-gray-600 mb-6">{{description}}</p>
          <div class="bg-emerald-50 p-4 rounded-lg mb-6">
            <p class="text-emerald-800 font-semibold">{{benefit_text}}</p>
          </div>
        </div>
        <div class="text-center">
          <a href="/calculadora-valoracion" class="inline-block bg-emerald-600 text-white py-4 px-8 rounded-lg hover:bg-emerald-700 font-semibold text-lg">{{cta_text}}</a>
        </div>
      </div>
    </div>',
   '{"fields": ["title", "description", "benefit_text", "cta_text"]}',
   2),
   
  ('Contacto Sectorial', 'Template para capturar leads por sector específico', 'contact',
   '<div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-6">
      <div class="max-w-xl w-full bg-white rounded-lg shadow-xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">{{title}}</h1>
          <p class="text-gray-600 mb-6">{{description}}</p>
        </div>
        <form class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Nombre" class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" required>
            <input type="email" placeholder="Email" class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" required>
          </div>
          <input type="text" placeholder="Empresa" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" required>
          <select class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" required>
            <option value="">Selecciona tu sector</option>
            <option value="tecnologia">Tecnología</option>
            <option value="healthcare">Healthcare</option>
            <option value="industrial">Industrial</option>
            <option value="retail">Retail</option>
          </select>
          <textarea placeholder="Cuéntanos sobre tu proyecto..." class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 h-24"></textarea>
          <button type="submit" class="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 font-semibold">{{cta_text}}</button>
        </form>
      </div>
    </div>',
   '{"fields": ["title", "description", "cta_text"]}',
   3)
ON CONFLICT (name) DO NOTHING;