"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const telegraf_1 = require("telegraf");
admin.initializeApp();
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
const { key, region, project } = functions.config().telegrambot;
const bot = new telegraf_1.Telegraf(key, {
    telegram: { webhookReply: true },
});
const externalHost = 'https://weak-earwig-52.loca.lt'; // Must be HTTPS
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
// initialize the commands
bot.command('/start', async (ctx) => {
    const dataFromDb = await admin.database().ref('users/' + ctx.message.from.id)
        .once('value');
    if (dataFromDb.exists()) {
        admin.database().ref('users/' + ctx.message.from.id).set({
            username: dataFromDb.child('username'),
            birthday: dataFromDb.hasChild('birthday') ?
                dataFromDb.child('birthday') :
                null,
        });
    }
    else {
        admin.database().ref('users/' + ctx.message.from.id).set({
            username: ctx.message.from.username,
            birthday: null,
        });
    }
    ctx.reply(`Data from firebase: ${JSON.stringify(dataFromDb.val())}`);
});
bot.command('/member', async (ctx) => {
    const args = ctx.update.message.text.split(' ');
    ctx.reply(`${args[0]}`);
    ctx.reply(`${args[1]}`);
    await ctx.telegram.getChatMember(ctx.chat.id, parseInt(args[1]))
        .then((val) => {
        ctx.reply('true');
        ctx.reply(val.status);
    }).catch((e) => {
        ctx.reply(e);
        ctx.reply('false');
    });
});
// copy every message and send to the user
bot.on('message', async (ctx) => {
    ctx.reply(`@${ctx.from.username}`);
    await ctx.telegram.getChatMember(ctx.chat.id, ctx.from.id)
        .then((val) => {
        ctx.reply(`Spoke from: ${val.user.id}`);
    });
    await ctx.telegram.getChatAdministrators(ctx.chat.id)
        .then((val) => {
        ctx.reply(`Admins: ${val.map((val) => val.user.username).join(', ')}`);
    });
});
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
//# sourceMappingURL=index.js.map