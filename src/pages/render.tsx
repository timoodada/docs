import React, {
  FC, useEffect, useState,
} from 'react';
import { QueryContext } from '@/context';
import { queryParse } from '@/helpers/utils';
import { get } from '@/helpers/http';
import { catchError, finalize, tap } from 'rxjs/operators';
import { SubCustomLink } from '@/components/custom-link';
import { originMenuState } from '@/components/sider/menu.state';
import { language } from '@/store/main-states';
import { throwError } from 'rxjs';
import { Loading } from '@/components/loading';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { Header } from '@/components/header';
import { Sider } from '@/components/sider';
import { Layout } from '@/components/layout';

const RehypeReact = require('rehype-react');

const renderAst = new RehypeReact({
  createElement: React.createElement,
  components: {
    'custom-a': SubCustomLink,
  },
}).Compiler;

const SubServiceRender: FC<any> = (props) => {
  const { location } = props;
  const query = queryParse(location.search);
  const { slug, prefix } = query;
  const [newQueryContext, setNewQueryContext] = useState<any>(props);
  const [ast, setAst] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const localeLang = language.use();

  useEffect(() => {
    if (!slug || !prefix) {
      return;
    }
    const slugs = slug.split('/').filter((v) => v);
    const prefixs = prefix.split('/').filter((v) => v);
    slugs.push('page-data.json');
    slugs.unshift(...prefixs, 'page-data');
    setLoading(true);
    const subscription = get(slugs.map((v) => `/${v}`).join('')).pipe(
      tap((res) => {
        setNewQueryContext((prevState) => {
          return {
            ...prevState,
            data: res.result.data,
          };
        });
        setAst(res.result?.pageContext?.htmlAst);
      }),
      catchError((e) => {
        return throwError(e);
      }),
      finalize(() => setLoading(false)),
    ).subscribe();
    return () => subscription.unsubscribe();
  }, [slug, prefix]);
  useEffect(() => {
    language.init();
  }, []);
  useEffect(() => {
    if (!localeLang) {
      return;
    }
    const subscription = originMenuState.getMainMenu(localeLang).subscribe();
    return () => subscription.unsubscribe();
  }, [localeLang]);

  return (
    <QueryContext.Provider
      value={newQueryContext}
    >
      <Layout
        header={
          <Header />
        }
        sider={
          <Sider />
        }
      >
        {
          loading ?
            <Loading size="large" /> :
            ast ?
              renderAst(ast) :
              <div>404</div>
        }
      </Layout>
    </QueryContext.Provider>
  );
};

const WrappedProvider: FC = (props) => {
  return (
    <Provider store={store}>
      <SubServiceRender {...props} />
    </Provider>
  );
};

export default WrappedProvider;
