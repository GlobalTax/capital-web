import React from 'react';
import { Lock, ShieldCheck, EyeOff } from 'lucide-react';

const items = [
  {
    title: 'Transmisión segura',
    desc: 'Tus datos viajan cifrados mediante TLS/SSL y se almacenan de forma segura.',
    Icon: Lock,
  },
  {
    title: 'Cumplimiento RGPD',
    desc: 'Tratamos la información conforme al RGPD. Al hacer clic en "Calcular valoración" consientes el procesamiento de tus datos para generar tu valoración y su uso con fines comerciales relacionados con nuestros servicios. Si proporcionas tu teléfono, aceptas que Capittal procese tus datos para la valoración y envío por WhatsApp. Puedes solicitar la eliminación cuando lo desees.',
    Icon: ShieldCheck,
  },
  {
    title: 'Acceso restringido',
    desc: 'Solo el equipo de Capittal accede a la información para preparar tu valoración. No compartimos datos con terceros.',
    Icon: EyeOff,
  },
];

const ConfidentialityBlock: React.FC = () => {
  return (
    <section aria-labelledby="confidentiality" className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="max-w-3xl">
          <h2 id="confidentiality" className="text-2xl font-semibold text-gray-900">
            Confidencialidad y privacidad
          </h2>
          <p className="mt-3 text-gray-700">
            La calculadora está diseñada para proteger tu información y darte control total sobre tus datos.
          </p>
        </header>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {items.map(({ title, desc, Icon }) => (
            <article key={title} className="rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-gray-900" aria-hidden>
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{title}</h3>
                  <p className="mt-1 text-sm text-gray-700">{desc}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ConfidentialityBlock;
