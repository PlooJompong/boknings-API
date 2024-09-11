const { sendResponse, sendError } = require("../../responses/index");
const { db } = require("../../services/db");
const { UpdateCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { reorderObject, getRoomsLeft, getCurrentTime, calculateNight } = require("../../services/utilities");
const { rooms } = require("../../services/roomsData");

exports.handler = async (event) => {
  try {
    const bookingID = event.pathParameters && event.pathParameters.id;
    const { guests, singleRoom = 0, doubleRoom = 0, suiteRoom = 0, checkInDate, checkOutDate } = JSON.parse(event.body);

    if (!bookingID) {
      return sendError({ message: "Booking ID is required" });
    }

    const currentBooking = await db.send(new GetCommand({
      TableName: 'Booking',
      Key: {
        BookingID: bookingID
      }
    }));

    if (!currentBooking.Item) {
      return sendError({ message: "Booking not found" });
    }

    if (!guests || !checkInDate || !checkOutDate) {
      return sendError({ message: 'Guest, Check-In date and Check-Out date are required' });
    }

    const currentRoomAmount = currentBooking.Item.RoomAmount
    const newRoomAmount = singleRoom + doubleRoom + suiteRoom;

    if (guests > 60) {
      return sendError({ message: 'Too many guests' });
    }

    if (newRoomAmount === 0) {
      return sendError({ message: 'No rooms selected' });
    }

    const roomsLeft = await getRoomsLeft();

    const roomDifference = newRoomAmount - currentRoomAmount;

    if (roomDifference > 0 && roomDifference > roomsLeft) {
      return sendError({ message: `Not enough rooms available. Only ${roomsLeft} rooms left.` });
    }

    const numberOfNights = calculateNight(checkInDate, checkOutDate);

    if (getCurrentTime() > checkInDate) {
      return sendError({ message: 'Check-in date must be in the future' });
    }

    if (numberOfNights <= 0) {
      return sendError({ message: 'Check-Out date must be after Check-In date' });
    }

    const price = ((singleRoom * rooms.singleRoom.price) + (doubleRoom * rooms.doubleRoom.price) + (suiteRoom * rooms.suiteRoom.price)) * numberOfNights;

    const totalCapacity = (singleRoom * rooms.singleRoom.capacity) + (doubleRoom * rooms.doubleRoom.capacity) + (suiteRoom * rooms.suiteRoom.capacity)

    if (guests > totalCapacity) {
      return sendError({ message: 'Not enough room capacity for the number of guests' });
    }

    const result = await db.send(new UpdateCommand({
      TableName: 'Booking',
      Key: {
        BookingID: bookingID
      },
      UpdateExpression: `SET Guests = :guests, SingleRoom = :singleRoom, DoubleRoom = :doubleRoom, SuiteRoom = :suiteRoom, CheckInDate = :checkInDate, CheckOutDate = :checkOutDate, DayBooked = :numberOfNights, RoomAmount = :roomAmount, Price = :price`,
      ExpressionAttributeValues: {
        ':guests': guests,
        ':singleRoom': singleRoom,
        ':doubleRoom': doubleRoom,
        ':suiteRoom': suiteRoom,
        ':checkInDate': checkInDate,
        ':checkOutDate': checkOutDate,
        ':numberOfNights': numberOfNights,
        ':roomAmount': newRoomAmount,
        ':price': price
      },
      ReturnValues: 'ALL_NEW'
    }));

    const reorderBooking = reorderObject(result.Attributes);

    return sendResponse({ updatedBooking: reorderBooking });

  } catch (error) {
    return sendError({ message: 'Could not update booking', error: error.message });
  }
};
