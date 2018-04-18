var express = require('express');
var router = express.Router();
var cmds = require('../lib/commands');

async function validateId(id) {
  if (!id) {
    return;
  }
  let match = await cmds.getMatch(id);
  if (match === undefined) {
    return;
  }
  if (!match.id) {
    return;
  }
  return true;
}

/* GET home page. */
router.get('/', async function(req, res, next) {
  if (await validateId(req.query.id)) {
    let match = await cmds.getMatch(req.query.id);
    res.render('index', { match: match, team: [{ title: match.title1, logo: match.code1}, { title: match.title2, logo: match.code2}] });
  } else {
    let err = new ReferenceError('Wrong ID');
    res.render('error', { message: err.message , error: err});
  }
});

router.get('/ops', async function(req, res, next) {
  if (await validateId(req.query.id)) {
    let match = await cmds.getMatch(req.query.id);
    res.render('banops', { match: match, team: [{ title: match.title1, logo: match.code1}, { title: match.title2, logo: match.code2}] });
  } else {
    let err = new ReferenceError('Wrong ID');
    res.render('error', { message: err.message , error: err});
  }
})

module.exports = router;
