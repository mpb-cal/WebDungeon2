'use strict';

/* eslint-disable no-console */

const fs = require('fs');


/**
 *  Reads a files.
 *  @param {string} file - The name (full path) of the file.
 *  @returns {array} - An array of lines.
 */
function readLines(file) {
  return fs.readFileSync(file, 'utf8').split('\n');
}


function readJSONFile(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}


function writeJSONFile(file, object) {
  fs.writeFileSync(file, JSON.stringify(object, null, 1));
}


const dump = (function(obj) {
  let depth = 0;
  return function dump(obj) {
    depth++;
    if (obj) {
      console.log(depth);
      console.log(Object.getOwnPropertyNames(obj));
      dump(Object.getPrototypeOf(obj));
    }
    depth--;
  };
})();


module.exports = {
  readJSONFile: readJSONFile,
  writeJSONFile: writeJSONFile,
  dump: dump,
};


