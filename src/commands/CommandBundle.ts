import ICommand from '../interfaces/ICommand.js';
import {
  Announce,
  Ban,
  Help,
  Kick,
  LimitCheck,
  LimitSet,
  ServerConfig,
  Vote,
  WarnAdd,
  WarnSet,
  WarnCheck,
  WarnReset,
  WarnRemove,
} from './index.js';

const CommandBundle: ICommand[] = [
  Announce,
  Ban,
  Help,
  Kick,
  LimitCheck,
  LimitSet,
  Vote,
  WarnAdd,
  WarnCheck,
  WarnRemove,
  WarnReset,
  WarnSet,
  ServerConfig,
];

export default CommandBundle;
