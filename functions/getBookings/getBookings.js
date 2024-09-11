const { sendResponse, sendError } = require("../../reponses/index");
const { db } = require("../../services/db");
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");

exports.handler = async () => {
  try {
    const booking = await db.send(new ScanCommand({
      TableName: 'Booking'
    }))

    return sendResponse({ Count: booking.Count, Booking: booking.Items });

  } catch (error) {
    return sendError({ message: 'Could not get bookings', error: error.message });
  }
};