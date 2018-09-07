const bluebird = require('bluebird');

const fs = bluebird.promisifyAll(require('fs'));

const matchList = [];

function Pool() {
    this.id = ['bank', 'border', 'chalet', 'clubhouse', 'coastline', 'consulate', 'kafe', 'oregon', 'skyscraper', 'themepark', 'villa'];
    this.name = ['Банк', 'Граница', 'Шале', 'Клуб', 'Побережье', 'Консульство' ,'Кафе Достоевский', 'Орегон', 'Небоскреб', 'Лунопарк', 'Вилла'];
}
// function Ops() {
//     this.atk = ['sledge', 'thatcher', 'ash', 'thermite', 'twitch', 'montagne', 'glaz', 'fuze', 'blitz', 'iq', 'buck', 'blackbeard', 'capitao', 'hibana', 'jackal', 'ying', 'zofia', 'dokkaebi', 'lion', 'finka'];
//     this.def = ['smoke', 'mute', 'castle', 'pulse', 'doc', 'rook', 'kapkan', 'tachanka', 'jager', 'bandit', 'frost', 'valkyrie', 'caveira', 'echo', 'mira', 'lesion', 'ela', 'vigil'];
//     this.topAtk = ['lion', 'hibana', 'thermite', 'thatcher', 'blitz'],
//     this.topDef = ['mira', 'smoke', 'jager', 'pulse', 'lesion']
// }
function EmojiPoll() {
    this.list = ['1⃣','2⃣','3⃣','4⃣','5⃣','6⃣','7⃣','8⃣','9⃣','🇦','🇧'];
}

//тестовый матч для быстрого теста

matchList.push({
    id: "abcd",
    creatorID: "125634283258773504",
    matchType: "bo5",
    legacy: false,
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

module.exports.reportError = async (err, bot, msg) => {
    try {
        let dm = bot.users.get(process.env.SUPPORT_ID);
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

module.exports.help = async (file) => {
    try {
        let answ = await fs.readFileAsync('./lib/text/'+file, 'utf8');
        return answ;
    } catch(err) {
        throw err;
    }
}

module.exports.matchCreate = async (type, legacy, creatorID) => {
    if (['bo1', 'bo3', 'bo5'].includes(type)) {
		var match = {
            id: Math.random().toString(36).substring(2, 6),
            creatorID: creatorID,
            code1: 'XXX',
            title1: 'Team 1',
            code2: 'XXX',
            title2: 'Team 2',
            matchType: type,
            legacy: legacy === 'yes',
            ready: false
        }
        matchList.push(match);
        return `матч создан! ID: \`${match.id}\`. Оверлей: https://r6streamtools.herokuapp.com/?id=${match.id}`;
    } else {
        return `неверный тип матча!`;
    }
}

module.exports.fillTeams = async (id, code, title, captain, n, userID) => {    
    const { ee } = require('./discord');
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

async function matchSwap (id, userID) {
    const { ee } = require('./discord');
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

module.exports.matchSwap = matchSwap;

module.exports.matchDelete = async (id, userID) => {
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

module.exports.matchInfo = async (id) => {
    if (!id) {return 'ID не указан!'}
    var item = getItem(id);
    if (item !== undefined) {
        return '```JSON\n'+JSON.stringify(item, null, 2)+'```';
    } else {
        return 'матч не найден!';
    }    
}

module.exports.getMatch = getItem;

module.exports.matchEdit = async (id, prop, val, userID) => {
    const { ee } = require('./discord');
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

module.exports.matchStart = async (id, userID, channelID) => {
    console.log('channelID: ', channelID);
    console.log('userID: ', userID);
    console.log('id: ', id);    
    const { bot, ee } = require('./discord');
    var match = getItem(id);
    if (match !== undefined) {
        if (match.creatorID != userID) {
            return 'только создатель матча может его начать!';
        }
        if (match.ready) {
            if (!match.legacy) {
                let n = Math.round(Math.random()) + 1;
                let poll = await bot.channels.get(channelID).send(`<@${match['captain'+n]}> будете **убирать** карты первыми? (Капитан выбран случайно)`);
                await poll.react('🆗');
                await poll.react('🆑')
                const filter = (reaction, user) => (reaction.emoji.name === '🆗' || reaction.emoji.name === '🆑') && user.id === match['captain'+n];
                let res = await poll.awaitReactions(filter, { maxEmojis: 1 });
                if ((res.first().emoji.name !== '🆗' && n === 1) || (res.first().emoji.name === '🆗' && n === 2)) {
                    matchSwap(id, userID);
                }
            }

            var pool = new Pool();
            match.pool = new Pool();
            var emojiNumbers = new EmojiPoll().list;
            var mapAmount = parseInt(match.matchType[2]);
            var poolStr = "";
            match.votes = [];
            pool.name.forEach((e, i) => {poolStr += `${(i+1).toString(16).toUpperCase()}. **${e}**\n`});
            //постим опрос
            let poll = await bot.channels.get(channelID).send(`<@${match.captain1}>, **убирайте** одну из следующих карт:\n ${poolStr}`);
            for (let i = 0; i <= match.pool.id.length-1; i++) {
                await poll.react(emojiNumbers[i]);                                       
            }
                await poll.pin();

            //создаем фильтры
            var filter1 = (reaction, user) => {
                return (emojiNumbers.includes(reaction.emoji.name) && (user.id === match.captain1));
            }
            var filter2 = (reaction, user) => {
                return (emojiNumbers.includes(reaction.emoji.name) && (user.id === match.captain2));
            }
            //ждем голос
            var vote;
            var react;                            
            
            for (let i = 0; i < match.pool.id.length-1; i++) {
                let flag = !(i % 2);
                console.log((i+1)+' polling');
                if (flag) {
                    console.log(bot.users.get(match.captain1).tag);
                } else {
                    console.log(bot.users.get(match.captain2).tag);
                }
                if (flag) {
                    console.log('awaiting vote...');
                    vote = await poll.awaitReactions(filter1, { maxEmojis: 1 });//ожидаем голос
                } else {
                    console.log('awaiting vote...');
                    vote = await poll.awaitReactions(filter2, { maxEmojis: 1 });//ожидаем голос
                }  
                react = vote.first();
                let mapNumber = emojiNumbers.indexOf(react.emoji.name);//определяем выбранную цифру
                console.log('mapNumber: ', mapNumber);
                match.votes.push(pool.id[mapNumber]);//пушим ID карты в матч
                console.log('match.votes: ', JSON.stringify(match.votes));
                ee.emit('match', { match: match });
                pool.id.splice(mapNumber, 1);
                pool.name.splice(mapNumber, 1);//удаляем выбранную карту из пула
                console.log('pool:');
                console.log(pool);
                if (flag) {
                    await react.remove(match.captain1);//удаляем реакцию капитана
                } else {
                    await react.remove(match.captain2);//удаляем реакцию капитана
                }
                poolStr = "";
                pool.name.forEach((e, i) => {poolStr += `${(i+1).toString(16).toUpperCase()}. **${e}**\n`});//формируем список оставшихся карт
                // if (i < (match.pool.id.length-1-mapAmount)) {
                // if (!(i === 2 || i === 3)) {
                if ((match.matchType == 'bo1') || (match.matchType == 'bo3' && !([3,2].includes(i))) || (match.matchType == 'bo5' && !([5,4,3,2].includes(i)))) {
                    if (flag) {
                        await poll.edit(`<@${match.captain2}>, **убирайте** одну из следующих карт:\n ${poolStr}`);//редачим месседж
                    } else {
                        await poll.edit(`<@${match.captain1}>, **убирайте** одну из следующих карт:\n ${poolStr}`);//редачим месседж
                    }    
                } else {
                    if (flag) {
                        await poll.edit(`<@${match.captain2}>, **выбирайте** одну из следующих карт:\n ${poolStr}`);//редачим месседж
                    } else {
                        await poll.edit(`<@${match.captain1}>, **выбирайте** одну из следующих карт:\n ${poolStr}`);//редачим месседж
                    }    
                }                                        
                let lastNumber = emojiNumbers[emojiNumbers.length-1];//получаем последний номер
                poll.reactions.find(val => val.emoji.name == lastNumber).remove();//удаляем голос бота
                emojiNumbers.pop();//уменьшаем количество вариантов
            }
            match.votes.push(pool.id[0]);
            ee.emit('match', { match: match });
            poolStr = ""
            let ii = 1;
            for (let i = 0; i < match.votes.length; i++) {
                if ((match.matchType == 'bo3' && [3,2].includes(i)) || (match.matchType == 'bo5' && [5,4,3,2].includes(i)) || (match.matchType == 'bo1' && i == (match.votes.length-1))) {
                    poolStr += `${(ii).toString(16).toUpperCase()}. **${match.pool.name[match.pool.id.indexOf(match.votes[i])]}**  (сторону выбирает <@${match['captain'+(i%2+1)]}>)\n`;
                    ii++;
                }
            }
            await poll.delete();

            return `<@${match.captain1}>, <@${match.captain2}> голосование завершено!\nИтоговый набор карт: \n${poolStr}`;
        } else {
            return 'закончите настройку перед началом!';
        }
    } else {
        return 'матч не найден!';
    }
}

module.exports.matchList = () => {
    return matchList;
}

 
