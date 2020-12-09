import React, { FC } from 'react';
import { Spin } from 'antd';
import './style.less';
import { language } from '@/store/main-states';

const i18n = {
  'zh-CN': {
    loading: '加载中...',
  },
  'en-US': {
    loading: 'loading...',
  },
};

interface Props {
  size?: Spin['props']['size'];
}
export const Loading: FC<Props> = (props) => {
  const { size } = props;
  const localeLang = language.use();
  return (
    <div className="loading-wrapper">
      <Spin tip={i18n[localeLang]?.loading} size={size} />
    </div>
  );
};
