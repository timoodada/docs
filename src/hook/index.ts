import { formattedPrefix, queryParse } from '@/helpers/utils';

export const useMainSlug = (location: Partial<any>, withPrefix = false): string => {
  return withPrefix
    ? location.pathname.replace(/\/$/, '')
    : location.pathname.replace(new RegExp(`^${formattedPrefix}`), '').replace(/\/$/, '');
};
export const useCurrentSlug = (
  data: Partial<any>,
  location: Partial<any>,
  withPrefix = true,
): string => {
  const search = queryParse(location.search);
  let currentSlug = '/';
  if (data?.markdownRemark?.fields) {
    currentSlug = `${withPrefix ? data.markdownRemark.fields.prefix : ''}${data.markdownRemark.fields.slug}`;
  } else if (search?.prefix && search?.slug) {
    currentSlug = `${withPrefix ? search.prefix.replace(/\/$/, '') : ''}${search.slug}`;
  } else {
    currentSlug = useMainSlug(location, withPrefix);
  }
  return currentSlug;
};
