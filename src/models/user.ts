import { model, Schema } from 'mongoose';
import { EMAIL_REG_EXP, URL_REG_EXP } from '../constants';

export interface IUser {
  email: string;
  password: string;
  name: string;
  about: string;
  avatar: string;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v: string) => EMAIL_REG_EXP.test(v),
      message: 'Почта пользователя не прошла валидацию.',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 200,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator: (v: string) => URL_REG_EXP.test(v),
      message: 'Ссылка на аватар пользователя не прошла валидацию.',
    },
  },
});

export default model('user', userSchema);
