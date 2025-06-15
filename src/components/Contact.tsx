
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { formatSpanishPhone } from '@/utils/validationUtils';

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
    const { name, value } = e.target;
    
    if (name === 'phone') {
      setFormData({
        ...formData,
        [name]: formatSpanishPhone(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  return (
    <section id="contacto" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Contacto
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            ¿Está considerando una transacción estratégica? Nuestros expertos están listos para ayudarle.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className="bg-white border-0.5 border-black rounded-lg p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-black mb-6">
              Hablemos de su Proyecto
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-white border-0.5 border-black rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20"
                    placeholder="Su nombre"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-white border-0.5 border-black rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20"
                    placeholder="email@empresa.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa
                  </label>
                  <Input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="bg-white border-0.5 border-black rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20"
                    placeholder="Nombre de su empresa"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-white border-0.5 border-black rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20"
                    placeholder="+34 600 000 000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje *
                </label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="bg-white border-0.5 border-black rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20 resize-none"
                  placeholder="Cuéntenos sobre su proyecto o necesidades..."
                />
              </div>

              <Button 
                type="submit"
                className="bg-white text-black border-0.5 border-black rounded-lg w-full py-4 text-lg font-medium hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out"
              >
                Enviar Mensaje
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white border-0.5 border-black rounded-lg p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-black mb-6">
                Información de Contacto
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-black text-white rounded-lg p-3">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black mb-1">Oficina Principal</h4>
                    <p className="text-gray-600">
                      Paseo de la Castellana 123<br />
                      28046 Madrid, España
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-black text-white rounded-lg p-3">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black mb-1">Teléfono</h4>
                    <p className="text-gray-600">+34 91 234 5678</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-black text-white rounded-lg p-3">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black mb-1">Email</h4>
                    <p className="text-gray-600">info@capittal.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-black text-white rounded-lg p-3">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black mb-1">Horario</h4>
                    <p className="text-gray-600">
                      Lunes - Viernes: 9:00 - 18:00<br />
                      Disponibilidad 24/7 para urgencias
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Time */}
            <div className="bg-gray-50 border-0.5 border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-bold text-black mb-4">
                Tiempo de Respuesta
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Consultas generales</span>
                  <span className="font-semibold text-black">24 horas</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Valoraciones</span>
                  <span className="font-semibold text-black">48 horas</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Urgencias</span>
                  <span className="font-semibold text-black">Inmediato</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
