# CineFlix CRUD con LocalStorage

Aplicación web frontend para gestionar películas (CRUD) usando `localStorage`, con autenticación básica (login/registro), buscador, filtro por género, carrusel de recientes y vista en tarjetas.

## Características

- Registro e inicio de sesión de usuarios.
- Persistencia de sesión en `localStorage`.
- CRUD de películas:
  - Crear película.
  - Listar películas en grid.
  - Editar película.
  - Eliminar película.
- Búsqueda por texto (título, director, descripción).
- Filtro por género.
- Modal de detalles por película.
- Carrusel horizontal de películas recientes.

## Tecnologías usadas

- HTML5
- CSS3
- JavaScript (Vanilla)
- Bootstrap 5 (CDN)
- Bootstrap Icons (CDN)
- `localStorage` del navegador

## Estructura del proyecto

```text
.
|-- index.html
|-- styles.css
|-- localstorege.js
```

## Cómo ejecutar

1. Descarga o clona este repositorio.
2. Abre `index.html` en tu navegador.

No requiere instalación de dependencias ni backend.

## Usuarios de prueba

Puedes iniciar sesión con:

- `admin / admin123`
- `usuario / 1234`
- `demo / demo`

También puedes crear nuevas cuentas desde la pestaña de registro.

## Almacenamiento en LocalStorage

La app guarda información en estas claves:

- `peliculas`: listado de películas.
- `usuarios`: usuarios registrados.
- `sesion`: usuario autenticado actualmente.

## Flujo general

1. El usuario inicia sesión o se registra.
2. Se habilita la vista principal con buscador, filtro, carrusel y grid.
3. Desde el botón "Agregar Película" se abre un modal para crear.
4. Cada tarjeta permite ver detalles, editar o eliminar (si hay sesión activa).
5. Todos los cambios quedan persistidos en `localStorage`.

## Posibles mejoras

- Validaciones más estrictas (URL de imagen, rangos de año, etc.).
- Hash de contraseñas (actualmente se almacenan en texto plano).
- Paginación del grid.
- Exportar/importar datos.
- Pruebas unitarias y de integración.

