import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import IncorrectDataError from '../errors/incorrect-data-error';
import NotFoundError from '../errors/not-found-error';
import UnauthorizedError from '../errors/unauthorized-error';
import ConflictError from '../errors/conflict-error';
import { SECRET_KEY } from '../constants';
import { SessionRequest } from '../types';

export const getUsers = (req: Request, res: Response, next: NextFunction) => {
  User.find({})
    .then((users) => {
      res.send({ data: users });
    })
    .catch(next);
};

export const getUserById = (req: Request, res: Response, next: NextFunction) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user) {
        res.send({ data: user });
      } else {
        next(new NotFoundError('Пользователь по указанному _id не найден'));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new NotFoundError('Пользователь по указанному _id не найден'));
      }
      next(err);
    });
};

export const createUser = (req: Request, res: Response, next: NextFunction) => {
  const {
    email, password, name, about, avatar,
  } = req.body;

  return bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        email,
        password: hash,
        name,
        about,
        avatar,
      })
        .then((user) => {
          res.send(user);
        })
        .catch((err) => {
          if (err.code === 11000) {
            next(new ConflictError('Пользователь с таким email уже существует'));
            return;
          }
          if (err.name === 'ValidationError') {
            next(new IncorrectDataError('Переданы некорректные данные при создании пользователя'));
            return;
          }
          next(err);
        });
    })
    .catch((err) => next(err));
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        next(new NotFoundError('Неправильные почта или пароль'));
        return;
      }

      bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            // хеши не совпали — отклоняем промис
            throw new UnauthorizedError('Неправильные почта или пароль');
          }

          const token = jwt.sign({ _id: user._id }, SECRET_KEY, { expiresIn: '7d' });
          res.send({ user, token });
        });
    })
    .catch(() => {
      next(new NotFoundError('Неправильные почта или пароль'));
    });
};

export const getCurrentUser = (req: SessionRequest, res: Response, next: NextFunction) => {
  User.findById(req.user!._id)
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new NotFoundError('Пользователь по указанному _id не найден'));
        return;
      }
      next(err);
    });
};

export const updateUser = (req: SessionRequest, res: Response, next: NextFunction) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user!._id,
    {
      name,
      about,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new NotFoundError('Пользователь по указанному _id не найден'));
        return;
      }
      if (err.name === 'ValidationError') {
        next(new IncorrectDataError('Переданы некорректные данные при обновлении пользователя'));
        return;
      }
      next(err);
    });
};

export const updateAvatar = (req: SessionRequest, res: Response, next: NextFunction) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user!._id,
    {
      avatar,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new NotFoundError('Пользователь по указанному _id не найден'));
        return;
      }
      if (err.name === 'ValidationError') {
        next(new IncorrectDataError('Переданы некорректные данные при обновлении аватара'));
        return;
      }
      next(err);
    });
};
