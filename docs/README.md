# Talentea

Talentea es un MVP de bolsa de talento orientado a perfiles artisticos y empresas.
El proyecto cubre:

- Registro y autenticacion con roles `usuario`, `empresa` y `admin`
- Perfil profesional editable con portafolio, intereses, categorias y habilidades
- Publicacion, edicion, eliminacion y cierre de proyectos por parte de empresas
- Busqueda publica de proyectos y talento por categoria y palabra clave
- Candidaturas con estados `enviada`, `en revision`, `aceptada` y `rechazada`
- Valoraciones entre participantes al finalizar un proyecto
- Verificacion manual de perfiles, vista administrativa y auditoria simple

## Requisitos

- Node.js
- MongoDB en `mongodb://localhost:27017/talentea` o ajustar `backend/.env`

## Arranque

1. Entrar en `backend`
2. Ejecutar `npm install` si hiciera falta
3. Ejecutar `npm run dev`
4. Abrir `http://localhost:5000`

## Crear administrador

Desde `backend`:

```bash
npm run crear:admin
```

Variables opcionales en `.env`:

```env
ADMIN_EMAIL=admin@talentea.local
ADMIN_PASSWORD=Admin1234
```

## Flujo del MVP

1. Registro de usuario o empresa
2. Edicion del perfil y portafolio
3. Publicacion de proyecto por una empresa
4. Busqueda de talento y proyectos
5. Postulacion a una oferta desde un perfil de usuario
6. Gestion del estado de candidatura por la empresa
7. Marcado del proyecto como completado
8. Valoracion final entre participantes

## Estructura

- `backend/`: API REST con Express y MongoDB
- `frontend/`: interfaz web ligera servida como estatico por Express
- `docs/README.md`: guia de uso del MVP
