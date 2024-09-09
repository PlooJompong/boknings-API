const { error } = require("console");

function sendResponse(data) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data }),
  };
};

function sendError(data) {
  return {
    statusCode: 400,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data, error: error }),
  };
};

module.exports = { sendResponse, sendError }