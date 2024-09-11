const { sendResponse, sendError } = require("../../reponses/index");
const { db } = require("../../services/db");
const { GetCommand } = require("@aws-sdk/lib-dynamodb");

exports.handler = async (event) => {
  try {
    const bookingID = event.pathParameters && event.pathParameters.id

    if (!bookingID) {
      return sendError({ message: "Booking ID is required" });
    }

    const result = await db.send(new GetCommand({
      TableName: 'Booking',
      Key: {
        BookingID: bookingID
      }
    }))

    if (!result.Item) {
      return sendError({ message: "Booking not found" });
    }

    return sendResponse(result.Item);

  } catch (error) {
    return sendError({ message: 'Could not delete booking', error: error.message });
  }
}