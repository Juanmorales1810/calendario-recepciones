# � Calendario Disei Conelci

Una aplicación de calendario para gestionar recepciones de documentos y eventos, con autenticación de usuarios y sincronización offline.

![Next.js](https://img.shields.io/badge/Next.js-16.0.0-black)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-green)
![NextAuth](https://img.shields.io/badge/NextAuth-5-purple)

## ✨ Características

- 🔐 **Autenticación con NextAuth** - Registro e inicio de sesión de usuarios
- 📅 **Calendario de Eventos** - Crea, edita y elimina eventos
- 📄 **Calendario de Recepciones** - Gestión de documentos
- 💾 **Almacenamiento Dual** - MongoDB + localStorage para funcionamiento offline
- 🔄 **Sincronización Automática** - Sincroniza eventos locales al iniciar sesión
- 📱 **Diseño Responsivo** - Funciona en escritorio y móvil

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 16 con App Router
- **Base de Datos**: MongoDB con Mongoose
- **Autenticación**: NextAuth.js v5
- **Styling**: Tailwind CSS 4
- **UI**: shadcn/ui
- **TypeScript**: Tipado estricto

## 🚀 Configuración

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# MongoDB - Obtén tu URI de MongoDB Atlas o usa una instancia local
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/calendario-recepciones

# NextAuth - Genera un secreto seguro con: openssl rand -base64 32
AUTH_SECRET=tu-secreto-super-seguro-aqui
AUTH_URL=http://localhost:3000
```

### 3. Configurar MongoDB

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas) (gratis)
2. Crea un nuevo cluster
3. Crea un usuario de base de datos
4. Obtén la cadena de conexión y reemplázala en `MONGODB_URI`
5. Agrega tu IP a la lista blanca en Network Access

### 4. Ejecutar en desarrollo

```bash
pnpm dev
```

Visita [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts  # Handlers de NextAuth
│   │   │   └── register/route.ts       # Registro de usuarios
│   │   └── events/
│   │       ├── route.ts                # GET/POST eventos
│   │       ├── [id]/route.ts           # GET/PUT/DELETE evento
│   │       └── sync/route.ts           # Sincronización
│   ├── auth/
│   │   ├── signin/page.tsx             # Página de login
│   │   ├── register/page.tsx           # Página de registro
│   │   └── error/page.tsx              # Página de error
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/                           # Componentes de autenticación
│   ├── calendar-event/                 # Calendario de eventos
│   ├── document-calendar/              # Calendario de documentos
│   └── ui/                             # Componentes UI
├── hooks/
│   └── use-events.ts                   # Hook para gestión de eventos
├── lib/
│   ├── auth.ts                         # Configuración de NextAuth
│   ├── mongodb.ts                      # Conexión a MongoDB
│   └── utils.ts
├── models/
│   ├── User.ts                         # Modelo de Usuario
│   └── Event.ts                        # Modelo de Evento
└── types/
    └── next-auth.d.ts                  # Tipos de NextAuth
```

## 🔐 Autenticación

### Flujo de Usuario

1. **Sin autenticación**: Los eventos se guardan solo en localStorage
2. **Al registrarse/iniciar sesión**: Se muestra un banner para sincronizar eventos locales
3. **Sincronización**: Los eventos de localStorage se migran a MongoDB
4. **Funcionamiento normal**: Los eventos se guardan en ambos (MongoDB + localStorage como caché)

### Funcionamiento Offline

- Los eventos siempre se guardan en localStorage
- Si hay conexión y el usuario está autenticado, también se sincronizan con MongoDB
- Si hay error de red, los cambios quedan pendientes de sincronización

## 📜 Scripts

```bash
pnpm dev        # Desarrollo con Turbopack
pnpm build      # Construir para producción
pnpm start      # Iniciar servidor de producción
pnpm lint       # Ejecutar linter
```

## 🗄️ API Endpoints

### Autenticación

- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/callback/credentials` - Iniciar sesión
- `POST /api/auth/signout` - Cerrar sesión

### Eventos

- `GET /api/events` - Obtener todos los eventos del usuario
- `POST /api/events` - Crear nuevo evento
- `GET /api/events/:id` - Obtener evento específico
- `PUT /api/events/:id` - Actualizar evento
- `DELETE /api/events/:id` - Eliminar evento
- `POST /api/events/sync` - Sincronizar eventos desde localStorage

## 🚀 Despliegue

### Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en el dashboard
3. Despliega

### Variables de entorno en producción

Asegúrate de configurar:

- `MONGODB_URI`
- `AUTH_SECRET`
- `AUTH_URL` (tu dominio de producción)

## 📄 Licencia

MIT
