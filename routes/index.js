var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var arr={ title: '喜欢TA官网',nav:'首页，新闻，产品，联系' };
  res.render('index', arr);
});

module.exports = router;
