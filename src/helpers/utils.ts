const config = require('../../config');

export const formattedPrefix = config.pathPrefix.replace(/\/$/, '');

export function isPlainObject(val: { [prop: string]: any }): val is { [prop: string]: any } {
  return toString.call(val) === '[object Object]';
}
// return a new object.
export function deepMerge(...args: any[]): any {
  if (args.length < 1) {
    return null;
  }
  if (args.some((item) => !isPlainObject(item) && !Array.isArray(item))) {
    throw new Error('Arguments must be all object or array');
  }
  const ret = Array.isArray(args[0]) ? [] : Object.create(null);
  function deep(val: any, key: any) {
    if (isPlainObject(val)) {
      if (isPlainObject(ret[key])) {
        ret[key] = deepMerge(ret[key], val);
      } else {
        ret[key] = deepMerge(val);
      }
    } else if (Array.isArray(val)) {
      if (Array.isArray(ret[key])) {
        ret[key] = deepMerge(ret[key], val);
      } else {
        ret[key] = deepMerge(val);
      }
    } else {
      ret[key] = val;
    }
  }
  args.forEach((obj) => {
    if (isPlainObject(obj)) {
      Object.keys(obj).forEach((key) => {
        const val = obj[key];
        deep(val, key);
      });
    } else if (Array.isArray(obj)) {
      obj.forEach((item, key) => {
        deep(item, key);
      });
    }
  });
  return ret;
}

export function debounce(func: (args?: any) => any, delay = 300): (...args: any[]) => void {
  let timer: number;
  return (...args: any[]) => {
    if (timer) {
      window.clearTimeout(timer);
    }
    timer = window.setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export function combineClassNames(...args: (string | null | undefined)[]): string {
  const classNames: string[] = [];
  args.forEach((item) => {
    if (typeof item !== 'string') {
      return;
    }
    item = item.trim();
    if (!item) {
      return;
    }
    item.split(' ').forEach((className) => {
      if (classNames.indexOf(className) === -1) {
        classNames.push(className);
      }
    });
  });
  return classNames.join(' ');
}

export function addClass(dom: HTMLElement, className: string): void {
  dom.className = combineClassNames(dom.className, className);
}

export function queryParse(val: string | { [prop: string]: string }): any {
  if (typeof val === 'string') {
    if (val.indexOf('?') === 0) { val = val.substr(1); }
    const query: { [prop: string]: string } = {};
    val.split('&').forEach((item: { split: (arg0: string) => string[] }) => {
      const arr: string[] = item.split('=');
      const [key, value] = arr;
      query[key] = value;
    });
    return query;
  }
  if (isPlainObject(val)) {
    return val;
  }
  return {};
}
