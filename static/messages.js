'use strict';

const MODULE_NAME = 'messages';

(function(exports){

  exports.COMMAND_MESSAGE = 'command_message';
  exports.RESPONSE_MESSAGE = 'response_message';
  exports.ALERT_MESSAGE = 'alert_message';

})(typeof exports === 'undefined' ? this[MODULE_NAME] = {} : exports);


