import { Headers, RequestOptions, Response } from '@angular/http'

export class BaseHttpService {
  defaultRequestOptions = new RequestOptions({
    headers: new Headers({
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    })
  });

  handleError(error: Response, caller: string, url: string, opt?: any): Promise<any> {
    let jsonError = error.json();
    let msg = `An error occurred in ${caller} when calling '${url}': '${jsonError.error}' (${error.status})`;
    if(opt === undefined) {
      console.warn(msg);
    } else {
      console.warn(msg, opt);
    }
    return Promise.reject(error);
  }
}
