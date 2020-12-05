import React, { FC, useMemo } from 'react';
import { graphql } from 'gatsby';
import { ConfigProvider } from 'antd';
import { Layout } from '@/components/layout';
import { QueryContext } from '@/context';
import zhCN from 'antd/lib/locale/zh_CN';
import enUS from 'antd/lib/locale/en_US';
import { Header } from '@/components/layout/header';
import { Sider } from '@/components/layout/sider';
import { CustomLink } from '@/components/custom-link';

const RehypeReact = require('rehype-react');

const renderAst = new RehypeReact({
  createElement: React.createElement,
  components: {
    'custom-a': CustomLink,
  },
}).Compiler;

interface Props {
  data: any;
  pageContext: any;
  location: any;
}
const MDRuntime: FC<Props> = (props) => {
  const {
    data, pageContext, children, location,
  } = props;
  console.log(props);

  const queryData = useMemo(() => {
    return { data, pageContext, location };
  }, [data, pageContext]);

  if (!data || !pageContext) {
    return (
      <>{ children }</>
    );
  }
  return (
    <>
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
            <div className="root-remark-content">{ renderAst(pageContext.htmlAst) }</div>
          </Layout>
        </ConfigProvider>
      </QueryContext.Provider>
    </>
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
      }
    }
  }
`;
