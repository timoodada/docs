import React, {
  FC, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { Layout, Menu } from 'antd';
import { Link } from 'gatsby';
import { QueryContext } from '@/context';
import { combineClassNames } from '@/helpers/utils';
import { tap } from 'rxjs/operators';
import {
  openKeys as openKeysState,
  menuList,
  originMenuState,
  buildMenu,
  getSubMenu,
  MenuData,
} from '@/components/sider/menu.state';
import { useCurrentSlug } from '@/hook';
import { language } from '@/store/main-states';
import './style.less';

const config = require('../../../config');

const { Sider: AntSider } = Layout;

interface Props {
  className?: string;
}
export const Sider: FC<Props> = (props) => {
  const { className } = props;
  const { data, location, pageContext } = useContext(QueryContext);
  const originMenu = originMenuState.use();
  const currentSlug = useCurrentSlug(data, location);
  const localeLang = language.use();
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
    originMenuState.init(localeLang);
  }, [localeLang]);
  useEffect(() => {
    if (pageContext.menu) {
      originMenuState.set(pageContext.menu);
    }
  }, [pageContext]);
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
    const subscription = getSubMenu(localeLang).pipe(
      tap((res) => {
        setSubMenu(res);
      }),
    ).subscribe();
    return () => subscription.unsubscribe();
  }, [localeLang]);
  useEffect(() => {
    menuList.set(buildMenu(originMenu.concat(subMenus)));
  }, [originMenu, subMenus]);

  return (
    <div
      className="root-sider-wrapper"
    >
      <AntSider
        trigger={null}
        width={260}
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
