import React, {
  CSSProperties,
  FC, ReactNode, useCallback, useEffect, useRef, useState,
} from 'react';
import { BackTop, ConfigProvider, Affix } from 'antd';
import 'antd/dist/antd.less';
import './style.less';
import { combineClassNames } from '@/helpers/utils';
import zhCN from 'antd/lib/locale/zh_CN';
import enUS from 'antd/lib/locale/en_US';
import { language } from '@/store/main-states';
import { selectAll } from 'unist-util-select';
import toString from 'mdast-util-to-string';
import Helmet from 'react-helmet';

interface Props {
  header?: ReactNode;
  sider?: ReactNode;
  className?: string;
  contentStyle?: CSSProperties;
  ast?: any;
  title?: string;
}
export const Layout: FC<Props> = (props) => {
  const layout = useRef<HTMLDivElement>();
  const localeLang = language.use();
  const {
    children, header, sider, className, ast, title,
  } = props;
  const [titTrees, setTitTrees] = useState<any[]>([]);
  const [currentTit, setCurrentTit] = useState<any>();

  const onScroll = useCallback(() => {
    const height = layout.current?.clientHeight;
    let tit: any = titTrees[0];
    for (let i = 0; i < titTrees.length; i += 1) {
      const { id } = titTrees[i];
      if (id) {
        const dom = document.getElementById(id);
        if (dom) {
          const offsetTop = dom.getBoundingClientRect().top;
          if (offsetTop < height && offsetTop >= -1) {
            tit = titTrees[i];
            break;
          }
        }
      }
    }
    setCurrentTit(tit);
  }, [titTrees]);

  useEffect(() => {
    if (ast) {
      const result = (selectAll('element[tagName^=h]', ast) || [])
        .filter((val: any) => ['h1', 'h2'].includes(val.tagName) && val.properties?.id);
      setTitTrees(result.map((v: any) => {
        return {
          tagName: v.tagName,
          title: toString(v),
          id: v.properties?.id,
        };
      }));
    }
  }, [ast]);

  return (
    <ConfigProvider locale={localeLang === 'zh-CN' ? zhCN : enUS}>
      <Helmet
        title={title}
      />
      <section className={combineClassNames('root-layout', className)} ref={layout} onScroll={onScroll}>
        { header }
        <section className="root-layout-content">
          <Affix offsetTop={10} target={() => layout.current}>
            { sider }
          </Affix>
          <section className="markdown-body" id="markdownBody">
            { children }
          </section>
          <div className="affix-nav">
            <Affix offsetTop={10} target={() => layout.current}>
              <ul className="toc">
                {
                  titTrees.map((v, k) => {
                    return (
                      <li title={v.title} key={k}>
                        <a href={`#${v.id}`} className={combineClassNames(v.tagName, currentTit === v ? 'current' : null)}>{ v.title }</a>
                      </li>
                    );
                  })
                }
              </ul>
            </Affix>
          </div>
        </section>
        <BackTop target={() => layout.current} />
      </section>
    </ConfigProvider>
  );
};
