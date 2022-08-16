import { Request, Response, NextFunction } from 'express';
import Card from '../models/card';
import IncorrectDataError from '../errors/incorrect-data-error';
import NotFoundError from '../errors/not-found-error';
import ForbiddenError from '../errors/forbidden-error';
import { SessionRequest } from '../types';

export const getCards = (req: Request, res: Response, next: NextFunction) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

export const createCard = (req: SessionRequest, res: Response, next: NextFunction) => {
  const { name, link } = req.body;
  Card.create({
    name,
    link,
    owner: req.user!._id,
    likes: [],
  })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new IncorrectDataError('Переданы некорректные данные при создании карточки'));
        return;
      }
      next(err);
    });
};

export const deleteCard = (req: SessionRequest, res: Response, next: NextFunction) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      // Если карточка не найдена
      if (!card) {
        next(new NotFoundError('Карточка по указанному _id не найдена'));
        return;
      }
      // Проверяем что пользователь обращается к своей карточке и удаляем её
      if (card.owner === req.user!._id) {
        card.remove()
          .then(() => res.send({ data: card }))
          .catch(next);
      } else {
        next(new ForbiddenError('У вас нет прав для удаления этой карточки'));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new NotFoundError('Карточка по указанному _id не найдена'));
        return;
      }
      next(err);
    });
};

export const likeCard = (req: SessionRequest, res: Response, next: NextFunction) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user!._id } }, // добавить _id в массив, если его там нет
    {
      new: true,
      runValidators: true,
    },
  )
    .then((card) => {
      if (!card) {
        next(new NotFoundError('Карточка по указанному _id не найдена'));
      } else {
        res.send({ data: card });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new NotFoundError('Передан несуществующий _id карточки'));
        return;
      }
      if (err.name === 'ValidationError') {
        next(new IncorrectDataError('Переданы некорректные данные для постановки лайка'));
        return;
      }
      next(err);
    });
};

export const dislikeCard = (req: SessionRequest, res: Response, next: NextFunction) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user!._id } }, // убрать _id из массива
    {
      new: true,
      runValidators: true,
    },
  )
    .then((card) => {
      if (!card) {
        next(new NotFoundError('Карточка по указанному _id не найдена'));
      } else {
        res.send({ data: card });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new NotFoundError('Передан несуществующий _id карточки'));
        return;
      }
      if (err.name === 'ValidationError') {
        next(new IncorrectDataError('Переданы некорректные данные для снятия лайка'));
        return;
      }
      next(err);
    });
};
