import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Valoraciones = () => {
  console.log('🟢 VALORACIONES PAGE IS RENDERING - This should appear in console');
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* TEMPORARY DIAGNOSTIC CONTENT */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-bold text-slate-900">
            ✅ PÁGINA VALORACIONES FUNCIONANDO
          </h1>
          <p className="text-xl text-slate-600">
            Esta es la página correcta de valoraciones de empresas
          </p>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <strong>DIAGNÓSTICO:</strong> Si ves este mensaje, la ruta está funcionando correctamente.
          </div>
          <div className="bg-blue-50 p-8 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Información de la Página:</h2>
            <ul className="text-left space-y-2 max-w-md mx-auto">
              <li>✅ Ruta: /servicios/valoraciones</li>
              <li>✅ Componente: Valoraciones.tsx</li>
              <li>✅ Estado: Funcionando correctamente</li>
              <li>✅ Timestamp: {new Date().toLocaleString()}</li>
            </ul>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Valoraciones;