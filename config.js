const { resolve } = require('path');

module.exports = {
  isSubService: false,
  pathPrefix: '/',
  siteMetadata: {
    title: 'EasyStack',
    description: 'EasyStack Guides',
  },
  i18n: {
    langs: ['en-US', 'zh-CN'],
    defaultLang: 'zh-CN',
  },
  publicDir: resolve(__dirname, './public'),
  dataMapDir: 'data-i18n',
};
