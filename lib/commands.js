var bluebird = require('bluebird');
var fs = bluebird.promisifyAll(require('fs'));

var matchList = [];

function getItem(id) {
    return item = matchList.find((e, i, a) => {
        return e.id == id;
    });
}

function getIndex(id) {
    return matchList.indexOf(getItem(id));
}

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
            matchType: type,
            banOps: banOps,
            ready: false
        }
        matchList.push(match);
        return `матч создан! ID: \`${match.id}\`.`;
    } else {
        return `неверный тип матча!`;
    }
}

module.exports.fillTeams = async function (id, code, title, captain, n, userID) {
    //console.log('id, code, title, captain, n: ', id, code, title, captain, n);

    if (id && code && title && captain) {
        var item = getItem(id);
        if (item !== undefined) {
            if (item.creatorID != userID & userID != process.env.SUPPORT_ID) {return 'только создатель матча может его модерировать'}
            item['code'+n] = code;
            item['title'+n] = title;
            item['captain'+n] = captain;
            if (item.code1 && item.code2) {
                item.ready = true;
                return `обе команды заполнены. \`${process.env.PREFIX}match start ${id}\` чтобы начать!`;
            }
            return `команда ${n} настроена!`; 
        } else {
            return 'матч не найден!';
        }
    } else {
        return 'неверные аргументы!';
    }
    //var index = getIndex(id);
    
}

Оверлей: https://r6streamtools.herokuapp.com/?id=${match.id}

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

module.exports.matchEdit = async function (id, prop, val, userID) {
    if (!id) {return 'ID не указан!'}
    var item = getItem(id);
    if (item !== undefined) {
        if (item.creatorID != userID & userID != process.env.SUPPORT_ID) {return 'только создатель матча может его модерировать'};
        if (item.hasOwnProperty(prop) & prop != 'id') {
            item[prop] = val;
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