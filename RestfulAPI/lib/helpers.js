import { strict } from "assert";
import { createHmac } from "crypto";
import config from "../config.js";

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

export default helpers;
