var Discord = require('discord.js');
var bot = new Discord.Client();
var prefix = process.env.PREFIX;
console.log('prefix: ', prefix);
var cmds = require('./commands');
var EventEmitter = require('events');
var ee = new EventEmitter();

module.exports.ee = ee;
module.exports.bot = bot;
module.exports.matchList = function () {
    return cmds.matchList();
}

var matchList = [];

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
                                message.reply(await cmds.matchStart(command[2], user.id, message.channel.id));
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

bot.login(process.env.DISCORD_TOKEN)