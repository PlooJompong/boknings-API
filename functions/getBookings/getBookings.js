const { sendResponse, sendError } = require("../../reponses/index");
const { db } = require("../../services/db");
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");

exports.handler = async () => {
  try {
    const booking = await db.send(new ScanCommand({
      TableName: 'Booking'
    }))

    return sendResponse(booking.Items);

  } catch (error) {
    return sendError({ message: 'Could not get bookings', error: error.message });
  }
};