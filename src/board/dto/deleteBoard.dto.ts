import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/shared/CommonOutput.dto';

@InputType()
export class DeleteBoardInput {
  @Field()
  boardId: number;
}

@ObjectType()
export class DeleteBoardOutput extends CommonOutput {}
