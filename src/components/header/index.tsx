import React, { FC, useCallback, useContext } from 'react';
import { Layout as AntLayout, Menu, Select } from 'antd';
import { SearchBox } from '@/components/search';
import logo from '@/common/images/logo.png';
import { language } from '@/store/main-states';
import { QueryContext } from '@/context';
import { useCurrentSlug, useMainSlug } from '@/hook';
import { formattedPrefix, queryParse } from '@/helpers/utils';
import './style.less';

const config = require('../../../config');

const { Header: AntHeader } = AntLayout;
const { Option } = Select;

const { langs } = config.i18n;
const i18n = {
  'zh-CN': {
    console: '控制台',
  },
  'en-US': {
    console: 'Console',
  },
};

export const Header: FC = () => {
  const { location, data } = useContext(QueryContext);
  const lang = language.use();
  const currentSlug = useCurrentSlug(data, location, false);
  const mainSlug = useMainSlug(location);
  const query = queryParse(location.search);
  const langTranslate = {
    'zh-CN': '简体中文',
    'en-US': 'English',
  };
  const goTo = useCallback((url: string) => {
    window.location.href = url;
  }, []);
  const onChange = useCallback((value) => {
    let slug = '';
    const reg = new RegExp(lang);
    if (reg.test(currentSlug)) {
      slug = currentSlug.replace(reg, value);
      if (slug === `/${config.i18n.defaultLang}`) {
        slug = '/';
      }
    } else {
      slug = `/${value}${currentSlug.replace(new RegExp(`^/${lang}`), '')}`;
    }
    language.setLangSilent(value);
    const target = mainSlug === '/render'
      ? `${formattedPrefix}${mainSlug}?slug=${slug}&prefix=${query.prefix}`
      : `${formattedPrefix}${slug}`;
    goTo(target);
  }, [currentSlug, mainSlug, lang]);

  if (!lang) {
    return null;
  }
  return (
    <AntHeader className="root-header">
      <div className="logo">
        <img src={logo} alt="logo" />
      </div>
      <div className="search-box-wrapper">
        <SearchBox />
      </div>
      <div className="header-menu">
        <div>
          <Menu mode="inline">
            <Menu.Item>
              <a href="/">{ i18n[lang]?.console }</a>
            </Menu.Item>
          </Menu>
        </div>
        <Select defaultValue={lang} className="lang-select" onChange={onChange}>
          {
            langs.map((v) => (
              <Option value={v} key={v}>{ langTranslate[v] }</Option>
            ))
          }
        </Select>
      </div>
    </AntHeader>
  );
};
