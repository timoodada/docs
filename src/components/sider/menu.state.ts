import { Boom, Jinx, Spells } from '@/store/core';
import { Observable, of, zip } from 'rxjs';
import { get } from '@/helpers/http';
import {
  catchError, concatMap, map, tap,
} from 'rxjs/operators';
import { formattedPrefix } from '@/helpers/utils';
import { getSubServices } from '@/helpers/sub-service';

const { getMenuMapPath } = require('../../../utils');
const config = require('../../../config');

const MAIN_MENU = '__es_guide_main_menu_';
const SUB_SERVICE_MENU = '__es_guide_sub_menu_';

export interface MenuData {
  title: string;
  slug: string;
  path: string;
  type: string;
  main: boolean;
  slugWithPrefix: string;
  order: number;
  parent?: string;
  parentWithPrefix?: string;
  children?: this[];
}

type MenuOpenKeysType = string[];

export const buildMenu = (originMenu: MenuData[]): MenuData[] => {
  originMenu = originMenu.slice(0);
  originMenu.forEach((v) => {
    v.children = [];
  });
  originMenu.sort((a, b) => {
    let boo: boolean;
    if (a.main || b.main) {
      return a.main ? -1 : 1;
    }
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
    if (!item.parentWithPrefix) {
      menus.push(item);
    } else {
      const parent = originMenu.find((v) => v.slugWithPrefix === item.parentWithPrefix);
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
        menuMap[subServices[key]] = menu;
      });
      sessionStorage.setItem(`${SUB_SERVICE_MENU}_${lang}`, JSON.stringify(menuMap));
      return menuMap;
    }),
  );
};
export const getSubMenu = (lang: string): Observable<MenuData[]> => {
  if (!lang) {
    return of([]);
  }
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
        if (services.every((menu) => Object.keys(menus).includes(menu))) {
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
          v.parentWithPrefix = v.parent && `${sub}${v.parent}`;
          v.path = `/render?slug=${v.slug}&prefix=${sub}`;
        });
        arr.push(...res[sub]);
      });
      return arr;
    }),
  );
};

@Jinx<MenuOpenKeysType>('menuOpenKeys', [])
class MenuOpenKeys extends Spells<MenuOpenKeysType> {}
export const openKeys = new MenuOpenKeys();

@Jinx<MenuData[]>('menuList', [])
class MenuList extends Spells<MenuData[]> {}
export const menuList = new MenuList();

@Jinx<MenuData[]>('originMenu', [])
class OriginMenu extends Spells<MenuData[]> {
  init(lang: string) {
    let list = [];
    try {
      list = this.filter(JSON.parse(sessionStorage.getItem(`${MAIN_MENU}_${lang}`)));
    } catch (err) {
      //
    }
    this.set(list);
  }

  filter(list: MenuData[]): MenuData[] {
    const root = list.find((v) => v.type === 'root');
    list = list.filter((v) => v.type !== 'root');
    list.forEach((v) => {
      v.main = true;
      v.slugWithPrefix = `${formattedPrefix}${v.slug}`;
      v.path = v.slug;
      if (root && v.parent === root.slug) {
        delete v.parent;
      }
      v.parentWithPrefix = v.parent && `${formattedPrefix}${v.parent}`;
    });
    return list;
  }

  cache(data: MenuData[], lang: string) {
    sessionStorage.setItem(`${MAIN_MENU}_${lang}`, JSON.stringify(data));
  }

  syncSet(data: MenuData[], lang: string) {
    this.cache(data, lang);
    this.set(this.filter(data));
  }

  @Boom
  getMainMenu(lang: string): Observable<MenuData[]> {
    const str = sessionStorage.getItem(`${MAIN_MENU}_${lang}`);
    try {
      if (str) {
        return of(this.filter(JSON.parse(str)));
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('First Get Main Menus');
    }
    return get(getMenuMapPath(config.pathPrefix, config.dataMapDir, lang)).pipe(
      tap((res) => {
        this.cache(res, lang);
      }),
      catchError((err) => {
        // eslint-disable-next-line no-console
        console.error(err);
        return of([]);
      }),
      map((res) => {
        return this.filter(res);
      }),
    );
  }
}
export const originMenuState = new OriginMenu();
