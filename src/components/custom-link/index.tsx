import React, { FC, useContext, useMemo } from 'react';
import { Link } from 'gatsby';
import { resolve } from 'path';
import { QueryContext } from '@/context';
import { queryParse } from '@/helpers/utils';

const config = require('../../../config');

const regExp = new RegExp(`\\.(${config.i18n.langs.join('|')})\\.md`);

interface Props {
  href: string;
}
export const CustomLink: FC<Props> = (props) => {
  const { location } = useContext(QueryContext);
  const { href, children } = props;
  const realRef = resolve(location.pathname.replace(/[^/]+\/?$/, ''), href.replace(regExp, ''));
  if (regExp.test(href)) {
    return (
      <Link {...props} to={realRef} />
    );
  }
  return (
    <>{ children }</>
  );
};
export const SubCustomLink: FC<Props> = (props) => {
  const { href, children } = props;
  const { location } = useContext(QueryContext);
  const { slug, prefix } = queryParse(location.search);
  const realRef = useMemo(() => {
    const slugs = slug.split('/').filter((v) => v);
    const newSlug = resolve(slugs.map((v) => `/${v}`).join('').replace(/[^/]+\/?$/, ''), href.replace(regExp, ''));
    return `/render?slug=${newSlug}&prefix=${prefix}`;
  }, [slug, prefix]);
  if (regExp.test(href)) {
    return (
      <Link {...props} to={realRef} />
    );
  }
  return (
    <>{ children }</>
  );
};
