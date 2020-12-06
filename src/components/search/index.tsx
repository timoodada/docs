import React, { FC, useContext, useEffect } from 'react';
import { get } from '@/helpers/http';

import { QueryContext } from '@/context';

const { dataMapDir, pathPrefix } = require('../../../config');
const { getSearchMapPath } = require('../../../utils');

export const SearchBox: FC = () => {
  const { data } = useContext(QueryContext);

  useEffect(() => {
    if (!data) {
      return;
    }
    const searchMap = getSearchMapPath(pathPrefix, dataMapDir, data.markdownRemark.fields.lang);
    get(searchMap).subscribe();
  }, [data]);

  return (
    <div />
  );
};
