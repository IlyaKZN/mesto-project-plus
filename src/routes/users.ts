import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import {
  getUsers, getUserById, updateAvatar, updateUser, getCurrentUser,
} from '../controllers/users';
import { URL_REG_EXP, ID_REG_EXP } from '../constants';

const router = Router();
// Получить всех пользователей
router.get('/', getUsers);
// Получение текущего пользователя
router.get('/me', getCurrentUser);
// Получить пользователя по его id
router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().required().pattern(new RegExp(ID_REG_EXP)),
  }),
}), getUserById);
// Обновить аватар пользователя
router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().pattern(new RegExp(URL_REG_EXP)),
  }),
}), updateAvatar);
// Обновить информацию о пользователе
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(200),
  }),
}), updateUser);

export default router;
