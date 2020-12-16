/* eslint-disable @typescript-eslint/no-unused-vars */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { User } from 'src/user/user.model';
import { getConnection, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Board } from 'src/board/board.model';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  let userRepository: Repository<User>;
  let boardRepository: Repository<Board>;

  const GRAPHQL_ENDPOINT = '/graphql';

  const testUser = {
    name: 'hakhak',
  };
  let jwt: string;
  let fakeJwt: string;

  const testBoard = {
    title: 'test title',
    content: 'test content',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    userRepository = module.get(getRepositoryToken(User));
    boardRepository = module.get(getRepositoryToken(Board));
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  it('fake user', () => {
    return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .send({
        query: `
          mutation{
            createUser(args:{
              name:"fake",
            }){
              ok
              error
              token
            }
          }
        `,
      })
      .expect(200)
      .expect((res) => {
        fakeJwt = res.body.data.createUser.token;
      });
  });
  it('get hello', () => {
    return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .send({ query: '{hello}' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.hello).toBe('Hello World!');
      });
  });

  describe('createUser', () => {
    it('should create user', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
        mutation{
          createUser(args:{
            name:"${testUser.name}"
          }){
            ok
            error
            token
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                createUser: { ok, error, token },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(token).toEqual(expect.any(String));
          jwt = token;
        });
    });
    it('should fail with exist user name', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
        mutation{
          createUser(args:{
            name:"${testUser.name}"
          }){
            ok
            error
            token
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                createUser: { ok, error, token },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toEqual(expect.any(String));
          expect(token).toBe(null);
        });
    });
  });

  describe('getProfile', () => {
    let user: User;
    beforeAll(async () => {
      user = await userRepository.findOne({
        where: { name: testUser.name },
      });
    });
    it('should get profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `{
          getProfile(args:{userId:${user.id}}){
            ok
            error
            user{
              name
              boards{
                title
              }
            }
          }}
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                getProfile: {
                  ok,
                  error,
                  user,
                  user: { boards },
                },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(user).toEqual(expect.any(Object));
          expect(boards).toEqual(expect.any(Object));
        });
    });
    it('should fail with not found user id', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `{
          getProfile(args:{userId:666}){
            ok
            error
            user{
              name
              boards{
                title
              }
            }
          }}
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                getProfile: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('Not Found');
        });
    });
  });

  describe('createBoard', () => {
    it('should create board', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set({ Authorization: `Bearer ${jwt}` })
        .send({
          query: `
        mutation{
          createBoard(args:{
            title:"${testBoard.title}",
            content:"${testBoard.content}"
          }){
            ok
            error
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                createBoard: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should fail without JWT', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
        mutation{
          createBoard(args:{
            title:"${testBoard.title}",
            content:"${testBoard.content}"
          }){
            ok
            error
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors[0].message).toBe('Forbidden resource');
        });
    });
  });

  describe('getBoardDetail', () => {
    let board: Board;
    beforeAll(async () => {
      board = await boardRepository.findOne({
        where: { title: testBoard.title },
      });
    });
    it('should get board detail', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
        {
          getBoardDetail(args:{
            boardId:${board.id}
          }){
            ok
            error
            board{
              title
            }
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                getBoardDetail: { ok, error, board },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(board).toEqual(expect.any(Object));
        });
    });
    it('should fail with not found board id ', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
        {
          getBoardDetail(args:{
            boardId:666
          }){
            ok
            error
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                getBoardDetail: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('Not Found');
        });
    });
  });

  describe('serchBoard', () => {
    it('should get boards', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
        {
          searchBoard(args:{
            searchTerm:"${testBoard.title}"
          }){
            ok
            error
            boards{
              title
            }
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                searchBoard: { ok, error, boards },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(boards).toEqual(expect.any(Array));
        });
    });
  });

  describe('editBoard', () => {
    let board: Board;
    beforeAll(async () => {
      board = await boardRepository.findOne({
        where: { title: testBoard.title },
      });
    });
    it('should edit board', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set({ Authorization: `Bearer ${jwt}` })
        .send({
          query: `
        mutation{
          editBoard(args:{
            boardId:${board.id},
            content:"Changed!"
          }){
            ok
            error
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                editBoard: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should fail with not found board id', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set({ Authorization: `Bearer ${jwt}` })
        .send({
          query: `
      mutation{
        editBoard(args:{
          boardId:666,
          content:"Changed!"
        }){
          ok
          error
        }
      }
      `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                editBoard: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('Not Found');
        });
    });
    it('should fail without JWT', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation{
          editBoard(args:{
            boardId:${board.id},
            content:"Changed!"
          }){
            ok
            error
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors[0].message).toBe('Forbidden resource');
        });
    });
    it('should fail with others JWT', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set({ Authorization: `Bearer ${fakeJwt}` })
        .send({
          query: `
          mutation{
          editBoard(args:{
            boardId:${board.id},
            content:"Changed!"
          }){
            ok
            error
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                editBoard: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('Unauthorized');
        });
    });
  });

  describe('deleteBoard', () => {
    let board: Board;
    beforeAll(async () => {
      board = await boardRepository.findOne({
        where: { title: testBoard.title },
      });
    });
    it('should fail with not found board id', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set({ Authorization: `Bearer ${jwt}` })
        .send({
          query: `
        mutation{
          deleteBoard(args:{
            boardId:666
          }){
            ok
            error
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                deleteBoard: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('Not Found');
        });
    });
    it('should fail without JWT', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
        mutation{
          deleteBoard(args:{
            boardId:${board.id}
          }){
            ok
            error
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors[0].message).toBe('Forbidden resource');
        });
    });
    it('should fail with others JWT', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set({ Authorization: `Bearer ${fakeJwt}` })
        .send({
          query: `
        mutation{
          deleteBoard(args:{
            boardId:${board.id}
          }){
            ok
            error
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                deleteBoard: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('Unauthorized');
        });
    });
    it('should delete board', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set({ Authorization: `Bearer ${jwt}` })
        .send({
          query: `
        mutation{
          deleteBoard(args:{
            boardId:${board.id}
          }){
            ok
            error
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                deleteBoard: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
  });

  describe('deleteUser', () => {
    it('should fail without JWT', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
        mutation{
          deleteUser{
            ok
            error
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors[0].message).toBe('Forbidden resource');
        });
    });
    it('should delete user', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set({ Authorization: `Bearer ${jwt}` })
        .send({
          query: `
        mutation{
          deleteUser{
            ok
            error
          }
        }
        `,
        })
        .expect((res) => {
          const {
            body: {
              data: {
                deleteUser: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
  });
});
