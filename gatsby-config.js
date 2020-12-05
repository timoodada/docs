const config = require('./config');
// Since `gatsby-plugin-typescript` is automatically included in Gatsby you
// don't need to define it here (just if you need to change the options)
const plugins = [
  'gatsby-plugin-sharp',
  {
    resolve: 'gatsby-plugin-layout',
    options: {
      component: require.resolve('./src/templates/docs.tsx'),
    },
  },
  'gatsby-plugin-react-helmet',
  {
    resolve: 'gatsby-source-filesystem',
    options: {
      name: 'docs',
      path: `${__dirname}/content/`,
    },
  },
  {
    resolve: 'gatsby-plugin-less',
    options: {
      lessOptions: {
        javascriptEnabled: true,
        modifyVars: {
          'primary-color': '#1DA57A',
          'link-color': '#1DA57A',
        },
      },
    },
  },
  {
    resolve: 'gatsby-plugin-mdx',
    options: {
      gatsbyRemarkPlugins: [
        {
          resolve: 'gatsby-remark-images',
          options: {
            maxWidth: 1200,
          },
        },
        {
          resolve: 'gatsby-remark-copy-linked-files',
        },
      ],
      extensions: ['.mdx', '.md'],
    },
  }];
module.exports = {
  pathPrefix: config.pathPrefix,
  siteMetadata: {
    ...config.siteMetadata,
    i18n: {
      ...config.i18n,
    },
    dataMapDir: config.dataMapDir,
  },
  plugins,
  proxy: {
    prefix: '/api',
    url: 'https://127.0.0.1',
  },
};
