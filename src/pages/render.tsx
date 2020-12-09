import React, {
  FC, useContext, useEffect, useState,
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
  const [ast, setAst] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const localeLang = language.use();

  useEffect(() => {
    const { location } = queryContext;
    if (location) {
      setNewQueryContext((prevState) => {
        return { ...prevState, location };
      });
    }
  }, [queryContext]);
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
      {
        loading ?
          <Loading size="large" /> :
          ast ?
            renderAst(ast) :
            <div>404</div>
      }
    </QueryContext.Provider>
  );
};

export default SubServiceRender;
