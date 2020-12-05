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
    <div className={combineClassNames('root-layout', className)} ref={layout}>
      { header }
      <div className="root-layout-content">
        { sider }
        <div className="root-markdown-wrapper">{ children }</div>
      </div>
      <BackTop target={() => layout.current} />
    </div>
  );
};
