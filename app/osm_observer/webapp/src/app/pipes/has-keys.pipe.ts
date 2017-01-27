import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'hasKeys'})
export class HasKeysPipe implements PipeTransform {
  transform(value, args:string[]) : any {
    let hasKeys: boolean = false;
    for (let key in value) {
      if(typeof(value[key]) !== 'function') {
        hasKeys = true;
        break;
      }
    }
    return hasKeys;
  }
}
