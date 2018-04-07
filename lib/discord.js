require('dotenv').config();

var Discord = require('discord.js');
var bot = new Discord.Client();
var prefix = process.env.PREFIX;
var cmds = require('./commands');
var EventEmitter = require('events');
var ee = new EventEmitter();
module.exports.events = ee;

var matchList = [];

bot
	.on('error', console.error)
	.on('warn', console.warn)
	.on('debug', console.log)
	.on('ready', () => {
		console.log(`Client ready; logged in as ${bot.user.tag} (${bot.user.id})`);
	})
	.on('disconnect', () => { console.warn('Disconnected!'); })
    .on('reconnecting', () => { console.warn('Reconnecting...'); })
    .on('message', async (message) => {
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
                                message.reply(await cmds.fillTeams(command[2], command[3], command[4], command[5].replace(/\D/g, ''), 1, user.id));
                                break;
                            case 'team2':
                                message.reply(await cmds.fillTeams(command[2], command[3], command[4], command[5].replace(/\D/g, ''), 2, user.id));
                                break;
                            case 'delete':
                                message.reply(await cmds.deleteMatch(command[2], user.id));
                                break;
                            case 'info':
                                message.reply(await cmds.matchInfo(command[2]));
                                break;
                            case 'edit':
                                message.reply(await cmds.matchEdit(command[2], command[3], command.slice(4).join(' '), user.id))
                                break;
                            case 'start':
                                ee.emit('message', {text: 'Working?'})
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