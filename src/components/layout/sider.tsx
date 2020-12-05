import React, {
  CSSProperties, FC, useCallback, useContext, useMemo,
} from 'react';
import { Layout, Menu } from 'antd';
import { QueryContext } from '@/context';
import { buildMenu, MenuData } from '@/helpers/menus';

const { Sider: AntSider } = Layout;

interface Props {
  style?: CSSProperties;
}
export const Sider: FC<Props> = (props) => {
  const { style } = props;
  const { pageContext, data } = useContext(QueryContext);

  const menu = useMemo(() => {
    return buildMenu(pageContext.menu);
  }, [pageContext]);

  const render = useCallback((menuData: MenuData[]) => {
    return menuData.map((v) => {
      if (v.children?.length) {
        return (
          <Menu.SubMenu title={v.title} key={v.slug}>
            { render(v.children) }
          </Menu.SubMenu>
        );
      }
      return (
        <Menu.Item key={v.slug}>
          <a href={v.slug}>{ v.title }</a>
        </Menu.Item>
      );
    });
  }, []);

  return (
    <AntSider
      trigger={null}
      style={style}
      theme="light"
    >
      <div className="logo" style={{ height: 64 }} />
      <Menu
        mode="inline"
        defaultSelectedKeys={[data.mdx.fields.slug]}
        defaultOpenKeys={[menu.find((v) => data.mdx.fields.slug.includes(v.slug))?.slug]}
        theme="light"
      >
        { render(menu) }
      </Menu>
    </AntSider>
  );
};
