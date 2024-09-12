const { sendResponse, sendError } = require("../../responses/index");
const { db } = require("../../services/db");
const { UpdateCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { reorderObject, getRoomsLeft } = require("../../services/utilities");
const { updateValidation } = require("../../services/validations");

exports.handler = async (event) => {
  try {
    const bookingID = event.pathParameters && event.pathParameters.id;

    if (!bookingID) {
      return sendError({ message: "Booking ID is required" });
    }

    const currentBooking = await db.send(new GetCommand({
      TableName: 'Booking',
      Key: { BookingID: bookingID }
    }));

    if (!currentBooking.Item) {
      return sendError({ message: "Booking not found" });
    }

    if (event.body === undefined || event.body === null || event.body.trim() === "") {
      return sendError({ message: "Please don't try to hack, just provide valid booking details :)" });
    }

    let { guests, singleRoom, doubleRoom, suiteRoom, checkInDate, checkOutDate } = JSON.parse(event.body);

    singleRoom = singleRoom !== undefined ? singleRoom : currentBooking.Item.SingleRoom;
    doubleRoom = doubleRoom !== undefined ? doubleRoom : currentBooking.Item.DoubleRoom;
    suiteRoom = suiteRoom !== undefined ? suiteRoom : currentBooking.Item.SuiteRoom;

    const { error: inputError, numberOfNights, price, totalCapacity } = updateValidation(
      guests,
      singleRoom,
      doubleRoom,
      suiteRoom,
      checkInDate,
      checkOutDate
    );

    if (inputError) {
      return sendError({ message: inputError });
    }

    const currentRoomAmount = currentBooking.Item.RoomAmount;
    const newRoomAmount = singleRoom + doubleRoom + suiteRoom;

    const roomsLeft = await getRoomsLeft();
    const roomDifference = newRoomAmount - currentRoomAmount;

    if (roomDifference > 0 && roomDifference > roomsLeft) {
      return sendError({ message: `Not enough rooms available. Only ${roomsLeft} rooms left.` });
    }

    if (guests > totalCapacity) {
      return sendError({ message: 'Not enough room capacity for the number of guests' });
    }

    const result = await db.send(new UpdateCommand({
      TableName: 'Booking',
      Key: { BookingID: bookingID },
      UpdateExpression: `SET Guests = :guests, SingleRoom = :singleRoom, DoubleRoom = :doubleRoom, SuiteRoom = :suiteRoom, CheckInDate = :checkInDate, CheckOutDate = :checkOutDate, DayBooked = :numberOfNights, RoomAmount = :roomAmount, Price = :price`,
      ExpressionAttributeValues: {
        ':guests': guests,
        ':singleRoom': singleRoom,
        ':doubleRoom': doubleRoom,
        ':suiteRoom': suiteRoom,
        ':roomAmount': newRoomAmount,
        ':checkInDate': checkInDate,
        ':checkOutDate': checkOutDate,
        ':numberOfNights': numberOfNights,
        ':price': price
      },
      ReturnValues: 'ALL_NEW'
    }));

    const updatedBooking = reorderObject(result.Attributes);

    return sendResponse({ updatedBooking });

  } catch (error) {
    return sendError({ message: 'Could not update booking', error: error.message });
  }
};