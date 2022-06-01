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
  }
  callback(undefined, responseSuccess);
}

// updates the checkin message (kekw yes or no buttons) with a message that confirms their response
// prevents spamming of kekw buttons bc buttons no longer accessible
function updateCheckinMessage(responseUrl, user, buttonValue) {
  var postData = JSON.stringify({
    replace_original: "true", // edits original message
    text:
      buttonValue === "yes"
        ? `${user.name} said you met! :happy-panda:`
        : `${user.name} said you have not met! SADGE ;-; `, // TODO: make this more specific- who responded?  did you meet?
  });

  const searchTerm = ".com/";
  const indexOfFirst = responseUrl.indexOf(searchTerm);

  const pathSubstring = responseUrl.substring(indexOfFirst + 4);

  var options = {
    hostname: "hooks.slack.com",
    path: pathSubstring,
    method: "POST",
  };

  var req = https.request(options, (res) => {
    console.log("statusCode:", res.statusCode);

    res.on("data", (d) => {
      process.stdout.write(d);
    });
  });

  req.on("error", (e) => {
    console.error(e);
  });

  req.write(postData);
  req.end();
}

// handles when users click the Yes or No Kek buttons
async function handleButtonInteraction(payload, callback) {
  const buttonValue = payload.actions[0].value; // one of "yes" or "no"
  const user = payload.user; // the user who pressed the button.
  const response = getObjectFromS3(PAIRS_MET_PATH);
  response.then((response) => {
    let pairsMet = 0;
    // updates pairsMet if we already already exists in file
    if (response && response["pairsMet"]) {
      pairsMet = response["pairsMet"];
    }
    if (buttonValue === "yes") {
      pairsMet += 1;
    }
    // update pairsMet value in file
    putObjectInS3({ pairsMet: pairsMet });
    // update message response
    const responseURL = payload["response_url"];
    updateCheckinMessage(responseURL, user, buttonValue);
    callback(undefined, responseSuccess);
  });
}

// handles all slack "interaction payloads"
// for all interaction payload types, reference slack docs: https://api.slack.com/interactivity/handling
async function handleInteractions(payload, callback) {
  if (payload.type === "block_actions") {
    // messages with buttons are of type "block_actions"
    handleButtonInteraction(payload, callback);
  }
}

exports.handler = (data, context, callback) => {
  const resource = data.resource;

  switch (resource) {
    // called when messaging Bot
    case "/event-handler":
      const body = JSON.parse(data.body);
      resendText(body["event"], callback);
      break;
    // called when interactive button pressed
    case "/interactive-handler":
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
