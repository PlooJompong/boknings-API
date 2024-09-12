const { sendResponse, sendError } = require("../../responses/index");
const { db } = require("../../services/db");
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { reorderObject, getRoomsLeft } = require("../../services/utilities");

exports.handler = async () => {
  try {
    const booking = await db.send(new ScanCommand({
      TableName: 'Booking'
    }))

    const reorderBooking = booking.Items.map(reorderObject);

    const roomsLeft = await getRoomsLeft()

    if (booking.Items.length === 0) {
      return sendResponse({ RoomsLeft: roomsLeft, message: "No bookings found" });
    }

    return sendResponse({ RoomsLeft: roomsLeft, Booking: reorderBooking });

  } catch (error) {
    return sendError({ message: 'Could not get bookings', error: error.message });
  }
};