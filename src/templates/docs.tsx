import React, { FC, useEffect, useMemo } from 'react';
import { graphql } from 'gatsby';
import { Provider } from 'react-redux';
import { QueryContext } from '@/context';
import { CustomLink } from '@/components/custom-link';
import { store } from '@/store';
import zhCN from 'antd/lib/locale/zh_CN';
import enUS from 'antd/lib/locale/en_US';
import { Layout } from '@/components/layout';
import { Header } from '@/components/header';
import { Sider } from '@/components/sider';
import { ConfigProvider } from 'antd';
import { language } from '@/store/main-states';

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
  navigate: any;
  custom404: any;
}
const MDRuntime: FC<Props> = (props) => {
  const {
    data, pageContext, children,
  } = props;
  // console.log(props);

  const localeLang = language.getState();
  useEffect(() => {
    language.init();
  }, []);

  const content = useMemo(() => {
    if (pageContext?.htmlAst) {
      return renderAst(pageContext.htmlAst);
    }
    return children;
  }, [data, pageContext, children]);

  return (
    <Provider store={store}>
      <QueryContext.Provider
        value={props}
      >
        <ConfigProvider locale={localeLang === 'zh-CN' ? zhCN : enUS}>
          <Layout
            header={
              <Header />
            }
            sider={
              <Sider />
            }
          >
            { content }
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
