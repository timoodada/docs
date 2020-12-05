import React, { FC, useContext } from 'react';
import { Link } from 'gatsby';
import { resolve } from 'path';
import { QueryContext } from '@/context';

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
