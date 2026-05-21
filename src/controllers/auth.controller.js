import userRepository from '../repositories/user.repository.js';
import ServerError from '../helpers/serverError.helper.js';
import bcrypt from 'bcrypt';
import { sendVerificationEmail } from '../helpers/email.helper.js';
import jwt from 'jsonwebtoken';
import ENVIRONMENT from '../config/environment.config.js';


class AuthController {
    async register(req, res) {
        try {
            const { nombre, email, password } = req.body;

            if (!nombre || nombre.length <= 2) {
                throw new ServerError("El nombre debe tener más de 2 caracteres", 400);
            }

            if (!password || password.length < 6) {
                throw new ServerError("La contraseña debe tener al menos 6 caracteres", 400);
            }

            const userExists = await userRepository.getByEmail(email);
            if (userExists) {
                throw new ServerError("El email ya se encuentra registrado", 400);
            }

            const hashed_password = await bcrypt.hash(password, 12);

            const newUser = await userRepository.create(nombre, email, hashed_password);

            sendVerificationEmail(email);

            return res.status(201).json({
                ok: true,
                message: "Usuario registrado. Por favor, verifica tu email.",
                status: 201,
                data: {
                    user: {
                        id: newUser._id,
                        nombre: newUser.nombre,
                        email: newUser.email
                    }
                }
            });

        } catch (error) {
            if (error instanceof ServerError) {
                return res.status(error.status).json({
                    ok: false,
                    message: error.message
                });
            } else {
                return res.status(500).json({
                    ok: false,
                    message: error.message
                });
            }
        }
    }

    async verifyEmail(req, res) {
        try {
            const { verification_token } = req.query;

            if (!verification_token) {
                throw new ServerError("Falta token de verificación", 400);
            }
            const payload = jwt.verify(verification_token, ENVIRONMENT.JWT_SECRET)
            const { email } = payload
            const user = await userRepository.getByEmail(email);

            if (!user) {
                throw new ServerError("Usuario no encontrado", 404);
            }

            if (user.email_verificado) {
                throw new ServerError("Este email ya ha sido verificado", 400);
            }

            await userRepository.updateById(user._id, { email_verificado: true });

            return res.status(200).json({
                ok: true,
                message: "Email verificado correctamente. ¡Ya puedes usar tu cuenta!"
            });

        } catch (error) {
            if (
                error instanceof jwt.JsonWebTokenError
                ||
                error instanceof jwt.NotBeforeError
                ||
                error instanceof jwt.TokenExpiredError
            ) {
                return res.status(401).json(
                    {
                        message: "Token invalido",
                        ok: false,
                        status: 401
                    }
                )
            }
            else if (error instanceof ServerError) {
                return res.status(error.status).json({
                    ok: false,
                    message: error.message
                });
            } else {
                return res.status(500).json({
                    ok: false,
                    message: error.message
                });
            }
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                throw new ServerError("El email y la contraseña son obligatorios", 400);
            }

            const user_found = await userRepository.getByEmail(email);
            if (!user_found) {
                throw new ServerError("Credenciales inválidas", 401);
            }

            if (!user_found.email_verificado) {
                throw new ServerError("Debes verificar tu email antes de iniciar sesión. Revisa tu casilla de correo.", 403);
            }

            const isPasswordValid = await bcrypt.compare(password, user_found.password);
            if (!isPasswordValid) {
                throw new ServerError("Credenciales inválidas", 401);
            }

            const payload = {
                id: user_found._id,
                nombre: user_found.nombre,
                email: user_found.email,
                fecha_creacion: user_found.fecha_creacion,
            };

            const access_token = jwt.sign(
                payload,
                ENVIRONMENT.JWT_SECRET
            );

            return res.status(200).json({
                ok: true,
                message: "Inicio de sesión exitoso",
                data: {
                    access_token: access_token,
                    user: payload
                }
            });

        } catch (error) {
            if (error instanceof ServerError) {
                return res.status(error.status).json({
                    ok: false,
                    message: error.message
                });
            } else {
                return res.status(500).json({
                    ok: false,
                    message: "Error interno del servidor"
                });
            }
        }
    }
}

const authController = new AuthController();
export default authController;