# Jobs Feature Module

Sistema completo de gestión de ofertas de empleo con editor, aplicaciones y templates.

## 📁 Estructura

```
jobs/
├── components/         # Componentes del editor
│   ├── JobBasicInfo.tsx
│   ├── JobTemplateSelector.tsx
│   ├── JobRequirements.tsx
│   ├── JobLocationSalary.tsx
│   ├── JobApplicationMethod.tsx
│   ├── JobPreview.tsx
│   └── JobsErrorBoundary.tsx
├── hooks/             # Hooks de gestión
│   ├── useJobForm.ts
│   └── useJobListManagement.ts
├── types/             # Tipos TypeScript
│   └── index.ts
└── validation/        # Schemas Zod
    └── schemas.ts
```

## 🚀 Uso Rápido

### Crear/Editar Oferta

```typescript
import { useJobForm } from '@/features/jobs';

function JobEditor({ jobId }: { jobId?: string }) {
  const {
    form,
    isLoading,
    onSubmit
  } = useJobForm(jobId);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <JobBasicInfo form={form} />
      <JobRequirements form={form} />
      <JobLocationSalary form={form} />
      <JobApplicationMethod form={form} />
      
      <button type="submit" disabled={isLoading}>
        Publicar Oferta
      </button>
    </form>
  );
}
```

### Gestión de Listas

```typescript
import { useJobListManagement } from '@/features/jobs';

function RequirementsEditor({ form }) {
  const {
    newRequirement,
    setNewRequirement,
    addItem,
    removeItem
  } = useJobListManagement(form.watch, form.setValue);

  return (
    <div>
      <input
        value={newRequirement}
        onChange={(e) => setNewRequirement(e.target.value)}
        placeholder="Nuevo requisito"
      />
      <button onClick={() => addItem('requirement', newRequirement)}>
        Añadir
      </button>
      
      {form.watch('requirements')?.map((req, index) => (
        <div key={index}>
          {req}
          <button onClick={() => removeItem('requirements', index)}>
            Eliminar
          </button>
        </div>
      ))}
    </div>
  );
}
```

## 📝 Validación con Zod

```typescript
import { jobPostSchema } from '@/features/jobs';

const validatedData = jobPostSchema.parse({
  title: 'Senior React Developer',
  slug: 'senior-react-developer',
  short_description: 'Buscamos un desarrollador React senior...',
  description: 'Descripción completa del puesto...',
  requirements: [
    '5+ años experiencia React',
    'TypeScript avanzado',
    'Testing (Jest, React Testing Library)'
  ],
  responsibilities: [
    'Desarrollar features frontend',
    'Code reviews',
    'Mentoring junior developers'
  ],
  contract_type: 'indefinido',
  employment_type: 'hybrid',
  experience_level: 'senior',
  location: 'Madrid',
  is_remote: true,
  salary_min: 45000,
  salary_max: 60000,
  show_salary: true,
  application_method: 'email',
  application_email: 'jobs@example.com',
  status: 'published'
});
```

## 🎯 Tipos de Empleo

### Contract Types

```typescript
type ContractType = 
  | 'indefinido'    // Contrato indefinido
  | 'temporal'      // Contrato temporal
  | 'autonomo'      // Autónomo
  | 'practicas'     // Prácticas
  | 'freelance';    // Freelance
```

### Employment Types

```typescript
type EmploymentType = 
  | 'full-time'     // Tiempo completo
  | 'part-time'     // Tiempo parcial
  | 'hybrid'        // Híbrido
  | 'remote';       // Remoto
```

### Experience Levels

```typescript
type ExperienceLevel = 
  | 'junior'        // Junior (0-2 años)
  | 'mid'           // Mid (2-5 años)
  | 'senior'        // Senior (5+ años)
  | 'lead'          // Lead/Manager
  | 'executive';    // Executive
```

### Application Methods

```typescript
type ApplicationMethod = 
  | 'email'         // Por email
  | 'url'           // URL externa
  | 'form';         // Formulario interno
```

## 📊 Estructura de JobPost

```typescript
import type { JobPost } from '@/features/jobs';

const job: JobPost = {
  id: '123',
  title: 'Senior React Developer',
  slug: 'senior-react-developer',
  category_id: 'cat-123',
  category_name: 'Desarrollo',
  
  short_description: 'Buscamos un desarrollador React senior...',
  description: 'Descripción completa...',
  
  requirements: [
    '5+ años experiencia React',
    'TypeScript avanzado'
  ],
  responsibilities: [
    'Desarrollar features frontend',
    'Code reviews'
  ],
  nice_to_have: [
    'Experiencia con Next.js',
    'Conocimientos de DevOps'
  ],
  benefits: [
    'Salario competitivo',
    'Trabajo remoto',
    'Formación continua'
  ],
  
  contract_type: 'indefinido',
  employment_type: 'hybrid',
  experience_level: 'senior',
  
  location: 'Madrid',
  is_remote: true,
  salary_min: 45000,
  salary_max: 60000,
  show_salary: true,
  
  application_method: 'email',
  application_email: 'jobs@example.com',
  
  status: 'published',
  published_at: '2024-01-01T00:00:00Z',
  expires_at: '2024-03-01T00:00:00Z',
  
  views_count: 150,
  applications_count: 12,
  
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z'
};
```

## 📋 JobApplication Type

```typescript
import type { JobApplication } from '@/features/jobs';

const application: JobApplication = {
  id: '1',
  job_post_id: '123',
  name: 'María García',
  email: 'maria@example.com',
  phone: '+34600000000',
  linkedin_url: 'https://linkedin.com/in/mariagarcia',
  portfolio_url: 'https://mariagarcia.com',
  resume_url: 'https://storage.com/resume.pdf',
  cover_letter: 'Me interesa mucho esta posición...',
  status: 'pending',
  created_at: '2024-01-15T10:00:00Z'
};

type ApplicationStatus = 
  | 'pending'       // Pendiente
  | 'reviewing'     // En revisión
  | 'shortlisted'   // Preseleccionado
  | 'interviewed'   // Entrevistado
  | 'rejected'      // Rechazado
  | 'accepted';     // Aceptado
```

## 🏷️ Categorías

```typescript
import type { JobCategory } from '@/features/jobs';

const category: JobCategory = {
  id: '1',
  name: 'Desarrollo',
  slug: 'desarrollo',
  description: 'Posiciones de desarrollo de software',
  icon: 'code',
  jobs_count: 25
};
```

## 📝 Templates

```typescript
import type { JobTemplate } from '@/features/jobs';

const template: JobTemplate = {
  id: '1',
  name: 'Template React Developer',
  description: 'Template para posiciones React',
  template_data: {
    contract_type: 'indefinido',
    employment_type: 'hybrid',
    experience_level: 'mid',
    requirements: [
      'Experiencia con React',
      'TypeScript',
      'Testing'
    ],
    benefits: [
      'Trabajo remoto',
      'Formación continua'
    ]
  },
  category_id: 'cat-dev',
  created_at: '2024-01-01T00:00:00Z'
};
```

## 🎨 Componentes del Editor

### JobBasicInfo

```typescript
import { JobBasicInfo } from '@/features/jobs';

<JobBasicInfo form={form} />
```

### JobRequirements

```typescript
import { JobRequirements } from '@/features/jobs';

<JobRequirements form={form} />
```

### JobLocationSalary

```typescript
import { JobLocationSalary } from '@/features/jobs';

<JobLocationSalary form={form} />
```

### JobApplicationMethod

```typescript
import { JobApplicationMethod } from '@/features/jobs';

<JobApplicationMethod form={form} />
```

### JobPreview

```typescript
import { JobPreview } from '@/features/jobs';

<JobPreview job={formData} />
```

## 🛡️ Validación Avanzada

### Validación de Salario

```typescript
// El schema valida automáticamente que:
- salary_max >= salary_min
- Ambos sean números positivos

jobPostSchema.refine(
  (data) => data.salary_max >= data.salary_min,
  { message: 'El salario máximo debe ser mayor al mínimo' }
);
```

### Validación de Método de Aplicación

```typescript
// Valida que el método tenga su campo requerido
jobPostSchema.refine(
  (data) => {
    if (data.application_method === 'email') {
      return !!data.application_email;
    }
    if (data.application_method === 'url') {
      return !!data.application_url;
    }
    return true;
  }
);
```

## 🔍 Búsqueda y Filtrado

```typescript
// Filtrar por categoría
const devJobs = jobs.filter(job => job.category_name === 'Desarrollo');

// Filtrar por nivel
const seniorJobs = jobs.filter(job => job.experience_level === 'senior');

// Filtrar por remoto
const remoteJobs = jobs.filter(job => job.is_remote);

// Búsqueda en texto
const searchResults = jobs.filter(job => 
  job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  job.short_description.toLowerCase().includes(searchTerm.toLowerCase())
);
```

## 🛡️ Mejores Prácticas

1. **Slugs únicos** y SEO-friendly
2. **Salarios transparentes** cuando sea posible
3. **Requisitos claros** y concisos
4. **Beneficios atractivos** destacados
5. **Descripciones completas** del puesto
6. **Templates reutilizables** para eficiencia
7. **Validación estricta** con Zod
8. **Error boundaries** en UI

## 🐛 Debugging

```typescript
// Ver datos del formulario
console.log('Form data:', form.watch());

// Ver errores
console.log('Form errors:', form.formState.errors);

// Validar manualmente
try {
  const valid = jobPostSchema.parse(data);
  console.log('Valid:', valid);
} catch (error) {
  console.error('Errors:', error.errors);
}
```
