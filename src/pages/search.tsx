import React, {
  FC, useCallback, useEffect, useRef, useState,
} from 'react';
import '@/common/styles/search-page.less';
import { Provider } from 'react-redux';
import { store } from '@/store';
import 'antd/dist/antd.less';
import { RemoteSearch, SearchResults } from '@/components/search/search.core';
import { getSubServices } from '@/helpers/sub-service';
import { finalize, tap } from 'rxjs/operators';
import { language } from '@/store/main-states';
import {
  Breadcrumb,
  Input,
  Button,
  Tooltip,
} from 'antd';
import { Link } from 'gatsby';
import { LeftCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { queryParse } from '@/helpers/utils';

const { Search } = Input;

const i18n = {
  'zh-CN': {
    tip: '搜索帮助仅支持关键词搜索，若需多个关键词同时搜索，请以空格区分。',
    placeholder: '搜索...',
    production: '产品',
    search: '搜索',
    more: '查看更多',
  },
  'en-US': {
    tip: 'The search help only supports keyword search. If you need multiple keywords to search at the same time, please distinguish them with spaces.',
    placeholder: 'Search...',
    production: 'Production',
    search: 'Search',
    more: 'More',
  },
};

const SearchPage: FC<any> = (props) => {
  const { location } = props;
  const remoteSearch = useRef<RemoteSearch>();
  const pageInfo = useRef({
    page: 0,
    numPerPage: 10,
    keywords: '',
  });
  const [results, setResults] = useState<SearchResults[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [remoteSearchReady, setRemoteSearchReady] = useState(false);
  const lang = language.use();
  const { keywords } = queryParse(location.search);

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
  const onSearch = useCallback((keyword: string) => {
    if (!keyword) { return; }
    window.location.search = `?keywords=${keyword}`;
  }, []);
  const doSearch = useCallback(() => {
    if (!keywords || !remoteSearchReady) { return; }
    if (pageInfo.current.keywords !== keywords) {
      pageInfo.current.page = 0;
    }
    pageInfo.current.keywords = keywords;
    remoteSearch.current.search(keywords, pageInfo.current.page, pageInfo.current.numPerPage).pipe(
      tap((res) => {
        if (pageInfo.current.page === 0) {
          setResults(res);
        } else {
          setResults((prevState) => prevState.concat(res));
        }
      }),
      finalize(() => {
        setShowMore(!remoteSearch.current.isEnd);
      }),
    ).subscribe();
  }, [keywords, remoteSearchReady]);
  const next = useCallback(() => {
    pageInfo.current.page += 1;
    doSearch();
  }, [doSearch]);

  useEffect(() => {
    language.init();
  }, []);
  useEffect(() => {
    if (!lang) { return; }
    const subscription = getSubServices().pipe(
      tap((res) => {
        remoteSearch.current = new RemoteSearch(res, lang);
        setRemoteSearchReady(true);
      }),
    ).subscribe();
    return () => subscription.unsubscribe();
  }, [lang]);
  useEffect(() => {
    doSearch();
  }, [doSearch]);

  return (
    <div className="search-page">
      <div className="search-box">
        <Search
          placeholder={i18n[lang]?.placeholder || ''}
          onSearch={onSearch}
          className="search-input"
          defaultValue={keywords}
        />
        <Tooltip placement="left" title={i18n[lang]?.tip}>
          <QuestionCircleOutlined className="question-icon" />
        </Tooltip>
      </div>
      <div className="breadcrumb">
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a onClick={() => window.history.go(-1)}>
          <LeftCircleOutlined className="back-icon" />
        </a>
        <Breadcrumb>
          <Breadcrumb.Item>
            <a href="/">{ i18n[lang]?.production }</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{ i18n[lang]?.search }</Breadcrumb.Item>
        </Breadcrumb>
      </div>
      <div className="search-results-wrapper">
        {
          results.map((item, index) => {
            return (
              <div className="search-result-row" key={index}>
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
      {
        showMore ? (
          <div className="more">
            <Button type="link" onClick={next}>{ i18n[lang]?.more }</Button>
          </div>
        ) :
          null
      }
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
