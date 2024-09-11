const { sendResponse, sendError } = require("../../reponses/index");
const { db } = require("../../services/db");
const { DeleteCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

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

    await db.send(new DeleteCommand({
      TableName: 'Booking',
      Key: {
        BookingID: bookingID
      },
    }))

    return sendResponse({ message: "Booking deleted successfully" });
  } catch (error) {
    return sendError({ message: 'Could not delete booking', error: error.message });
  }
}