const { sendResponse, sendError } = require("../../responses/index");
const { db } = require("../../services/db");
const { GetCommand } = require("@aws-sdk/lib-dynamodb");
const { reorderObject } = require("../../services/utilities");

exports.handler = async (event) => {
  try {
    const bookingID = event.pathParameters && event.pathParameters.id

    if (!bookingID) {
      return sendError({ message: "Booking ID is required" });
    }

    const booking = await db.send(new GetCommand({
      TableName: 'Booking',
      Key: { BookingID: bookingID }
    }))

    if (!booking.Item) {
      return sendError({ message: "Booking not found" });
    }

    const reorderBooking = reorderObject(booking.Item);

    return sendResponse({ Booking: reorderBooking });

  } catch (error) {
    return sendError({ message: 'Could not delete booking', error: error.message });
  }
}