import * as JsSearch from 'js-search';
import { formattedPrefix } from '@/helpers/utils';
import { get } from '@/helpers/http';
import { Observable, of } from 'rxjs';
import { catchError, concatMap } from 'rxjs/operators';

const { getSearchMapPath } = require('../../../utils');
const { dataMapDir } = require('../../../config');

interface SearchData {
  t: string;
  r: Array<{ t: string; c: string[]; }>;
  s: string;
  prefix: string;
  isSubService: boolean;
  slugWithPrefix: string;
}
interface FormattedData extends SearchData {
  parentTitle: string;
  slug: string;
  k: string;
  c: string[];
}

export class Search {
  private dataToSearch: JsSearch.Search;

  private readonly formattedData: FormattedData[];

  static formatData(data: SearchData[]): FormattedData[] {
    const ret = [];
    data.forEach((v) => {
      ret.push(...v.r.map((item, index) => {
        return {
          ...item,
          k: `${v.slugWithPrefix} ${index}`,
          parentTitle: v.t,
          slug: v.s,
          slugWithPrefix: v.slugWithPrefix,
          prefix: v.prefix,
          isSubService: v.isSubService,
        };
      }));
    });
    return ret;
  }

  constructor(data: SearchData[]) {
    this.formattedData = Search.formatData(data);
    this.dataToSearch = new JsSearch.Search('k');
    // this index strategy is built for all substrings matches.
    this.dataToSearch.indexStrategy = new JsSearch.AllSubstringsIndexStrategy();
    /**
     * defines the sanitizer for the search
     * to prevent some of the words from being excluded
     *
     */
    this.dataToSearch.sanitizer = new JsSearch.LowerCaseSanitizer();
    this.dataToSearch.tokenizer = {
      tokenize(text: string) {
        return text.split(/[^a-zа-яё0-9\-'\u4e00-\u9fa5]+/ig)
          .filter((v) => v);
      },
    };
    /**
     * defines the search index
     * read more in here https://github.com/bvaughn/js-search#configuring-the-search-index
     */
    this.dataToSearch.searchIndex = new JsSearch.TfIdfSearchIndex('k');
    // sets the index attribute for the data
    this.dataToSearch.addIndex(['t']);
    this.dataToSearch.addIndex(['c']);
    // adds the data to be searched
    this.dataToSearch.addDocuments(this.formattedData);
  }

  search(keyword: string): FormattedData[] {
    return this.dataToSearch.search(keyword);
  }
}

interface SearchResults {
  title: string;
  slugWithPrefix: string;
  slug: string;
  prefix: string;
  isSubService: string;
  content: FormattedData[];
}
export class RemoteSearch {
  searchList: Search[] = [];

  currentIndex = -1;

  mainSearchUrl: string;

  subSearchUrl: string[];

  subServices: string[];

  numPerPage: number;

  results: FormattedData[] = [];

  keyword = '';

  private static format(results: FormattedData[], keyword: string): SearchResults[] {
    const ret = [];
    results.forEach((v) => {
      const value = { ...v };
      const index = ret.find((item) => item.slugWithPrefix === v.slugWithPrefix);
      value.c = value.c
        .filter((kw) => new RegExp(`(${keyword.split(/\s+/g).join('|')}|${keyword})`, 'i').test(kw))
        .slice(0, 5);
      if (index) {
        index.content.push(value);
      } else {
        ret.push({
          title: v.parentTitle,
          slugWithPrefix: v.slugWithPrefix,
          slug: v.slug,
          prefix: v.prefix,
          isSubService: v.isSubService,
          content: [value],
        });
      }
    });
    return ret;
  }

  private doSearch(skip = 0): Observable<SearchResults[]> {
    while (this.currentIndex < this.searchList.length - 1) {
      this.currentIndex += 1;
      const result = this.searchList[this.currentIndex].search(this.keyword);
      this.results.push(...result);
      const results = this.results.slice(skip, skip + this.numPerPage);
      if (results.length >= this.numPerPage) {
        return of(RemoteSearch.format(results, this.keyword));
      }
    }
    const results = this.results.slice(skip, skip + this.numPerPage);
    if (results.length >= this.numPerPage) {
      return of(RemoteSearch.format(results, this.keyword));
    }
    let searchUrl: string;
    let prefix: string;
    const isSubService = this.searchList.length >= 1;
    if (this.searchList.length < 1) {
      searchUrl = this.mainSearchUrl;
      prefix = formattedPrefix;
    } else {
      searchUrl = this.subSearchUrl[this.searchList.length - 1];
      prefix = this.subServices[this.searchList.length - 1];
    }
    if (!searchUrl) {
      return of(RemoteSearch.format(results, this.keyword));
    }
    return get(searchUrl).pipe(
      concatMap((res) => {
        res.forEach((v) => {
          v.slugWithPrefix = `${prefix}${v.s}`;
          v.prefix = prefix;
          v.isSubService = isSubService;
        });
        this.searchList.push(new Search(res));
        return this.doSearch(skip);
      }),
      catchError((err) => {
        // eslint-disable-next-line no-console
        console.error(err);
        return of([]);
      }),
    );
  }

  constructor(subServices: string[], lang: string) {
    this.subServices = subServices;
    this.mainSearchUrl = getSearchMapPath(formattedPrefix, dataMapDir, lang);
    this.subSearchUrl = subServices.map((v) => {
      return getSearchMapPath(v, dataMapDir, lang);
    });
  }

  search(keyword: string, page = 0, numPerPage = 8): Observable<SearchResults[]> {
    if (keyword !== this.keyword) {
      this.results = [];
      this.currentIndex = -1;
    }
    this.keyword = keyword;
    this.numPerPage = numPerPage;
    const ret = this.results.slice(numPerPage * page, numPerPage + numPerPage * page);
    if (ret.length >= numPerPage) {
      return of(RemoteSearch.format(ret, this.keyword));
    }
    return this.doSearch(numPerPage * page);
  }
}
