'use strict';

module.exports.hello = async event => {
  try {
    return {
      statusCode: 200,
      body: `Lambda Test Function`
    };

  } catch (error) {
    console.log("Error in try catch", error);
    return error;
  }
};
