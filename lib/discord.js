require('dotenv').config();

var Discord = require('discord.js');
var bot = new Discord.Client();
var prefix = process.env.PREFIX;
console.log('prefix: ', prefix);
var cmds = require('./commands');
var EventEmitter = require('events');
var ee = new EventEmitter();
module.exports.events = ee;

var matchList = [];
function Pool() {
    this.id = ['bank', 'border', 'chalet', 'clubhouse', 'coastline', 'consulate', 'kafe', 'oregon', 'skyscraper'];
    this.name = ['Банк', 'Граница', 'Шале', 'Клуб', 'Побережье', 'Консульство', 'Кафе Достоевский', 'Орегон', 'Небоскреб'];
}
function Ops() {
    this.atk = ['sledge', 'thatcher', 'ash', 'thermite', 'twitch', 'montagne', 'glaz', 'fuze', 'blitz', 'iq', 'buck', 'blackbeard', 'capitao', 'hibana', 'jackal', 'ying', 'zofia', 'dokkaebi', 'lion', 'finka'];
    this.def = ['smoke', 'mute', 'castle', 'pulse', 'doc', 'rook', 'kapkan', 'tachanka', 'jager', 'bandit', 'frost', 'valkyrie', 'caveira', 'echo', 'mira', 'lesion', 'ela', 'vigil'];
    this.topAtk = ['lion', 'hibana', 'thermite', 'thatcher', 'blitz'],
    this.topDef = ['mira', 'smoke', 'jager', 'pulse', 'lesion']
}
function EmojiPoll() {
    this.list = ['1⃣','2⃣','3⃣','4⃣','5⃣','6⃣','7⃣','8⃣','9⃣'];
}

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

// var perm = ['ADMINISTRATOR',
// 'CREATE_INSTANT_INVITE',
// 'KICK_MEMBERS',
// 'BAN_MEMBERS',
// 'MANAGE_CHANNELS',
// 'MANAGE_GUILD',
// 'ADD_REACTIONS',
// 'VIEW_AUDIT_LOG',
// 'VIEW_CHANNEL',
// 'READ_MESSAGES',
// 'SEND_MESSAGES',
// 'SEND_TTS_MESSAGES',
// 'MANAGE_MESSAGES',
// 'EMBED_LINKS',
// 'ATTACH_FILES',
// 'READ_MESSAGE_HISTORY', //~!!!
// 'MENTION_EVERYONE',
// 'USE_EXTERNAL_EMOJIS',
// 'CONNECT',
// 'SPEAK',
// 'MUTE_MEMBERS',
// 'DEAFEN_MEMBERS',
// 'MOVE_MEMBERS',
// 'USE_VAD',
// 'CHANGE_NICKNAME',
// 'MANAGE_NICKNAMES',
// 'MANAGE_ROLES',
// 'MANAGE_ROLES_OR_PERMISSIONS',
// 'MANAGE_WEBHOOKS',
// 'MANAGE_EMOJIS'
// ];
  
bot
	.on('error', console.error)
	.on('warn', console.warn)
	//.on('debug', console.log)
	.on('ready', () => {
        console.log(`Client ready; logged in as ${bot.user.tag} (${bot.user.id})`);
	})
	.on('disconnect', () => { console.warn('Disconnected!'); })
    .on('reconnecting', () => { console.warn('Reconnecting...'); })
    .on('message', async (message) => {
        // if (message.content == '<:garold:414786714385776660>') {
        //     console.log('##########################################################################');
        //     //console.log(new Discord.Permissions(message.guild.member(bot.user), 1110961217).serialize());
        //     //console.log(await Permission);
        //     perm.forEach((e, i) => {
        //         console.log(`${i}. ${e}: ${message.guild.member(bot.user).permissions.has(e)}`);
        //     });
        //     console.log('--------------------------------------------------------------------------');
        //     console.log(message.channel.permissionOverwrites);
        //     console.log('##########################################################################');
        // }
        //console.log('message: ', message.content);
        try {
            if (!message.author.bot & message.content.startsWith(prefix) & message.channel.type == 'text') {
                console.log(`[${message.guild.name}, ${message.channel.name}] ${message.content}`);
                var msg = message.content.replace(/ +(?= )/g, ''); //убираем множественные пробелы
                var user = message.member;
                var command = msg.split(' ');
                command[0] = command[0].slice(prefix.length);
                console.log('command: ', command);
                switch(command[0]) {
                    case 'match':
                        //if (user.permissions.has('MANAGE_ROLES') || message.author.id == process.env.SUPPORT_ID) {
                        switch(command[1]) {
                            case 'create':
                                message.reply(await cmds.matchCreate(command[2], command[3], user.id));
                                break;
                            case 'team1':
                                if (!!command[5]) {
                                    message.reply(await cmds.fillTeams(command[2], command[3], command[4], command[5].replace(/\D/g, ''), 1, user.id, ee));
                                } else {
                                    message.reply('укажите капитана!');
                                }
                                break;
                            case 'team2':
                                if (!!command[5]) {
                                    message.reply(await cmds.fillTeams(command[2], command[3], command[4], command[5].replace(/\D/g, ''), 2, user.id, ee));
                                } else {
                                    message.reply('укажите капитана!');
                                }
                                break;
                            case 'swap':
                                message.reply(await cmds.matchSwap(command[2], user.id, ee))
                                break;
                            case 'delete':
                                message.reply(await cmds.deleteMatch(command[2], user.id));
                                break;
                            case 'info':
                                message.reply(await cmds.matchInfo(command[2]));
                                break;
                            case 'edit':
                                message.reply(await cmds.matchEdit(command[2], command[3], command.slice(4).join(' '), user.id, ee))
                                break;
                            case 'start':
                                //ee.emit('message', {text: 'Working?'})
                                var match = await cmds.getMatch(command[2]);
                                if (match !== undefined) {
                                    if (match.creatorID != user.id) {
                                        message.reply('только создатель матча может его начать!');
                                        break;
                                    }
                                    if (match.ready) {
                                        var pool = new Pool();
                                        match.pool = new Pool();
                                        var emojiNumbers = new EmojiPoll().list;
                                        var mapAmount = parseInt(match.matchType[2]);
                                        var poolStr = "";
                                        match.votes = [];
                                        pool.name.forEach((e, i) => {poolStr += `${i+1}. **${e}**\n`});
                                        //постим опрос
                                        let poll = await message.channel.send(`<@${match.captain1}>, убирайте одну из следующих карт:\n ${poolStr}`);
                                        for (let i = 1; i <= 9; i++) {
                                            await poll.react(emojiNumbers[i-1]);                                       
                                        }
                                            await poll.pin();

                                        //создаем фильтры
                                        var filter1 = function (reaction, user) {
                                            //console.log(reaction);
                                            //console.log(user.tag);
                                            return (emojiNumbers.includes(reaction.emoji.name) && (user.id === match.captain1));
                                        }
                                        var filter2 = function (reaction, user) {
                                            //console.log(reaction);
                                            //console.log(user.tag);
                                            return (emojiNumbers.includes(reaction.emoji.name) && (user.id === match.captain2));
                                        }
                                        //ждем голос
                                        var vote;
                                        var react;                            
                                        
                                        for (let i = 0; i < 8; i++) {
                                            let flag = !(i % 2);
                                            console.log((i+1)+' polling');
                                            if (flag) {
                                                console.log(bot.users.find('id', match.captain1).tag);
                                            } else {
                                                console.log(bot.users.find('id', match.captain2).tag);
                                            }
                                            if (flag) {
                                                console.log('awaiting vote...');
                                                vote = await poll.awaitReactions(filter1, { maxEmojis: 1 });//ожидаем голос
                                            } else {
                                                console.log('awaiting vote...');
                                                vote = await poll.awaitReactions(filter2, { maxEmojis: 1 });//ожидаем голос
                                            }  
                                            react = vote.first();
                                            //console.log('Vote:');
                                            // console.log('##########################################################################');
                                            // console.log(vote);
                                            // console.log('##########################################################################');
                                            //console.log(vote.first());
                                            //console.log('##########################################################################');
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
                                            pool.name.forEach((e, i) => {poolStr += `${i+1}. **${e}**\n`});//формируем список оставшихся карт
                                            if (i < (8-mapAmount)) {
                                                if (flag) {
                                                    await poll.edit(`<@${match.captain2}>, убирайте одну из следующих карт:\n ${poolStr}`);//редачим месседж
                                                } else {
                                                    await poll.edit(`<@${match.captain1}>, убирайте одну из следующих карт:\n ${poolStr}`);//редачим месседж
                                                }    
                                            } else {
                                                if (flag) {
                                                    await poll.edit(`<@${match.captain2}>, выбирайте одну из следующих карт:\n ${poolStr}`);//редачим месседж
                                                } else {
                                                    await poll.edit(`<@${match.captain1}>, выбирайте одну из следующих карт:\n ${poolStr}`);//редачим месседж
                                                }    
                                            }                                        
                                            let lastNumber = emojiNumbers[emojiNumbers.length-1];//получаем последний номер
                                            poll.reactions.find(val => val.emoji.name == lastNumber).remove();//удаляем голос бота
                                            emojiNumbers.pop();//уменьшаем количество вариантов
                                        }
                                        match.votes.push(pool.id[0]);
                                        ee.emit('match', { match: match });
                                        await poll.clearReactions();
                                        poolStr = "";
                                        match.votes.slice(match.votes.length-mapAmount).forEach((e, i) => {
                                            poolStr += `${i+1}. **${match.pool.name[match.pool.id.indexOf(e)]}**\n`;
                                        });
                                        await poll.edit(`<@${match.captain1}>, <@${match.captain2}> голосование завершено!\nИтоговый набор карт: \n${poolStr}`);

                                            await poll.unpin();

                                        if (match.banOps) {
                                            var confirm = await message.channel.send(`<@${match.creatorID}>, приступить к бану оперативников?`);
                                            await confirm.react('🆗');
                                            await confirm.react('🆑')
                                            var filter = (reaction, user) => (reaction.emoji.name === '🆗' || reaction.emoji.name === '🆑') && user.id === match.creatorID;
                                            let res = await confirm.awaitReactions(filter, { maxEmojis: 1 });
                                            if (res.first().emoji.name !== '🆗') {
                                                confirm.delete(5000);
                                                break;
                                            }
                                            ee.emit('reload', { id: match.id });
                                            var msg;
                                            var ops;
                                            match.ops = new Ops();
                                            for (let i = 0; i < mapAmount; i++) {
                                                ops = new Ops();
                                                match.votesOps = [];
                                                let poll = await message.channel.send(`<@${match.captain1}>, удаляйте атакующего из следующего списка: \`${ops.atk.join(', ')}\``);
                                                msg = await poll.channel.awaitMessages(m => ops.atk.includes(m.content) && m.author.id === match.captain1, { max: 1 });
                                                match.votesOps.push(msg.first().content);
                                                ops.atk.remove(msg.first().content);
                                                ee.emit('match', { match: match });
                                                msg.first().delete(3000);

                                                poll = await poll.edit(`<@${match.captain2}>, удаляйте атакующего из следующего списка: \`${ops.atk.join('`, `')}\`\nУже удалены \`${match.votesOps.join('`, `')}\``);
                                                msg = await poll.channel.awaitMessages(m => ops.atk.includes(m.content) && m.author.id === match.captain2, { max: 1 });
                                                match.votesOps.push(msg.first().content);
                                                ee.emit('match', { match: match });
                                                msg.first().delete(3000);

                                                setTimeout(() => {
                                                    ee.emit('swap', { id: match.id });
                                                }, 5000);

                                                poll = await poll.edit(`<@${match.captain1}>, удаляйте защитника из следующего списка: \`${ops.def.join('`, `')}\`\nУже удалены \`${match.votesOps.join('`, `')}\``);
                                                msg = await poll.channel.awaitMessages(m => ops.def.includes(m.content) && m.author.id === match.captain1, { max: 1 });
                                                match.votesOps.push(msg.first().content);
                                                ee.emit('match', { match: match });
                                                msg.first().delete(3000);

                                                poll = await poll.edit(`<@${match.captain2}>, удаляйте защитника из следующего списка: \`${ops.def.join('`, `')}\`\nУже удалены \`${match.votesOps.join('`, `')}\``);
                                                msg = await poll.channel.awaitMessages(m => ops.def.includes(m.content) && m.author.id === match.captain2, { max: 1 });
                                                match.votesOps.push(msg.first().content);
                                                ee.emit('match', { match: match });
                                                msg.first().delete(3000);

                                                
                                                await poll.edit(`<@${match.captain1}>, <@${match.captain2}>, бан оперативников для карты №${i+1} ${match.pool.name[match.pool.id.indexOf(match.votes.slice(9-mapAmount)[i])]} закончен! Удаленные оперативники: \`${match.votesOps.join(', ')}\`.`);
                                                if (i+1 == mapAmount) {
                                                    break;
                                                }
                                                confirm = await message.channel.send(`<@${match.creatorID}>, продолжить?`);
                                                await confirm.react('🆗');
                                                await confirm.react('🆑');
                                                var filter = (reaction, user) => (reaction.emoji.name === '🆗' || reaction.emoji.name === '🆑') && user.id === match.creatorID;
                                                let res = await confirm.awaitReactions(filter, { maxEmojis: 1 });
                                                if (res.first().emoji.name !== '🆗') {
                                                    confirm.delete();
                                                    break;
                                                }
                                                ee.emit('reload', { id: match.id });
                                            }
                                        }

                                    } else {
                                        message.reply('закончите настройку перед началом!');
                                    }
                                } else {
                                    message.reply('матч не найден!');
                                }
                                break;
                            case 'help':
                            default:
                            user.send(await cmds.help('match.txt'));
                        }//} else {
                            //message.reply('эта команда доступна только **модераторам** и **администрации**');
                        //}
                        break;
                    case 'help':
                    default:
                        user.send(await cmds.help('help.txt'));
                }
            };  
        } catch(err) {
            cmds.reportError(err, bot, message);
        }
    });

bot.login(process.env.DISCORD_TOKEN).then(res => {
    module.exports = bot;
    module.exports.matchList = function () {
        return cmds.matchList();
    }
});