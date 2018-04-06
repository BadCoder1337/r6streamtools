var bluebird = require('bluebird');
var fs = bluebird.promisifyAll(require('fs'));

var matchList = [];

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

module.exports.matchCreate = async function (team1, team2, type, banOps) {
    if (team1 && team2 && ['bo1', 'bo3', 'bo5'].includes(type)) {
        if (banOps == 'yes') {
            banOps = true;
        } else {
            banOps = false;
        }
		var match = {
            id: Math.random().toString(36).substring(2, 6),
            team1: team1,
            title1: team1,
            team2: team2,
            title2: team2,
            matchType: type,
            banOps: banOps
        }
        matchList.push(match);
        return `матч создан! ID: \`${match.id}\`. Оверлей: https://r6streamtools.herokuapp.com/?id=${match.id}`;
    } else {
        return `неверные аргументы!`;
    }
}

module.exports.matchInfo = async function (id) {
    if (!id) {return 'ID не указан!'}
    var item = matchList.find((e, i, a) => {
        return e.id == id;
    });
    if (item !== undefined) {
        return '```JSON\n'+JSON.stringify(item, null, 2)+'```';
    } else {
        return 'матч не найден!';
    }    
}

module.exports.getMatch = async function (id) {
    var item = matchList.find((e, i, a) => {
        return e.id == id;
    });
    return item;
}

module.exports.matchEdit = async function (id, prop, val) {
    if (!id) {return 'ID не указан!'}
    var item = matchList.find((e, i, a) => {
        return e.id == id;
    });
    if (item !== undefined) {
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