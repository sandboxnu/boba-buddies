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

const PAIRS_MET_PATH = "pairsMet.json";

let pairsMet = 0;
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

function putObjectInS3(body) {
  var s3 = new AWS.S3();
  var params = {
    Bucket: config.S3_BUCKET_NAME,
    Key: PAIRS_MET_PATH,
    Body: JSON.stringify(body),
    ContentType: "application/json; charset=utf-8",
  };
  s3.putObject(params, (err, data) => {
    if (err) console.log(err);
    else console.log(data);
  });
}

// fetches file with given name (key). parses file content as JSON
async function getObjectFromS3(key) {
  var s3 = new AWS.S3();
  var getParams = {
    Bucket: config.S3_BUCKET_NAME,
    Key: key,
  };
  await s3.getObject(getParams, function (err, data) {
    // callback
    if (err) {
      console.log(err);
      return undefined;
    } else {
      const response = JSON.parse(data.Body.toString());
      return response;
    }
  });
}

/**
 * resends the direct message being sent to it
 * Used for testing lambda/slack connection only
 */
function resendText(event, callback) {
  // test ensures that message isnt from a bot and is a direct message
  if (!event.bot_id && event.channel_type === "im") {
    const { text, channel } = event;
    sendMessage(text, channel);
    callback(undefined, responseSuccess);
  } else {
    callback(undefined, responseSuccess);
  }
}

// handles when users click the Yes or No Kek buttons
async function handleInteractions(payload, callback) {
  const buttonValue = payload.actions[0].value; // one of "yes" or "no"
  const response = getObjectFromS3(PAIRS_MET_PATH);
  response.then((response) => {
    // updates pairsMet if we already already exists in file
    if (response && response["pairsMet"]) {
      pairsMet = response["pairsMet"];
    }
    if (buttonValue === "yes") {
      pairsMet += 1;
    }
    // update pairsMet value in file
    putObjectInS3({ pairsMet: pairsMet });
    callback(undefined, responseSuccess);
  });
}

exports.handler = (data, context, callback) => {
  const resource = data.resource;

  switch (resource) {
    case "/event-handler":
      const body = JSON.parse(data.body);
      resendText(body["event"], callback);
      break;
    case "/interactive-handler":
      // when press button
      const payload = data.body.replace("payload=", "");
      const decodedPayload = decodeURIComponent(payload).replace(/\+/g, "%20");
      const payLoadJSON = JSON.parse(decodedPayload);
      handleInteractions(payLoadJSON, callback);
      break;
    default:
      console.log("unhandled data type");
      callback(undefined, responseSuccess);
      break;
  }
};
