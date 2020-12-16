import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UserModule } from './user/user.module';
import { BoardModule } from './board/board.module';
import { BoardService } from './board/board.service';
import { GraphQLModule } from '@nestjs/graphql';
import { AppResolver } from './app/app.resolver';
import { AppService } from './app/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { Board } from './board/board.model';
import { User } from './user/user.model';
import { AssignUserMiddleware } from './auth/assignUser.middleware';

@Module({
  imports: [
    UserModule,
    BoardModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [User, Board],
      synchronize: true,
      logging: process.env.NODE_ENV === 'test' ? false : true,
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
    }),
  ],
  providers: [AppService, BoardService, AppResolver],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AssignUserMiddleware)
      .forRoutes({ path: '/graphql', method: RequestMethod.ALL });
  }
}
