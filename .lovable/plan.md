

# Plan: Boton "Confirmar cotizacion" via WhatsApp en la vista compartida

## Cambio unico en `src/pages/Cotizacion.tsx`

Agregar un boton **"Deseo confirmar mi cotizacion"** (con icono de WhatsApp/MessageCircle) debajo del boton "Descargar PDF", visible solo en pantalla (clase `no-print`).

Al hacer clic, el boton construye una URL con este formato exacto:

```
https://api.whatsapp.com/send?phone=5492615783684&text=Hola!+Recibí+esta+cotización+de+parte+de+{seller_name}+en+Andina+Link+y+me+gustaría+confirmar+el+valor+que+recibí!+{quote_url}
```

- El numero de telefono es fijo: `5492615783684`
- `seller_name` se toma de `data.seller_name`
- `quote_url` se construye como `https://holaprecios.lovable.app/cotizacion?id={id}` usando el parametro `id` de la URL actual
- El texto se codifica con `encodeURIComponent`
- Se abre en nueva pestana con `window.open`

El boton tendra estilo verde WhatsApp (`bg-[#25D366]`) para diferenciarlo del boton de descarga.

