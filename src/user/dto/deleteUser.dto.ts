import { ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/shared/CommonOutput.dto';

@ObjectType()
export class DeleteUserOutput extends CommonOutput {}
