import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/shared/CommonOutput.dto';
import { User } from '../user.model';

@InputType()
export class CreateUserInput extends PickType(User, ['name'], InputType) {}

@ObjectType()
export class CreateUserOutput extends CommonOutput {
  @Field({ nullable: true })
  token: string;
}
