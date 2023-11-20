import { connect } from 'mongoose';
import IConfig from '../interfaces/IConfig.js';

const mongoConnect = (config: IConfig) =>
  new Promise<void>((resolve, reject) => {
    connect(config.database.mongoURL)
      .then(() => resolve())
      .catch(err => reject(err));
  });

export default mongoConnect;
