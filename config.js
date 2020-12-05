const { resolve } = require('path');

module.exports = {
  isSubService: false,
  pathPrefix: process.env.PATH_PREFIX || '/',
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
};
