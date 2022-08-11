import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/user';
import IncorrectDataError from '../errors/incorrect-data-error';
import NotFoundError from '../errors/not-found-error';
import UnauthorizedError from '../errors/unauthorized-error';
import ConflictError from '../errors/conflict-error';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import { SECRET_KEY } from '../constants';

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
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new NotFoundError('Пользователь по указанному _id не найден');
      }
    })
    .catch(next);
};

export const createUser = (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name, about, avatar } = req.body;

  if (!validator.isEmail(email)) {
    next(new IncorrectDataError('Передан некорректный email при создании пользователя'));
    return
  }

  bcrypt.hash(password, 10)
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
          if (err.name === 'MongoServerError') {
            throw new ConflictError('Пользователь с таким email уже существует');
          }
          if (err.name === 'ValidationError') {
            throw new IncorrectDataError('Переданы некорректные данные при создании пользователя');
          }
        })
        .catch(next);
    })
    .catch((err) => {
      throw new IncorrectDataError('Переданы некорректные данные при создании пользователя');
    })
    .catch(next);
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            // хеши не совпали — отклоняем промис
            throw new UnauthorizedError('Неправильные почта или пароль');
          }

          const token = jwt.sign({ _id: user._id }, SECRET_KEY, { expiresIn: '7d' });
          res.send({ user, token });
        })
    })

    .catch((err) => {
      if (err.name === 'CastError') {
        throw new NotFoundError('Пользователь по указанному _id не найден');
      }
    });
};

export const getCurrentUser = (req: any, res: Response, next: NextFunction) => {
  User.findById(req.user._id)
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new NotFoundError('Пользователь по указанному _id не найден');
      }
    });
};

export const updateUser = (req: any, res: Response, next: NextFunction) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    {
      name,
      about,
    },
    {
      new: true,
      runValidators: true,
      upsert: true,
    },
  )
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new NotFoundError('Пользователь по указанному _id не найден');
      }
      if (err.name === 'ValidationError') {
        throw new IncorrectDataError('Переданы некорректные данные при обновлении пользователя');
      }
    })
    .catch(next);
};

export const updateAvatar = (req: any, res: Response, next: NextFunction) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    {
      avatar,
    },
    {
      new: true,
      runValidators: true,
      upsert: true,
    },
  )
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new NotFoundError('Пользователь по указанному _id не найден');
      }
      if (err.name === 'ValidationError') {
        throw new IncorrectDataError('Переданы некорректные данные при обновлении аватара');
      }
    })
    .catch(next);
};
