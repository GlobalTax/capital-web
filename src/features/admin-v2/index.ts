// ============= ADMIN V2 FEATURE EXPORTS =============
// Centralized exports for the admin-v2 feature module

// Guards
export { AdminV2Guard } from './guards/AdminV2Guard';

// Layouts
export { MainLayout } from './components/MainLayout';

// Pages
export { default as DashboardDemo } from './components/DashboardDemo';

// Components
export {
  LiquidGlassProvider,
  Glass,
  NavBar,
  ToggleSwitch,
  FeatureCard,
  TabMenu
} from './components/LiquidGlassKit';
