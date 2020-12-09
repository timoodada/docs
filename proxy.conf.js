const url = 'http://127.0.0.1:5555';

module.exports = {
  proxy: [{
    prefix: '/edrs',
    url,
  }],
};
