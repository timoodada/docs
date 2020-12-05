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
    const array = [];
    visit(node.htmlAst, ['element', 'text'], (value) => {
      if (!value) {
        return;
      }
      if (value.type === 'element' && value.tagName === 'a') {
        const regExp = new RegExp(`\\.(${config.i18n.langs.join('|')})\\.md`);
        if (
          value.properties
          && value.properties.href
          && regExp.test(value.properties.href)
        ) {
          value.tagName = 'custom-a';
        }
        return;
      }
      if (value.type === 'element' && !/^h\d$/.test(value.tagName)) {
        return;
      }
      let text = '';
      if (Array.isArray(value.children)) {
        const child = value.children.find((v) => v.type === 'text');
        if (child) {
          text = child.value;
        }
      }
      switch (value.type) {
        case 'element':
          array.push({
            l: value.tagName,
            t: text,
            c: [],
          });
          break;
        case 'text':
          if (array.length) {
            array[array.length - 1].c.push(value.value);
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
    array.forEach((v) => {
      v.c = v.c.join('').split(/\n/).filter((s) => s);
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
    const searchData = searchMap.filter((v) => v.lang === item || !v.lang).map((v) => ({
      t: v.title,
      s: v.slug,
      r: v.rawBody,
    }));
    const menuData = edges.filter(({ node }) => {
      return node.fields.lang === item || !node.fields.lang;
    }).map(({ node }) => ({
      title: node.fields.title,
      slug: node.fields.slug,
      type: node.fields.type,
      order: node.fields.order,
    }));
    const formattedMenu = buildMenuData(menuData);
    menu[item] = formattedMenu;
    outPutJsonTo(resolve(config.publicDir, getSearchMapPath('./', config.dataMapDir, item)), searchData);
    outPutJsonTo(resolve(config.publicDir, getMenuMapPath('./', config.dataMapDir, item)), formattedMenu);
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

    if (langAndUrl.length === 2) {
      value = `${langAndUrl[1]}/${langAndUrl[0]}`;
      createNodeField({
        name: 'lang',
        node,
        value: langAndUrl[1],
      });
    }

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
      value: `${config.pathPrefix.replace(/\/$/, '')}/${value}`,
    });
    createNodeField({
      name: 'id',
      node,
      value: node.id,
    });
    createNodeField({
      name: 'title',
      node,
      value: node.frontmatter.title || startCase(parent.name),
    });
    createNodeField({
      name: 'type',
      node,
      value: node.frontmatter.type || '',
    });
    createNodeField({
      name: 'order',
      node,
      value: node.frontmatter.order || -1,
    });
    createNodeField({
      name: 'description',
      node,
      value: node.frontmatter.description || config.siteMetadata.description,
    });
  }
};
