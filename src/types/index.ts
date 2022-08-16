import { Request } from 'express';
import { ObjectId } from 'mongoose';

export interface SessionRequest extends Request {
  user?: {
    _id: ObjectId;
  }
}

export interface SessionError extends Error {
  statusCode: number;
}
