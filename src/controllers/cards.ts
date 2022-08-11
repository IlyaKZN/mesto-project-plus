import { Request, Response, NextFunction } from 'express';
import Card from '../models/card';
import IncorrectDataError from '../errors/incorrect-data-error';
import NotFoundError from '../errors/not-found-error';
import ForbiddenError from '../errors/forbidden-error';

export const getCards = (req: Request, res: Response, next: NextFunction) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

export const createCard = (req: any, res: Response, next: NextFunction) => {
  const { name, link } = req.body;
  Card.create({
    name,
    link,
    owner: req.user._id,
    likes: [],
  })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new IncorrectDataError('Переданы некорректные данные при создании карточки');
      }
    })
    .catch(next);
};

export const deleteCard = (req: any, res: Response, next: NextFunction) => {
  if (req.user._id !== req.params.cardId) {
    next(new ForbiddenError('У вас нет прав для удаления этой карточки'));
  }

  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new NotFoundError('Карточка по указанному _id не найдена');
      }
    })
    .catch(next);
};

export const likeCard = (req: any, res: Response, next: NextFunction) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    {
      new: true,
      runValidators: true,
      upsert: true,
    },
  )
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new NotFoundError('Передан несуществующий _id карточки');
      }
      if (err.name === 'ValidationError') {
        throw new IncorrectDataError('Переданы некорректные данные для постановки лайка');
      }
    })
    .catch(next);
};

export const dislikeCard = (req: any, res: Response, next: NextFunction) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    {
      new: true,
      runValidators: true,
      upsert: true,
    },
  )
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new NotFoundError('Передан несуществующий _id карточки');
      }
      if (err.name === 'ValidationError') {
        throw new IncorrectDataError('Переданы некорректные данные для снятия лайка');
      }
    })
    .catch(next);
};
