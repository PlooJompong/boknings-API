const { sendResponse, sendError } = require("../../responses/index");
const { db } = require("../../services/db");
const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { nanoid } = require("nanoid");
const { getRoomsLeft, getCurrentTime } = require("../../services/utilities");
const { bookingValidation } = require("../../services/validations");

exports.handler = async (event) => {
  try {
    const { guests, singleRoom = 0, doubleRoom = 0, suiteRoom = 0, checkInDate, checkOutDate, guestName, guestEmail } = JSON.parse(event.body);
    const bookingId = nanoid();

    const { error: inputError, numberOfNights, price, totalCapacity } = bookingValidation(guests, singleRoom, doubleRoom, suiteRoom, checkInDate, checkOutDate, guestName, guestEmail);

    if (inputError) {
      return sendError({ message: inputError });
    }

    const roomAmount = singleRoom + doubleRoom + suiteRoom;
    const roomsLeft = await getRoomsLeft();

    if (guests > totalCapacity) {
      return sendError({ message: 'Not enough room capacity for the number of guests' });
    }

    if (roomAmount > roomsLeft) {
      return sendError({ message: `Not enough rooms available. Only ${roomsLeft} rooms left.` });
    }

    const newBooking = {
      BookingID: bookingId,
      Guests: guests,
      SingleRoom: singleRoom,
      DoubleRoom: doubleRoom,
      SuiteRoom: suiteRoom,
      RoomAmount: roomAmount,
      CheckInDate: checkInDate,
      CheckOutDate: checkOutDate,
      DayBooked: numberOfNights,
      Price: price,
      GuestName: guestName,
      GuestEmail: guestEmail,
      CreateAt: getCurrentTime()
    };

    await db.send(new PutCommand({
      TableName: 'Booking',
      Item: newBooking
    }));

    return sendResponse({ newBooking, message: 'Booking created successfully' });

  } catch (error) {
    return sendError({ message: 'Could not create booking', error: error.message });
  }
};