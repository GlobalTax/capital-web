
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate form submission
    toast({
      title: "Mensaje enviado",
      description: "Nos pondremos en contacto contigo en las próximas 24 horas.",
    });
    
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      message: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contacto" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Contacto
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            ¿Está considerando una transacción estratégica? Hablemos sobre cómo podemos 
            ayudarle a maximizar el valor de su empresa.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div>
            <h3 className="text-2xl font-semibold text-black mb-8">
              Información de Contacto
            </h3>

            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="mr-4 mt-1 text-black" size={20} />
                <div>
                  <p className="font-medium text-black">Oficina Principal</p>
                  <p className="text-gray-600">
                    Paseo de la Castellana 123<br />
                    28046 Madrid, España
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="mr-4 mt-1 text-black" size={20} />
                <div>
                  <p className="font-medium text-black">Teléfono</p>
                  <p className="text-gray-600">+34 91 234 5678</p>
                </div>
              </div>

              <div className="flex items-start">
                <Mail className="mr-4 mt-1 text-black" size={20} />
                <div>
                  <p className="font-medium text-black">Email</p>
                  <p className="text-gray-600">info@capittal.com</p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="mr-4 mt-1 text-black" size={20} />
                <div>
                  <p className="font-medium text-black">Horario</p>
                  <p className="text-gray-600">
                    Lunes - Viernes: 9:00 - 18:00<br />
                    Consultas urgentes: 24/7
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 capittal-card">
              <h4 className="text-lg font-semibold text-black mb-4">
                Consulta Gratuita
              </h4>
              <p className="text-gray-600 mb-4">
                Ofrecemos una consulta inicial gratuita de 30 minutos para evaluar 
                su situación y discutir las mejores opciones estratégicas.
              </p>
              <Button className="capittal-button">
                Agendar Consulta
              </Button>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <form onSubmit={handleSubmit} className="capittal-card">
              <h3 className="text-2xl font-semibold text-black mb-6">
                Envíanos un Mensaje
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Nombre *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="capittal-input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="capittal-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Empresa
                  </label>
                  <Input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="capittal-input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Teléfono
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="capittal-input"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-black mb-2">
                  Mensaje *
                </label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="capittal-input resize-none"
                  placeholder="Cuéntanos sobre tu proyecto o consulta..."
                />
              </div>

              <Button type="submit" className="capittal-button w-full">
                Enviar Mensaje
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
