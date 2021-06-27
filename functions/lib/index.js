"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const telegraf_1 = require("telegraf");
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
const { key, region, project } = functions.config().telegrambot;
const bot = new telegraf_1.Telegraf(key, {
    telegram: { webhookReply: true },
});
const externalHost = "https://fluffy-sheep-48.loca.lt"; // Must be HTTPS
const url = process.env.FUNCTIONS_EMULATOR === "true"
    // change to own external localhost website (e.g. using ngrok)
    ? `${externalHost}/${project}/${region}/bot`
    : `https://${region}-${project}.cloudfunctions.net/bot`;
bot.telegram.setWebhook(url).catch((err) => {
    functions.logger.error('[Bot] Error', err);
});
// error handling
bot.catch((err, ctx) => {
    functions.logger.error('[Bot] Error', err);
    ctx.reply(`Ooops, encountered an error for ${ctx.updateType}, ${err}`);
});
// initialize the commands
bot.command('/start', (ctx) => ctx.reply('Hello! Send any message and I will copy it.'));
// copy every message and send to the user
bot.on('message', (ctx) => ctx.telegram.sendCopy(ctx.chat.id, ctx.message));
exports.bot = functions.https.onRequest(async (req, res) => {
    functions.logger.log(`Incoming message`, req.body);
    try {
        await bot.handleUpdate(req.body, res);
    }
    finally {
        res.status(200).end();
    }
});
//# sourceMappingURL=index.js.map