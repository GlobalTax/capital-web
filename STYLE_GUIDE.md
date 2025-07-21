
# Guía de Estilo - Convenciones de Nomenclatura

## 📋 Convenciones Generales

### 1. **Constantes** - `UPPER_CASE`
```typescript
// ✅ Correcto
const MAX_RETRY_ATTEMPTS = 3;
const API_ENDPOINTS = {
  USERS: '/api/users',
  PRODUCTS: '/api/products'
};
const DEFAULT_FUSE_OPTIONS = { threshold: 0.3 };

// ❌ Incorrecto
const maxRetryAttempts = 3;
const apiEndpoints = { users: '/api/users' };
const defaultFuseOptions = { threshold: 0.3 };
```

### 2. **Variables y Funciones** - `camelCase`
```typescript
// ✅ Correcto
const userName = 'john.doe';
const isUserActive = true;
const calculateTotalPrice = (items: Item[]) => { ... };
const generateId = () => { ... };

// ❌ Incorrecto
const user_name = 'john.doe';
const IsUserActive = true;
const calculate_total_price = (items: Item[]) => { ... };
const genId = () => { ... };
```

### 3. **Componentes** - `PascalCase`
```typescript
// ✅ Correcto
const UserProfile = () => { ... };
const LandingPageBuilder = () => { ... };
export default AdminDashboard;

// ❌ Incorrecto
const userProfile = () => { ... };
const landingPageBuilder = () => { ... };
export default adminDashboard;
```

### 4. **Hooks** - `camelCase` con prefijo `use`
```typescript
// ✅ Correcto
const useUserData = () => { ... };
const useToast = () => { ... };
const useValuationCalculator = () => { ... };

// ❌ Incorrecto
const UseUserData = () => { ... };
const use_toast = () => { ... };
const useValuationCalc = () => { ... };
```

### 5. **Interfaces y Types** - `PascalCase`
```typescript
// ✅ Correcto
interface UserProfile {
  id: string;
  userName: string;
  isActive: boolean;
}

type ApiResponse<T> = {
  data: T;
  statusCode: number;
};

// ❌ Incorrecto
interface userProfile {
  id: string;
  user_name: string;
  is_active: boolean;
}
```

## 🗄️ Convenciones de Base de Datos

### Mapping entre snake_case (BD) y camelCase (Frontend)

```typescript
// Base de datos (snake_case)
interface DatabaseUser {
  id: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

// Frontend (camelCase)
interface FrontendUser {
  id: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
}

// Usar mappers de src/utils/databaseMapping.ts
const frontendUser = mapUserFromDatabase(dbUser);
const dbUser = mapUserToDatabase(frontendUser);
```

## 📁 Estructura de Archivos

### Nomenclatura de Archivos
```
// ✅ Correcto
src/components/UserProfile.tsx
src/hooks/useUserData.ts
src/utils/databaseMapping.ts
src/types/userTypes.ts

// ❌ Incorrecto
src/components/user-profile.tsx
src/hooks/use_user_data.ts
src/utils/database_mapping.ts
src/types/user_types.ts
```

### Organización por Funcionalidad
```
src/
├── components/
│   ├── admin/
│   │   ├── AdminDashboard.tsx
│   │   └── UserManager.tsx
│   └── ui/
│       ├── Button.tsx
│       └── Modal.tsx
├── hooks/
│   ├── useUserData.ts
│   └── useToast.ts
├── utils/
│   ├── databaseMapping.ts
│   └── validationUtils.ts
└── types/
    ├── userTypes.ts
    └── errorTypes.ts
```

## ⚙️ Configuraciones Específicas

### Props de Componentes
```typescript
// ✅ Correcto
interface ButtonProps {
  variant: 'primary' | 'secondary';
  isLoading: boolean;
  onClick: () => void;
}

// ❌ Incorrecto
interface ButtonProps {
  variant: 'primary' | 'secondary';
  is_loading: boolean;
  on_click: () => void;
}
```

### Event Handlers
```typescript
// ✅ Correcto
const handleSubmit = () => { ... };
const handleUserClick = () => { ... };
const handleFormChange = () => { ... };

// ❌ Incorrecto
const onSubmit = () => { ... };
const userClick = () => { ... };
const formChange = () => { ... };
```

### Estado Local
```typescript
// ✅ Correcto
const [isLoading, setIsLoading] = useState(false);
const [userData, setUserData] = useState(null);
const [currentStep, setCurrentStep] = useState(1);

// ❌ Incorrecto
const [is_loading, set_is_loading] = useState(false);
const [user_data, set_user_data] = useState(null);
const [current_step, set_current_step] = useState(1);
```

## 🎯 Casos Específicos

### Acrónimos
```typescript
// ✅ Correcto
const API_BASE_URL = 'https://api.example.com';
const userId = 'user123';
const xmlParser = new XMLParser();

// ❌ Incorrecto
const Api_Base_Url = 'https://api.example.com';
const userID = 'user123';
const XMLParser = new XMLParser();
```

### Nombres Booleanos
```typescript
// ✅ Correcto
const isActive = true;
const hasPermission = false;
const canEdit = true;
const shouldRender = false;

// ❌ Incorrecto
const active = true;
const permission = false;
const edit = true;
const render = false;
```

### Funciones Utilitarias
```typescript
// ✅ Correcto
const formatCurrency = (amount: number) => { ... };
const validateEmail = (email: string) => { ... };
const generateUniqueId = () => { ... };

// ❌ Incorrecto
const formatCurr = (amount: number) => { ... };
const validateMail = (email: string) => { ... };
const genId = () => { ... };
```

## 🔧 Herramientas de Validación

### ESLint Rules (Recomendadas)
```json
{
  "rules": {
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "variable",
        "format": ["camelCase", "UPPER_CASE"]
      },
      {
        "selector": "function",
        "format": ["camelCase"]
      },
      {
        "selector": "typeLike",
        "format": ["PascalCase"]
      }
    ]
  }
}
```

## 🚀 Beneficios de Seguir estas Convenciones

- **Consistencia**: Código más profesional y fácil de mantener
- **Legibilidad**: Otros desarrolladores pueden entender el código rápidamente
- **Menos errores**: Convenciones claras reducen la confusión
- **Mejor DX**: Autocompletado más efectivo en IDEs
- **Onboarding**: Nuevos desarrolladores se adaptan más rápido

## 📝 Checklist de Revisión

Antes de hacer commit, verificar:

- [ ] Todas las constantes están en `UPPER_CASE`
- [ ] Variables y funciones están en `camelCase`
- [ ] Componentes están en `PascalCase`
- [ ] Hooks empiezan con `use` y están en `camelCase`
- [ ] Interfaces y tipos están en `PascalCase`
- [ ] Nombres de archivos siguen las convenciones
- [ ] Se usan mappers para conversión BD ↔ Frontend
- [ ] Nombres son descriptivos y no abreviados
