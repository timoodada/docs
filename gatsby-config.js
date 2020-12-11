const { resolve } = require('path');
const config = require('./config');
const proxyConf = require('./proxy.conf');
// Since `gatsby-plugin-typescript` is automatically included in Gatsby you
// don't need to define it here (just if you need to change the options)
const plugins = [
  'gatsby-plugin-sharp-es',
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
      path: resolve(process.cwd(), config.markdownDir),
    },
  },
  {
    resolve: 'gatsby-plugin-less',
    options: {
      lessOptions: {
        javascriptEnabled: true,
        modifyVars: config.theme,
      },
    },
  }, {
    resolve: 'gatsby-transformer-remark',
    options: {
      // CommonMark mode (default: true)
      commonmark: true,
      // Footnotes mode (default: true)
      footnotes: true,
      // Pedantic mode (default: true)
      pedantic: true,
      // GitHub Flavored Markdown mode (default: true)
      gfm: true,
      // Plugins configs
      plugins: [
        {
          resolve: 'gatsby-remark-images-es',
          options: {
            maxWidth: 1200,
          },
        },
        {
          resolve: 'gatsby-remark-copy-linked-files',
          options: {
            ignoreFileExtensions: ['md'],
          },
        },
        {
          resolve: 'gatsby-remark-autolink-headers',
          options: {
            offsetY: '100',
            icon: '<svg aria-hidden="true" height="20" version="1.1" viewBox="0 0 16 16" width="20"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>',
            className: 'autolink-title',
            maintainCase: true,
            removeAccents: true,
            isIconAfterHeader: true,
            elements: ['h1', 'h2', 'h3'],
          },
        },
        {
          resolve: 'gatsby-remark-prismjs',
          options: {
            // Class prefix for <pre> tags containing syntax highlighting;
            // defaults to 'language-' (e.g. <pre class="language-js">).
            // If your site loads Prism into the browser at runtime,
            // (e.g. for use with libraries like react-live),
            // you may use this to prevent Prism from re-processing syntax.
            // This is an uncommon use-case though;
            // If you're unsure, it's best to use the default value.
            classPrefix: 'language-',
            // This is used to allow setting a language for inline code
            // (i.e. single backticks) by creating a separator.
            // This separator is a string and will do no white-space
            // stripping.
            // A suggested value for English speakers is the non-ascii
            // character '›'.
            inlineCodeMarker: null,
            // This lets you set up language aliases.  For example,
            // setting this to '{ sh: "bash" }' will let you use
            // the language "sh" which will highlight using the
            // bash highlighter.
            aliases: {},
            // This toggles the display of line numbers globally alongside the code.
            // To use it, add the following line in gatsby-browser.js
            // right after importing the prism color scheme:
            //  require("prismjs/plugins/line-numbers/prism-line-numbers.css")
            // Defaults to false.
            // If you wish to only show line numbers on certain code blocks,
            // leave false and use the {numberLines: true} syntax below
            showLineNumbers: false,
            // If setting this to true, the parser won't handle and highlight inline
            // code used in markdown i.e. single backtick code like `this`.
            noInlineHighlight: false,
            // This adds a new language definition to Prism or extend an already
            // existing language definition. More details on this option can be
            // found under the header "Add new language definition or extend an
            // existing language" below.
            languageExtensions: [
              {
                language: 'superscript',
                extend: 'javascript',
                definition: {
                  superscript_types: /(SuperType)/,
                },
                insertBefore: {
                  function: {
                    superscript_keywords: /(superif|superelse)/,
                  },
                },
              },
            ],
            // Customize the prompt used in shell output
            // Values below are default
            prompt: {
              user: 'root',
              host: 'localhost',
              global: false,
            },
            // By default the HTML entities <>&'" are escaped.
            // Add additional HTML escapes by providing a mapping
            // of HTML entities and their escape value IE: { '}': '&#123;' }
            escapeEntities: {},
          },
        },
      ],
    },
  }];
module.exports = {
  pathPrefix: process.env.NODE_ENV === 'production' ? config.pathPrefix : '/',
  siteMetadata: {
    ...config.siteMetadata,
    i18n: {
      ...config.i18n,
    },
    dataMapDir: config.dataMapDir,
  },
  plugins,
  proxy: proxyConf.proxy,
};
