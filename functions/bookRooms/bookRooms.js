const { sendResponse, sendError } = require("../../reponses/index");
const { db } = require("../../services/db");
const { PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { nanoid } = require("nanoid");

const rooms = {
  singleRoom: {
    price: 500,
    capacity: 1
  },
  doubleRoom: {
    price: 1000,
    capacity: 2
  },
  suiteRoom: {
    price: 1500,
    capacity: 3
  }
}

exports.handler = async (event) => {
  try {
    const { guests, singleRoom, doubleRoom, suiteRoom, guestName, guestEmail } = JSON.parse(event.body);
    const bookingId = nanoid();

    const roomAmount = (singleRoom || 0) + (doubleRoom || 0) + (suiteRoom || 0);

    if (!guests || !guestName || !guestEmail) {
      return sendError({ message: 'All fields are required' });
    }

    if (guests > 60) {
      return sendError({ message: 'Too many guests' });
    }

    if (roomAmount === 0) {
      return sendError({ message: 'No rooms selected' });
    }

    const bookings = await db.send(new ScanCommand({
      TableName: 'Booking'
    }));

    const bookedRooms = bookings.Items.reduce((total, booking) => {
      return total + (booking.SingleRoom || 0) + (booking.DoubleRoom || 0) + (booking.SuiteRoom || 0);
    }, 0);

    const maxRooms = 20;
    const roomsLeft = maxRooms - bookedRooms;

    if (roomAmount > roomsLeft) {
      return sendError({ message: `Not enough rooms available. Only ${roomsLeft} rooms left.` });
    }

    const newBooking = {
      BookingID: bookingId,
      Guest: guests,
      SingleRoom: singleRoom || 0,
      DoubleRoom: doubleRoom || 0,
      SuiteRoom: suiteRoom || 0,
      RoomAmount: roomAmount,
      // Price: 
      GuestName: guestName,
      GuestEmail: guestEmail
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