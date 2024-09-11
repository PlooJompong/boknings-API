const { sendResponse, sendError } = require("../../reponses/index");
const { db } = require("../../services/db");
const { PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { nanoid } = require("nanoid");

exports.handler = async (event) => {
  try {
    const { guests, roomType, roomAmount, guestName, guestEmail } = JSON.parse(event.body);
    const bookingId = nanoid();

    const bookings = await db.send(new ScanCommand({
      TableName: 'Booking'
    }));

    if (bookings.Items && bookings.Count < 20) {

      const newBooking = {
        BookingID: bookingId,
        Guest: guests,
        RoomType: roomType,
        RoomAmout: roomAmount,
        GuestName: guestName,
        GuestEmail: guestEmail
      };

      await db.send(new PutCommand({
        TableName: 'Booking',
        Item: newBooking
      }));

      return sendResponse({ newBooking, message: 'Booking successfully' });
    } else {
      return sendResponse({ message: 'Booking limit reached, cannot create more bookings' });
    }

  } catch (error) {
    return sendError({ message: 'Could not create booking', error: error.message });
  }
};