import axios, { AxiosRequestConfig, Canceler } from 'axios';
import { Observable } from 'rxjs';
import { deepMerge } from '@/helpers/utils';

const defaultAxiosConf = {
  timeout: 20000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  },
  baseURL: '/',
};

export function http<T=any>(params: AxiosRequestConfig): Observable<T> {
  return new Observable<any>((subscribe) => {
    let cancel: Canceler;
    const conf = deepMerge(defaultAxiosConf, params);
    conf.cancelToken = new axios.CancelToken((c) => {
      cancel = c;
    });
    axios(conf).then((res) => {
      subscribe.next(res.data);
      subscribe.complete();
    }).catch((error) => {
      subscribe.error(error);
      subscribe.complete();
    });
    return {
      unsubscribe() {
        if (typeof cancel === 'function') { cancel('Cancel'); }
      },
    };
  });
}

export function get<T=any>(url: string, params?: { [prop: string]: any }): Observable<T> {
  return http({ method: 'get', url, params });
}
