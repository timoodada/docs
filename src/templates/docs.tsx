import React, { FC, useMemo } from 'react';
import { graphql } from 'gatsby';
import { ConfigProvider } from 'antd';
import { Provider } from 'react-redux';
import { Layout } from '@/components/layout';
import { QueryContext } from '@/context';
import zhCN from 'antd/lib/locale/zh_CN';
import enUS from 'antd/lib/locale/en_US';
import { Header } from '@/components/layout/header';
import { Sider } from '@/components/layout/sider';
import { CustomLink } from '@/components/custom-link';
import { store } from '@/store';

const RehypeReact = require('rehype-react');

const renderAst = new RehypeReact({
  createElement: React.createElement,
  components: {
    'custom-a': CustomLink,
  },
}).Compiler;

interface Props {
  data: any;
  pageContext: {
    id: string;
    lang: string;
    menu: any;
    htmlAst: any;
  };
  location: any;
}
const MDRuntime: FC<Props> = (props) => {
  const {
    data, pageContext, children, location,
  } = props;

  const queryData = useMemo(() => {
    return {
      data,
      pageContext,
      location,
      originMenu: pageContext?.menu || [],
    };
  }, [data, pageContext, location]);

  if (!data || !pageContext) {
    return (
      <Provider store={store}>
        <QueryContext.Provider value={queryData}>{ children }</QueryContext.Provider>
      </Provider>
    );
  }
  return (
    <Provider store={store}>
      <QueryContext.Provider
        value={queryData}
      >
        <ConfigProvider locale={data.markdownRemark.fields.lang === 'zh-CN' ? zhCN : enUS}>
          <Layout
            header={
              <Header />
            }
            sider={
              <Sider />
            }
          >
            <div className="root-remark-content markdown-body">{ renderAst(pageContext.htmlAst) }</div>
          </Layout>
        </ConfigProvider>
      </QueryContext.Provider>
    </Provider>
  );
};
export default MDRuntime;
export const pageQuery = graphql`
  query($id: String!) {
    site {
      siteMetadata {
        title
        description
        i18n {
          langs
          defaultLang
        }
        dataMapDir
      }
    }
    markdownRemark(id: {eq: $id}) {
      id
      fields {
        title
        lang
        slug
        prefix
      }
    }
  }
`;
