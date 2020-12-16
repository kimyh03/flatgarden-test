import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/shared/CommonOutput.dto';
import { User } from '../user.model';

@InputType()
export class GetProfileInput {
  @Field()
  userId: number;
}

@ObjectType()
export class GetProfileOutput extends CommonOutput {
  @Field({ nullable: true })
  user: User;
}
