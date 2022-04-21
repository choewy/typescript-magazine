import { Express } from 'express';
import { PostController } from '../posts/posts.controller';
import { UserController } from '../users/users.controller';
import { LikeController } from '../likes/likes.controller';

export const setControllers = (app: Express) => {
  UserController(app);
  PostController(app);
  LikeController(app);
};
