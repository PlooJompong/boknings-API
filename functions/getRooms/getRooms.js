const { sendResponse, sendError } = require("../../reponses/index");
const { db } = require("../../services/index");
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");

exports.handler = async () => {
  try {
    const rooms = await db.send(new ScanCommand({
      TableName: 'RoomTypes'
    }))

    return sendResponse(rooms.Items);

  } catch (error) {
    return sendError({ message: 'Could not get Rooms', error: error });
  }
};