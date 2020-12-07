import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

const config = require('../../config');

let subServices: string[] = [];

export const getSubServices = (): Observable<string[]> => {
  if (config.isSubService) {
    return of([]);
  }
  if (subServices.length) {
    return of(subServices);
  }
  return of(['/edrs/esguide']).pipe(
    map((res) => {
      subServices = res.map((v) => {
        let ret: string;
        if (v.indexOf('/') !== 0) {
          ret = `/${v}`;
        } else {
          ret = v;
        }
        return ret.replace(/\/$/, '');
      });
      return subServices;
    }),
  );
};
