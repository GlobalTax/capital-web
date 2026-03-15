import React from 'react';
import { Navigate } from 'react-router-dom';

const VentaEmpresasRedirect = () => {
  return <Navigate to="/venta-empresas" replace />;
};

export default VentaEmpresasRedirect;
