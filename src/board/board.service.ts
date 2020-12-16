import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.model';
import { Brackets, Repository } from 'typeorm';
import { Board } from './board.model';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private readonly _boardRepository: Repository<Board>,
  ) {}

  async create(title: string, content: string, author: User) {
    const newBoard = this._boardRepository.create({
      title,
      content,
      author,
    });
    await this._boardRepository.save(newBoard);
  }

  async delete(board: Board) {
    await this._boardRepository.remove(board);
  }

  async findOneById(boardId: number) {
    return await this._boardRepository.findOne({ where: { id: boardId } });
  }

  async edit(board: Board, content: string) {
    board.content = content;
    await this._boardRepository.save(board);
  }

  async getAllBySearchTerm(searchTerm: string) {
    return this._boardRepository
      .createQueryBuilder('board')
      .orderBy('board.id', 'DESC')
      .andWhere(
        new Brackets((qb) => {
          qb.where('board.title LIKE :title', {
            title: `%${searchTerm}%`,
          }).orWhere('board.content like :content', {
            content: `%${searchTerm}%`,
          });
        }),
      )
      .getMany();
  }
}
