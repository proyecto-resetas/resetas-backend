# 🔐 Sistema de OTP (One-Time Password)

## Descripción

Este sistema permite generar y verificar códigos OTP (contraseñas de un solo uso) que se envían por email utilizando la API de Brevo.

## 📋 Características

- ✅ Generación de códigos OTP de 6 dígitos
- ✅ Envío de emails a través de Brevo
- ✅ Expiración de códigos después de 10 minutos
- ✅ Límite de 3 intentos de verificación
- ✅ Limpieza automática de códigos expirados
- ✅ Plantilla de email HTML atractiva

## 🚀 Configuración

### 1. Instalar dependencias

El proyecto ya utiliza `axios` para realizar peticiones HTTP a la API de Brevo:

```bash
npm install
```

### 2. Configurar variables de entorno

Agrega las siguientes variables a tu archivo `.env`:

```env
# Brevo Email Configuration
BREVO_API_KEY=tu_api_key_de_brevo_aqui
BREVO_SENDER_EMAIL=noreply@tudominio.com
```

### 3. Obtener API Key de Brevo

1. Regístrate en [Brevo](https://www.brevo.com/)
2. Ve a **Settings** → **API Keys**
3. Crea una nueva API key
4. Copia la key y agrégala a tu archivo `.env`

### 4. Configurar email de remitente

1. En Brevo, ve a **Senders & IP**
2. Agrega y verifica tu dominio/email
3. Usa ese email en la variable `BREVO_SENDER_EMAIL`

## 📡 Endpoints de la API

### 1. Generar OTP

**Endpoint:** `POST /auth/otp/generate`

**Descripción:** Genera un código OTP de 6 dígitos y lo envía al email del usuario.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Código OTP enviado exitosamente al email"
}
```

**Errores posibles:**
- `400`: El usuario no existe
- `500`: Error al generar el código OTP

---

### 2. Verificar OTP

**Endpoint:** `POST /auth/otp/verify`

**Descripción:** Verifica si el código OTP ingresado por el usuario es correcto.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "code": "123456"
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Código OTP verificado exitosamente",
  "verified": true
}
```

**Errores posibles:**
- `400`: No se encontró un código OTP válido para este email
- `400`: El código OTP ha expirado
- `400`: Has excedido el número máximo de intentos
- `400`: Código incorrecto. Te quedan X intento(s)
- `500`: Error al verificar el código OTP

## 🎨 Ejemplo de uso desde el Frontend

### Con JavaScript/TypeScript (Fetch)

```javascript
// Generar OTP
async function generateOtp(email) {
  try {
    const response = await fetch('http://localhost:3000/auth/otp/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error('Error al generar OTP:', error);
  }
}

// Verificar OTP
async function verifyOtp(email, code) {
  try {
    const response = await fetch('http://localhost:3000/auth/otp/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });
    
    const data = await response.json();
    
    if (data.verified) {
      console.log('¡Código verificado exitosamente!');
      // Redirigir o continuar con el flujo
    }
  } catch (error) {
    console.error('Error al verificar OTP:', error);
  }
}
```

### Con Axios

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:3000';

// Generar OTP
async function generateOtp(email) {
  try {
    const response = await axios.post(`${API_URL}/auth/otp/generate`, { email });
    console.log(response.data.message);
  } catch (error) {
    console.error('Error:', error.response?.data?.message);
  }
}

// Verificar OTP
async function verifyOtp(email, code) {
  try {
    const response = await axios.post(`${API_URL}/auth/otp/verify`, { 
      email, 
      code 
    });
    
    if (response.data.verified) {
      console.log('¡Verificado!');
    }
  } catch (error) {
    console.error('Error:', error.response?.data?.message);
  }
}
```

### Ejemplo React

```jsx
import { useState } from 'react';

function OtpForm() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('email'); // 'email' o 'verify'

  const handleGenerateOtp = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3000/auth/otp/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(data.message);
        setStep('verify');
      }
    } catch (error) {
      alert('Error al generar OTP');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3000/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      
      const data = await response.json();
      
      if (data.verified) {
        alert('¡Código verificado exitosamente!');
        // Continuar con tu flujo
      }
    } catch (error) {
      alert('Error al verificar OTP');
    }
  };

  return (
    <div>
      {step === 'email' ? (
        <form onSubmit={handleGenerateOtp}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Enviar Código</button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <input
            type="text"
            placeholder="Código de 6 dígitos"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            required
          />
          <button type="submit">Verificar</button>
        </form>
      )}
    </div>
  );
}
```

## 🗄️ Modelo de Base de Datos

La colección `otp` en MongoDB tiene la siguiente estructura:

```typescript
{
  email: string;           // Email del usuario
  code: string;            // Código OTP de 6 dígitos
  expiresAt: Date;         // Fecha de expiración (10 minutos)
  verified: boolean;       // Si el código fue verificado
  attempts: number;        // Número de intentos (máximo 3)
  createdAt: Date;         // Fecha de creación (automático)
  updatedAt: Date;         // Fecha de actualización (automático)
}
```

## 🔒 Seguridad

- Los códigos expiran después de **10 minutos**
- Se permite un máximo de **3 intentos** de verificación
- Los códigos antiguos no verificados se eliminan al generar uno nuevo
- Los códigos verificados no se pueden reutilizar

## 📧 Personalización del Email

Puedes personalizar la plantilla del email modificando el método `sendOtpEmail` en `/src/common/utils/services/brevo.service.ts`.

La plantilla actual incluye:
- Logo/nombre de la aplicación
- Código OTP destacado
- Tiempo de expiración
- Diseño responsive
- Colores personalizables

## 🧪 Pruebas

Puedes probar los endpoints usando:

1. **Swagger UI**: `http://localhost:3000/api` (si está configurado)
2. **Postman/Insomnia**: Importa la colección con los endpoints
3. **cURL**:

```bash
# Generar OTP
curl -X POST http://localhost:3000/auth/otp/generate \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@ejemplo.com"}'

# Verificar OTP
curl -X POST http://localhost:3000/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@ejemplo.com","code":"123456"}'
```

## 📚 Documentación adicional

- [API de Brevo](https://developers.brevo.com/reference/sendtransacemail)
- [NestJS Documentation](https://docs.nestjs.com/)

## ❓ Problemas comunes

### Error: BREVO_API_KEY no está configurada
**Solución:** Asegúrate de agregar la variable `BREVO_API_KEY` en tu archivo `.env`

### Error: No se pudo enviar el email
**Solución:** 
- Verifica que tu API key sea válida
- Verifica que el email de remitente esté verificado en Brevo
- Revisa los logs para más detalles

### El código no llega al email
**Solución:**
- Revisa la carpeta de spam
- Verifica que el email existe en la base de datos
- Revisa los logs del servidor

## 🤝 Contribución

Si encuentras algún problema o tienes sugerencias, por favor abre un issue o crea un pull request.





