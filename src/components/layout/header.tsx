import React, { FC } from 'react';
import { Layout as AntLayout } from 'antd';
import { SearchBox } from '@/components/search';

const { Header: AntHeader } = AntLayout;

export const Header: FC = () => {
  return (
    <AntHeader style={{ padding: 0 }} className="root-header">
      <SearchBox />
    </AntHeader>
  );
};
