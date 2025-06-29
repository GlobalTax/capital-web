
# Testing Setup

Este proyecto utiliza Jest y React Testing Library para las pruebas.

## Configuración

- **Jest**: Framework de testing principal
- **React Testing Library**: Para testing de componentes React
- **jsdom**: Ambiente DOM simulado para testing
- **TypeScript**: Soporte completo para TypeScript en tests

## Estructura de Tests

```
src/
├── components/
│   └── ui/
│       └── __tests__/
│           └── button.test.tsx
├── hooks/
│   └── __tests__/
│       └── useAdminAuth.test.tsx
├── utils/
│   └── __tests__/
│       └── validationUtils.test.ts
└── __tests__/
    └── README.md
```

## Comandos Disponibles

Una vez que instales las dependencias necesarias, podrás usar:

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con reporte de cobertura
npm run test:coverage
```

## Dependencias Necesarias

Para que funcione completamente, necesitarás instalar:

```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3",
    "@types/jest": "^29.5.0",
    "jest": "^29.5.0",
    "jest-environment-jsdom": "^29.5.0"
  }
}
```

## Mocks Configurados

El archivo `setupTests.ts` incluye mocks para:
- `react-router-dom`
- `@/integrations/supabase/client`
- `@/hooks/use-toast`

## Ejemplos de Tests Incluidos

1. **Button Component**: Testing de renderizado, variantes, tamaños, eventos
2. **useAdminAuth Hook**: Testing de estados, autenticación, permisos admin
3. **validationUtils**: Testing de funciones de validación de formularios

## Escribiendo Nuevos Tests

Para agregar nuevos tests:
1. Crea archivos `.test.tsx` o `.test.ts` junto a tus componentes/hooks/utils
2. Usa las utilidades de React Testing Library para componentes
3. Usa `renderHook` para testing de hooks personalizados
4. Sigue los patrones establecidos en los tests existentes
