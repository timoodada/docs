import React, {
  FC, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { debounce } from '@/helpers/utils';
import './style.less';

import { QueryContext } from '@/context';
import { RemoteSearch } from '@/components/search/search.core';
import { getSubServices } from '@/helpers/sub-service';
import { finalize, tap } from 'rxjs/operators';
import { Popover, Empty } from 'antd';
import { Link } from 'gatsby';
import { searchInput } from '@/components/search/search.state';
import { language } from '@/store/main-states';
import { Loading } from '@/components/loading';

const i18n = {
  'zh-CN': {
    tip: '搜索帮助仅支持关键词搜索，若需多个关键词同时搜索，请以空格区分。',
    placeholder: '搜索...',
  },
  'en-US': {
    placeholder: 'Search...',
  },
};

interface SearchContentProps {
  results: any[];
  keyword: string;
  loading?: boolean;
}

const SearchContent: FC<SearchContentProps> = (props) => {
  const { results, keyword, loading = false } = props;

  const replace = useCallback((str: string): string => {
    const reg = new RegExp(`(${keyword.split(/\s+/g).join('|')}|${keyword})`, 'ig');
    return str.replace(reg, (c) => {
      return `<span class="active">${c}</span>`;
    });
  }, [keyword]);
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
  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);
  const buildContent = useMemo(() => {
    if (loading) {
      return (
        <div style={{ padding: 20 }}>
          <Loading size="large" />
        </div>
      );
    }
    if (results.length) {
      return results.map((item) => {
        return (
          <div className="search-result-row" key={item.slugWithPrefix}>
            <div
              className="search-result-label"
              title={item.title}
            >
              <Link to={linkTo(item)}>
                <span dangerouslySetInnerHTML={{ __html: replace(item.title) }} />
              </Link>
            </div>
            <div className="search-result-content">
              {
                item.content.map((content, key) => {
                  return (
                    <div className="search-result-sub-row" key={key}>
                      {
                        content.t
                          ? (
                            <>
                              <div
                                className="search-result-sub-label search-result-label"
                                title={content.t}
                              >
                                <Link to={linkTo(content)}>
                                  <span dangerouslySetInnerHTML={{ __html: replace(content.t) }} />
                                </Link>
                              </div>
                              <div className="search-result-sub-content search-result-content">
                                {
                                  content.c.map((v, k) => (
                                    <p
                                      className="search-result-sub-content-row"
                                      key={k}
                                      title={v}
                                      dangerouslySetInnerHTML={{ __html: replace(v) }}
                                    />
                                  ))
                                }
                              </div>
                            </>
                          )
                          : (
                            <div className="search-result-no-label">
                              {
                                content.c.map((v, k) => (
                                  <p
                                    className="search-result-sub-content-row"
                                    key={k}
                                    title={v}
                                    dangerouslySetInnerHTML={{ __html: replace(v) }}
                                  />
                                ))
                              }
                            </div>
                          )
                      }
                    </div>
                  );
                })
              }
            </div>
          </div>
        );
      });
    }
    return (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    );
  }, [loading, results]);

  return (
    <div
      className="search-content-popover"
      onClick={stopPropagation}
    >
      { buildContent }
    </div>
  );
};

export const SearchBox: FC = () => {
  const { location } = useContext(QueryContext);
  const lang = language.use();
  const remoteSearch = useRef<RemoteSearch>();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const keyword = searchInput.use();
  const inputRef = useRef<HTMLInputElement>();

  const onSearch = useCallback((keywords: string) => {
    if (!keywords) {
      setVisible(false);
      return;
    }
    setVisible(true);
    if (remoteSearch.current) {
      setLoading(true);
      remoteSearch.current.search(keywords).pipe(
        tap((res) => {
          setResults(res);
        }),
        finalize(() => setLoading(false)),
      ).subscribe();
    }
  }, []);
  const onChange = useCallback(debounce((e: React.ChangeEvent<HTMLElement>) => {
    const { value } = e.target as any;
    searchInput.set(value);
    onSearch(value);
  }, 500), [onSearch]);
  const onSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = e.currentTarget.getElementsByTagName('input')[0]?.value;
    onSearch(value);
  }, []);
  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
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
  useEffect(() => {
    const onDomClick = () => {
      setVisible(false);
    };
    document.body.addEventListener('click', onDomClick);
    return () => {
      document.body.removeEventListener('click', onDomClick);
    };
  }, []);
  useEffect(() => {
    setVisible(false);
  }, [location]);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = searchInput.getState();
    }
  }, []);

  return (
    <form
      className="search-box"
      onSubmit={onSubmit}
    >
      <SearchOutlined className="search-icon" />
      <Popover
        visible={visible}
        title={null}
        placement="bottom"
        content={(
          <SearchContent
            results={results}
            keyword={keyword}
            loading={loading}
          />
        )}
      >
        <input
          ref={inputRef}
          autoComplete="off"
          name="keywords"
          type="text"
          placeholder={i18n[lang]?.placeholder || ''}
          onClick={stopPropagation}
          onChange={onChange}
        />
      </Popover>
    </form>
  );
};
