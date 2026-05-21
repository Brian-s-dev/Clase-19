import nodemailer from 'nodemailer';
import ENVIRONMENT from '../config/environment.config.js';
import jwt from 'jsonwebtoken';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: ENVIRONMENT.GMAIL_USERNAME,
        pass: ENVIRONMENT.EMAIL_PASSWORD
    }
});

export const sendVerificationEmail = async (email) => {
    try {
        const verification_token = jwt.sign(
            {
                email: email
            },
            ENVIRONMENT.JWT_SECRET
        )

        const url_verificacion = `http://localhost:${ENVIRONMENT.PORT}/api/auth/verify-email?verification_token=${verification_token}`;

        await transporter.sendMail({
            from: `"Mi App Backend" <${ENVIRONMENT.GMAIL_USERNAME}>`,
            to: email,
            subject: 'Verifica tu cuenta',
            html: `
                <h1>¡Bienvenido a la App!</h1>
                <p>Haz click en el siguiente enlace para verificar tu correo:</p>
                <a href="${url_verificacion}" style="padding: 10px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verificar mi correo</a>
            `
        });
        console.log("¡Correo de verificación enviado exitosamente a:", email);
    } catch (error) {
        console.error("Error al enviar el correo con Nodemailer:", error);
    }
};