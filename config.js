const { resolve } = require('path');

let prefix = process.env.ES_PATH_PREFIX || '/';

if (prefix.indexOf('/') !== 0) {
  prefix = `/${prefix}`;
}

module.exports = {
  isSubService: process.env.ES_IS_SUB_SERVICE || false,
  pathPrefix: prefix,
  markdownDir: `${__dirname}/content/`,
  siteMetadata: {
    title: 'EasyStack',
    description: 'EasyStack Guides',
  },
  i18n: {
    langs: ['en-US', 'zh-CN'],
    titles: ['English', '简体中文'],
    defaultLang: 'zh-CN',
  },
  publicDir: resolve(__dirname, './public'),
  dataMapDir: 'data-i18n',
  theme: {
    'primary-color': '#9382E3',
    'link-color': '#9382E3',
  },
  development: {
    proxy: {
      prefix: '/esguide-dr',
      url: 'http://127.0.0.1',
    },
  },
};
