import { open, writeFile, close, readFile, ftruncate, unlink } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import helpers from "./helpers.js";

//Container
const lib = {};

//Base dir for the datat folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

lib.baseDir = join(__dirname, "/../.data/");

//write data to the file
lib.create = (dir, file, data, callback) => {
  open(
    lib.baseDir + dir + "/" + file + ".json",
    "wx",
    (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        //Convert data to a string
        const sringData = JSON.stringify(data);
        //Write to file and close it
        writeFile(fileDescriptor, sringData, (err) => {
          if (!err) {
            close(fileDescriptor, (err) => {
              if (!err) {
                callback(false);
              } else {
                callback("Error closing new file.");
              }
            });
          } else {
            callback("Error writing to a new file");
          }
        });
      } else {
        callback("Could not create a file, it may alrealy exist");
      }
    }
  );
};

// Read data from the file
lib.read = (dir, file, callback) => {
  readFile(lib.baseDir + dir + "/" + file + ".json", "utf8", (err, data) => {
    if (!err && data) {
      const parsedData = helpers.parseJsonToObject(data);
      callback(false, parsedData);
    } else {
      callback(err, data);
    }
  });
};

// Update file data
lib.update = (dir, file, data, callback) => {
  open(
    lib.baseDir + dir + "/" + file + ".json",
    "r+",
    (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        //Convert data to a string
        const sringData = JSON.stringify(data);
        // Truncate the file
        ftruncate(fileDescriptor, (err) => {
          if (!err) {
            //write to the file and close it
            writeFile(fileDescriptor, sringData, (err) => {
              if (!err) {
                close(fileDescriptor, (err) => {
                  if (!err) {
                    callback(false);
                  } else {
                    callback("Error closing the file");
                  }
                });
              } else {
                callback("Error writing tp existing file");
              }
            });
          } else {
            callback("Error truncating the file");
          }
        });
      } else {
        callback("Could not open file for update, it could not exist yet");
      }
    }
  );
};

//Delete file
lib.delete = (dir, file, callback) => {
  //Unlink
  unlink(lib.baseDir + dir + "/" + file + ".json", (err) => {
    if (!err) {
      callback(false);
    } else {
      callback("Can not delete the file, file may not exist");
    }
  });
};

export default lib;
