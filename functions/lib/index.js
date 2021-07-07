"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const telegraf_1 = require("telegraf");
const moment = require("moment");
const admin_1 = require("./admin");
const botUtils_1 = require("./botUtils");
const member_1 = require("./member");
admin.initializeApp();
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
const { key, region, project, password } = functions.config().telegrambot;
const bot = new telegraf_1.Telegraf(key, {
    telegram: { webhookReply: true },
});
const externalHost = 'https://curly-goat-76.loca.lt'; // Must be HTTPS
const url = process.env.FUNCTIONS_EMULATOR === 'true' ?
    // change to own external localhost website (e.g. using ngrok)
    `${externalHost}/${project}/${region}/bot` :
    `https://${region}-${project}.cloudfunctions.net/bot`;
bot.telegram.setWebhook(url).catch((err) => {
    functions.logger.error('[Bot] Error', err);
});
/* -- Error Handling -- */
bot.catch((err, ctx) => {
    functions.logger.error('[Bot] Error', err);
    ctx.reply(`Ooops, encountered an error for ${ctx.updateType}, ${err}`);
});
/* -- Admin Commands -- */
admin_1.adminCommands(bot, password, admin.database());
/* -- Member Commands --*/
member_1.memberCommands(bot, admin.database());
// initialize the commands
bot.command('/start', (ctx) => {
    botUtils_1.initialiseMember(ctx.message.from.id, ctx.message.from, admin.database())
        .then(() => {
        admin.database().ref('users/' + ctx.message.from.id)
            .once('value').then((val) => {
            ctx.reply(`Data from firebase: ${JSON.stringify(val.val())}`);
        });
    });
});
// default response
bot.on('text', (ctx) => {
    if (ctx.chat.type === 'private') {
        ctx.reply('WAAAH WRONG COMMANDzzzzz');
    }
});
// bot.command('/member', async (ctx) => {
//   const args: string[] = ctx.update.message.text.split(' ');
//   const uid: number = args[1] ? parseInt(args[1]) : ctx.message.from.id;
//   ctx.reply(`${uid}`);
//   await ctx.telegram.getChatMember(ctx.chat.id, uid)
//       .then((val: ChatMember) => {
//         ctx.reply('true');
//         ctx.reply(val.status);
//       }).catch((e) => {
//         ctx.reply(e);
//         ctx.reply('false');
//       });
// }
// );
// // copy every message and send to the user
// bot.on('message', async (ctx) => {
//   ctx.reply(`@${ctx.from.username}`);
//   await ctx.telegram.getChatMember(ctx.chat.id, ctx.from.id)
//       .then((val: ChatMember) => {
//         ctx.reply(`Spoke from: ${val.user.id}`);
//       });
//   await ctx.telegram.getChatAdministrators(ctx.chat.id)
//       .then((val: ChatMember[]) => {
//         ctx.reply(`Admins: ${val.map((val) => val.user.username)
//         .join(', ')}`);
//       });
// });
exports.bot = functions
    .region(region)
    .https.onRequest(async (req, res) => {
    functions.logger.log('Incoming message', req.body);
    try {
        await bot.handleUpdate(req.body, res);
    }
    finally {
        res.status(200).end();
    }
});
exports.scheduledBirthday = functions
    .region(region)
    .pubsub
    .schedule('0 9 * * *')
    .timeZone('Asia/Singapore')
    .onRun(async () => {
    const month = botUtils_1.getMonth(moment());
    const date = botUtils_1.getDate(moment());
    const idArrTest = await admin.database().ref('bday/' + month)
        .child(date).once('value');
    const memberChatId = await admin.database().ref('admin')
        .child('memberRoom').once('value');
    if (idArrTest.exists() && memberChatId.exists()) {
        const idArr = idArrTest.val();
        const nameArr = idArr.map(async (id) => {
            const user = (await bot.telegram
                .getChatMember(memberChatId.val(), id)).user;
            botUtils_1.initialiseMember(user.id, user, admin.database());
            return user.username ? `@${user.username}` : null;
        });
        Promise.all(nameArr).then((arr) => {
            const newArr = arr.filter((x) => x);
            bot.telegram.sendMessage(memberChatId.val(), `Happy birthday ${newArr.join(' and ')}!`);
        });
    }
    if (memberChatId.exists()) {
        bot.telegram.sendMessage(memberChatId.val(), 'Cron job executed!');
    }
});
//# sourceMappingURL=index.js.map