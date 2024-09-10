const { sendResponse, sendError } = require("../../reponses/index");
const { db } = require("../../services/index");
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");

exports.handler = async (event) => {
  try {
    const { maxGuests, roomType, guestName, guestEmail } = JSON.parse(event.body);

    const roomsData = await db.send(new ScanCommand({
      TableName: 'Rooms'
    }))

    // const totalGuests = roomsData.Items.reduce((total, room) => total + room.MaxGuests, 0);

    if (maxGuests !== "") {

      const matchingMaxGuests = roomsData.Items.filter((room) => room.MaxGuests <= maxGuests && room.Available === false && (roomType ? room.RoomType === roomType : true));

      if (matchingMaxGuests.length > 0) {
        return sendResponse({ matchingMaxGuests, Count: matchingMaxGuests.length });

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