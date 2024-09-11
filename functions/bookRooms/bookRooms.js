const { sendResponse, sendError } = require("../../reponese/index");
const { db } = require("../../services/db");
const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { nanoid } = require("nanoid");
const { getRoomsLeft, getCurrentTime, calculateNight } = require("../../services/utilities");

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
    const { guests, singleRoom = 0, doubleRoom = 0, suiteRoom = 0, checkInDate, checkOutDate, guestName, guestEmail } = JSON.parse(event.body);
    const bookingId = nanoid();

    const roomAmount = singleRoom + doubleRoom + suiteRoom;

    if (!guests || !guestName || !guestEmail) {
      return sendError({ message: 'All fields are required' });
    }

    if (guests > 60) {
      return sendError({ message: 'Too many guests' });
    }

    if (roomAmount === 0) {
      return sendError({ message: 'No rooms selected' });
    }

    const roomsLeft = await getRoomsLeft();

    const numberOfNights = calculateNight(checkInDate, checkOutDate);

    if (numberOfNights <= 0) {
      return sendError({ message: 'Check out date must be after check in date' });
    }

    const price = ((singleRoom * rooms.singleRoom.price) + (doubleRoom * rooms.doubleRoom.price) + (suiteRoom * rooms.suiteRoom.price)) * numberOfNights;

    const totalCapacity = (singleRoom * rooms.singleRoom.capacity) + (doubleRoom * rooms.doubleRoom.capacity) + (suiteRoom * rooms.suiteRoom.capacity)

    if (guests > totalCapacity) {
      return sendError({ message: 'Not enough room capacity for the number of guests' });
    }

    if (roomAmount > roomsLeft) {
      return sendError({ message: `Not enough rooms available. Only ${roomsLeft} rooms left.` });
    }

    const newBooking = {
      BookingID: bookingId,
      Guest: guests,
      SingleRoom: singleRoom,
      DoubleRoom: doubleRoom,
      SuiteRoom: suiteRoom,
      CheckInDate: checkInDate,
      CheckOutDate: checkOutDate,
      DayBooked: numberOfNights,
      RoomAmount: roomAmount,
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