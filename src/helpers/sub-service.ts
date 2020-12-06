import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

const config = require('../../config');

let subServices: string[] = [];

export const getSubServices = (): Observable<string[]> => {
  if (config.isSubService) {
    return of([]);
  }
  if (subServices.length) {
    return of(subServices);
  }
  return of(['/esguide-dr']).pipe(
    tap((res) => {
      subServices = res;
    }),
  );
};
