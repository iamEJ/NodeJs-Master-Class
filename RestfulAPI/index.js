import { createServer } from "http";
import { parse } from "url"; // TODO fix parse
import { StringDecoder } from "string_decoder";
import enviromentToExport from "./config.js";
import https from "https";
import fs from "fs";
import _data from "./lib/data.js";
import handlers from "./lib/handlers.js";
import helpers from "./lib/helpers.js";

//Testing
// _data.create("test", "newFile", { new: "file" }, (err) => {
//   console.log("This is an error", err);
// });

// HTTP server
const httpServer = createServer((req, res) => {
  unifiedServer(req, res);
});

httpServer.listen(enviromentToExport.httpPort, () => {
  console.log(
    "Sever is on port " +
      enviromentToExport.httpPort +
      " on " +
      enviromentToExport.evnName +
      " mode"
  );
});

// HTTPS server
const httpsServerOptions = {
  key: fs.readFileSync("./https/key.pem"),
  cert: fs.readFileSync("./https/cert.pem"),
};
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res);
});

httpsServer.listen(enviromentToExport.httpsPort, () => {
  console.log(
    "Sever is on port " +
      enviromentToExport.httpsPort +
      " on " +
      enviromentToExport.evnName +
      " mode"
  );
});

// Http and https logic

const unifiedServer = (req, res) => {
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
      typeof router[trimedPath] !== "undefined"
        ? router[trimedPath]
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
const router = {
  ping: handlers.ping,
  users: handlers.users,
  tokens: handlers.tokens,
};
