import React, { FC } from 'react';
import { Layout as AntLayout } from 'antd';
import { SearchBox } from '@/components/search';
import logo from '@/common/images/logo.png';

const { Header: AntHeader } = AntLayout;

export const Header: FC = () => {
  return (
    <AntHeader className="root-header">
      <div className="logo">
        <img src={logo} alt="logo" />
      </div>
      <div className="search-box-wrapper">
        <SearchBox />
      </div>
    </AntHeader>
  );
};
