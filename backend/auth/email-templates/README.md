# Plantillas de email — SaludCoNet

Estas son las plantillas custom para los emails transaccionales que manda Supabase Auth.
**Supabase no las lee de aquí**: hay que copiar/pegar el HTML en el dashboard cada vez que se
actualicen. Este directorio es el "source of truth" versionado.

## Cómo aplicar una plantilla

1. Entra al dashboard:
   https://supabase.com/dashboard/project/dhtsunfisrucazfrbbnc/auth/templates

2. Selecciona la plantilla correspondiente en el menú lateral (Magic Link, Confirm signup, etc.).

3. **Subject** (asunto del email): pega el subject sugerido al inicio de cada archivo HTML.

4. **Body**: borra el contenido por defecto y pega el HTML completo del archivo `.html`.

5. **Save changes**.

6. **Manda un email de prueba** desde el dashboard ("Send test email") y verifica que se ve bien
   en Gmail, Outlook web, y móvil.

## Plantillas disponibles

| Archivo | Cuándo se manda | Subject sugerido |
|---|---|---|
| `magic-link.html` | Usuario con cuenta OAuth pulsa "Crear contraseña" → recibe link para verificar | `Establece tu contraseña en SaludCoNet` |
| `reset-password.html` | Usuario pulsa "Olvidé mi contraseña" en /recuperar | `Recupera tu contraseña de SaludCoNet` |

## Variables disponibles en las plantillas

Supabase expone estas variables que puedes interpolar con `{{ .Variable }}`:

- `{{ .ConfirmationURL }}` — URL completa con token, lleva al callback que autentica al user
- `{{ .Email }}` — email del destinatario
- `{{ .Token }}` — OTP de 6 dígitos (alternativa al link)
- `{{ .TokenHash }}` — hash del token
- `{{ .SiteURL }}` — URL del site configurado en Supabase
- `{{ .RedirectTo }}` — URL de redirect después de confirmar

## Notas técnicas

- Usar `<table>` para layout (NO flexbox/grid — Outlook no los soporta)
- Estilos inline (NO `<style>` blocks salvo media queries)
- Evita imágenes EXCEPTO el logo: es un PNG alojado en `https://app.saludconet.com/logo-email.png`
  (fichero versionado en `public/logo-email.png`) con `alt="SaludCoNet"` de respaldo. NO uses base64
  (Outlook lo bloquea). El logo solo se ve si el dominio de prod está desplegado con ese asset; si el
  cliente bloquea imágenes, se muestra el texto del `alt`.
- Texto preheader oculto para mejorar el preview en el inbox
- Probar siempre en al menos: Gmail web, Gmail mobile, Outlook web
