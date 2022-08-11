import { Router } from "express";
import { celebrate, Joi } from 'celebrate';
import {
  createCard,
  getCards,
  deleteCard,
  likeCard,
  dislikeCard,
} from "../controllers/cards";
import { REGULAR_URL } from "../constants";

const router = Router();
//Получить все карточки
router.get("/", getCards);
router.post("/", celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().pattern(new RegExp(REGULAR_URL))
  }),
}), createCard);
router.delete("/:cardId", celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().alphanum().required().length(24)
  }),
}), deleteCard);
router.put("/:cardId/likes", celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().alphanum().required().length(24)
  }),
}), likeCard);
router.delete("/:cardId/likes", celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().alphanum().required().length(24)
  }),
}), dislikeCard);

export default router;
