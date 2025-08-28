// Using lucide-react's official dynamic import system
import dynamicIconImports from 'lucide-react/dynamicIconImports';

export type IconName = keyof typeof dynamicIconImports;

// Re-export the official dynamic imports - no custom implementation needed
export { dynamicIconImports };