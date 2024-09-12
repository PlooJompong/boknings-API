const { getCurrentTime, calculateNight } = require("./utilities");
const { rooms } = require("./roomsData");

function nameValidation(name) {
  const re = /^[a-zA-Z\s]+$/;
  return re.test(String(name).trim())
}

function emailValidation(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase())
}

function bookingValidation(guests, singleRoom, doubleRoom, suiteRoom, checkInDate, checkOutDate, guestName, guestEmail) {
  if (!guests || !checkInDate || !checkOutDate || !guestName || !guestEmail) {
    return { error: "All fields (Guests, Check-In date, Check-Out date, Guest Name, and Guest Email) are required" };
  }

  if (!nameValidation(guestName)) {
    return { error: "Invalid name" };
  }

  if (!emailValidation(guestEmail)) {
    return { error: "Invalid email address" };
  }

  return checkBookingInfo(guests, singleRoom, doubleRoom, suiteRoom, checkInDate, checkOutDate);
}

function updateValidation(guests, singleRoom, doubleRoom, suiteRoom, checkInDate, checkOutDate) {
  if (!guests || !checkInDate || !checkOutDate) {
    return { error: "Guest Amount, Check-In date, Check-Out date are required" };
  }

  return checkBookingInfo(guests, singleRoom, doubleRoom, suiteRoom, checkInDate, checkOutDate);
}

function checkBookingInfo(guests, singleRoom, doubleRoom, suiteRoom, checkInDate, checkOutDate) {

  const roomAmount = singleRoom + doubleRoom + suiteRoom;

  if (guests > 60) {
    return { error: "Too many guests" };
  }

  if (roomAmount === 0) {
    return { error: "No rooms selected" };
  }

  const numberOfNights = calculateNight(checkInDate, checkOutDate);
  if (numberOfNights <= 0) {
    return { error: "Check-Out date must be after Check-In date" };
  }

  const currentTime = new Date(getCurrentTime()).getTime();
  const checkInTime = new Date(checkInDate).getTime();

  if (checkInTime <= currentTime) {
    return { error: "Check-in date must be in the future" };
  }

  const price = (
    (singleRoom * rooms.singleRoom.price) +
    (doubleRoom * rooms.doubleRoom.price) +
    (suiteRoom * rooms.suiteRoom.price)
  ) * numberOfNights;

  // Calculate the total room capacity
  const totalCapacity = (
    (singleRoom * rooms.singleRoom.capacity) +
    (doubleRoom * rooms.doubleRoom.capacity) +
    (suiteRoom * rooms.suiteRoom.capacity)
  );

  return { numberOfNights, price, totalCapacity };
}

module.exports = { bookingValidation, updateValidation };