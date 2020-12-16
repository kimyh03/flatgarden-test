import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/shared/CommonOutput.dto';
import { Board } from '../board.model';

@InputType()
export class SearchBoardInput {
  @Field()
  searchTerm: string;
}

@ObjectType()
export class SearchBoardOutput extends CommonOutput {
  @Field(() => [Board], { nullable: true })
  boards: Board[];
}
