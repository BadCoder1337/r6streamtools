const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const cmds = require('../lib/commands');
const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs'));

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

async function getUser(token) {
  if (!token) {throw new Error('InvalidToken')}
        
    let response = await fetch(`https://discordapp.com/api/users/@me`, {method: 'GET', headers: {Authorization: `Bearer ${token}`}});
    let user = await response.json();

    if (user.code === 0) {throw new Error('InvalidToken')}

    return user;
}

router.get('/api/auth', async (req, res) => {
  try {
    if (!req.query.code) {res.status(400)};
    let code = req.query.code;
    let url = `https://discordapp.com/api/v6/oauth2/token?client_id=${process.env.DISCORD_ID}&client_secret=${process.env.DISCORD_SECRET}&grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(process.env.CALLBACK_URI)}`;
    console.log(url);
    let response = await fetch(url, {method: 'POST'});
    let json = await response.json();
    console.log(json);
    res.send(json.access_token);
  } catch(err) {
    res.send(500);
    console.log(err.message);
    console.log(err.stack);
  }
});

router.get('/api', async (req, res) => {
  try {
    res.send(await cmds.getMatch(req.query.id))
  } catch (err) {
    res.send({code: 404, error: err.message}); 
  }
})

router.get('/api/names', async (req, res) => {
  try {
    res.send(require('../public/images/teams'));
  } catch (err) {
    console.log(err);
    res.sendStatus(500); 
  }
})

router.get('/api/list', async (req, res) => {
  try {
    let a = await fs.readdirAsync(__dirname+'/../public/images/teams');
    for (let i = 0; i < a.length; i++) {
      a[i] = a[i].slice(0, -4);
    }
    res.send(a);
  } catch (err) {
    console.log(err);
    res.sendStatus(500); 
  }
})

router.post('/api', async (req, res) => {
  try {
    const user = await getUser(req.headers['authorization']);
    let answ = await cmds.matchCreate(req.body.type, req.body.banOps, user.id);
    if (answ == 'неверный тип матча!') {
      res.sendStatus(404);
    } else {
      res.send({id: answ.slice(-4)});
    }
  } catch (err) {
    res.sendStatus(403); 
  }
});

router.patch('/api', async (req, res) => {
  try {
    const user = await getUser(req.headers['authorization']);
    let { id, ...other } = req.body;
    for (const key in other) {
      console.log(await cmds.matchEdit(id, key, other[key], user.id));
    }
    res.sendStatus(200); 
  } catch (err) {
    res.sendStatus(403); 
  }
})

router.delete('/api', async (req, res) => {
  try {
    const user = await getUser(req.headers['authorization']);
    if (req.body.id) {
      let answ = cmds.matchDelete(req.body.id, user.id);
      if (answ == 'матч не найден!') {
        res.sendStatus(404); 
      } else {
        res.sendStatus(200); 
      }
    } else {
      res.sendStatus(400); 
    }
  } catch (err) {
    res.sendStatus(403)
  }
});

router.options('/api', async (req, res) => {
  try {
    // console.log(req.headers);
    const user = await getUser(req.headers['authorization']);
    if (req.query.id) {
      cmds.matchStart(req.query.id, user.id, req.query.channel);
      res.sendStatus(200)
    } else {
      res.sendStatus(400); 
    }
  } catch (err) {
    // console.log(err);
    res.sendStatus(403)
  }
})

/* GET home page. */
router.get('/', async (req, res) => {
  if (await validateId(req.query.id)) {
    let match = await cmds.getMatch(req.query.id);
    res.render('index', { match: match, team: [{ title: match.title1, logo: match.code1}, { title: match.title2, logo: match.code2}] });
  } else {
    let err = new ReferenceError('Wrong ID');
    res.render('error', { message: err.message , error: err});
  }
});

router.get('/ops', async (req, res) => {
  if (await validateId(req.query.id)) {
    let match = await cmds.getMatch(req.query.id);
    res.render('banops', { match: match, team: [{ title: match.title1, logo: match.code1}, { title: match.title2, logo: match.code2}] });
  } else {
    let err = new ReferenceError('Wrong ID');
    res.render('error', { message: err.message , error: err});
  }
})

module.exports = router;
