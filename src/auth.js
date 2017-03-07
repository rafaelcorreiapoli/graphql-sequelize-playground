import jwt from 'jsonwebtoken';
import User from '../db/model/user';
import { jwtSecret } from './config';

export async function getUser(token) {
  if (!token) return null;

  try {
    const decodedToken = jwt.verify(token.substring(4), jwtSecret);
    const user = await User.findOne({
      where: {
        id: decodedToken.id,
      },
    });

    return user;
  } catch (err) {
    return null;
  }
}


export function generateToken(user) {
  return `JWT ${jwt.sign({ id: user.id }, jwtSecret)}`;
}
