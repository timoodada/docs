import React, {
  FC, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { Layout, Menu } from 'antd';
import { Link } from 'gatsby';
import { QueryContext } from '@/context';
import { buildMenu, getSubMenu, MenuData } from '@/helpers/menus';
import { combineClassNames } from '@/helpers/utils';
import { tap } from 'rxjs/operators';
import { openKeys as openKeysState, menuList, originMenuState } from '@/components/layout/menu.state';
import { useCurrentSlug, useLang } from '@/hook';

const config = require('../../../config');

const { Sider: AntSider } = Layout;

interface Props {
  className?: string;
}
export const Sider: FC<Props> = (props) => {
  const { className } = props;
  const { originMenu: contextOriginMenu, data, location } = useContext(QueryContext);
  const originMenu = originMenuState.use();
  const currentSlug = useCurrentSlug(data, location);
  const lang = useLang(data, config.i18n.defaultLang);
  const [subMenus, setSubMenu] = useState([]);

  const render = useCallback((menuData: MenuData[]) => {
    return menuData.map((v) => {
      if (v.children?.length) {
        return (
          <Menu.SubMenu
            title={v.title}
            key={v.slugWithPrefix}
          >
            { render(v.children) }
          </Menu.SubMenu>
        );
      }
      return (
        <Menu.Item key={v.slugWithPrefix}>
          <Link to={v.path}>{ v.title }</Link>
        </Menu.Item>
      );
    });
  }, []);
  const openKeys = openKeysState.use();
  const menu = menuList.use();

  const defaultOpenKeys = useMemo(() => {
    const keys = [];
    const deep = (current: string): void => {
      for (let i = 0; i < originMenu.length; i += 1) {
        if (current === originMenu[i].slugWithPrefix) {
          keys.push(originMenu[i].parent);
          deep(originMenu[i].parent);
          break;
        }
      }
    };
    deep(currentSlug);
    return keys;
  }, [originMenu, currentSlug]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const onClick = useCallback(({ key }) => {
    setSelectedKeys([key]);
  }, []);
  const onOpenChange = useCallback((keys: string[]) => {
    openKeysState.set(keys);
  }, []);
  useEffect(() => {
    if (contextOriginMenu && contextOriginMenu.length) {
      originMenuState.set(contextOriginMenu);
    }
  }, [contextOriginMenu]);
  useEffect(() => {
    setSelectedKeys([currentSlug]);
  }, [currentSlug]);
  useEffect(() => {
    openKeysState.set(Array.from(new Set(openKeysState.getState().concat(defaultOpenKeys))));
  }, [defaultOpenKeys]);
  useEffect(() => {
    if (config.isSubService) {
      return;
    }
    getSubMenu(lang).pipe(
      tap((res) => {
        setSubMenu(res);
      }),
    ).subscribe();
  }, [lang]);
  useEffect(() => {
    menuList.set(buildMenu(originMenu.concat(subMenus)));
  }, [originMenu, subMenus]);

  return (
    <div
      className="root-sider-wrapper"
      style={{
        position: 'absolute',
      }}
    >
      <AntSider
        trigger={null}
        width={280}
        theme="light"
        className={combineClassNames('root-sider', className)}
      >
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          onClick={onClick}
          onOpenChange={onOpenChange}
          theme="light"
        >
          {
            menu.map((v) => {
              if (v.children?.length) {
                return (
                  <Menu.ItemGroup
                    title={v.title}
                    key={v.slugWithPrefix}
                  >
                    { render(v.children) }
                  </Menu.ItemGroup>
                );
              }
              return (
                <Menu.Item
                  key={v.slugWithPrefix}
                >
                  {/* Link will add prefix path automatically */}
                  <Link to={v.path}>{ v.title }</Link>
                </Menu.Item>
              );
            })
          }
        </Menu>
      </AntSider>
    </div>
  );
};
