import express from 'express';
import ENVIRONMENT from "./config/environment.config.js";
import connectMongoDB from "./config/mongodb.config.js";
import dns from 'dns';

import authRouter from "./routes/auth.route.js";
import workspaceRouter from "./routes/workspace.route.js";
import authMiddleware from './middleware/auth.middleware.js';
import ServerError from './helpers/serverError.helper.js';
import cors from 'cors';

if (ENVIRONMENT.MODE === 'development') {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
}

const app = express();

app.use(cors()) // Habilitar CORS para todas las rutas y métodos HTTP

app.use(express.json());


/* 
Ruta: /api/workspace


    controlador: workspaceController
        
        POST '/' post() Debe estar con el authMiddleware (IMPORTANTE)
            Validar nombre y descripcion (opcional)
            Crear un espacio de trabajo
            Crear una membresia de role tipo 'dueño' a nombre del id del cliente consultante.
            
            body: {
                nombre,
                descripcion
            }

        GET '/' getAllByUser() Debe estar con el authMiddleware (IMPORTANTE)
            Buscar todos los espacios de trabajo de los que el cliente consultante es miembro 
            Responder con la lista de espacios de trabajo

        DELETE '/:workspace_id' deleteById() Debe estar con el authMiddleware
            Validar que el espacio de trabajo exista => 404
            Validar que el usuario consultante sea 'dueño' de dicho espacio de trabajo => 403 Forbidden
            Eliminar (Soft o Hard) el espacio de trabajo

        PUT '/:workspace_id' updateById() Debe estar con el authMiddleware
            body: {
                nombre (opcional),
                descripcion (opcional)
            }
            Validar que el espacio de trabajo exista => 404
            Validar que el usuario consultante sea 'dueño' o 'admin' de dicho espacio de trabajo => 403 Forbidden
            Actualizar los campos correspondientes.

    RECOMENDACION:
        Como se repite 
            Validar que el espacio de trabajo exista
            Validar que el cliente consultante sea miembro del espacio de trabajo
        Vendria muy bien usar un middleware que se llame workspaceMiddleware
        Haria:
            - Validar que el espacio de trabajo exista
            - Validar que el cliente consultante sea miembro del espacio de trabajo
            - Guardar en la request la info de:
                workspace
                member
*/


/* 
Un endpoint donde el cliente debera enviarnos por header de autorizacion el acces token, en caso de estar presente y ser correcto
Le daremos los datos de la cuenta
*/

app.get(
    '/api/profile', 
   /*  (request, response, next) => {
        const random_num = Math.random() 
        console.log('Numero aleatorion generado:', random_num)
        if(random_num > 0.5){
            return response.json({
                message:"Mala suerte campeon ☠"
            })
        }
        else{
            next()
        }
    }, */
    authMiddleware,
    (request, response) => {
        console.log(
            'Nombre del cliente',
            request.user.nombre
        )
        return response.json({
            ok: true,
            status: 200,
            message: "Estas autenticado"
        })
    }
)

connectMongoDB()
    .then(() => {
        console.log("Conexión a MongoDB exitosa");

        app.listen(ENVIRONMENT.PORT, () => {
            console.log(`Nuestra app de express se ejecuta correctamente en el puerto ${ENVIRONMENT.PORT}`);
        });
    })
    .catch(error => {
        console.log("Error al iniciar la aplicación:", error);
    });

app.use('/api/auth', authRouter);
app.use('/api/workspace', workspaceRouter);

/* 

/api/auth => trabaja todo lo relacionado a autentificacion
/api/workspace => trabaja todo lo relacionado a los espacios de trabajo
    /:workspace_id/members => trabaja todo lo relacionado a los miembros de un espacio de trabajo
    /:workspace_id/channels => trabaja todo lo relacionado a los canales de un espacio de trabajo
        /:channel_id/messages => trabaja todo lo relacionado a los mensajes de un canal de un espacio de trabajo
    /:workspace_id/contacts => trabaja todo lo relacionado a los contactos de un espacio de trabajo
*/