const { sendError } = require("../reponese/index");
const { db } = require("./db");
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { format } = require("date-fns");

async function getRoomsLeft() {
  try {
    const bookings = await db.send(new ScanCommand({
      TableName: 'Booking'
    }));

    const bookedRooms = bookings.Items.reduce((total, booking) => {
      return total + (booking.SingleRoom || 0) + (booking.DoubleRoom || 0) + (booking.SuiteRoom || 0);
    }, 0);

    const maxRooms = 20;
    return maxRooms - bookedRooms;

  } catch (error) {
    return sendError({ message: 'Could not get rooms left', error: error.message });
  }
}

function getCurrentTime() {
  return format(new Date(), 'yyyy-MM-dd HH:mm:ss');
}

function calculateNight(checkInDate, checkOutDate) {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const timeDiff = checkOut - checkIn
  return Math.ceil(timeDiff) / (1000 * 3600 * 24)
}

module.exports = { getRoomsLeft, getCurrentTime, calculateNight };