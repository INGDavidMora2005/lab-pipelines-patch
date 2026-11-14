# DevHub · App 2 (Path Location)

DevHub es un portafolio para desarrolladores: una página de inicio, una vista de proyectos y un formulario de contacto. Este repositorio es la **App 2** del Laboratorio Pipelines de Arquitectura de Software (UCEVA, docente Jesus David Mejia Vergara). Está construida con Angular 22, usa la estrategia de enrutamiento **Path Location** y tiene una identidad visual propia: tema claro cálido, acento naranja y títulos en Fraunces.

**Aplicación desplegada:** <https://ingdavidmora2005.github.io/lab-pipelines-patch/>

[![CI/CD](https://github.com/INGDavidMora2005/lab-pipelines-patch/actions/workflows/deploy.yml/badge.svg?branch=master)](https://github.com/INGDavidMora2005/lab-pipelines-patch/actions/workflows/deploy.yml)

## Stack

Versiones declaradas en [`package.json`](package.json):

- **Angular ^22.2.0** (`@angular/core`, `common`, `compiler`, `forms`, `platform-browser`, `router`), con componentes standalone y sin SSR.
- **TypeScript ~6.0.2** y **SCSS** para los estilos.
- **Vitest ^5.0.0** con **jsdom ^30.0.0** para las pruebas unitarias.
- **Prettier ^3.8.1** para el formato del código.
- **Node.js 24** en el pipeline (`actions/setup-node`) y **npm 12.2.1** como gestor (`packageManager`).

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

Scripts reales de `package.json`:

| Script | Comando | Qué hace |
|---|---|---|
| `start` | `ng serve` | Servidor de desarrollo en `http://localhost:4200/`. |
| `build` | `ng build` | Build de producción en `dist/lab-pipelines-path/browser/`. |
| `watch` | `ng build --watch --configuration development` | Build de desarrollo con recarga. |
| `test` | `ng test` | Pruebas unitarias con Vitest; en CI se ejecuta `npm test -- --no-watch`. |
| `ng` | `ng` | Acceso directo a la CLI de Angular. |

El nombre interno del proyecto Angular es `lab-pipelines-path` (ver `angular.json`), por eso la salida del build queda en `dist/lab-pipelines-path/browser/`.

En local no hace falta `--base-href` ni `404.html`: `ng serve` ya devuelve `index.html` para cualquier ruta.

## Pipeline de CI/CD

El workflow está en [.github/workflows/deploy.yml](.github/workflows/deploy.yml) y se llama **CI/CD**.

**Disparadores:** `push` y `pull_request` sobre la rama por defecto `master`, más `workflow_dispatch` para ejecutarlo manualmente. La concurrencia usa `group: ${{ github.ref }}` con `cancel-in-progress: true`: un push nuevo cancela la ejecución anterior de la misma referencia. El workflow solo pide `contents: read`; el job `deploy` añade `pages: write` e `id-token: write`.

**Job `build`** (ubuntu-latest):

1. **Checkout:** descarga el código (`actions/checkout@v7`).
2. **Configurar Node.js:** instala Node 24 con caché de npm (`actions/setup-node@v7`).
3. **Instalar dependencias:** `npm ci`.
4. **Ejecutar pruebas:** `npm test -- --no-watch` (23 pruebas en 7 archivos). Si alguna falla, el pipeline se detiene.
5. **Compilar:** `npm run build -- --base-href /lab-pipelines-patch/`.
6. **Copiar a 404.html:** copia `dist/lab-pipelines-path/browser/index.html` a `404.html` en la misma carpeta.
7. **Validar artefactos:** falla si no existe `404.html` o si el `index.html` no contiene `base href="/lab-pipelines-patch/"`.
8. **Preparar Pages:** `actions/configure-pages@v6` y `actions/upload-pages-artifact@v5` con la carpeta `dist/lab-pipelines-path/browser`. Ambos pasos solo se ejecutan en `push` o `workflow_dispatch` sobre `master`; en un `pull_request` el job únicamente valida pruebas y build.

**Job `deploy`** (depende de `build`): se ejecuta con las mismas condiciones que la subida del artefacto, es decir, solo en `push` o `workflow_dispatch` sobre `master`. Declara los permisos `pages: write` e `id-token: write`, usa el entorno `github-pages` con la URL de salida, el grupo de concurrencia `pages` con `cancel-in-progress: false` y publica con `actions/deploy-pages@v5`.

**Job `verify`** (depende de `deploy`): comprueba la publicación con `curl` y hasta 10 intentos cada 15 segundos. Consulta la URL base **con barra final** (sin ella GitHub Pages responde 301) y exige HTTP 200 y el marcador `<app-root>`; además verifica que el bundle principal responda 200 y que la ruta profunda `/proyectos` contenga `<app-root>`. En esa ruta profunda no exige un código concreto: Pages puede responder 404 por diseño y el cuerpo igualmente sirve la app. El resumen queda en el *step summary* de la ejecución.

Versiones mayores de las acciones, contrastadas con sus releases oficiales: `actions/checkout@v7`, `actions/setup-node@v7`, `actions/configure-pages@v6`, `actions/upload-pages-artifact@v5` y `actions/deploy-pages@v5`.

Desde local no se pueden ejecutar GitHub Actions: el workflow se valida con actionlint y la primera ejecución real la hace GitHub al recibir el push.

**Paso manual en GitHub:** la publicación usa GitHub Pages con **Settings → Pages → Source = GitHub Actions**. Si el repositorio se configura desde cero, ese ajuste debe hacerse una vez en la interfaz de GitHub.

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

Cada componente y cada página tiene su archivo `.spec.ts` con pruebas unitarias: **7 archivos** y **23 pruebas** en total.

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

## Autor

**David Mora Duque** — GitHub [INGDavidMora2005](https://github.com/INGDavidMora2005). Repositorio desarrollado en equipo con los integrantes listados arriba.
