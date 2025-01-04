*This is my first project with Express & EJS.*

- University: Universidad Nacional Experimental de Los Llanos Centrales Rómulo Gallegos
- Campus:     San Juan de Los Morros, Guárico, Venezuela
- Faculty:    Área de Ingeniería en Sistemas
- Subject:    Programación II (Sección 4)
- Student:    Carlos Nieves

*Task 3: third party connection*

1. Geolocalización por IP: Se procedió con la elección de la API: ipstack, en mi caso;
a través de su web, me tomé el tiempo de conocer las características y ventajas de su servicio,
así como los pasos a seguir para su integración al proyecto, con la ayuda de su documentación.
Se instaló unas dependencias necesarias para las solicitudes HTTP: la biblioteca "axios".
En el archivo "contact.js", dentro de "ContactsController", se creó el endpoint para hacer la solicitud a la API de geolocalización y obtener el nombre del país del usuario que llenó el formulario.
En la clase "ContactsModel", se modificó la función "save" para ejecutar la consulta SQL en la base de datos, añadiendo "country", además de "email, name, message, ip y date". Previamente, se añadió la columna correspondiente a la tabla "contacts" para almacenar dicho dato (el país).

2. Google Analytics: Se accedió al portal oficial para indagar sobre el funcionamiento y las bondades que ofrece este servicio de Google. Se completó el formulario principal que se solicita para empezar el análisis y la recogida de datos. Se configuró la propiedad para el sitio web, y se obtuvo el ID de seguimiento único. Para la integración, se modificó, añadiendo un script proporcionado por Analytics, cada una de las vistas (plantillas EJS). También, se configuró la herramienta para rastrear interacciones clave (p.ej.: el envío del formulario, vistas de páginas, clics), siguiendo las instrucciones de etiquetado.