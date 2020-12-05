const config = require('./config');

exports.getLang = function getLang(path) {
  if (typeof path !== 'string') {
    return null;
  }
  const reg = new RegExp(`^(.+)\\.(${config.i18n.langs.join('|')})$`);
  const match = path.match(reg);
  if (match && match.length === 3) {
    return match.slice(1);
  }
  return null;
};
