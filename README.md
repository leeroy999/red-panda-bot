# red-panda-bot
 
This project uses Telegraf API and Firebase to host server.

You will need firebase-tools for this project. If you haven't, run:
npm install -g firebase-tools

The main logic is in functions/src/index.ts


To setup for project:

cd functions
npm install


For testing:
(create your own localhost port externally e.g. using ngrok, and replace development line)
npm run build
firebase emulators:start



