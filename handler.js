const moment = require("moment");

module.exports.logger = async event => {
  try {
    return {
      statusCode: 200,
      body: JSON.stringify({

        message: "Lambda Test Function",
        version: "v1.0",
        timestamp: moment().unix()
      })
    };

  } catch (error) {
    console.log("Error in try catch", error);
    return error;
  }
};
