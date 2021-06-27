"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const telegraf_1 = require("telegraf");
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
const bot = new telegraf_1.Telegraf(functions.config().telegrambot.key);
console.log("test");
bot.on("text", (ctx) => ctx.reply("Hello"));
bot.hears("hi", (ctx) => ctx.reply("Hey there"));
bot.launch();
exports.bot = functions.https.onRequest((req, res) => {
    bot.handleUpdate(req.body, res);
});
//# sourceMappingURL=index.js.map