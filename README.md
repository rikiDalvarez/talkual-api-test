# 🚀 Talkual Api Test
Bienvenido a la prueba de Backend para optar al puesto de FullStack Developer dentro de la empresa TALKUAL. 
Cómo sabrás tenemos un ecommerce como producto principal, precisamente este proyecto es un mini ecommerce hecho con Strapi 4.

A continuación te explico los modelos del proyecto:
- **Order Item:** Es una línea de pedido de un pedido y tiene los siguientes campos:
  - **quantity (number)**: Cantidad de productos de la línea de pedido.
  - **product (integer)**: Identificador del producto asociado a la línea del pedido.
  - **order**: Relación Many to One con pedido a través de la tabla `order_items_order_links`.


- **Order Meta:** Es la dirección de envío de un pedido y tiene los siguientes campos:
  - **shipping_postcode (string)**: Código postal de la dirección de envío.
  - **shipping_firstname (string)**: Nombre del usuario que recibe el pedido.
  - **order**: Relación One to One con pedido a través de la tabla `order_metas_order_links`.


- **Order:** Es el pedido que hace un usuario y tiene los siguientes campos:
  - **status (enum)**: Es el estado de un pedido. Puede ser **pending, processing y cancelled**. Por defecto el estado es **pending**.
  - **delivery_date (date)**: Fecha de entrega del pedido.
  - **type (enum)**: Tipo de pedido, pueden ser **normal** o **donation**. Por defecto es tipo **normal**
  - **user**: Relación One to One con user a través de la tabla `orders_user_links`


- **User:** Es un usuario y tiene los siguientes campos:
  - **username (string)**: Nombre de usuario.
  - **email (string)**: Correo electrónico del usuario.
  - **password (string)**: Contraseña del usuario.
  - **confirmed (boolean)**: Significa si el usuario puede hacer login o no.

La base de datos es SQLite y el fichero se encuentra en el directorio raíz dentro de la carpeta **.tmp/data.db**. 

Esta ya contiene algunos datos, como el usuario administrador para hacer login en http://localhost:1337/admin/auth/login con las siguientes credenciales:
- **identificador**: admin@demo.com 
- **password**: Admin1234

También contiene un usuario con el que hacer el pedido desde el cliente:
- **identificador**: user@demo.com
- **password**: User1234

En la carpeta `tests`, tiene toda la configuración y un test de ejemplo usando `Jest` y `Supertest`.

## Descripción de la prueba
La prueba consiste en desarrollar en TypeScript la feature de donar un pedido ya creado, el punto de partida está en este controlador
`src/api/order/controllers/order.ts`, en este archivo ya existe un código inicial que tienes que completar 
y los requisitos de la feature son los siguientes:
- La entrada de datos al controlador de la ruta /api/orders/:id/donate` tiene que seguir este formato:
```
{
  "order_meta": {
    "shipping_postcode": "08004",
    "shipping_firstname": "User firstname"
  }
}
```
- Los carriers solo reparten en estos códigos postales `28005, 08001, 25250`, si se envía un código postal
que no está en este listado, se tiene que devolver un error al usuario con el mensaje ***"Código postal inválido"***.
Para validar estos códigos postales, puedes usar el servicio que se encuentra en esta ruta `src/api/order/services/coverageService.ts`
- Cuando se dona un pedido, el pedido del id que viene en la url, tiene que pasar a estado `cancelled` y se tiene que crear un nuevo pedido en estado `processing` del tipo `donation` (Tabla orders`). 
- Se tiene que crear un nuevo `Order Meta` con los datos que vienen desde el controlador y asociado al nuevo pedido (Tablas `order_metas` y `order_metas_order_links`).
- Se tiene que actualizar el identificador del pedido en el modelo `Order Item` (Tabla `order_items_order_links`).
- Finalmente se tiene que enviar un correo al usuario con el mensaje `{username} su pedido ha sido creado`. 
Para esto simplemente haga un fake de un servicio de envio de email que imprima el mensaje anterior usando un `console.log`.

## Ejemplo de los endpoints que va a tener que usar:
- Loguear un usuario para obtener el token:

**Request:**
```
curl --location 'http://localhost:1337/api/auth/local' \
--header 'Accept: application/json' \
--form 'identifier="user@demo.com"' \
--form 'password="User1234"'
```
**Response:**
```
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjk2MjU3OTczLCJleHAiOjE2OTg4NDk5NzN9.7DVxXOkaF80QJ4CGkqjC64u85Ph7DOBC-WkTEssQ44o",
  "user": {
      "id": 1,
      "username": "user1",
      "email": "user1@demo.com",
      "provider": "local",
      "confirmed": true,
      "blocked": false,
      "createdAt": "2023-10-02T09:57:27.598Z",
      "updatedAt": "2023-10-02T09:57:27.598Z"
  }
}
```
- Hacer una donación:

**Request:**
```
curl --location 'http://localhost:1337/api/orders/1/donate' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjk2MjU3OTczLCJleHAiOjE2OTg4NDk5NzN9.7DVxXOkaF80QJ4CGkqjC64u85Ph7DOBC-WkTEssQ44o' \
--data '{
    "order_meta": {
        "shipping_postcode": "08004",
        "shipping_firstname": "User 2"
    }
}'
```

**Response:**

```
{
  "order": {
        "id": 2,
        "status": "processing",
        "createdAt": "2023-10-02T10:49:43.371Z",
        "updatedAt": "2023-10-02T14:16:56.673Z",
        "type": "donation"
    },
    "order_meta": {
        "shipping_postcode": "08004",
        "shipping_firstname": "User 2"
    },
}
```

# Cosas a valorar
- Simplicidad en el código.
- Aplicación de los principios SOLID.
- Buenas prácticas de desarrollo de software en general.
- Añadir tests de integración o unitarios al código.
- Funcionamiento de la feature.

# Como arrancar el proyecto
Use la versión LTS 18.18.0 de Node o la versión más actual.
Copia el fichero `.env.example` y crea uno nuevo que se llame `.env`

Ejecute el siguiente comando para arrancar el proyecto en modo desarrollo:
```
npm run develop
# or
yarn develop
```

# Como entregar la prueba
Para entregar la prueba, haga un fork del proyecto en su repositorio de github y desarrolle la prueba. 
Tiene para ello 7 días desde que se le envía la prueba. Una vez finalizado, envie un correo con el enlace de su proyecto
en github a luis.ramirez@talkualfoods.com` con el asunto `Prueba Api Talkual`
