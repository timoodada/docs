import { Jinx, Spells } from '@/store/core';
import { MenuData } from '@/helpers/menus';

type MenuOpenKeysType = string[];

@Jinx('menuOpenKeys', [])
class MenuOpenKeys extends Spells<MenuOpenKeysType> {}

export const openKeys = new MenuOpenKeys();

@Jinx('menuList', [])
class MenuList extends Spells<MenuData[]> {}

export const menuList = new MenuList();

@Jinx('originMenu', [])
class OriginMenu extends Spells<MenuData[]> {}

export const originMenuState = new OriginMenu();
