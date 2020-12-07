import React, { FC, useContext, useMemo } from 'react';
import { Link } from 'gatsby';
import { resolve } from 'path';
import { QueryContext } from '@/context';
import { queryParse } from '@/helpers/utils';

const config = require('../../../config');

const regExp = new RegExp(`\\.(${config.i18n.langs.join('|')})\\.md`);

const customLinkFormat = (fro: string, to: string): string => {
  return resolve(fro.replace(/[^/]+\/?$/, ''), to.replace(regExp, ''));
};

interface Props {
  href: string;
}
export const CustomLink: FC<Props> = (props) => {
  const { location } = useContext(QueryContext);
  const { href, children } = props;
  const realRef = customLinkFormat(location.pathname, href);
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
    return `/render?slug=${customLinkFormat(slug, href)}&prefix=${prefix}`;
  }, [slug, prefix, href]);
  if (regExp.test(href)) {
    return (
      <Link {...props} to={realRef} />
    );
  }
  return (
    <>{ children }</>
  );
};
