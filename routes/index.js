var express = require('express');
var router = express.Router();
var cmds = require('../lib/commands');

/* GET home page. */
router.get('/', async function(req, res, next) {
  if (!!req.query.id) {
    let match = await cmds.getMatch(req.query.id);
    console.log('req.query.id: ', req.query.id);
    console.log(match);
    if (match === undefined) {
      let err = new ReferenceError('Wrong ID');
      res.render('error', { message: err.message , error: err});
      return;
    }
    if (match.id) {
      res.render('index', { match: match, team: [{ title: match.title1, logo: match.code1}, { title: match.title2, logo: match.code2}] });
    } else {
      let err = new ReferenceError('Wrong ID');
      res.render('error', { message: err.message , error: err});
    }
  } else {
    let err = new ReferenceError('Wrong ID');
    res.render('error', { message: err.message , error: err});
  }
});

module.exports = router;
