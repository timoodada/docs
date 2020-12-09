const { resolve } = require('path');

let prefix = process.env.NODE_ENV === 'production'
  ? (process.env.GATSBY_PATH_PREFIX || '/')
  : '/';

if (prefix.indexOf('/') !== 0) {
  prefix = `/${prefix}`;
}

module.exports = {
  isSubService: Number(process.env.GATSBY_IS_SUB_SERVICE) === 1,
  pathPrefix: prefix,
  markdownDir: `${__dirname}/content/`,
  siteMetadata: {
    title: 'EasyStack',
    description: 'EasyStack Guides',
  },
  i18n: {
    langs: ['en-US', 'zh-CN'],
    defaultLang: 'zh-CN',
  },
  search: {
    depth: 3,
  },
  publicDir: resolve(__dirname, './public'),
  dataMapDir: 'data-i18n',
  theme: {
    'primary-color': '#9382E3',
    'link-color': '#9382E3',
  },
};
