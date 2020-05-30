'use strict'
const moment = require("moment");

module.exports.logger = async event => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Lambda Test Function",
      version: "v3.0",
      timestamp: moment().unix()
    })
  };
};
