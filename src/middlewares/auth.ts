import { Response, NextFunction } from 'express';
import { ObjectId } from 'mongoose';
import jwt from 'jsonwebtoken';
import UnauthorizedError from '../errors/unauthorized-error';
import { SECRET_KEY } from '../constants';
import { SessionRequest } from '../types';

export default (req: SessionRequest, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new UnauthorizedError('Отсутствует токен'));
    return;
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    // попытаемся верифицировать токен
    payload = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    // отправим ошибку, если не получилось
    next(new UnauthorizedError('Неактуальный токен'));
    return;
  }

  req.user = { _id: payload as ObjectId }; // записываем пейлоуд в объект запроса

  next(); // пропускаем запрос дальше
};
