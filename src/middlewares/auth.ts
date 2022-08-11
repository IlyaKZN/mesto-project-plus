import { Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import UnauthorizedError from "../errors/unauthorized-error";
import { SECRET_KEY } from "../constants";

export default (req: any, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new UnauthorizedError('Отсутствует токен'));
    return
  }

  const token = authorization.replace('Bearer ', '');
  console.log(token);
  let payload;

  try {
    // попытаемся верифицировать токен
    payload = jwt.verify(token, SECRET_KEY);

  } catch (err) {
    // отправим ошибку, если не получилось
    console.log(payload);
    next(new UnauthorizedError('Неактуальный токен'));
    return
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  next(); // пропускаем запрос дальше
};