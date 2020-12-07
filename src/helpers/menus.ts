import { Observable, of, zip } from 'rxjs';
import { getSubServices } from '@/helpers/sub-service';
import {
  catchError, concatMap, map, tap,
} from 'rxjs/operators';
import { get } from '@/helpers/http';
import { formattedPrefix } from '@/helpers/utils';

const { getMenuMapPath } = require('../../utils');
const config = require('../../config');

const SUB_SERVICE_MENU = '__es_guide_sub_menu_';
const MAIN_MENU = '__es_guide_main_menu_';

export interface MenuData {
  title: string;
  slug: string;
  path: string;
  slugWithPrefix: string;
  order: number;
  parent?: string;
  children?: this[];
}
export const buildMenu = (originMenu: MenuData[]): MenuData[] => {
  originMenu = originMenu.slice(0);
  originMenu.forEach((v) => {
    if (!v.path) {
      v.path = v.slug;
    }
    if (!v.slugWithPrefix) {
      v.slugWithPrefix = `${formattedPrefix}${v.slug}`;
    }
    v.children = [];
  });
  originMenu.sort((a, b) => {
    let boo: boolean;
    if (a.order === b.order) {
      boo = a.slugWithPrefix < b.slugWithPrefix;
    } else if (a.order * b.order > 0) {
      boo = Math.abs(a.order) < Math.abs(b.order);
    } else {
      boo = a.order < 0;
    }
    return boo ? -1 : 1;
  });
  const menus = [];
  for (let i = 0; i < originMenu.length; i += 1) {
    const item = originMenu[i];
    if (!item.parent) {
      menus.push(item);
    } else {
      const parent = originMenu.find((v) => v.slug === item.parent);
      if (parent) {
        parent.children.push(item);
      }
    }
  }
  return menus;
};

export const updateSubMenu = (
  lang: string,
  subServices: string[],
): Observable<{ [prop: string]: MenuData[] }> => {
  const requests = subServices.map((v) => {
    return get(getMenuMapPath(v, config.dataMapDir, lang)).pipe(
      catchError((err) => {
        // eslint-disable-next-line no-console
        console.error(err);
        return of([]);
      }),
    );
  });
  return zip(...requests).pipe(
    map((menus) => {
      const menuMap: any = {};
      menus.forEach((menu, key) => {
        menu.forEach((v) => {
          if (v.order === -1) {
            v.order = -2;
          }
        });
        menuMap[subServices[key]] = menu;
      });
      sessionStorage.setItem(`${SUB_SERVICE_MENU}_${lang}`, JSON.stringify(menuMap));
      return menuMap;
    }),
  );
};
export const getSubMenu = (lang: string): Observable<MenuData[]> => {
  const str = sessionStorage.getItem(`${SUB_SERVICE_MENU}_${lang}`);
  let menus: { [prop: string]: MenuData[] };
  try {
    menus = JSON.parse(str);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('First Get Sub Menus');
  }
  return getSubServices().pipe(
    concatMap((services) => {
      if (menus) {
        if (Object.keys(menus).every((key) => services.includes(key))) {
          return of(menus);
        }
      }
      return updateSubMenu(lang, services);
    }),
    map((res) => {
      const arr = [];
      Object.keys(res).forEach((sub) => {
        res[sub].forEach((v) => {
          v.slugWithPrefix = `${sub}${v.slug}`;
          v.path = `/render?slug=${v.slug}&prefix=${sub}`;
        });
        arr.push(...res[sub]);
      });
      return arr;
    }),
  );
};

export const getMainMenu = (lang: string): Observable<MenuData[]> => {
  const str = sessionStorage.getItem(`${MAIN_MENU}_${lang}`);
  try {
    if (str) {
      return of(JSON.parse(str));
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('First Get Main Menus');
  }
  return get(getMenuMapPath(config.pathPrefix, config.dataMapDir, lang)).pipe(
    tap((res) => {
      sessionStorage.setItem(`${MAIN_MENU}_${lang}`, JSON.stringify(res));
    }),
  );
};
