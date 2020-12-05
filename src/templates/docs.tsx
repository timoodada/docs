import React, { FC, useMemo } from 'react';
import { graphql } from 'gatsby';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import { ConfigProvider } from 'antd';
import { Layout } from '@/components/layout';
import { QueryContext } from '@/context';
import zhCN from 'antd/lib/locale/zh_CN';
import enUS from 'antd/lib/locale/en_US';

interface Props {
  data: any;
  pageContext: any;
}
const MDXRuntime: FC<Props> = (props) => {
  const { data, pageContext, children } = props;

  const queryData = useMemo(() => {
    return { data, pageContext };
  }, [data, pageContext]);

  if (!data || !pageContext) {
    return (
      <>{ children }</>
    );
  }
  return (
    <QueryContext.Provider
      value={queryData}
    >
      <ConfigProvider locale={data.mdx.fields.lang === 'zh-CN' ? zhCN : enUS}>
        <Layout>
          {
            data?.mdx.body
              ? <MDXRenderer>{data?.mdx.body}</MDXRenderer>
              : null
          }
        </Layout>
      </ConfigProvider>
    </QueryContext.Provider>
  );
};
export default MDXRuntime;
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
    mdx(id: {eq: $id}) {
      id
      body
      fields {
        title
        lang
        slug
      }
    }
  }
`;
