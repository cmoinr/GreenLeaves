**This is my first project with Express & EJS.**

- *University:* Universidad Nacional Experimental de Los Llanos Centrales Rómulo Gallegos
- *Campus:*     San Juan de Los Morros, Guárico, Venezuela
- *Faculty:*    Área de Ingeniería en Sistemas
- *Subject:*    Programación II (Sección 4)
- *Student:*    Carlos Nieves

**Task 3: third party connection**

1. *Geolocalización por IP:* Se procedió con la elección de la API: ipstack, en mi caso;
a través de su web, me tomé el tiempo de conocer las características y ventajas de su servicio,
así como los pasos a seguir para su integración al proyecto, con la ayuda de su documentación.
Se instaló unas dependencias necesarias para las solicitudes HTTP: la biblioteca "axios".
En el archivo "contact.js", dentro de "ContactsController", se creó el endpoint para hacer la solicitud a la API de geolocalización y obtener el nombre del país del usuario que llenó el formulario.
En la clase "ContactsModel", se modificó la función "save" para ejecutar la consulta SQL en la base de datos, añadiendo "country", además de "email, name, message, ip y date". Previamente, se añadió la columna correspondiente a la tabla "contacts" para almacenar dicho dato (el país).

2. *Google Analytics:* Se accedió al portal oficial para indagar sobre el funcionamiento y las bondades que ofrece este servicio de Google. Se completó el formulario principal que se solicita para empezar el análisis y la recogida de datos. Se configuró la propiedad para el sitio web, y se obtuvo el ID de seguimiento único. Para la integración, se modificó, añadiendo un script proporcionado por Analytics, cada una de las vistas (plantillas EJS). También, se configuró la herramienta para rastrear interacciones clave (p.ej.: el envío del formulario, vistas de páginas, clics), siguiendo las instrucciones de etiquetado.

3. *Google reCAPTCHA:* A través del portal oficial se creó una "Casilla de v2" (con desafío) de reCAPTCHA para proteger el envío del formulario contra bots y spam. Se le dió nombre a la etiqueta, se agregaron los dominios requeridos donde funcionará el servicio, así como la dirección Gmail del propietario, y se configuró la preferencia de seguridad. Con esto, se obtuvo las credenciales (clave del sitio y clave secreta) para añadir esta medida de seguridad al proyecto. Se adjuntó el div proporcionado en la plantilla EJS del formulario, y en el back-end, se implementó la validación del token generado por reCAPTCHA, donde si la consulta a la API resulta exitosa, se procede con el correcto envío del formulario.

4. *Notificación por correo electrónico:* Para lograr dicho objetivo, fue necesario la instalación de varias librerías al proyecto: "nodemailer", para poder gestionar y enviar los e-mails de manera sistemática y efectiva; "googleapis", para poder acceder a la cuenta Gmail de manera segura y sin inconvenientes. Primero, en el proyecto ya creado en Google Cloud Platform, se habilitó la API de Gmail (el servicio de correo seleccionado), se crearon las credenciales de OAuth 2.0 y, para autenticar el acceso a la cuenta respectiva de correo desde el mismo código y autorizar la API, se siguieron los pasos indicados en OAuth 2.0 Playground, obteniendo el token y credenciales necesarias. Luego en el back-end, se procedió con la implementación de las funciones en el archivo "contact.js" que permitirían: crear el transporte del correo, autenticar el acceso a la cuenta de Gmail, establecer los destinatarios, estructurar el contenido del mail y enviarlo satisfactoriamente.

5. *Ubicación del servicio con Google Maps:* A través de Google Cloud Platform, se accedió a Google Maps Platform para habilitar las APIs y poder añadir a la sección "Ubicación" de la página web, un fragmento de mapa en la locación establecida. Con esto se obtuvo una clave secreta para dar acceso a la API desde la plantilla EJS, y se agregó el script HTML y el elemento "gmp-map" proporcionado por la plataforma al código del proyecto. Fueron asignados los parámetros: coordenadas y un marcador de la ubicación, zoom y ID del mapa, a dicho elemento, para que la vista al usuario sea precisa y conveniente. Por último, se personalizó la sección y el mapa a través de las propiedades CSS.

5. *Seguridad:* Se implementó al proyecto el uso de variables de entorno para hacer más robusta la seguridad y resguardar datos sensibles y credenciales utilizadas en el mismo. Una conocida biblioteca llamada "dotenv" fue instalada al proyecto para hacer posible esta mejora. En un archivo ".env" se guardaron credenciales como: las claves secreta de reCAPTCHA, IP-stack y OAuth 2.0, así como los token requeridos y direcciones e-mail. Luego, para asegurarnos de que estas variables no se incluyan en el repositorio de GitHub, se agregó este archivo al ".gitignore".