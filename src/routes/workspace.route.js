import express from 'express';
import workspaceController from '../controllers/workspace.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import workspaceMiddleware from '../middleware/workspace.middleware.js';
import { MEMBER_WORKSPACE_ROLES } from '../constants/memberRoles.constant.js';

const workspaceRouter = express.Router();
workspaceRouter.use(authMiddleware); // conmfiguramos el authmiddleware a nivel de ruta

workspaceRouter.post('/', workspaceController.create);

workspaceRouter.get('/', workspaceController.getAllByUser);

workspaceRouter.put('/:workspace_id', workspaceMiddleware([MEMBER_WORKSPACE_ROLES.ADMIN, MEMBER_WORKSPACE_ROLES.OWNER]), workspaceController.updateById);

workspaceRouter.delete('/:workspace_id', workspaceMiddleware([MEMBER_WORKSPACE_ROLES.OWNER]), workspaceController.deleteById);

export default workspaceRouter;