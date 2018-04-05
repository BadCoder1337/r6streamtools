var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { team: [{ title: "BOMJ", logo: "BMJ"}, { title: "CatPawz", logo: "CPZ"}] });
});

module.exports = router;
