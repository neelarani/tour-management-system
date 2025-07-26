import { UserControllers } from './user.controller';
import { createUserZodSchema, updateUserZodSchema } from './user.validation';
import { validateRequest } from '../../middlewares/validateRequest';
import { Router } from 'express';
import { Role } from './user.interface';
import { checkAuth } from '../../middlewares/checkAuth';

const router = Router();

router.post(
  '/register',
  validateRequest(createUserZodSchema),
  UserControllers.createUser
);

router.get(
  '/all-users',
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UserControllers.getAllUsers
);
router.get(
  '/me',
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UserControllers.getMe
);

router.patch(
  '/:id',
  validateRequest(updateUserZodSchema),
  checkAuth(...Object.values(Role)),
  UserControllers.updateUser
);

export const UserRoutes = router;
