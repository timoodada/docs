import React, {
  FC, PropsWithChildren,
} from 'react';
import { Layout as AntLayout } from 'antd';
import { Sider } from '@/components/layout/sider';
import { Header } from '@/components/layout/header';
import 'antd/dist/antd.less';
import './style.less';

const { Content } = AntLayout;

export const Layout: FC<PropsWithChildren<any>> = (props) => {
  const { children } = props;

  return (
    <AntLayout className="root-layout">
      <Sider
        style={{
          overflow: 'auto',
          height: '100%',
          position: 'fixed',
          left: 0,
          width: 200,
        }}
      />
      <AntLayout
        style={{ paddingLeft: 200 }}
      >
        <Header />
        <Content style={{ padding: 20 }}>{ children }</Content>
      </AntLayout>
    </AntLayout>
  );
};
