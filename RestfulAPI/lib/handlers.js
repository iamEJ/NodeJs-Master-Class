import _data from "./data.js";
import helpers from "./helpers.js";

//Define a handler
const handlers = {};

//Users
handlers.users = (data, callback) => {
  const acceptableMethdos = ["post", "get", "put", "delete"];
  if (acceptableMethdos.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};
//Container for the users submethods
handlers._users = {};

// User method post
// Requere data: firstName, lastName, phone, password, tosAgreement
handlers._users.post = (data, callback) => {
  //Check if all fields are filled
  const firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  const lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  const phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false;
  const password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  const tosAgreement =
    typeof data.payload.tosAgreement == "boolean" &&
    data.payload.tosAgreement == true
      ? true
      : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    // Make sure the user does not exist already
    _data.read("users", phone, (err, data) => {
      if (err) {
        // Hash the password
        const hashedPassword = helpers.hash(password);
        //Create a user object
        if (hashedPassword) {
          const userObject = {
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            hashedPassword: hashedPassword,
            tosAgreement: true,
          };
          //Store the user
          _data.create("users", phone, userObject, (err) => {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { Error: "Could not create a new user." });
            }
          });
        } else {
          callback(500, { Error: "Could not hash the password" });
        }
      } else {
        callback(400, { Error: "User already exist." });
      }
    });
  } else {
    callback(400, { error: "Missing required fields" });
  }
};

// User method get
// Required data: phone
handlers._users.get = (data, callback) => {
  // Phone is valid
  const phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length == 10
      ? data.queryStringObject.phone.trim()
      : false;
  if (phone) {
    //Get the token from the headers
    const token =
      typeof data.headers.token == "string" ? data.headers.token : false;
    //Verify that the given token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        //Lookup the user
        _data.read("users", phone, (err, data) => {
          if (!err && data) {
            // Remove the hashed password form the user object
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404, { err: "where is the data" });
          }
        });
      } else {
        callback(403, {
          Error: "Missing requirred token in header or token is invalid",
        });
      }
    });
  } else {
    callback(400, { Error: "Missing requered field." });
  }
};

// User method put
// Requered field: phone
// Optional fields: evething else one is a must
// Todo //only auth users can update their own data
handlers._users.put = (data, callback) => {
  // Requered field exist
  const phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false;
  // Check optinion fields
  const firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  const lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  const password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  if (phone) {
    if (firstName || lastName || password) {
      //Get the token from the headers
      const token =
        typeof data.headers.token == "string" ? data.headers.token : false;
      //Verify that the given token is valid for the phone number
      handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
        if (tokenIsValid) {
          //Lookup the user
          _data.read("users", phone, (err, userData) => {
            if (!err && userData) {
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.hashedPassword = helpers.hash(password);
              }
              //Store the new updates
              _data.update("users", phone, userData, (err) => {
                if (!err) {
                  callback(200);
                } else {
                  callback(500, { Error: "Cant update the user" });
                }
              });
            } else {
              callback(400, { Error: "User does not exist" });
            }
          });
        } else {
          callback(403, {
            Error: "Missing requirred token in header or token is invalid",
          });
        }
      });
    } else {
      callback(400, { Error: "Missing fields to update" });
    }
  } else {
    callback(400, { Error: "Missing required field." });
  }
};

// User method delete
// Requered field: phone
handlers._users.delete = (data, callback) => {
  //Get the token from the headers
  const token =
    typeof data.headers.token == "string" ? data.headers.token : false;

  // Phone is valid
  const phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length == 10
      ? data.queryStringObject.phone.trim()
      : false;
  if (phone) {
    //Verify that the given token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        //Lookup the user
        _data.read("users", phone, (err, data) => {
          if (!err && data) {
            // Delete user
            _data.delete("users", phone, (err) => {
              if (!err) {
                callback(200);
              } else {
                callback(500, { Error: "Could not delete the user" });
              }
            });
          } else {
            callback(403, {
              Error: "Missing requirred token in header or token is invalid",
            });
          }
        });
      } else {
        callback(400, { err: "Could not find the user" });
      }
    });
  } else {
    callback(400, { Error: "Missing requered field." });
  }
};

// TOKENTS FUNCTIONS
//------------------------------------------------------------------------------------------------
//Tokens
handlers.tokens = (data, callback) => {
  const acceptableMethdos = ["post", "get", "put", "delete"];
  if (acceptableMethdos.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

//Container for the all tokens methods
handlers._tokens = {};

//Tokens - post
//Requered data: phone and password for the creating token
handlers._tokens.post = (data, callback) => {
  const phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false;
  const password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  if (phone && password) {
    //Look up the user that matches the phone number
    _data.read("users", phone, (err, userData) => {
      if (!err && userData) {
        //Hash the sent password and compare to password in user's object
        const hashedPassword = helpers.hash(password);
        if (hashedPassword === userData.hashedPassword) {
          //If valid set token, with expiration data 1h
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60;
          const tokenObject = {
            phone: phone,
            token: tokenId,
            expires: expires,
          };

          //Store the token
          _data.create("tokens", tokenId, tokenObject, (err) => {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, { Error: "Can't create a new token" });
            }
          });
        } else {
          callback(400, { Error: "Passwords did not match" });
        }
      } else {
        callback(400, { Error: "Could not find a user" });
      }
    });
  } else {
    callback(400, { Error: "Missing required field(s)" });
  }
};

//Tokens - get
//Required data : token
handlers._tokens.get = (data, callback) => {
  //Check token is valid
  const token =
    typeof data.queryStringObject.token == "string" &&
    data.queryStringObject.token.trim().length == 20
      ? data.queryStringObject.token.trim()
      : false;
  if (token) {
    //Lookup the token
    _data.read("tokens", token, (err, tokenData) => {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404, { err: "where is the data" });
      }
    });
  } else {
    callback(400, { Error: "Missing requered field." });
  }
};

//Tokens - put (we only allowing to extend token expiration time)
//Required data: token, extend
handlers._tokens.put = (data, callback) => {
  const token =
    typeof data.payload.token == "string" &&
    data.payload.token.trim().length == 20
      ? data.payload.token.trim()
      : false;
  const extend =
    typeof data.payload.extend == "boolean" && data.payload.extend == true
      ? true
      : false;
  if (token && extend) {
    //Look up the token
    _data.read("tokens", token, (err, tokenData) => {
      if (!err && tokenData) {
        // Check if token is not already expired
        if (tokenData.expires > Date.now()) {
          //Set the expiration an hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60;
          //Store the new updates
          _data.update("tokens", token, tokenData, (err) => {
            if (!err) {
              callback(200);
            } else {
              callback(500, {
                Error: "Could not update tokes expiration date",
              });
            }
          });
        } else {
          callback(400, { Error: "Token is expired" });
        }
      } else {
        callback(400, { Error: "Token does not exist" });
      }
    });
  } else {
    callback(400, { Error: "Missing required field(s) or invalid" });
  }
};

//Tokens - delete
//Required data: token
handlers._tokens.delete = (data, callback) => {
  // Token is valid
  const token =
    typeof data.queryStringObject.token == "string" &&
    data.queryStringObject.token.trim().length == 20
      ? data.queryStringObject.token.trim()
      : false;
  if (token) {
    //Lookup the token
    _data.read("tokens", token, (err, data) => {
      if (!err && data) {
        // Delete user
        _data.delete("tokens", token, (err) => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { Error: "Could not delete the token" });
          }
        });
      } else {
        callback(400, { err: "Could not find the token" });
      }
    });
  } else {
    callback(400, { Error: "Missing requered field." });
  }
};

//Verify if a given token is currenty valid for a given user
handlers._tokens.verifyToken = (token, phone, callback) => {
  //Look up the token
  _data.read("tokens", token, (err, tokenData) => {
    if (!err && tokenData) {
      //Check that the token is for the given user and is not expired
      if (tokenData.phone === phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

//Sample handler
handlers.ping = (data, callback) => {
  callback(406, { name: "Sample Hander" });
  //callback(200);
};

//Not found handler
handlers.notFound = (data, callback) => {
  callback(404, { error: "not found" });
};

export default handlers;
