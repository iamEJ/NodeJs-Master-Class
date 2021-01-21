import { strict } from "assert";
import { createHmac } from "crypto";
import config from "../config.js";
import querystring from "querystring";
import https from "https";

// A container for helpers
const helpers = {};

// Create sha256 hash for password
helpers.hash = (str) => {
  if (typeof str == "string" && str.length > 0) {
    const hash = createHmac("sha256", config.hashingSecret)
      .update(str)
      .digest("hex");
    return hash;
  } else {
    return false;
  }
};

//Parse a Json string to an object
helpers.parseJsonToObject = (str) => {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
};

//Create a random string of the given length
helpers.createRandomString = (strLength) => {
  strLength =
    typeof strLength === "number" && strLength > 0 ? strLength : false;
  if (strLength) {
    //Define all the possible characters
    const possibleCharacters = "abcdefjgihklmnopqrstuvwxyz0123456789";
    // Start the string
    let str = "";
    for (let i = 1; i <= strLength; i++) {
      //Get random character form possible characters
      const random = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );
      //Append to string
      str += random;
    }
    //Return final string
    return str;
  } else {
    return false;
  }
};

//Send an SMS message via Twilio
helpers.sendTwilioSMS = (phone, msg, callback) => {
  phone =
    typeof phone == "string" && phone.trim().length == 10
      ? phone.trim()
      : false;
  msg =
    typeof msg == "string" && msg.trim().length > 0 && msg.trim().length <= 1600
      ? msg.trim()
      : false;
  if (phone && msg) {
    //Config the request payload
    const payload = {
      From: config.twilio.fromPhone,
      To: "+1" + phone,
      Body: msg,
    };

    //Stringify the payload
    const stringPayload = querystring.stringify(payload);
    //Confige the request details
    const requistDetails = {
      protocol: "https:",
      hostname: "api.twilio.com",
      method: "POST",
      path:
        "/2010-04-01/Accounts/" + config.twilio.accountSid + "/Messages.json",
      auth: config.twilio.accountSid + ":" + config.twilio.authToken,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(stringPayload),
      },
    };
    //Instantiate the requst object
    const req = https.request(requistDetails, (res) => {
      //Grab the status of the sent request
      const status = res.statusCode;
      //Callback successfully if the request went through
      if (status == 200 || status == 201) {
        callback(false);
      } else {
        callback("Returned status code was " + status);
      }
    });
    //Bind to the error event so it doesn't get thrown
    req.on("error", (e) => {
      callback(e);
    });
    //Add the payload
    req.write(stringPayload);
    //End the request
    req.end();
  } else {
    callback("Giving parameters are missing or invalid");
  }
};

export default helpers;
