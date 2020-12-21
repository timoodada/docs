import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import '@/common/styles/search-page.less';
import { Provider } from 'react-redux';
import { store } from '@/store';
import 'antd/dist/antd.less';
import { RemoteSearch, SearchResults } from '@/components/search/search.core';
import { getSubServices } from '@/helpers/sub-service';
import { tap } from 'rxjs/operators';
import { language } from '@/store/main-states';
import { Input } from 'antd';
import { Link } from 'gatsby';

const { Search } = Input;

const i18n = {
  'zh-CN': {
    tip: '搜索帮助仅支持关键词搜索，若需多个关键词同时搜索，请以空格区分。',
    placeholder: '搜索...',
  },
  'en-US': {
    placeholder: 'Search...',
  },
};

const SearchPage: FC = () => {
  const remoteSearch = useRef<RemoteSearch>();
  const pageInfo = useRef({
    page: 0,
    numPerPage: 10,
    keywords: '',
  });
  const [results, setResults] = useState<SearchResults[]>([]);
  const lang = language.use();

  const replace = useCallback((str: string): string => {
    const reg = new RegExp(`(${pageInfo.current.keywords.split(/\s+/g).join('|')}|${pageInfo.current.keywords})`, 'ig');
    return str.replace(reg, (c) => {
      return `<span class="active">${c}</span>`;
    });
  }, []);
  type LinkToArg = {
    slug: string;
    isSubService: boolean;
    prefix: string;
    a?: string;
  };
  const linkTo = useCallback((v: LinkToArg): string => {
    if (v.isSubService) {
      return `/render?slug=${v.slug}&prefix=${v.prefix}${v.a ? `#${v.a}` : ''}`;
    }
    return `${v.slug}${v.a ? `#${v.a}` : ''}`;
  }, []);
  const onSearch = useCallback((keywords: string) => {
    pageInfo.current.keywords = keywords;
    if (!keywords) {
      return;
    }
    remoteSearch.current.search(keywords, pageInfo.current.page, pageInfo.current.numPerPage).pipe(
      tap((res) => {
        if (pageInfo.current.page === 0) {
          setResults(res);
        } else {
          setResults((prevState) => prevState.concat(res));
        }
      }),
    ).subscribe();
  }, []);

  useEffect(() => {
    language.init();
  }, []);
  useEffect(() => {
    if (!lang) {
      return;
    }
    const subscription = getSubServices().pipe(
      tap((res) => {
        remoteSearch.current = new RemoteSearch(res, lang);
      }),
    ).subscribe();
    return () => subscription.unsubscribe();
  }, [lang]);

  return (
    <div className="search-page">
      <div className="search-box">
        <Search
          placeholder={i18n[lang]?.placeholder || ''}
          onSearch={onSearch}
        />
      </div>
      <div className="search-results-wrapper">
        {
          results.map((item) => {
            return (
              <div className="search-result-row" key={item.slugWithPrefix}>
                <h1>
                  <Link to={linkTo(item as any)} dangerouslySetInnerHTML={{ __html: replace(item.title) }} />
                </h1>
                {
                  item.content.map((val, key) => {
                    if (val.t) {
                      return (
                        <div key={key}>
                          <h3>
                            <Link to={linkTo(val)} dangerouslySetInnerHTML={{ __html: replace(val.t) }} />
                          </h3>
                          {
                            val.c.map((v, k) => {
                              return (
                                <div key={k} dangerouslySetInnerHTML={{ __html: replace(v) }} />
                              );
                            })
                          }
                        </div>
                      );
                    }
                    return (
                      <div key={key}>
                        {
                          val.c.map((v, k) => {
                            return (
                              <div key={k} dangerouslySetInnerHTML={{ __html: replace(v) }} />
                            );
                          })
                        }
                      </div>
                    );
                  })
                }
              </div>
            );
          })
        }
      </div>
    </div>
  );
};
const WrappedProvider: FC = (props) => {
  return (
    <Provider store={store}>
      <SearchPage {...props} />
    </Provider>
  );
};

export default WrappedProvider;
