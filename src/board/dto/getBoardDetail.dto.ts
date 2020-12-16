import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/shared/CommonOutput.dto';
import { Board } from '../board.model';

@InputType()
export class GetBoardDetailInput {
  @Field()
  boardId: number;
}

@ObjectType()
export class GetBoardDetailOutput extends CommonOutput {
  @Field(() => Board, { nullable: true })
  board: Board;
}
