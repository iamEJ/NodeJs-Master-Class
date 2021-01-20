// container for enviroments

const enviroments = {};

//Staging enviroment
enviroments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  evnName: "staging",
  hashingSecret: "thisIsASecret",
  maxChecks: 5,
};

//Production enviroment
enviroments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  evnName: "production",
  hashingSecret: "thisIsAlsoASecret",
  maxChecks: 5,
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
