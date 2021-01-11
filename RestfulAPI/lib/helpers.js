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

export default helpers;
