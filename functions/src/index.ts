import * as functions from "firebase-functions";
import {Telegraf} from "telegraf";

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

const bot = new Telegraf(functions.config().telegrambot.key);
console.log("test");

bot.on("text", (ctx) => ctx.reply(
    "Hi! I am Red Panda bot, a cute and fearless bot!"
));
bot.hears("hi", (ctx) => ctx.reply("Hey there"));
bot.launch();

exports.bot = functions.https.onRequest((req, res) => {
  bot.handleUpdate(req.body, res);
});
