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



app.get(
    '/api/profile',
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