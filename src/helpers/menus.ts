export interface MenuData {
  title: string;
  slug: string;
  parent?: string;
  children?: this[];
}
export const buildMenu = (originMenu: MenuData[]): MenuData[] => {
  const menus = [];
  originMenu.forEach((v) => {
    v.children = [];
  });
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
