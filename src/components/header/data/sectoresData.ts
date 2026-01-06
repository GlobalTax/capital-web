import { MenuCategory } from '../types';

export const sectoresData: MenuCategory[] = [
  {
    title: 'Sectores',
    items: [
      { id: 'industrial', label: 'Industrial', href: '/sectores/industrial', description: 'Fabricación, manufactura y maquinaria' },
      { id: 'construccion', label: 'Construcción', href: '/sectores/construccion', description: 'Obra civil, rehabilitación y pavimentos' },
      { id: 'healthcare', label: 'Healthcare', href: '/sectores/healthcare', description: 'Salud, biotecnología y distribución sanitaria' },
      { id: 'seguridad', label: 'Seguridad', href: '/sectores/seguridad', description: 'Vigilancia, alarmas y protección contra incendios' },
      { id: 'medio-ambiente', label: 'Medio Ambiente', href: '/sectores/medio-ambiente', description: 'Residuos, reciclaje y demoliciones' },
      { id: 'tecnologia', label: 'Tecnología', href: '/sectores/tecnologia', description: 'SaaS, consultoría TIC y telecomunicaciones' },
      { id: 'retail', label: 'Retail y Consumo', href: '/sectores/retail-consumer', description: 'Distribución, turismo y hostelería' },
      { id: 'alimentacion', label: 'Alimentación', href: '/sectores/alimentacion', description: 'Producción, distribución y HORECA' },
      { id: 'energia', label: 'Energía', href: '/sectores/energia', description: 'Renovables, solar, eólica y almacenamiento' },
      { id: 'logistica', label: 'Logística', href: '/sectores/logistica', description: 'Transporte, operadores y última milla' }
    ]
  }
];
