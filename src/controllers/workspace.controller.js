import workspaceRepository from '../repositories/workspace.repository.js';
import workspaceMemberRepository from '../repositories/workspaceMember.repository.js';
import ServerError from '../helpers/serverError.helper.js';
import { MEMBER_WORKSPACE_ROLES } from '../constants/memberRoles.constant.js';

class WorkspaceController {
    async create(request, response) {
        try {
            const { nombre, descripcion } = request.body;
            
            const user_id = request.user.id; 

            if (!nombre || nombre.trim() === '') {
                throw new ServerError("El nombre del espacio de trabajo es obligatorio", 400);
            }

            const newWorkspace = await workspaceRepository.create(
                nombre, 
                descripcion || '' 
            );

            await workspaceMemberRepository.create({
                fk_workspace_id: newWorkspace._id,
                fk_user_id: user_id,
                rol: MEMBER_WORKSPACE_ROLES.OWNER
            });

            return response.status(201).json({
                ok: true,
                message: "Espacio de trabajo creado con éxito",
                data: {
                    workspace: newWorkspace
                }
            });

        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(error.status).json({
                    ok: false,
                    message: error.message
                });
            } else {
                console.error("Error en WorkspaceController:", error);
                return response.status(500).json({
                    ok: false,
                    message: "Error interno del servidor"
                });
            }
        }
    }

    async getAllByUser(req, res) {
        try {
            const user_id = req.user.id;
            const workspaces = await workspaceMemberRepository.getByUserId(user_id);

            return res.status(200).json({
                ok: true,
                message: "Espacios de trabajo obtenidos",
                data: { workspaces }
            });
        } catch (error) {
            if (error instanceof ServerError) {
                return res.status(500).json({ ok: false, message: "Error interno" });
            }
            console.error(error);
        }
    }

    async deleteById(req, res) {
        try {
            const { workspace_id } = req.params;
            const user_role = req.member.rol;

            if (user_role !== MEMBER_WORKSPACE_ROLES.OWNER) {
                throw new ServerError("No tienes permisos para eliminar este espacio. Solo el dueño puede hacerlo.", 403);
            }

            await workspaceRepository.softDeleteById(workspace_id);

            return res.status(200).json({
                ok: true,
                message: "Espacio de trabajo eliminado correctamente"
            });
        } catch (error) {
            if (error instanceof ServerError) {
                return res.status(error.status).json({ ok: false, message: error.message });
            }
            console.error(error);
            return res.status(500).json({ ok: false, message: "Error interno" });
        }
    }

    async updateById(req, res) {
        try {
            const { workspace_id } = req.params;
            const { nombre, descripcion } = req.body;
            const user_role = req.member.rol;

            if (user_role !== MEMBER_WORKSPACE_ROLES.OWNER && user_role !== MEMBER_WORKSPACE_ROLES.ADMIN) {
                throw new ServerError("No tienes permisos suficientes para editar este espacio.", 403);
            }

            const updateData = {};
            if (nombre) updateData.nombre = nombre;
            if (descripcion !== undefined) updateData.descripcion = descripcion;

            const updatedWorkspace = await workspaceRepository.updateById(workspace_id, updateData);

            return res.status(200).json({
                ok: true,
                message: "Espacio actualizado",
                data: { workspace: updatedWorkspace }
            });
        } catch (error) {
             if (error instanceof ServerError) {
                return res.status(error.status).json({ ok: false, message: error.message });
            }
            console.error(error);
            return res.status(500).json({ ok: false, message: "Error interno" });
        }
    }
}

const workspaceController = new WorkspaceController();
export default workspaceController;