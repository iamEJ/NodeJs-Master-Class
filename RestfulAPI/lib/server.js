import { createServer } from "http";
import { parse, fileURLToPath } from "url"; // TODO fix parse
import { StringDecoder } from "string_decoder";
import enviromentToExport from "./../config.js";
import https from "https";
import fs from "fs";
import _data from "./data.js";
import handlers from "./handlers.js";
import helpers from "./helpers.js";
import path from "path";

//For __dirname to work
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Instantiate the server module object
const server = {};

// HTTP server
server.httpServer = createServer((req, res) => {
  server.unifiedServer(req, res);
});

// HTTPS server
server.httpsServerOptions = {
  key: fs.readFileSync(path.join(__dirname, "/../https/key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "/../https/cert.pem")),
};
server.httpsServer = https.createServer(
  server.httpsServerOptions,
  (req, res) => {
    server.unifiedServer(req, res);
  }
);

// Http and https logic

server.unifiedServer = (req, res) => {
  // get url and parse it
  const parseUrl = parse(req.url, true);

  //get path
  const path = parseUrl.pathname;
  const trimedPath = path.replace(/^\/+|\/+$/g, "");

  //get http method
  const method = req.method.toLowerCase();

  // get query string as an object
  //const queryStringObject = parseUrl.query;
  const queryString = JSON.stringify(parseUrl.query, null, 4);
  const queryStringObject = JSON.parse(queryString);

  //request headers
  const headers = req.headers;

  //get payload, if any
  const decoder = new StringDecoder("utf-8");
  let buffer = "";
  req.on("data", (data) => {
    buffer += decoder.write(data);
  });
  req.on("end", () => {
    buffer += decoder.end();

    //Choose the handler
    const chosenHander =
      typeof server.router[trimedPath] !== "undefined"
        ? server.router[trimedPath]
        : handlers.notFound;

    //Construct the data object
    const data = {
      trimedPath: trimedPath,
      queryStringObject: queryStringObject,
      method: method,
      headers: headers,
      payload: helpers.parseJsonToObject(buffer),
    };

    //Route the request to the handler
    chosenHander(data, (statusCode, payload) => {
      statusCode = typeof statusCode == "number" ? statusCode : 200;

      payload = typeof payload == "object" ? payload : {};

      const payloadString = JSON.stringify(payload);

      //get response
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);

      console.log("Returning this response: ", statusCode, payloadString);
    });

    //log the request payload
    //console.log("Requested payload: ", buffer);

    //log the request path
    // console.log(`Requested path: ${trimedPath}`);
    // console.log(`Method: ${method}`);
    // console.log("QueryStringObject: ", queryStringObject);
    // console.log("Headers: ", headers);
  });
};

//Define a request router
server.router = {
  ping: handlers.ping,
  users: handlers.users,
  tokens: handlers.tokens,
  checks: handlers.checks,
};

//Init script
server.init = () => {
  //Start the http server
  server.httpServer.listen(enviromentToExport.httpPort, () => {
    console.log(
      "Sever is on port " +
        enviromentToExport.httpPort +
        " on " +
        enviromentToExport.evnName +
        " mode"
    );
  });
  //Start the https server
  server.httpsServer.listen(enviromentToExport.httpsPort, () => {
    console.log(
      "Sever is on port " +
        enviromentToExport.httpsPort +
        " on " +
        enviromentToExport.evnName +
        " mode"
    );
  });
};

//Export the server
export default server;

//Testing
// _data.create("test", "newFile", { new: "file" }, (err) => {
//   console.log("This is an error", err);
// });
//Test of sending sms
// helpers.sendTwilioSMS("4158126541", "Hello!", (err) => {
//   console.log("This is an error " + err);
// });
