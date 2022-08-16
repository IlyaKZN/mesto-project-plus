import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import {
  createCard,
  getCards,
  deleteCard,
  likeCard,
  dislikeCard,
} from '../controllers/cards';
import { URL_REG_EXP, ID_REG_EXP } from '../constants';

const router = Router();
// Получить все карточки
router.get('/', getCards);
router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().pattern(new RegExp(URL_REG_EXP)),
  }),
}), createCard);
router.delete('/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required().pattern(new RegExp(ID_REG_EXP)),
  }),
}), deleteCard);
router.put('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required().pattern(new RegExp(ID_REG_EXP)),
  }),
}), likeCard);
router.delete('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required().pattern(new RegExp(ID_REG_EXP)),
  }),
}), dislikeCard);

export default router;
