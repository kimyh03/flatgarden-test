import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.model';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private _usersRepository: Repository<User>,
  ) {}
  async create(name: string) {
    const existUser = await this._usersRepository.findOne({
      where: { name },
    });
    if (existUser) {
      throw new Error('이미 가입된 정보입니다.');
    } else {
      const newUser = this._usersRepository.create({ name });
      await this._usersRepository.save(newUser);
      return newUser;
    }
  }

  async findOneById(id: number, relations?: string[]) {
    if (relations) {
      return await this._usersRepository.findOne({
        where: { id },
        relations: [...relations],
      });
    } else {
      return await this._usersRepository.findOne(id);
    }
  }

  async delete(user: User) {
    await this._usersRepository.remove(user);
  }
}
