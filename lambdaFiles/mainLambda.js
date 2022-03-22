const https = require("https"),
  qs = require("querystring"),
  ACCESS_TOKEN = process.env.BOT_TOKEN;

/**
 * Sends a message as boba buddy to the given channel
 * @param {string} text the message being sent
 * @param {string} channel the channel its being sent to
 */
function sendMessage(text, channel) {
  const message = { channel, text };

  const query = qs.stringify(message);
  const options = {
    hostname: "slack.com",
    path: `/api/chat.postMessage?${query}`,
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  };
  https.get(options);
}

/**
 * resends the direct message being sent to it
 */
function resendText(event, callback) {
  // test ensures that message isnt from a bot and is a direct message
  if (!event.bot_id && event.channel_type === "im") {
    const { text, channel } = event;
    sendMessage(text, channel);
  }
  callback(null);
}

exports.handler = (data, context, callback) => {
  console.log(data);
  switch (data.type) {
    case "url_verification":
      verify(data, callback);
      break;
    case "event_callback":
      resendText(data.event, callback);
      break;
    default:
      callback(null);
  }
};
