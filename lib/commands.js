var bluebird = require('bluebird');
var fs = bluebird.promisifyAll(require('fs'));

var matchList = [];

//тестовый матч для быстрого теста

matchList.push({
    id: "abcd",
    creatorID: "125634283258773504",
    matchType: "bo3",
    banOps: false,
    ready: true,
    code2: "AUP",
    title2: "UPelsin",
    captain2: "125634283258773504",
    code1: "ADL",
    title1: "Aquila de Legio",
    captain1: "216640141572177921"
  })

function getItem(id) {
    return item = matchList.find((e, i, a) => {
        return e.id == id;
    });
}

function getIndex(id) {
    return matchList.indexOf(getItem(id));
}

Object.prototype.renameProperty = function (oldName, newName) {
    if (oldName == newName) {
        return this;
    }
   if (this.hasOwnProperty(oldName)) {
       this[newName] = this[oldName];
       delete this[oldName];
   }
   return this;
};

module.exports.reportError = async function (err, bot, msg) {
    try {
        let dm = bot.users.find('id', process.env.SUPPORT_ID);
        let code = Math.random().toString(36).substring(2, 6);
        if (msg) {
            msg.reply('произошла ошибка! Код: `'+code+'` (данные для поддержки)');
            dm.send(`[${msg.guild.name}, <#${msg.channel.id}>, <@${msg.author.id}>] ${msg.content}\n\`${code}\`: \`${err.name}\` \`\`\`JavaScript\n${err.stack}\`\`\` `)
        } else {
            dm.send(` \`${code}\`: \`${err.name}\` \`\`\`JavaScript\n${err.stack}\`\`\` `);
        }
    } catch (err) {
        console.log('-----UNSEND ERROR-----')
        console.log(err);
    }    
}

module.exports.help = async function (file) {
    try {
        let answ = await fs.readFileAsync('./lib/text/'+file, 'utf8');
        return answ;
    } catch(err) {
        throw err;
    }
}

module.exports.matchCreate = async function (type, banOps, creatorID) {
    if (['bo1', 'bo3', 'bo5'].includes(type)) {
        if (banOps == 'yes') {
            banOps = true;
        } else {
            banOps = false;
        }
		var match = {
            id: Math.random().toString(36).substring(2, 6),
            creatorID: creatorID,
            code1: 'XXX',
            title1: 'Team 1',
            code2: 'XXX',
            title2: 'Team 2',
            matchType: type,
            banOps: banOps,
            ready: false
        }
        matchList.push(match);
        return `матч создан! ID: \`${match.id}\`. Оверлей: https://r6streamtools.herokuapp.com/?id=${match.id}`;
    } else {
        return `неверный тип матча!`;
    }
}

module.exports.fillTeams = async function (id, code, title, captain, n, userID, ee) {
    //console.log('id, code, title, captain, n: ', id, code, title, captain, n);

    if (id && code && title && captain) {
        var item = getItem(id);
        if (item !== undefined) {
            if (item.creatorID != userID & userID != process.env.SUPPORT_ID) {return 'только создатель матча может его модерировать'}
            var noCode = "";
            let exist = await fs.existsSync(`./public/images/teams/${code}.png`);
            console.log('exist: ', exist);

            if (exist) {
                item['code'+n] = code;
            } else {
                noCode = `\n*Команда с кодом \`${code}\` не найдена, лого будет по умолчанию.*`;
            }
            item['title'+n] = title;
            item['captain'+n] = captain;
            if (item.captain1 && item.captain2) {
                item.ready = true;
                ee.emit('reload', { id: id });
                return `обе команды заполнены. \`${process.env.PREFIX}match start ${id}\` чтобы начать!`+noCode;
            }
            ee.emit('reload', { id: id });
            return `команда ${n} настроена!`+noCode; 
        } else {
            return 'матч не найден!';
        }
    } else {
        return 'неверные аргументы!';
    }
    //var index = getIndex(id);
    
}

module.exports.matchSwap = async function (id, userID, ee) {
    if (!id) {return 'ID не указан!'}
    var item = getItem(id);
    if (item !== undefined) {
        if (item.creatorID != userID & userID != process.env.SUPPORT_ID) {return 'только создатель матча может его модерировать'}
        item.renameProperty('code1', 'code');
        item.renameProperty('code2', 'code1');
        item.renameProperty('code', 'code2');

        item.renameProperty('title1', 'title');
        item.renameProperty('title2', 'title1');            //КОЛХОЗ
        item.renameProperty('title', 'title2');
        
        item.renameProperty('captain1', 'captain');
        item.renameProperty('captain2', 'captain1');
        item.renameProperty('captain', 'captain2');

        ee.emit('reload', { id: id });

        return `команды переставлены! *Первой голосует всегда первая команда.*`;
    } else {
        return `матч не найден!`;
    }
}

module.exports.matchDelete = async function (id, userID) {
    if (!id) {return 'ID не указан!'}
    var item = getItem(id);
    if (item !== undefined) {
        if (item.creatorID != userID & userID != process.env.SUPPORT_ID) {return 'только создатель матча может его модерировать'}
        matchList.splice(matchList.indexOf(item), 1);
        return `матч успешно удален!`;
    } else {
        return `матч не найден!`;
    }
}

module.exports.matchInfo = async function (id) {
    if (!id) {return 'ID не указан!'}
    var item = getItem(id);
    if (item !== undefined) {
        return '```JSON\n'+JSON.stringify(item, null, 2)+'```';
    } else {
        return 'матч не найден!';
    }    
}

module.exports.getMatch = getItem;

module.exports.matchEdit = async function (id, prop, val, userID, ee) {
    if (!id) {return 'ID не указан!'}
    var item = getItem(id);
    if (item !== undefined) {
        if (item.creatorID != userID & userID != process.env.SUPPORT_ID) {return 'только создатель матча может его модерировать'};
        if (item.hasOwnProperty(prop) & prop != 'id') {
            item[prop] = val;
            ee.emit('reload', { id: id });
            return 'значение успешно изменено!';
        } else if (prop == 'id') {
            return 'ID изменить нельзя!';
        } else {
            return 'значение не найдено!';
        }
    } else {
        return 'матч не найден!';
    }    
}

module.exports.matchList = function () {
    return matchList;
}