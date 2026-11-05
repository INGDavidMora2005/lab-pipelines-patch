# DevHub · App 2 (Path Location)

DevHub es un portafolio para desarrolladores: una página de inicio, una vista de proyectos y un formulario de contacto. Este repositorio es la **App 2** del Laboratorio Pipelines de Arquitectura de Software (UCEVA, docente Jesus David Mejia Vergara). Está construida con Angular 22, usa la estrategia de enrutamiento **Path Location** y tiene una identidad visual propia: tema claro cálido, acento naranja y títulos en Fraunces.

## Estrategia de enrutamiento: Path Location

Las rutas se ven como rutas normales del servidor, sin `#`:

```
/inicio   /proyectos   /contacto
```

`PathLocationStrategy` es la estrategia por defecto de Angular, así que no hay que declararla. En [src/app/app.config.ts](src/app/app.config.ts) solo aparece `provideRouter(routes)`, sin `withHashLocation()` ni ningún proveedor de `LocationStrategy`. Por eso la app usa Path Location.

Rutas definidas en [src/app/app.routes.ts](src/app/app.routes.ts):

| Ruta | Destino | Título | Carga |
|---|---|---|---|
| `''` (raíz) | Redirige a `/inicio` | — | — |
| `/inicio` | Componente `Inicio` | Inicio | Inmediata |
| `/proyectos` | Componente `Proyectos` | Proyectos | Diferida (`loadComponent`) |
| `/contacto` | Componente `Contacto` | Contacto | Inmediata |
| `**` (comodín) | Redirige a `/inicio` | — | — |

[src/app/app.routes.spec.ts](src/app/app.routes.spec.ts) verifica las cinco: la raíz, `/inicio`, `/proyectos`, `/contacto` y la redirección de una ruta desconocida a Inicio.

## El problema de Path Location en GitHub Pages

GitHub Pages es un servidor de archivos estáticos. Si navegas dentro de la app no hay problema, porque el router de Angular cambia la URL sin pedir nada al servidor. Pero si **recargas** la página o **abres directamente** una URL interna, como `.../lab-pipelines-patch/proyectos`, el servidor busca un archivo `proyectos` que no existe y responde **404**.

**Solución usada (la del docente):** el workflow copia `index.html` como `404.html` dentro de la carpeta publicada. Cuando GitHub Pages no encuentra un archivo, sirve `404.html`. Como es la misma app, Angular arranca, lee la URL y muestra la vista correcta.

**Es un parche, no una solución completa:**

- La respuesta HTTP sigue teniendo **estado 404** aunque el navegador muestre la app bien. Esto puede afectar a buscadores, monitoreo o herramientas que miran el código de estado.
- En un servidor propio, como **Nginx**, se resolvería con una regla de *fallback* que devuelva `index.html` con estado 200 para cualquier ruta que no sea un archivo:

  ```nginx
  location / {
    try_files $uri $uri/ /index.html;
  }
  ```

- El `--base-href "/lab-pipelines-patch/"` del build solo le indica al navegador dónde buscar los recursos (JS, CSS, favicon) porque la app vive en un subdirectorio. **No arregla los 404** de las rutas internas: eso lo hace el `404.html`.

## URL pública

- App: https://ingdavidmora2005.github.io/lab-pipelines-patch/
- Rutas internas:
  - https://ingdavidmora2005.github.io/lab-pipelines-patch/inicio
  - https://ingdavidmora2005.github.io/lab-pipelines-patch/proyectos
  - https://ingdavidmora2005.github.io/lab-pipelines-patch/contacto

## Cómo correrlo en local

Requiere Node.js (el pipeline usa la versión 24) y npm.

```bash
npm ci                    # instala las dependencias exactas de package-lock.json
npm start                 # ng serve: servidor de desarrollo en http://localhost:4200/
npm test -- --no-watch    # pruebas unitarias (Vitest) una sola vez
npm run build             # build de producción en dist/lab-pipelines-path/browser
```

En local no hace falta `--base-href` ni `404.html`: `ng serve` ya devuelve `index.html` para cualquier ruta.

## Pipeline de CI/CD

El workflow está en [.github/workflows/deploy.yml](.github/workflows/deploy.yml) ("Deploy Angular to GitHub Pages").

**Disparador:** cada `push` a la rama `master`, y también manualmente (`workflow_dispatch`). Tiene permisos `pages: write` e `id-token: write`, y el grupo de concurrencia `pages` evita dos despliegues simultáneos.

**Job `build`** (ubuntu-latest):

1. **Checkout:** descarga el código (`actions/checkout@v4`).
2. **Setup Node.js:** instala Node 24 con caché de npm (`actions/setup-node@v4`).
3. **Setup Pages:** prepara la configuración de GitHub Pages (`actions/configure-pages@v5`).
4. **Install dependencies:** `npm ci`.
5. **Run Unit Tests:** `npm test -- --watch=false`. Si alguna prueba falla, el pipeline se detiene y no se despliega.
6. **Build Angular:** `npm run build -- --base-href "/${{ github.event.repository.name }}/"`, que en este repositorio queda como `/lab-pipelines-patch/`.
7. **Configure GitHub Pages fallback:** copia `dist/lab-pipelines-path/browser/index.html` a `404.html` en la misma carpeta (el parche explicado arriba).
8. **Upload artifact:** sube `./dist/lab-pipelines-path/browser` como artefacto de Pages (`actions/upload-pages-artifact@v3`).

**Job `deploy`** (depende de `build`): publica el artefacto en el entorno `github-pages` con `actions/deploy-pages@v5` y expone la URL del sitio.

## Estructura del proyecto

```
src/
├── index.html                 # carga Inter, JetBrains Mono y Fraunces
├── styles.scss                # variables de tema y clases globales
└── app/
    ├── app.config.ts          # provideRouter(routes)
    ├── app.routes.ts          # tabla de rutas
    ├── app.routes.spec.ts     # pruebas de enrutamiento
    ├── app.ts / app.html / app.scss / app.spec.ts
    ├── components/
    │   ├── navbar/            # menú con enlaces Inicio, Proyectos, Contacto
    │   └── footer/            # pie de página
    └── pages/
        ├── inicio/            # bienvenida y botones de acción
        ├── proyectos/         # tarjetas de proyectos (carga diferida)
        └── contacto/          # formulario de contacto
```

Cada componente y cada página tiene su archivo `.spec.ts` con pruebas unitarias.

## Diseño

La App 2 usa un tema claro cálido con acento naranja; la App 1, en cambio, usa un tema oscuro con acento azul. Las variables están en [src/styles.scss](src/styles.scss) y documentadas en [docs/diseno.md](docs/diseno.md):

| Variable | Valor | Uso |
|---|---|---|
| `--bg` | `#faf7f2` | Fondo de la página |
| `--surface` | `#ffffff` | Tarjetas, menú y pie |
| `--border` | `#e4dccf` | Bordes |
| `--text` | `#1c1917` | Texto y títulos |
| `--muted` | `#57534e` | Texto secundario |
| `--accent` | `#b63d0b` | Naranja: enlaces, etiquetas, botones, borde del menú |
| `--accent-2` | `#0f766e` | Verde azulado (`.tag`) |
| `--on-accent` | `#ffffff` | Texto sobre el acento |
| `--radius` | `4px` | Esquinas más rectas |

**Tipografías:**

- **Fraunces** 600/700 (`--font-serif`): títulos h1–h3 y la marca "DevHub".
- **Inter** (`--font-sans`): texto general.
- **JetBrains Mono** (`--font-mono`): código y etiquetas.

Todas las combinaciones de texto y fondo cumplen WCAG AA (mínimo 4.5:1); los valores están en `docs/diseno.md`.

## Flujo de trabajo del equipo

- **Ramas:** nadie trabaja directamente en `master`. Cada cambio va en su propia rama con prefijo según el tipo y el autor, por ejemplo `feature/juanpablo-contacto`, `fix/david-ruta-inicio`, `style/juanpablo-tema-claro` o `docs/juanpablo-readme`.
- **Pull Requests:** todo cambio entra a `master` por un Pull Request que revisa y aprueba **otro integrante** del equipo. Al hacer merge a `master` se dispara el despliegue.
- **Conventional Commits:** los mensajes siguen el formato `tipo(alcance): descripción`, por ejemplo `feat`, `fix`, `style` o `docs`.
- **Pruebas unitarias obligatorias:** cada componente y cada página tiene su `.spec.ts`, y el pipeline ejecuta las pruebas antes del build. Si alguna falla, no se despliega.

## Integrantes

- David Mora Duque
- Juan Pablo Devia
- Juan Diego Rodriguez
