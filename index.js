require("dotenv").config();


exports.handler = async (event) => {
  try {
    let response = {
      statusCode: 200,
      body: `Lambda Test Function`,
    };
    return response;
  } catch (error) {
    console.log("Error in try catch", error);
    return error;
  }
};

this.event;
