// container for enviroments

const enviroments = {};

//Staging enviroment
enviroments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  evnName: "staging",
  hashingSecret: "thisIsASecret",
  maxChecks: 5,
  twilio: {
    accountSid: "ACb32d411ad7fe886aac54c665d25e5c5d",
    authToken: "9455e3eb3109edc12e3d8c92768f7a67",
    fromPhone: "+15005550006",
  },
};

//Production enviroment
enviroments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  evnName: "production",
  hashingSecret: "thisIsAlsoASecret",
  maxChecks: 5,
  twilio: {
    accountSid: "",
    authToken: "",
    fromPhone: "",
  },
};

const currentEnviromen =
  typeof process.env.NODE_ENV == "string"
    ? process.env.NODE_ENV.toLowerCase()
    : "";

const enviromentToExport =
  typeof enviroments[currentEnviromen] == "object"
    ? enviroments[currentEnviromen]
    : enviroments.staging;

export default enviromentToExport;
