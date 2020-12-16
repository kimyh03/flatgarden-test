import {
  NotFoundException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/currentUser.decorator';
import { LogInOnly } from 'src/auth/logInOnly.guard';
import { User } from 'src/user/user.model';
import { BoardService } from './board.service';
import { CreateBoardInput, CreateBoardOutput } from './dto/createBoard.dto';
import { DeleteBoardInput, DeleteBoardOutput } from './dto/deleteBoard.dto';
import { EditBoardInput, EditBoardOutput } from './dto/editBoard.dto';
import {
  GetBoardDetailInput,
  GetBoardDetailOutput,
} from './dto/getBoardDetail.dto';
import { SearchBoardInput, SearchBoardOutput } from './dto/searchBoard.dto';

@Resolver()
export class BoardResolver {
  constructor(private readonly boardService: BoardService) {}

  @UseGuards(LogInOnly)
  @Mutation(() => CreateBoardOutput)
  async createBoard(
    @CurrentUser() currentUser: User,
    @Args('args') args: CreateBoardInput,
  ): Promise<CreateBoardOutput> {
    try {
      const { title, content } = args;
      await this.boardService.create(title, content, currentUser);
      return {
        ok: true,
        error: null,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  @Query(() => GetBoardDetailOutput)
  async getBoardDetail(
    @Args('args') args: GetBoardDetailInput,
  ): Promise<GetBoardDetailOutput> {
    try {
      const { boardId } = args;
      const board = await this.boardService.findOneById(boardId);
      if (!board) throw new NotFoundException();
      return {
        ok: true,
        error: null,
        board,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
        board: null,
      };
    }
  }

  @UseGuards(LogInOnly)
  @Mutation(() => EditBoardOutput)
  async editBoard(
    @CurrentUser() currentUser: User,
    @Args('args') args: EditBoardInput,
  ): Promise<EditBoardOutput> {
    try {
      const { boardId, content } = args;
      const existBoard = await this.boardService.findOneById(boardId);
      if (!existBoard) {
        throw new NotFoundException();
      }
      if (currentUser.id !== existBoard.authorId) {
        throw new UnauthorizedException();
      }
      await this.boardService.edit(existBoard, content);
      return { ok: true, error: null };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  @UseGuards(LogInOnly)
  @Mutation(() => DeleteBoardOutput)
  async deleteBoard(
    @CurrentUser() currentUser: User,
    @Args('args') args: DeleteBoardInput,
  ): Promise<DeleteBoardOutput> {
    try {
      const { boardId } = args;
      const existBoard = await this.boardService.findOneById(boardId);
      if (!existBoard) {
        throw new NotFoundException();
      }
      if (currentUser.id !== existBoard.authorId) {
        throw new UnauthorizedException();
      }
      await this.boardService.delete(existBoard);
      return { ok: true, error: null };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  @Query(() => SearchBoardOutput)
  async searchBoard(
    @Args('args') args: SearchBoardInput,
  ): Promise<SearchBoardOutput> {
    try {
      const { searchTerm } = args;
      const boards = await this.boardService.getAllBySearchTerm(searchTerm);
      return {
        ok: true,
        error: null,
        boards,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
        boards: null,
      };
    }
  }
}
