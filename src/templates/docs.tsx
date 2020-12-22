import React, { FC, useEffect } from 'react';
import { graphql } from 'gatsby';
import { Provider } from 'react-redux';
import { QueryContext } from '@/context';
import { CustomLink } from '@/components/custom-link';
import { store } from '@/store';
import { Layout } from '@/components/layout';
import { Header } from '@/components/header';
import { Sider } from '@/components/sider';
import { language } from '@/store/main-states';

const RehypeReact = require('rehype-react');

const renderAst = new RehypeReact({
  createElement: React.createElement,
  components: {
    'custom-a': CustomLink,
  },
}).Compiler;

const MDRuntime: FC<any> = (props) => {
  const {
    pageContext, data,
  } = props;

  useEffect(() => {
    language.init(pageContext?.lang);
    if (pageContext?.lang) {
      language.setLangSilent(pageContext.lang);
    }
  }, [pageContext]);

  return (
    <Provider store={store}>
      <QueryContext.Provider
        value={props}
      >
        <Layout
          header={
            <Header />
          }
          sider={
            <Sider />
          }
          ast={pageContext?.htmlAst}
          title={data?.markdownRemark?.fields?.title}
        >
          {
            pageContext?.htmlAst ?
              renderAst(pageContext.htmlAst) :
              null
          }
        </Layout>
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
