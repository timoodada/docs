import React, { FC, useContext, useEffect } from 'react';
import { get } from '@/helpers/http';
import { tap } from 'rxjs/operators';

import { Search } from '@/helpers/search';
import { QueryContext } from '@/context';

const { dataMapDir, pathPrefix } = require('../../../config');
const { getSearchMapPath } = require('../../../utils');

export const SearchBox: FC = () => {
  const { data } = useContext(QueryContext);

  useEffect(() => {
    const searchMap = getSearchMapPath(pathPrefix, dataMapDir, data.markdownRemark.fields.lang);
    get(searchMap).pipe(
      tap((res) => {
        console.log(res);
      }),
    ).subscribe();
  }, [data]);

  return (
    <div />
  );
};
