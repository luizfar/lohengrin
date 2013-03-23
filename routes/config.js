exports.index = function (req, res) {
  res.json(require('../lib/config/all').clientConfig);
};
