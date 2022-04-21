import { UserPayload } from '../../commons/interfaces';
import { ComparePassword, PasswordHash } from '../../commons/utils';
import { UserSigninDto, UserSignupDto } from './users.dto';
import { User } from './users.model';
import { UserError } from '../../commons/errors';
import db from '../app/app.models';

export class UserRepository {
  /* TODO : Repository에는 단순 DB 처리만 할 수 있도록 수정할 것 */
  /*
    - [ ] : findByPayload
    - [ ] : findByEmail
    - [ ] : createUser
    - [ ] : updateUser
    - [ ] : deleteUser
  */

  /* 토큰에 담긴 Payload로 사용자 정보 조회 */
  public static FindByPayload = async (
    payload: UserPayload
  ): Promise<User | null> => {
    const { email } = payload;
    return await db.User.findOne({
      raw: true,
      nest: true,
      where: {
        [db.Op.or]: [{ email }],
      },
      attributes: ['user_id', 'email', 'nickname', 'role'],
    });
  };

  /* 이메일로 사용자 정보 조회 */
  public static FindByEmail = async (email: string): Promise<User | null> => {
    return await db.User.findOne({
      raw: true,
      nest: true,
      where: {
        [db.Op.or]: [{ email }],
      },
      attributes: ['user_id', 'email', 'nickname', 'password'],
    });
  };

  /* 사용자 회원가입 */
  public static Signup = async (
    userSignupDto: UserSignupDto
  ): Promise<never | UserPayload> => {
    const { email, nickname, password } = userSignupDto;

    /* 이메일 계정이 존재하는 경우 409 Conflict */
    const user = await this.FindByEmail(email);
    if (user) throw new UserError.AleadyExist();

    /* 비밀번호 암호화 후 저장 */
    userSignupDto.password = PasswordHash(password);
    await db.User.create(userSignupDto);

    /* UserService로 토큰에 저장할 정보를 넘김 */
    return { email, nickname };
  };

  /* 사용자 로그인 */
  public static Signin = async (
    userSigninDto: UserSigninDto
  ): Promise<never | UserPayload> => {
    const { email, password } = userSigninDto;

    /* 이메일 계정이 존재하지 않는 경우 404 Not Found */
    const user = await this.FindByEmail(email);
    if (!user) throw new UserError.NotFound();

    /* 비밀번호 일치 여부 확인 */
    let verify = false;
    if (user) verify = ComparePassword(user, password);

    /* 비밀번호가 틀린 경우 402 Unauthorized */
    if (!verify) throw new UserError.WrongEmailOrPasswd();

    /* UserService로 토큰에 저장할 정보를 넘김 */
    return { email, nickname: user.nickname };
  };
}
