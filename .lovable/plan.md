

# Añadir cláusula RGPD/LOPD al Compromiso de Confidencialidad

## Cambio

Añadir una nueva cláusula 7 sobre protección de datos personales (RGPD/LOPD) al array `clauses` en la función `generateConfidentialityPdf` del archivo `supabase/functions/send-valuation-email/index.ts`.

## Texto de la nueva cláusula

**7. Protección de datos personales.** Capittal tratará los datos personales del Cliente conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD). Los datos facilitados serán tratados con la finalidad exclusiva de prestar los servicios profesionales solicitados. El Cliente podrá ejercer sus derechos de acceso, rectificación, supresión, limitación, portabilidad y oposición dirigiéndose a samuel@capittal.es. Para más información, puede consultar nuestra política de privacidad en capittal.es.

## Detalle técnico

| Archivo | Cambio |
|---|---|
| `supabase/functions/send-valuation-email/index.ts` (línea ~426) | Añadir cláusula 7 al array `clauses` |

Se insertará un nuevo elemento al final del array `clauses` (línea 426), después de la cláusula 6 (Duración):

```text
['7. Protección de datos personales.', ' Capittal tratará los datos personales del Cliente conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD). Los datos facilitados serán tratados con la finalidad exclusiva de prestar los servicios profesionales solicitados. El Cliente podrá ejercer sus derechos de acceso, rectificación, supresión, limitación, portabilidad y oposición dirigiéndose a samuel@capittal.es. Para más información, puede consultar nuestra política de privacidad en capittal.es.'],
```

## Consideraciones

- El texto cabe en la misma página ya que hay espacio suficiente antes de la firma (y > 120 threshold para nueva página ya está implementado).
- No se modifican otros archivos ni la estructura del PDF.
- Se redesplega la Edge Function tras el cambio.

