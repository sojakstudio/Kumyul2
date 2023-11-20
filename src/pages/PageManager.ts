import { PageError } from '../error/index.js';
import PageBuilder from './PageBuilder';

export default class PageManager {
  pages: Array<PageBuilder>;

  constructor() {
    this.pages = new Array<PageBuilder>();
  }
  public init(pages: PageBuilder[]): Promise<PageManager> {
    return new Promise((res, rej) => {
      try {
        this.pages = pages;
        res(this);
      } catch (e) {
        rej(e);
      }
    });
  }
  public add(pages: PageBuilder): Promise<boolean> {
    return new Promise((res, rej) => {
      try {
        this.pages.push(pages);
        res(true);
      } catch (e) {
        rej(e);
      }
    });
  }
  public get(assetName: string): Promise<PageBuilder> {
    return new Promise((res, rej) => {
      try {
        const result = this.pages.find(e => e.data.assetcode.match(assetName));
        if (result) res(result);
        else {
          rej(
            new PageError({
              name: 'PAGE_NOT_EXIST',
              message: `Requested Page '${assetName}' was not found in list.`,
            }),
          );
        }
      } catch (e) {
        rej(e);
      }
    });
  }
}
