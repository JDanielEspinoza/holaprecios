

# Plan: Upgrade Visual Premium SaaS

Mejora visual global de toda la app sin cambiar lógica ni estructura. Solo diseño, profundidad y transiciones.

## 1. CSS Variables y Gradientes Base (`src/index.css`)

- Aumentar `--radius` a `0.75rem` (12px) para esquinas más suaves
- Agregar variables CSS para gradientes y sombras reutilizables
- Agregar clases utilitarias: `.card-premium` (sombra doble + hover elevación), `.btn-premium` (gradiente + press animation scale 0.97), `.input-premium` (glow en focus)
- Agregar animaciones: `fade-slide-up` para aparición de secciones, transiciones suaves globales

## 2. Tailwind Config (`tailwind.config.ts`)

- Agregar keyframes: `fade-slide-up`, `glow-pulse`
- Agregar animations correspondientes
- Ampliar `boxShadow` con sombras premium de dos niveles

## 3. Página Login (`src/pages/Login.tsx`)

- Fondo con gradiente sutil (purple → indigo → soft blue) animado
- Card con sombra premium elevada, bordes más suaves
- Inputs con transición de borde y glow en focus
- Botón con gradiente y efecto press

## 4. Página Principal (`src/pages/Index.tsx`)

- Banner header: gradiente animado en lugar de color sólido
- Cards de productos: sombra doble, hover con `translateY(-3px)` y `scale(1.01)`, transición 250ms
- Selector de clientes: glow sutil en el borde
- Card de resumen: fondo con gradiente más sofisticado
- Total: tamaño aumentado, glow detrás del número
- Secciones con `animate-fade-slide-up` escalonado
- Botones con gradiente y press animation

## 5. Página Cotización compartida (`src/pages/Cotizacion.tsx`)

- Card principal con sombra premium
- Botones con transiciones suaves
- Tipografía del total más impactante

## 6. Página Historial (`src/pages/Cotizaciones.tsx`)

- Cards con hover elevation
- Transiciones suaves en hover

## 7. Página Perfil (`src/pages/Perfil.tsx`)

- Card con sombra premium
- Inputs con glow en focus
- Foto de perfil con borde con glow

## 8. AppMenu (`src/components/AppMenu.tsx`)

- Dropdown con sombra premium y bordes más suaves

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/index.css` | Variables, gradientes, clases utilitarias premium, animaciones |
| `tailwind.config.ts` | Keyframes, animations, boxShadow extendidos |
| `src/pages/Login.tsx` | Gradiente animado de fondo, card y inputs premium |
| `src/pages/Index.tsx` | Sombras, hover effects, gradiente banner, total con glow, fade-in sections |
| `src/pages/Cotizacion.tsx` | Sombra premium en card, tipografía mejorada |
| `src/pages/Cotizaciones.tsx` | Hover elevation en cards |
| `src/pages/Perfil.tsx` | Card premium, inputs con glow |

## Principios

- Todo sutil y refinado, nada exagerado
- Transiciones 250-400ms con ease-out
- Sombras de baja opacidad para profundidad realista
- Gradientes casi imperceptibles para dar vida sin distraer

