
export { serviciosData } from './data/serviciosData';
export { sectoresData } from './data/sectoresData';
export { recursosData } from './data/recursosData';
export { nosotrosData } from './data/nosotrosData';
export { colaboradoresData } from './data/colaboradoresData';
export type { NavItem, MenuCategory } from './types';

// Mantener compatibilidad con el código existente
import { serviciosData } from './data/serviciosData';
import { sectoresData } from './data/sectoresData';
import { recursosData } from './data/recursosData';
import { nosotrosData } from './data/nosotrosData';
import { colaboradoresData } from './data/colaboradoresData';

export const menuData = {
  serviciosItems: serviciosData.flatMap(category => category.items),
  sectoresItems: sectoresData.flatMap(category => category.items),
  recursosItems: recursosData.flatMap(category => category.items),
  nosotrosItems: nosotrosData.flatMap(category => category.items),
  navItems: colaboradoresData,
};
