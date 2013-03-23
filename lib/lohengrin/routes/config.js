exports.index = function (req, res) {
  res.json(require('../config/all').clientConfig);
};
