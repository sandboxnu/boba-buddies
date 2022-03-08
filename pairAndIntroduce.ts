import { App } from '@slack/bolt';
import { findConversation } from './utils/buttons';

require('dotenv').config();
// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true, // add this
  appToken: process.env.SLACK_APP_TOKEN // add this
});

findConversation(app).catch((e) => console.error(e['data']));
