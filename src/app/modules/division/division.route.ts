import { Router } from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { Role } from '../user/user.interface';
import { validateRequest } from '../../middlewares/validateRequest';
import {
  createDivisionSchema,
  updateDivisionSchema,
} from './division.validation';
import { DivisionCotroller } from './division.controller';

const router = Router();

router.post(
  '/create',
  checkAuth(Role.ADMIN && Role.SUPER_ADMIN),
  validateRequest(createDivisionSchema)
);
router.get('/', DivisionCotroller.getAllDivisions);
router.get('/:slug', DivisionCotroller.getSingleDivision);
router.patch(
  '/:id',
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateDivisionSchema),
  DivisionCotroller.updateDivision
);

router.delete(
  '/:id',
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  DivisionCotroller.deleteDivision
);

export const DivisionRoutes = router;
