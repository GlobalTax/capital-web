
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CompanyData {
  contactName: string;
  companyName: string;
  cif: string;
  email: string;
  phone: string;
  industry: string;
  yearsOfOperation: number;
  employeeRange: string;
  revenue: number;
  ebitda: number;
  netProfitMargin: number;
  growthRate: number;
  location: string;
  ownershipParticipation: string;
  competitiveAdvantage: string;
}

interface ValuationResult {
  ebitdaMultiple: number;
  finalValuation: number;
  valuationRange: {
    min: number;
    max: number;
  };
  multiples: {
    ebitdaMultipleUsed: number;
  };
}

export const generateValuationPDF = async (
  companyData: CompanyData,
  result: ValuationResult
): Promise<Blob> => {
  // Crear un elemento temporal para el contenido HTML
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.width = '210mm'; // A4 width
  tempDiv.style.fontFamily = 'Arial, sans-serif';
  tempDiv.style.backgroundColor = 'white';
  tempDiv.style.padding = '20mm';
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getEmployeeRangeLabel = (range: string) => {
    const ranges: { [key: string]: string } = {
      '1-10': '1-10 empleados',
      '11-50': '11-50 empleados',
      '51-200': '51-200 empleados',
      '201-500': '201-500 empleados',
      '500+': 'Más de 500 empleados'
    };
    return ranges[range] || range;
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // HTML content del PDF
  tempDiv.innerHTML = `
    <div style="color: #000; line-height: 1.4;">
      <!-- Header -->
      <div style="border-bottom: 3px solid #000; padding-bottom: 20px; margin-bottom: 30px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="font-size: 32px; font-weight: bold; margin: 0; color: #000;">CAPITTAL</h1>
            
          </div>
          <div style="text-align: right;">
            <p style="font-size: 12px; margin: 0; color: #666;">Fecha del informe</p>
            <p style="font-size: 14px; margin: 0; font-weight: bold;">${getCurrentDate()}</p>
          </div>
        </div>
      </div>

      <!-- Título principal -->
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="font-size: 28px; font-weight: bold; margin: 0; color: #000;">
          INFORME DE VALORACIÓN EMPRESARIAL
        </h1>
        <h2 style="font-size: 20px; margin: 10px 0 0 0; color: #333;">
          ${companyData.companyName}
        </h2>
      </div>

      <!-- Resumen ejecutivo -->
      <div style="background-color: #f8f9fa; border-left: 5px solid #000; padding: 20px; margin-bottom: 30px;">
        <h3 style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0; color: #000;">
          RESUMEN EJECUTIVO
        </h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Valoración estimada:</strong></p>
            <p style="margin: 0 0 15px 0; font-size: 24px; font-weight: bold; color: #000;">
              ${formatCurrency(result.finalValuation)}
            </p>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">
              Rango: ${formatCurrency(result.valuationRange.min)} - ${formatCurrency(result.valuationRange.max)}
            </p>
          </div>
          <div>
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Múltiplo EBITDA aplicado:</strong></p>
            <p style="margin: 0 0 15px 0; font-size: 24px; font-weight: bold; color: #000;">
              ${result.multiples.ebitdaMultipleUsed}x
            </p>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">
              Sector: ${companyData.industry.charAt(0).toUpperCase() + companyData.industry.slice(1)}
            </p>
          </div>
        </div>
      </div>

      <!-- Información de la empresa -->
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 18px; font-weight: bold; margin: 0 0 20px 0; color: #000; border-bottom: 2px solid #000; padding-bottom: 5px;">
          INFORMACIÓN DE LA EMPRESA
        </h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
          <div>
            <h4 style="font-size: 14px; font-weight: bold; margin: 0 0 15px 0; color: #333;">Datos Generales</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 40%;">Razón Social:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${companyData.companyName}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">CIF:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${companyData.cif}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Sector:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${companyData.industry.charAt(0).toUpperCase() + companyData.industry.slice(1)}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Ubicación:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${companyData.location}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Años operando:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${companyData.yearsOfOperation} años</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Nº empleados:</td><td style="padding: 8px 0;">${getEmployeeRangeLabel(companyData.employeeRange)}</td></tr>
            </table>
          </div>
          
          <div>
            <h4 style="font-size: 14px; font-weight: bold; margin: 0 0 15px 0; color: #333;">Contacto</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 40%;">Persona de contacto:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${companyData.contactName}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${companyData.email}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Teléfono:</td><td style="padding: 8px 0;">${companyData.phone}</td></tr>
            </table>
          </div>
        </div>
      </div>

      <!-- Datos financieros -->
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 18px; font-weight: bold; margin: 0 0 20px 0; color: #000; border-bottom: 2px solid #000; padding-bottom: 5px;">
          DATOS FINANCIEROS
        </h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
          <div>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 60%;">Ingresos anuales:</td><td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 16px; font-weight: bold;">${formatCurrency(companyData.revenue)}</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: bold;">EBITDA:</td><td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 16px; font-weight: bold;">${formatCurrency(companyData.ebitda)}</td></tr>
            </table>
          </div>
          <div>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 60%;">Margen beneficio neto:</td><td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 16px; font-weight: bold;">${companyData.netProfitMargin}%</td></tr>
              <tr><td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: bold;">Tasa de crecimiento:</td><td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 16px; font-weight: bold;">${companyData.growthRate}%</td></tr>
            </table>
          </div>
        </div>
      </div>

      <!-- Metodología de valoración -->
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 18px; font-weight: bold; margin: 0 0 20px 0; color: #000; border-bottom: 2px solid #000; padding-bottom: 5px;">
          METODOLOGÍA DE VALORACIÓN
        </h3>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="font-size: 16px; font-weight: bold; margin: 0 0 10px 0;">Múltiplos EBITDA por Sector</h4>
          <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6;">
            La valoración se ha realizado utilizando el método de múltiplos EBITDA, que es una metodología ampliamente 
            aceptada en el mercado para la valoración de empresas. Este método compara la empresa con otras similares 
            en el mismo sector y rango de empleados.
          </p>
          
          <div style="background-color: white; padding: 15px; border-radius: 6px; border: 1px solid #dee2e6;">
            <div style="text-align: center;">
              <p style="margin: 0 0 5px 0; font-size: 14px; color: #666;">Cálculo aplicado:</p>
              <p style="margin: 0; font-size: 18px; font-weight: bold;">
                ${formatCurrency(companyData.ebitda)} × ${result.multiples.ebitdaMultipleUsed} = ${formatCurrency(result.finalValuation)}
              </p>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px;">
            <h5 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">Factores considerados:</h5>
            <ul style="margin: 0; padding-left: 20px; font-size: 12px; line-height: 1.5;">
              <li>Sector de actividad: ${companyData.industry}</li>
              <li>Tamaño de la empresa: ${getEmployeeRangeLabel(companyData.employeeRange)}</li>
              <li>Años de operación: ${companyData.yearsOfOperation} años</li>
              <li>Ubicación geográfica: ${companyData.location}</li>
            </ul>
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px;">
            <h5 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">Rango de valoración:</h5>
            <p style="margin: 0 0 5px 0; font-size: 12px;">Mínimo: ${formatCurrency(result.valuationRange.min)} (-20%)</p>
            <p style="margin: 0 0 5px 0; font-size: 12px;">Valoración central: ${formatCurrency(result.finalValuation)}</p>
            <p style="margin: 0; font-size: 12px;">Máximo: ${formatCurrency(result.valuationRange.max)} (+20%)</p>
          </div>
        </div>
      </div>

      <!-- Análisis cualitativo -->
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 18px; font-weight: bold; margin: 0 0 20px 0; color: #000; border-bottom: 2px solid #000; padding-bottom: 5px;">
          ANÁLISIS CUALITATIVO
        </h3>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h4 style="font-size: 14px; font-weight: bold; margin: 0 0 10px 0;">Ventaja Competitiva</h4>
          <p style="margin: 0; font-size: 12px; line-height: 1.6; background-color: white; padding: 15px; border-radius: 6px; border: 1px solid #dee2e6;">
            ${companyData.competitiveAdvantage}
          </p>
        </div>
        
        <div style="margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px;">
            <h5 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">Participación societaria:</h5>
            <p style="margin: 0; font-size: 12px;">
              ${companyData.ownershipParticipation === 'alta' ? 'Alta (>75%)' : 
                companyData.ownershipParticipation === 'media' ? 'Media (25-75%)' : 'Baja (<25%)'}
            </p>
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px;">
            <h5 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">Rentabilidad:</h5>
            <p style="margin: 0; font-size: 12px;">Margen EBITDA: ${((companyData.ebitda / companyData.revenue) * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <!-- Disclaimer -->
      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin-top: 40px;">
        <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 15px 0; color: #856404;">
          AVISO LEGAL Y LIMITACIONES
        </h3>
        <div style="font-size: 11px; line-height: 1.5; color: #856404;">
          <p style="margin: 0 0 10px 0;">
            <strong>Propósito del informe:</strong> Esta valoración es una estimación basada en múltiplos EBITDA por sector 
            y no constituye asesoramiento financiero, fiscal o legal profesional.
          </p>
          <p style="margin: 0 0 10px 0;">
            <strong>Limitaciones:</strong> Los resultados se basan en la información proporcionada por el cliente y múltiplos 
            de mercado generales. Para valoraciones precisas se recomienda un análisis detallado por parte de expertos.
          </p>
          <p style="margin: 0 0 10px 0;">
            <strong>Validez:</strong> Esta estimación es válida en la fecha de emisión y está sujeta a cambios en las 
            condiciones del mercado y la empresa.
          </p>
          <p style="margin: 0;">
            <strong>Uso recomendado:</strong> Esta valoración debe usarse únicamente como referencia inicial. Para 
            transacciones reales, se recomienda realizar una due diligence completa y valoración profesional detallada.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #000; text-align: center;">
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; font-size: 11px;">
          <div>
            <h4 style="margin: 0 0 8px 0; font-weight: bold;">CAPITTAL</h4>
            <p style="margin: 0; line-height: 1.4;">Consultoría especializada<br>en valoración empresarial</p>
          </div>
          <div>
            <h4 style="margin: 0 0 8px 0; font-weight: bold;">Contacto</h4>
            <p style="margin: 0; line-height: 1.4;">info@capittal.com<br>+34 XXX XXX XXX</p>
          </div>
          <div>
            <h4 style="margin: 0 0 8px 0; font-weight: bold;">Web</h4>
            <p style="margin: 0; line-height: 1.4;">www.capittal.com</p>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(tempDiv);

  try {
    // Generar imagen del contenido HTML
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123 // A4 height in pixels at 96 DPI
    });

    // Crear PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    // Añadir imagen al PDF
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297); // A4 dimensions in mm

    // Generar blob
    const pdfBlob = pdf.output('blob');
    
    return pdfBlob;
  } finally {
    // Limpiar elemento temporal
    document.body.removeChild(tempDiv);
  }
};
