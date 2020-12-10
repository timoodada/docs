const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const startCase = require('lodash.startcase');
const { resolve } = require('path');
const visit = require('unist-util-visit');
const fse = require('fs-extra');
const { getLang } = require('./i18n');
const config = require('./config');
const { getSearchMapPath, getMenuMapPath, buildMenuData } = require('./utils');

function outPutJsonTo(path, data) {
  // eslint-disable-next-line consistent-return
  fse.outputJson(path, data, (err) => {
    if (err) {
      return console.error(err); // eslint-disable-line no-console
    }
    console.log(`${path} Completed`); // eslint-disable-line no-console
  });
}

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      plugins: [new TsconfigPathsPlugin()],
    },
  });
};
exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;
  const result = await graphql(
    `
      {
        allMarkdownRemark {
          edges {
            node {
              fields {
                id
                slug
                filePath
                title
                lang
                type
                order
              }
              htmlAst
            }
          }
        }
      }
    `,
  );
  if (result.errors) {
    console.error(result.errors); // eslint-disable-line no-console
    await Promise.reject(result.errors);
  }

  const { edges } = result.data.allMarkdownRemark;
  const searchMap = edges.map(({ node }) => {
    let array = [];
    visit(node.htmlAst, ['element', 'text'], (value) => {
      if (!value) { return; }
      if (value.type === 'element' && value.tagName === 'a') {
        const regExp = new RegExp(`\\.(${config.i18n.langs.join('|')})\\.md`);
        if (
          value.properties
          && value.properties.href
          && regExp.test(value.properties.href)
          && !/^https?:\/\//.test(value.properties.href)
        ) {
          value.tagName = 'custom-a';
        }
        return;
      }
      if (value.type === 'element' && !/^h\d$/.test(value.tagName)) {
        return;
      }
      let textVal = '';
      switch (value.type) {
        case 'element':
          array.push({
            l: value.tagName,
            t: null,
            a: value.properties && value.properties.id,
            c: [],
          });
          break;
        case 'text':
          textVal = value.value && value.value.trim();
          if (!textVal) { break; }
          if (array.length) {
            const targetIndex = array.length - 1;
            if (array[targetIndex].t) {
              array[targetIndex].c.push(textVal);
            } else {
              array[targetIndex].t = textVal;
            }
          } else {
            array.push({
              t: '',
              c: [value.value],
            });
          }
          break;
        default:
      }
    });
    array = array.filter((v) => {
      const level = v.l;
      delete v.l;
      if (level && /^h(\d+)$/.test(level)) {
        return Number(RegExp.$1) <= config.search.depth;
      }
      return true;
    });
    array.forEach((v) => {
      v.c = v.c.join('').split(/\n/).map((s) => s.trim()).filter((s) => s);
    });
    return {
      id: node.fields.id,
      title: node.fields.title,
      slug: node.fields.slug,
      lang: node.fields.lang,
      rawBody: array,
    };
  });
  const menu = {};
  config.i18n.langs.forEach((item) => {
    const searchData = searchMap.filter((v) => v.lang === item).map((v) => ({
      t: v.title,
      s: v.slug,
      r: v.rawBody,
    }));
    const menuData = edges.filter(({ node }) => {
      return node.fields.lang === item;
    }).map(({ node }) => ({
      title: node.fields.title,
      slug: node.fields.slug,
      type: node.fields.type,
      order: node.fields.order,
    }));
    const formattedMenu = buildMenuData(menuData);
    menu[item] = formattedMenu;
    outPutJsonTo(resolve(process.cwd(), config.publicDir, getSearchMapPath('./', config.dataMapDir, item)), searchData);
    outPutJsonTo(resolve(process.cwd(), config.publicDir, getMenuMapPath('./', config.dataMapDir, item)), formattedMenu);
  });

  // Create blog posts pages.
  await Promise.all(edges.map(({ node }) => createPage({
    path: node.fields.filePath || '/',
    component: resolve(__dirname, './src/templates/docs.tsx'),
    context: {
      id: node.fields.id,
      lang: node.fields.lang,
      menu: menu[node.fields.lang],
      htmlAst: node.htmlAst,
    },
  })));
};
exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions;

  if (node.internal.type === 'MarkdownRemark') {
    const parent = getNode(node.parent);

    let value = parent.relativePath.replace(parent.ext, '');

    const langAndUrl = getLang(value);

    if (langAndUrl && langAndUrl.length === 2) {
      value = `${langAndUrl[1]}/${langAndUrl[0]}`;
    }
    createNodeField({
      name: 'lang',
      node,
      value: (langAndUrl && langAndUrl[1]) || config.i18n.defaultLang,
    });

    value = value.replace(/\/index$/, '');
    if (value === config.i18n.defaultLang) {
      value = '';
    }
    createNodeField({
      name: 'filePath',
      node,
      value: `/${value}`,
    });
    createNodeField({
      name: 'slug',
      node,
      value: `/${value}`,
    });
    createNodeField({
      name: 'prefix',
      node,
      value: config.pathPrefix.replace(/\/$/, ''),
    });
    createNodeField({
      name: 'id',
      node,
      value: node.id,
    });
    createNodeField({
      name: 'title',
      node,
      value: node.frontmatter.title || startCase(parent.name) || '',
    });
    createNodeField({
      name: 'type',
      node,
      value: node.frontmatter.type || '',
    });
    createNodeField({
      name: 'order',
      node,
      value: Number(node.frontmatter.order) || -1,
    });
    createNodeField({
      name: 'description',
      node,
      value: node.frontmatter.description || config.siteMetadata.description,
    });
  }
};
