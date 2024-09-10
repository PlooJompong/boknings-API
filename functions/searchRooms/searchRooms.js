const { sendResponse, sendError } = require("../../reponses/index");
const { db } = require("../../services");
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");

exports.handler = async (event) => {
  try {
    const { maxGuests, roomType, guestName, guestEmail } = JSON.parse(event.body);

    const roomsData = await db.send(new ScanCommand({
      TableName: 'Rooms'
    }))

    // const totalGuests = roomsData.Items.reduce((total, room) => total + room.MaxGuests, 0);

    if (maxGuests !== 0) {
      const matchingMaxGuests = roomsData.Items.filter((room) =>
        room.MaxGuests <= maxGuests &&
        room.Available === true &&
        (roomType && roomType.length > 0 ? roomType.includes(room.RoomType) : true));

      if (matchingMaxGuests.length > 0) {
        return sendResponse({ matchingMaxGuests, AvailableRooms: matchingMaxGuests.length });

      } else {
        return sendResponse({
          message: 'No rooms found'
        });
      }
    }

  } catch (error) {
    return sendError({ message: 'Could not get Rooms', error: error });
  }
};