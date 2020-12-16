import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/shared/CommonOutput.dto';
import { Board } from '../board.model';

@InputType()
export class CreateBoardInput extends PickType(
  Board,
  ['title', 'content'],
  InputType,
) {}

@ObjectType()
export class CreateBoardOutput extends CommonOutput {}
