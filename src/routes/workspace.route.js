import express from 'express';
import workspaceController from '../controllers/workspace.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import workspaceMiddleware from '../middleware/workspace.middleware.js';

const workspaceRouter = express.Router();

workspaceRouter.post('/', authMiddleware, workspaceController.create);

workspaceRouter.get('/', authMiddleware, workspaceController.getAllByUser);

workspaceRouter.put('/:workspace_id', authMiddleware, workspaceMiddleware, workspaceController.updateById);
workspaceRouter.delete('/:workspace_id', authMiddleware, workspaceMiddleware, workspaceController.deleteById);

export default workspaceRouter;