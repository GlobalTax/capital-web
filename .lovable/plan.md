

## Plan: Rediseñar "Envíos ROD" con estructura idéntica al sistema Outbound

### Contexto
El panel actual de Envíos ROD es un diálogo simple. El usuario quiere replicar la experiencia completa del `MailStep.tsx` de outbound (Template + Firma + Lista de emails + Copias CC) y añadir una sección separada de Envío y seguimiento.

### Estructura final

```text
Envíos ROD
├── Mail (sub-pestaña)
│   ├── Template       → Editor con variables {{nombre}}, {{empresa}}, vista previa en tiempo real
│   ├── Firma          → Reutiliza SignatureEditorSection (ya existe en MailStep)
│   ├── Lista de emails → Tabla de destinatarios ROD con email personalizado editable por fila
│   └── Copias (CC)    → Selector de CC reutilizando useActiveEmailRecipients
│
└── Envío y seguimiento (sub-pestaña)
    ├── Envío de prueba → Enviar a 1 email de test (reenviar ilimitadamente)
    ├── Envío masivo    → Enviar a toda la lista seleccionada
    ├── Envío individual → Enviar a contactos específicos desde la tabla
    └── Historial       → Tabla con estado de cada envío/destinatario
```

### Cambios por archivo

**1. `src/components/admin/rod/RODSendsTab.tsx`** — Reescritura completa
- Reemplazar el diálogo actual por una vista inline con 2 sub-pestañas principales: "Mail" y "Envío y seguimiento"
- Sub-pestaña "Mail": replicar la estructura de `MailStep.tsx` con 4 tabs internas (Template, Firma, Lista de emails, Copias CC)
  - **Template**: Editor de asunto + cuerpo con variables clickables (`{{nombre}}`, `{{empresa}}`), vista previa en tiempo real con datos del primer contacto de la lista, auto-guardado con debounce
  - **Firma**: Reutilizar `useEmailSignature` y el patrón de `SignatureEditorSection`
  - **Lista de emails**: Tabla con todos los miembros de `rod_list_members` del idioma seleccionado, mostrando email generado por contacto, con posibilidad de editar individualmente (clic en fila abre diálogo de edición)
  - **Copias CC**: Reutilizar `useActiveEmailRecipients`
- Sub-pestaña "Envío y seguimiento":
  - Panel de envío de prueba (input email + botón enviar, reenviar ilimitadamente)
  - Botón de envío masivo con confirmación
  - Tabla de destinatarios con estado individual (pendiente/enviado/error), búsqueda, envío individual por fila
  - Historial de envíos anteriores

**2. `src/components/admin/rod/RODMailTemplate.tsx`** — Nuevo componente
- Editor de template ROD: variables, asunto, cuerpo, vista previa lado a lado (idéntico visualmente a la captura)

**3. `src/components/admin/rod/RODMailList.tsx`** — Nuevo componente  
- Tabla de destinatarios con emails personalizados, buscador, contadores, edición individual

**4. `src/components/admin/rod/RODSendTracking.tsx`** — Nuevo componente
- Envío de prueba, envío masivo, envío individual, historial con estados

**5. DB: tabla `rod_send_emails`** — Nueva migración
- Almacenar emails personalizados por destinatario (rod_list_member_id, send_id, subject, body, status, sent_at)
- Permitir edición individual antes del envío

**6. `supabase/functions/send-rod-email/index.ts`** — Actualizar
- Soporte para firma HTML en el email
- Soporte para CC recipients
- Soporte para envío individual (por recipient_id)

### Detalles técnicos
- Se reutiliza `useEmailSignature` y `generateSignatureHtml` existentes
- Se reutiliza `useActiveEmailRecipients` para CC
- Las variables ROD son: `{{nombre}}`, `{{empresa}}`, `{{firmante_nombre}}`, `{{firmante_cargo}}`, `{{firmante_telefono}}`
- La vista previa resuelve variables en tiempo real con datos del primer contacto
- El template se guarda en `rod_sends` (subject, body_html, body_text) con auto-save

