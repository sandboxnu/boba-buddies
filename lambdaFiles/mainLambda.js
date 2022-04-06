const AWS = require("aws-sdk");
const S3 = new AWS.S3();
const config = require("./config.json");

const https = require("https"),
  qs = require("querystring"),
  ACCESS_TOKEN = process.env.BOT_TOKEN;

const responseSuccess = {
  statusCode: 200,
  body: JSON.stringify({
    message: "ok",
  }),
};
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

function putObjectInS3(text) {
  var s3 = new AWS.S3();
  var params = {
    Bucket: config.S3_BUCKET_NAME,
    Key: "boba-buddies/text.json",
    Body: JSON.stringify({ text }),
    ContentType: "application/json; charset=utf-8",
  };
  s3.putObject(params, (err, data) => {
    if (err) console.log(err);
    else console.log(data);
  });
}

/**
 * resends the direct message being sent to it
 */
function resendText(event, callback) {
  // test ensures that message isnt from a bot and is a direct message

  console.log(event.bot_id, !event.bot_id);
  if (!event.bot_id && event.channel_type === "im") {
    const { text, channel } = event;
    sendMessage(text, channel);
    putObjectInS3(text);
    callback(undefined, responseSuccess);
  } else {
    console.log("don't respond to self");
    callback(undefined, responseSuccess);
  }
}

function handleInteractions(payload, callback) {
  const buttonValue = payload.actions[0].value;
  console.log("button pressed:", buttonValue);
  callback(undefined, responseSuccess);
}

exports.handler = (data, context, callback) => {
  console.log(data.body);
  const resource = data.resource;

  switch (resource) {
    case "/event-handler":
      const body = JSON.parse(data.body);
      resendText(body["event"], callback);
      break;
    case "/interactive-handler":
      const payload = data.body.replace("payload=", "");
      const decodedPayload = decodeURIComponent(payload).replace(/\+/g, "%20");
      const payLoadJSON = JSON.parse(decodedPayload);
      handleInteractions(payLoadJSON, callback);
      break;
    default:
      console.log("What is going on");
      callback(undefined, responseSuccess);
      break;
  }
};
