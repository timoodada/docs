function compareLevel(node1, node2) {
  if (node1.slug === node2.slug) {
    return;
  }
  if (
    node1.slug.indexOf(node2.slug) === 0
    && (!node1.parent || (node1.parent && node2.slug.indexOf(node1.parent) === 0))
  ) {
    node1.parent = node2.slug;
  } else if (
    node2.slug.indexOf(node1.slug) === 0
    && (!node2.parent || (node2.parent && node1.slug.indexOf(node2.parent) === 0))
  ) {
    node2.parent = node1.slug;
  }
}

exports.getSearchMapPath = function getSearchMapPath(prefix, dataMapDir, lang) {
  return `${prefix.replace(/\/$/, '')}/${dataMapDir}/${lang}.json`;
};
exports.getMenuMapPath = function getMenuMapPath(prefix, dataMapDir, lang) {
  return `${prefix.replace(/\/$/, '')}/${dataMapDir}/menu.${lang}.json`;
};
exports.buildMenuData = function buildMenuData(data) {
  // data = data.filter((v) => v.type !== 'root');
  for (let i = 0; i < data.length; i += 1) {
    const item = data[i];
    for (let j = i; j < data.length; j += 1) {
      compareLevel(item, data[j]);
    }
  }
  return data;
};
