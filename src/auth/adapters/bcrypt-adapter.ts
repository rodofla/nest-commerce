import * as bcrypt from 'bcrypt';
import { IHashingAdapter } from './hashing-adapter.interface';

export class BcryptAdapter implements IHashingAdapter {
  private readonly saltRounds = 10;

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  hashSync(plain: string): string {
    return bcrypt.hashSync(plain, this.saltRounds);
  }

  compareSync(plain: string, hash: string): boolean {
    return bcrypt.compareSync(plain, hash);
  }
}
