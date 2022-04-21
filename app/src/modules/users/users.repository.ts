import db from '../app/app.models';
import { UserDefaltDto } from './dto/user-default.dto';
import { UserSignupDto } from './dto/user-signup.dto';
import { UserRepositoryError } from './error/user.repository.error';
import { FindPasswordDto } from './dto/find-password.dto';

const Options = { raw: true, nest: true };
const defaultAttributes = ['user_id', 'email', 'nickname', 'role'];
const passwdAttributes = ['nickname, password'];

export class UserRepository {
  public static findUserByEmail = async (
    email: string
  ): Promise<UserDefaltDto | null> => {
    try {
      return await db.User.findOne({
        ...Options,
        where: {
          [db.Op.or]: [{ email }],
          attribute: defaultAttributes,
        },
      });
    } catch (error) {
      throw new UserRepositoryError.find(error);
    }
  };

  public static findPassword = async (
    email: string
  ): Promise<FindPasswordDto | null> => {
    try {
      return await db.User.findOne({
        ...Options,
        where: {
          [db.Op.or]: [{ email }],
        },
        attributes: passwdAttributes,
      });
    } catch (error) {
      throw new UserRepositoryError.find(error);
    }
  };

  public static createUser = async (
    userSignupDto: UserSignupDto
  ): Promise<void> => {
    try {
      await db.User.create(userSignupDto);
    } catch (error) {
      throw new UserRepositoryError.create(error);
    }
  };
}
