import React, {
  CSSProperties,
  FC, ReactNode, useRef,
} from 'react';
import { BackTop, ConfigProvider } from 'antd';
import 'antd/dist/antd.less';
import './style.less';
import { combineClassNames } from '@/helpers/utils';
import zhCN from 'antd/lib/locale/zh_CN';
import enUS from 'antd/lib/locale/en_US';
import { language } from '@/store/main-states';

interface Props {
  header?: ReactNode;
  sider?: ReactNode;
  className?: string;
  contentStyle?: CSSProperties;
}
export const Layout: FC<Props> = (props) => {
  const layout = useRef<HTMLDivElement>();
  const localeLang = language.use();

  const {
    children, header, sider, className,
  } = props;

  return (
    <ConfigProvider locale={localeLang === 'zh-CN' ? zhCN : enUS}>
      <section className={combineClassNames('root-layout', className)}>
        { header }
        <section className="root-layout-content">
          { sider }
          <section className="markdown-body" ref={layout}>
            { children }
            <BackTop target={() => layout.current} />
          </section>
        </section>
      </section>
    </ConfigProvider>
  );
};
