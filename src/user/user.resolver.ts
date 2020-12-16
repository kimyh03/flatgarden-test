import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Query, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from 'src/auth/auth.service';
import { CurrentUser } from 'src/auth/currentUser.decorator';
import { LogInOnly } from 'src/auth/logInOnly.guard';
import { CreateUserInput, CreateUserOutput } from './dto/createUser';
import { DeleteUserOutput } from './dto/deleteUser.dto';
import { GetProfileInput, GetProfileOutput } from './dto/getProfile.dto';
import { User } from './user.model';
import { UserService } from './user.service';
@Resolver()
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Mutation(() => CreateUserOutput)
  async createUser(
    @Args('args') args: CreateUserInput,
  ): Promise<CreateUserOutput> {
    try {
      const { name } = args;
      const newUser = await this.userService.create(name);
      const token = this.authService.sign(newUser.id);
      return { ok: true, error: null, token };
    } catch (error) {
      return { ok: false, error: error.message, token: null };
    }
  }

  @UseGuards(LogInOnly)
  @Mutation(() => DeleteUserOutput)
  async deleteUser(
    @CurrentUser() currentUser: User,
  ): Promise<DeleteUserOutput> {
    try {
      await this.userService.delete(currentUser);
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

  @Query(() => GetProfileOutput)
  async getProfile(
    @Args('args') args: GetProfileInput,
  ): Promise<GetProfileOutput> {
    try {
      const { userId } = args;
      const user = await this.userService.findOneById(userId, ['boards']);
      if (!user) throw new NotFoundException();
      return { ok: true, error: null, user };
    } catch (error) {
      return { ok: false, error: error.message, user: null };
    }
  }
}
