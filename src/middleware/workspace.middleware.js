import workspaceRepository from "../repositories/workspace.repository.js";
import workspaceMemberRepository from "../repositories/workspaceMember.repository.js";
import ServerError from "../helpers/serverError.helper.js";

async function workspaceMiddleware(request, response, next) {
    try {
        const { workspace_id } = request.params;
        const user_id = request.user.id;

        const workspace = await workspaceRepository.getById(workspace_id);
        
        if (!workspace || !workspace.activo) {
            throw new ServerError("Espacio de trabajo no encontrado", 404);
        }

        const member = await workspaceMemberRepository.getMemberByWorkspaceAndUserId(workspace_id, user_id);

        if (!member) {
            throw new ServerError("No eres miembro de este espacio de trabajo", 403);
        }

        request.workspace = workspace;
        request.member = member;

        return next();

    } catch (error) {
        if (error instanceof ServerError) {
            return response.status(error.status).json({
                message: error.message,
                ok: false,
                status: error.status
            });
        }
        if(error.name === 'CastError' && error.kind === 'ObjectId') {
            return response.status(400).json({
                message: "ID de espacio de trabajo inválido",
                ok: false,
                status: 400
            });
        }
        console.error('Error crítico en workspaceMiddleware:', error);
        return response.status(500).json({
            message: "Error interno del servidor",
            ok: false,
            status: 500
        });
    }
}

export default workspaceMiddleware;