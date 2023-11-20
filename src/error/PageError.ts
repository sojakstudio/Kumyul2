type ErrorName = 'PAGE_NOT_EXIST';

export default class PageError extends Error {
  name: ErrorName;
  message: string;

  constructor({
    name,
    message,
    cause,
  }: {
    name: ErrorName;
    message: string;
    cause?: Error;
  }) {
    super();
    this.name = name;
    this.message = message;
    this.cause = cause;
  }
}
