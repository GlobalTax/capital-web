
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Teléfono',
      content: '+34 91 234 5678',
      description: 'Lunes a Viernes, 9:00 - 18:00'
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'info@capittal.com',
      description: 'Respuesta en menos de 24h'
    },
    {
      icon: MapPin,
      title: 'Oficina',
      content: 'Paseo de la Castellana 123',
      description: '28046 Madrid, España'
    },
    {
      icon: Clock,
      title: 'Horario',
      content: 'Lunes a Viernes',
      description: '9:00 - 18:00'
    }
  ];

  return (
    <section id="contacto" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6">
            Contacta con Nosotros
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            ¿Tienes un proyecto en mente? Estamos aquí para ayudarte a conseguir 
            los mejores resultados para tu empresa.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon;
                return (
                  <Card key={index} className="bg-white border-0.5 border-black rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-white border-0.5 border-black rounded-lg">
                          <IconComponent className="h-5 w-5 text-black" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-black mb-1">
                            {info.title}
                          </h3>
                          <p className="text-black font-medium mb-1">
                            {info.content}
                          </p>
                          <p className="text-sm text-gray-600">
                            {info.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-0.5 border-black rounded-lg shadow-sm">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-black mb-6">
                  Solicita una Consulta Gratuita
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-white border-0.5 border-black rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20 transition-all duration-300"
                        placeholder="Tu nombre"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                        Empresa
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full bg-white border-0.5 border-black rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20 transition-all duration-300"
                        placeholder="Nombre de la empresa"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-white border-0.5 border-black rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20 transition-all duration-300"
                        placeholder="tu@email.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-white border-0.5 border-black rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20 transition-all duration-300"
                        placeholder="+34 600 000 000"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Mensaje
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full bg-white border-0.5 border-black rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20 transition-all duration-300"
                      placeholder="Cuéntanos sobre tu proyecto..."
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-white text-black border-0.5 border-black rounded-lg px-6 py-4 text-lg font-medium hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out"
                  >
                    Enviar Consulta
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
