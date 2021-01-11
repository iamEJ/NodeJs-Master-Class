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
// Requared data: phone
handlers._users.get = (data, callback) => {
  // Phone is valid
  const phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length == 10
      ? data.queryStringObject.phone.trim()
      : false;
  if (phone) {
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
      callback(400, { Error: "Missing fields to update" });
    }
  } else {
    callback(400, { Error: "Missing required field." });
  }
};

// User method delete
// Requered field: phone
handlers._users.delete = (data, callback) => {
  // Phone is valid
  const phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length == 10
      ? data.queryStringObject.phone.trim()
      : false;
  if (phone) {
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
        callback(200, data);
      } else {
        callback(400, { err: "Could not find the user" });
      }
    });
  } else {
    callback(400, { Error: "Missing requered field." });
  }
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
