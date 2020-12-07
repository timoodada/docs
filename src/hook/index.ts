import { queryParse } from '@/helpers/utils';

export const useLang = (
  data: Partial<any>,
  defaultLang?: string,
): string => {
  let lang = defaultLang || '';
  if (data?.markdownRemark?.fields?.lang) {
    lang = data.markdownRemark.fields.lang;
  }
  return lang;
};

export const useCurrentSlug = (data: Partial<any>, location: Partial<any>): string => {
  const search = queryParse(location.search);
  let currentSlug = '/';
  if (data?.markdownRemark?.fields) {
    currentSlug = `${data.markdownRemark.fields.prefix}${data.markdownRemark.fields.slug}`;
  } else if (search?.prefix && search?.slug) {
    currentSlug = `${search.prefix.replace(/\/$/, '')}${search.slug}`;
  }
  return currentSlug;
};
