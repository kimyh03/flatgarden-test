import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/shared/CommonOutput.dto';
import { Board } from '../board.model';

@InputType()
export class EditBoardInput extends PickType(Board, ['content'], InputType) {
  @Field()
  boardId: number;
}

@ObjectType()
export class EditBoardOutput extends CommonOutput {}
