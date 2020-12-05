import React, {
  CSSProperties, FC, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { Layout, Menu } from 'antd';
import { Link } from 'gatsby';
import { QueryContext } from '@/context';
import { buildMenu, MenuData } from '@/helpers/menus';
import { combineClassNames } from '@/helpers/utils';

const { Sider: AntSider } = Layout;

interface Props {
  className?: string;
}
export const Sider: FC<Props> = (props) => {
  const { className } = props;
  const { pageContext, data } = useContext(QueryContext);
  const { slug } = data.markdownRemark.fields;

  const menu = useMemo(() => {
    return buildMenu(pageContext.menu);
  }, [pageContext]);

  const render = useCallback((menuData: MenuData[]) => {
    return menuData.map((v) => {
      if (v.children?.length) {
        return (
          <Menu.SubMenu
            title={v.title}
            key={v.slug}
          >
            { render(v.children) }
          </Menu.SubMenu>
        );
      }
      return (
        <Menu.Item key={v.slug}>
          <Link to={v.slug}>{ v.title }</Link>
        </Menu.Item>
      );
    });
  }, []);
  const [openKeys, setOpenKeys] = useState([]);

  const defaultOpenKeys = useMemo(() => {
    const originMenu = pageContext.menu;
    const keys = [];
    const deep = (current: string): void => {
      for (let i = 0; i < originMenu.length; i += 1) {
        if (current === originMenu[i].slug) {
          keys.push(originMenu[i].parent);
          deep(originMenu[i].parent);
          break;
        }
      }
    };
    deep(slug);
    return keys;
  }, [pageContext, slug]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const onClick = useCallback(({ key }) => {
    setSelectedKeys([key]);
  }, []);
  const onOpenChange = useCallback((keys: string[]) => {
    setOpenKeys(keys);
  }, []);
  useEffect(() => {
    setSelectedKeys(slug);
  }, [slug]);
  useEffect(() => {
    setOpenKeys((prevState) => {
      return Array.from(new Set(prevState.concat(defaultOpenKeys)));
    });
  }, [defaultOpenKeys]);

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
                    key={v.slug}
                  >
                    { render(v.children) }
                  </Menu.ItemGroup>
                );
              }
              return (
                <Menu.Item
                  key={v.slug}
                >
                  <Link to={v.slug}>{ v.title }</Link>
                </Menu.Item>
              );
            })
          }
        </Menu>
      </AntSider>
    </div>
  );
};
