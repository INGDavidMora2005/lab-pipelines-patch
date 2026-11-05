# Diseño común DevHub

## Paleta y tipografía (App 2, Path Location)
Tema claro cálido con acento naranja; se distingue de la App 1 (tema oscuro con acento azul).

| Variable | Valor | Uso |
|---|---|---|
| `--bg` | #faf7f2 | Fondo de la página |
| `--surface` | #ffffff | Tarjetas, menú y pie |
| `--border` | #e4dccf | Bordes |
| `--text` | #1c1917 | Texto y títulos |
| `--muted` | #57534e | Texto secundario y descripciones |
| `--accent` | #b63d0b | Acento naranja: enlaces, etiquetas, botones, borde del menú |
| `--accent-2` | #0f766e | Acento verde azulado (`.tag`) |
| `--on-accent` | #ffffff | Texto sobre el acento |
| `--radius` | 4px | Esquinas más rectas |

- Fuentes: Fraunces 600/700 (`--font-serif`, títulos h1–h3 y marca "DevHub"), Inter (`--font-sans`, texto) y JetBrains Mono (`--font-mono`, código y etiquetas).
- Menú: fondo `--surface` con borde inferior de 3px en `--accent`; enlace activo con fondo `color-mix(in srgb, var(--accent) 12%, transparent)` y texto `--accent`.

### Contraste (WCAG AA, mínimo 4.5:1)
| Combinación | Ratio |
|---|---|
| `--text` sobre `--bg` / `--surface` | 16.37 / 17.49 |
| `--muted` sobre `--bg` / `--surface` | 7.14 / 7.63 |
| `--accent` sobre `--bg` / `--surface` | 5.37 / 5.74 |
| Blanco sobre `--accent` | 5.74 |
| `--accent` sobre su fondo de etiqueta (12 % sobre `--surface` / `--bg`) | 4.80 / 4.51 |

El naranja propuesto #c2410c daba 4.35:1 sobre el fondo de etiqueta, así que se oscureció lo mínimo (luminosidad HSL) hasta #b63d0b.

## Textos de las vistas

### Inicio (ruta /inicio)
- Título: Hola, somos DevHub
- Subtítulo: Un hub para mostrar proyectos de desarrollo, desplegados automáticamente con CI/CD.
- Tarjetas: Código limpio | Despliegue continuo | Trabajo en equipo
- Botón: Ver proyectos (lleva a /proyectos)

### Proyectos (ruta /proyectos)
- Título: Proyectos
- Subtítulo: Lo que hemos construido en el laboratorio.
- Tarjetas: lab-pipelines-hash (Hash Location) | lab-pipelines-path (Path Location) | Pipeline CI/CD (GitHub Actions + Pages)

### Contacto (ruta /contacto)
- Título: Contacto
- Subtítulo: ¿Quieres saber más? Escríbenos.
- Formulario: nombre, correo y mensaje; al enviar muestra "Mensaje enviado"
