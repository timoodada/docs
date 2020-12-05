import * as JsSearch from 'js-search';

interface SearchData {
  t: string;
  r: Array<{ t: string; c: string[]; }>;
  s: string;
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
          k: `${v.s} ${index}`,
          parentTitle: v.t,
          slug: v.s,
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
    const ret = [];
    const result = this.dataToSearch.search(keyword);
    result.forEach((v) => {
      let item = ret.find((it) => it.id === v.id);
      if (!item) {
        item = {
          title: v.parentTitle,
          slug: v.slug,
          rawBody: [],
        };
        ret.push(item);
      }
      item.rawBody.push({
        title: v.t,
        content: v.c,
      });
    });
    return ret;
  }
}
