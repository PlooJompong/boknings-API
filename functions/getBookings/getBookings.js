const { sendResponse, sendError } = require("../../reponese/index");
const { db } = require("../../services/db");
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { getRoomsLeft } = require("../../services/utilities");

const reorderObject = (item) => {
  return {
    BookingID: item.BookingID,
    Guest: item.Guest,
    SingleRoom: item.SingleRoom,
    DoubleRoom: item.DoubleRoom,
    SuiteRoom: item.SuiteRoom,
    CheckInDate: item.CheckInDate,
    CheckOutDate: item.CheckOutDate,
    DayBooked: item.DayBooked,
    RoomAmount: item.RoomAmount,
    Price: item.Price,
    GuestName: item.GuestName,
    GuestEmail: item.GuestEmail,
    CreateAt: item.CreateAt
  };
};

exports.handler = async () => {
  try {
    const booking = await db.send(new ScanCommand({
      TableName: 'Booking'
    }))

    const reorderBooking = booking.Items.map(reorderObject);

    const roomsLeft = await getRoomsLeft()

    return sendResponse({ RoomsLeft: roomsLeft, Booking: reorderBooking });

  } catch (error) {
    return sendError({ message: 'Could not get bookings', error: error.message });
  }
};