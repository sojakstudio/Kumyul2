import pg from 'pg';
import logger from '../utils/logger.js';

const { Pool, Client } = pg;

export const Connect = (): Promise<boolean> =>
  // eslint-disable-next-line no-async-promise-executor
  new Promise<boolean>(async (resolve, reject) => {
    try {
      // config 생성하기
      const clientconfig: pg.ClientConfig = {
        connectionString: process.env.DATABASE_URL?.replace(
          'postgres',
          'postgresql',
        ).concat('', '?sslmode=require'),
        // Beware! The ssl object is overwritten when parsing the connectionString
        ssl: {
          rejectUnauthorized: false,
        },
      };

      // 클라이언트 생성
      const client = new Client(clientconfig);

      // 연결
      client.connect(err => {
        if (err) {
          logger.error(`Error Connecting: ${err.stack}`);
        } else {
          logger.info('Client connected');
          resolve(true);
        }
      });
    } catch {
      // 에러가 나부려써영?
      // eslint-disable-next-line
      (err: any) => {
        logger.error(err.stack);
        reject(err);
      };
    }
  });

export function getPool() {
  // 컨피그 만들어
  const poolconfig: pg.PoolConfig = {
    connectionString: process.env.DATABASE_URL?.replace(
      'postgres',
      'postgresql',
    ).concat('', '?sslmode=require'),
    // Beware! The ssl object is overwritten when parsing the connectionString
    ssl: {
      rejectUnauthorized: true,
    },
  };

  // 리턴해부려잉~
  return new Pool(poolconfig);
}
