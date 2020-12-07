import * as JsSearch from 'js-search';
import { formattedPrefix } from '@/helpers/utils';
import { get } from '@/helpers/http';
import { Observable, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';

const { getSearchMapPath } = require('../../utils');
const { dataMapDir } = require('../../config');

interface SearchData {
  t: string;
  r: Array<{ t: string; c: string[]; }>;
  s: string;
  prefix: string;
  isSubService: boolean;
  slugWithPrefix: string;
}
interface FormattedData {
  parentTitle: string;
  slug: string;
  t: string;
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
    this.dataToSearch.indexStrategy = new JsSearch.PrefixIndexStrategy();
    /**
     * defines the sanitizer for the search
     * to prevent some of the words from being excluded
     *
     */
    this.dataToSearch.sanitizer = new JsSearch.LowerCaseSanitizer();
    // sets the index attribute for the data
    this.dataToSearch.addIndex(['t']);
    this.dataToSearch.addIndex(['c']);
    // adds the data to be searched
    this.dataToSearch.addDocuments(this.formattedData);
  }

  search(keyword: string): any[] {
    return this.dataToSearch.search(keyword);
  }
}

export class RemoteSearch {
  searchList: Search[] = [];

  currentIndex = 0;

  mainSearchUrl: string;

  subSearchUrl: string[];

  subServices: string[];

  numPerPage: number;

  results = [];

  private static format(results: any[], keyword: string) {
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

  constructor(subServices: string[], lang: string, numPerPage = 8) {
    this.subServices = subServices;
    this.mainSearchUrl = getSearchMapPath(formattedPrefix, dataMapDir, lang);
    this.subSearchUrl = subServices.map((v) => {
      return getSearchMapPath(v, dataMapDir, lang);
    });
    this.numPerPage = numPerPage;
  }

  search(keyword: string): Observable<any[]> {
    this.results = [];
    this.currentIndex = 0;
    return this.doSearch(keyword);
  }

  doSearch(keyword: string, skip = 0): Observable<any[]> {
    for (; this.currentIndex < this.searchList.length; this.currentIndex += 1) {
      const result = this.searchList[this.currentIndex].search(keyword);
      this.results.push(...result);
    }
    const results = this.results.slice(skip, skip + this.numPerPage);
    if (results.length >= this.numPerPage) {
      return of(RemoteSearch.format(results, keyword));
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
      return of(RemoteSearch.format(results, keyword));
    }
    return get(searchUrl).pipe(
      concatMap((res) => {
        res.forEach((v) => {
          v.slugWithPrefix = `${prefix}${v.s}`;
          v.prefix = prefix;
          v.isSubService = isSubService;
        });
        this.searchList.push(new Search(res));
        return this.doSearch(keyword, skip);
      }),
    );
  }
}
