import ServerError from "../helpers/serverError.helper.js";
import jwt from 'jsonwebtoken';
import ENVIRONMENT from "../config/environment.config.js";

function authMiddleware(request, response, next) {
    try {
        const authorization_header = request.headers.authorization
        if (!authorization_header) {
            throw new ServerError("No hay header de autorización", 401)
        }
        const authorization_token = authorization_header.split(" ")[1]
        if (!authorization_token) {
            throw new ServerError("No hay token de autorización", 401)
        }

        const user_info = jwt.verify(
            authorization_token,
            ENVIRONMENT.JWT_SECRET
        )

        //Estamos guardando la info del usuario dentro de la request
        request.user = user_info

        console.log('SE ACTIVO EL MIDDLEWARE')
        console.log('Auth Token:', authorization_token)

        //Activamos el siguiente controlador
        return next()
    }
    catch (error) {
        if (error instanceof jwt.JsonWebTokenError){
            return response.status(401).json(
                {
                    message: "Token invalido",
                    ok: false,
                    status: 401
                }
            )
        }
        if (error instanceof ServerError) {
            return response.status(error.status).json(
                {
                    message: error.message,
                    ok: false,
                    status: error.status
                }
            )
        }
        else {
            console.error('Error critico:', error);
            return response.status(500).json({
                message: "Error interno del servidor",
                ok: false,
                status: 500
            });
        }

    }
}

export default authMiddleware