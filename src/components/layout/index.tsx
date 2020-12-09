import React, {
  CSSProperties,
  FC, ReactNode, useRef,
} from 'react';
import { BackTop } from 'antd';
import 'antd/dist/antd.less';
import './style.less';
import { combineClassNames } from '@/helpers/utils';

interface Props {
  header?: ReactNode;
  sider?: ReactNode;
  className?: string;
  contentStyle?: CSSProperties;
}
export const Layout: FC<Props> = (props) => {
  const layout = useRef<HTMLDivElement>();

  const {
    children, header, sider, className,
  } = props;

  return (
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
  );
};
