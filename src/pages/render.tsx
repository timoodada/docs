import React, {
  FC, useContext, useEffect, useState,
} from 'react';
import { QueryContext } from '@/context';
import { queryParse } from '@/helpers/utils';
import { get } from '@/helpers/http';
import { concatMap, tap } from 'rxjs/operators';
import { getMainMenu } from '@/helpers/menus';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import enUS from 'antd/lib/locale/en_US';
import { Layout } from '@/components/layout';
import { Header } from '@/components/layout/header';
import { Sider } from '@/components/layout/sider';
import { SubCustomLink } from '@/components/custom-link';

const RehypeReact = require('rehype-react');

const renderAst = new RehypeReact({
  createElement: React.createElement,
  components: {
    'custom-a': SubCustomLink,
  },
}).Compiler;

const SubServiceRender: FC = () => {
  const queryContext = useContext(QueryContext);
  const query = queryParse(queryContext.location.search);
  const { slug, prefix } = query;
  const [newQueryContext, setNewQueryContext] = useState<any>(queryContext);

  useEffect(() => {
    const slugs = slug.split('/').filter((v) => v);
    const prefixs = prefix.split('/').filter((v) => v);
    slugs.push('page-data.json');
    slugs.unshift('page-data');
    slugs.unshift(...prefixs);
    get(slugs.map((v) => `/${v}`).join('')).pipe(
      tap((res) => {
        setNewQueryContext((prevState) => {
          return {
            ...prevState,
            data: res.result.data,
            pageContext: res.result.pageContext,
          };
        });
      }),
      concatMap((res) => {
        return getMainMenu(res.result.data.markdownRemark.fields.lang).pipe(
          tap((menus) => {
            setNewQueryContext((prevState) => {
              return {
                ...prevState,
                originMenu: menus,
              };
            });
          }),
        );
      }),
    ).subscribe();
  }, [slug, prefix]);

  return (
    <>
      <QueryContext.Provider
        value={newQueryContext}
      >
        <ConfigProvider locale={newQueryContext?.data?.markdownRemark?.fields?.lang === 'zh-CN' ? zhCN : enUS}>
          <Layout
            header={
              <Header />
            }
            sider={
              <Sider />
            }
          >
            <div
              className="root-remark-content markdown-body"
            >
              {
                newQueryContext?.pageContext?.htmlAst
                  ? renderAst(newQueryContext.pageContext.htmlAst)
                  : null
              }
            </div>
          </Layout>
        </ConfigProvider>
      </QueryContext.Provider>
    </>
  );
};

export default SubServiceRender;
