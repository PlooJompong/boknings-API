const { sendResponse, sendError } = require("../../responses/index");
const { db } = require("../../services/db");
const { DeleteCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { getCurrentTime } = require("../../services/utilities");

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

    const currentTime = new Date(getCurrentTime()).getTime()
    const checkInDate = new Date(booking.Item.CheckInDate).getTime();

    const twoDaysBefore = new Date(checkInDate);
    twoDaysBefore.setDate(twoDaysBefore.getDate() - 2);

    if (currentTime > twoDaysBefore.getTime()) {
      return sendError({ message: "Booking is less than 2 days away, cannot be deleted" });
    }

    await db.send(new DeleteCommand({
      TableName: 'Booking',
      Key: { BookingID: bookingID }
    }))

    return sendResponse({ message: `BookingID ${bookingID} deleted successfully` });

  } catch (error) {
    return sendError({ message: 'Could not delete booking', error: error.message });
  }
}