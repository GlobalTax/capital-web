-- Insertar templates por defecto para landing pages
INSERT INTO public.landing_page_templates (name, type, template_html, template_config, description, display_order) VALUES
(
  'Reporte Sectorial',
  'sector-report',
  '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{meta_title}}</title>
    <meta name="description" content="{{meta_description}}">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .hero { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 80px 20px; text-align: center; }
        .hero h1 { font-size: 3rem; margin-bottom: 20px; }
        .hero p { font-size: 1.25rem; margin-bottom: 30px; }
        .form-section { background: white; padding: 60px 20px; }
        .form-container { max-width: 600px; margin: 0 auto; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
        .form-group input { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; }
        .btn { background: #3b82f6; color: white; padding: 15px 30px; border: none; border-radius: 6px; cursor: pointer; font-size: 1.1rem; }
        .features { padding: 60px 20px; }
        .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
        .feature { text-align: center; padding: 30px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="hero">
        <div class="container">
            <h1>{{title}}</h1>
            <p>{{subtitle}}</p>
        </div>
    </div>
    
    <div class="form-section">
        <div class="container">
            <div class="form-container">
                <h2>Descarga tu Reporte Gratuito</h2>
                <form id="leadForm">
                    <div class="form-group">
                        <label for="name">Nombre Completo</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email Corporativo</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="company">Empresa</label>
                        <input type="text" id="company" name="company" required>
                    </div>
                    <div class="form-group">
                        <label for="position">Cargo</label>
                        <input type="text" id="position" name="position">
                    </div>
                    <button type="submit" class="btn">Descargar Reporte</button>
                </form>
            </div>
        </div>
    </div>
    
    <div class="features">
        <div class="container">
            <div class="feature-grid">
                <div class="feature">
                    <h3>{{feature_1_title}}</h3>
                    <p>{{feature_1_description}}</p>
                </div>
                <div class="feature">
                    <h3>{{feature_2_title}}</h3>
                    <p>{{feature_2_description}}</p>
                </div>
                <div class="feature">
                    <h3>{{feature_3_title}}</h3>
                    <p>{{feature_3_description}}</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>',
  '{
    "customizable_fields": [
      "title",
      "subtitle", 
      "meta_title",
      "meta_description",
      "feature_1_title",
      "feature_1_description",
      "feature_2_title", 
      "feature_2_description",
      "feature_3_title",
      "feature_3_description"
    ],
    "form_fields": ["name", "email", "company", "position"],
    "conversion_goals": ["form_submission", "download"],
    "color_scheme": "blue",
    "layout": "hero-form-features"
  }',
  'Template optimizada para promocionar reportes sectoriales con formulario de captura de leads',
  1
),
(
  'Herramienta de Valoración',
  'valuation-tool',
  '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{meta_title}}</title>
    <meta name="description" content="{{meta_description}}">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .hero { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 80px 20px; text-align: center; }
        .hero h1 { font-size: 3rem; margin-bottom: 20px; }
        .hero p { font-size: 1.25rem; margin-bottom: 30px; }
        .tool-section { background: white; padding: 60px 20px; }
        .tool-container { max-width: 800px; margin: 0 auto; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
        .form-group input, .form-group select { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; }
        .btn { background: #10b981; color: white; padding: 15px 30px; border: none; border-radius: 6px; cursor: pointer; font-size: 1.1rem; }
        .benefits { padding: 60px 20px; background: #f0fdf4; }
        .benefit-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .benefit { padding: 20px; background: white; border-radius: 8px; border-left: 4px solid #10b981; }
    </style>
</head>
<body>
    <div class="hero">
        <div class="container">
            <h1>{{title}}</h1>
            <p>{{subtitle}}</p>
        </div>
    </div>
    
    <div class="tool-section">
        <div class="container">
            <div class="tool-container">
                <h2>Obtén tu Valoración Gratuita</h2>
                <form id="valuationForm">
                    <div class="form-group">
                        <label for="company_name">Nombre de la Empresa</label>
                        <input type="text" id="company_name" name="company_name" required>
                    </div>
                    <div class="form-group">
                        <label for="contact_name">Nombre de Contacto</label>
                        <input type="text" id="contact_name" name="contact_name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="phone">Teléfono</label>
                        <input type="tel" id="phone" name="phone">
                    </div>
                    <div class="form-group">
                        <label for="industry">Sector</label>
                        <select id="industry" name="industry" required>
                            <option value="">Selecciona un sector</option>
                            <option value="tecnologia">Tecnología</option>
                            <option value="retail">Retail</option>
                            <option value="manufactura">Manufactura</option>
                            <option value="servicios">Servicios</option>
                            <option value="otros">Otros</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="revenue">Facturación Anual (€)</label>
                        <select id="revenue" name="revenue" required>
                            <option value="">Selecciona rango</option>
                            <option value="0-1M">Menos de 1M€</option>
                            <option value="1M-5M">1M€ - 5M€</option>
                            <option value="5M-25M">5M€ - 25M€</option>
                            <option value="25M+">Más de 25M€</option>
                        </select>
                    </div>
                    <button type="submit" class="btn">Solicitar Valoración</button>
                </form>
            </div>
        </div>
    </div>
    
    <div class="benefits">
        <div class="container">
            <h2 style="text-align: center; margin-bottom: 40px;">{{benefits_title}}</h2>
            <div class="benefit-list">
                <div class="benefit">
                    <h3>{{benefit_1_title}}</h3>
                    <p>{{benefit_1_description}}</p>
                </div>
                <div class="benefit">
                    <h3>{{benefit_2_title}}</h3>
                    <p>{{benefit_2_description}}</p>
                </div>
                <div class="benefit">
                    <h3>{{benefit_3_title}}</h3>
                    <p>{{benefit_3_description}}</p>
                </div>
                <div class="benefit">
                    <h3>{{benefit_4_title}}</h3>
                    <p>{{benefit_4_description}}</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>',
  '{
    "customizable_fields": [
      "title",
      "subtitle",
      "meta_title", 
      "meta_description",
      "benefits_title",
      "benefit_1_title",
      "benefit_1_description",
      "benefit_2_title",
      "benefit_2_description", 
      "benefit_3_title",
      "benefit_3_description",
      "benefit_4_title",
      "benefit_4_description"
    ],
    "form_fields": ["company_name", "contact_name", "email", "phone", "industry", "revenue"],
    "conversion_goals": ["form_submission", "valuation_request"],
    "color_scheme": "green", 
    "layout": "hero-form-benefits"
  }',
  'Template para capturar solicitudes de valoración empresarial con formulario detallado',
  2
),
(
  'Consulta Gratuita',
  'consultation',
  '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{meta_title}}</title>
    <meta name="description" content="{{meta_description}}">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .hero { background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 80px 20px; text-align: center; }
        .hero h1 { font-size: 3rem; margin-bottom: 20px; }
        .hero p { font-size: 1.25rem; margin-bottom: 30px; }
        .consultation-section { background: white; padding: 60px 20px; }
        .consultation-container { max-width: 600px; margin: 0 auto; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
        .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; }
        .form-group textarea { height: 100px; resize: vertical; }
        .btn { background: #a855f7; color: white; padding: 15px 30px; border: none; border-radius: 6px; cursor: pointer; font-size: 1.1rem; }
        .services { padding: 60px 20px; background: #faf5ff; }
        .service-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
        .service { padding: 30px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
        .service h3 { color: #7c3aed; margin-bottom: 15px; }
    </style>
</head>
<body>
    <div class="hero">
        <div class="container">
            <h1>{{title}}</h1>
            <p>{{subtitle}}</p>
        </div>
    </div>
    
    <div class="consultation-section">
        <div class="container">
            <div class="consultation-container">
                <h2>Reserva tu Consulta Gratuita</h2>
                <p>{{consultation_description}}</p>
                <form id="consultationForm">
                    <div class="form-group">
                        <label for="name">Nombre Completo</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="phone">Teléfono</label>
                        <input type="tel" id="phone" name="phone" required>
                    </div>
                    <div class="form-group">
                        <label for="company">Empresa</label>
                        <input type="text" id="company" name="company" required>
                    </div>
                    <div class="form-group">
                        <label for="service_interest">Servicio de Interés</label>
                        <select id="service_interest" name="service_interest" required>
                            <option value="">Selecciona un servicio</option>
                            <option value="valoracion">Valoración Empresarial</option>
                            <option value="venta">Venta de Empresa</option>
                            <option value="due_diligence">Due Diligence</option>
                            <option value="asesoramiento">Asesoramiento Estratégico</option>
                            <option value="otros">Otros</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="message">Cuéntanos sobre tu proyecto</label>
                        <textarea id="message" name="message" placeholder="Describe brevemente tu situación y objetivos..."></textarea>
                    </div>
                    <button type="submit" class="btn">Solicitar Consulta</button>
                </form>
            </div>
        </div>
    </div>
    
    <div class="services">
        <div class="container">
            <h2 style="text-align: center; margin-bottom: 40px;">{{services_title}}</h2>
            <div class="service-grid">
                <div class="service">
                    <h3>{{service_1_title}}</h3>
                    <p>{{service_1_description}}</p>
                </div>
                <div class="service">
                    <h3>{{service_2_title}}</h3>
                    <p>{{service_2_description}}</p>
                </div>
                <div class="service">
                    <h3>{{service_3_title}}</h3>
                    <p>{{service_3_description}}</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>',
  '{
    "customizable_fields": [
      "title",
      "subtitle",
      "meta_title",
      "meta_description", 
      "consultation_description",
      "services_title",
      "service_1_title",
      "service_1_description",
      "service_2_title",
      "service_2_description",
      "service_3_title", 
      "service_3_description"
    ],
    "form_fields": ["name", "email", "phone", "company", "service_interest", "message"],
    "conversion_goals": ["form_submission", "consultation_request"],
    "color_scheme": "purple",
    "layout": "hero-form-services"
  }',
  'Template para capturar solicitudes de consulta gratuita con formulario de contacto detallado',
  3
);