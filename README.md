## Bonzai API

The Bonzai API manages hotel room bookings, allowing users to create, retrieve, update, and delete reservations. It ensures room availability, guest capacity, and pricing based on room types (Single, Double, Suite). The API includes validation checks for guest limits, email format, and prevents deletions within 2 days of check-in.

```
Room capacity and price per night:
  {
    "singleRoom": {
      "capacity": 1,
      "price": 500
    },
    "doubleRoom": {
      "capacity": 2,
      "price": 1000
    },
    "suiteRoom": {
      "capacity": 3,
      "price": 1500
    }
  }
```

##### Get All Bookings

- GET https://95qroyn3ph.execute-api.eu-north-1.amazonaws.com/bookings

```
response:
  {
    "data": {
      "RoomsLeft": 19,
      "Booking": [
        {
          "BookingID": "XOHrNyJUeGvAdEdR-77q6",
          "Guests": 2,
          "SingleRoom": 0,
          "DoubleRoom": 0,
          "SuiteRoom": 1,
          "RoomAmount": 1,
          "CheckInDate": "2024-09-13",
          "CheckOutDate": "2024-09-18",
          "DayBooked": 5,
          "Price": 7500,
          "GuestName": "John Doe",
          "GuestEmail": "jd@heheh.com",
          "CreateAt": "2024-09-12 14:10:47"
        }
      ]
    }
  }

```

##### Get One Booking

- GET https://95qroyn3ph.execute-api.eu-north-1.amazonaws.com/bookings/{id}

```
response:
  {
    "data": {
      "Booking": {
        "BookingID": "XOHrNyJUeGvAdEdR-77q6",
        "Guests": 2,
        "SingleRoom": 0,
        "DoubleRoom": 0,
        "SuiteRoom": 1,
        "RoomAmount": 1,
        "CheckInDate": "2024-09-13",
        "CheckOutDate": "2024-09-18",
        "DayBooked": 5,
        "Price": 7500,
        "GuestName": "John Doe",
        "GuestEmail": "jd@heheh.com",
        "CreateAt": "2024-09-12 14:10:47"
      }
    }
  }
```

##### Create Booking

- POST https://95qroyn3ph.execute-api.eu-north-1.amazonaws.com/booking

```
body:
  {
    "guests": 2,
    "singleRoom": 0,
    "doubleRoom": 0,
    "suiteRoom": 1,
    "checkInDate": "2024-09-13",
    "checkOutDate": "2024-09-18",
    "guestName": "John Doe",
    "guestEmail": "jd@heheh.com"
  }

 Required: guests, checkInDate, checkOutDate, guestName, guestEmail and atleast one room with right capacity

```

```
response:
  {
    "data": {
    "newBooking": {
      "BookingID": "XOHrNyJUeGvAdEdR-77q6",
      "Guests": 2,
      "SingleRoom": 0,
      "DoubleRoom": 0,
      "SuiteRoom": 1,
      "RoomAmount": 1,
      "CheckInDate": "2024-09-13",
      "CheckOutDate": "2024-09-18",
      "DayBooked": 5,
      "Price": 7500,
      "GuestName": "John Doe",
      "GuestEmail": "jd@heheh.com",
      "CreateAt": "2024-09-12 14:10:47"
    },
    "message": "Booking created successfully"
  }
}
```

##### Update Booking

- PUT https://95qroyn3ph.execute-api.eu-north-1.amazonaws.com/booking/{id}

```
body:
  {
    "guests": 2,
    "doubleRoom": 1,
    "suiteRoom": 0,
    "checkInDate": "2024-09-16",
    "checkOutDate": "2024-09-21"
  }

 Required: guests, checkInDate, checkOutDate
```

```
response:
  {
    "data": {
      "updatedBooking": {
        "BookingID": "XOHrNyJUeGvAdEdR-77q6",
        "Guests": 2,
        "SingleRoom": 0,
        "DoubleRoom": 1,
        "SuiteRoom": 0,
        "RoomAmount": 1,
        "CheckInDate": "2024-09-16",
        "CheckOutDate": "2024-09-21",
        "DayBooked": 5,
        "Price": 5000,
        "GuestName": "John Doe",
        "GuestEmail": "jd@heheh.com",
        "CreateAt": "2024-09-12 14:10:47"
      }
    }
  }
```

##### Delete Booking

- DELETE https://95qroyn3ph.execute-api.eu-north-1.amazonaws.com/booking/{id}

```
response:
  {
    "data": {
      "message": "BookingID XOHrNyJUeGvAdEdR-77q6 deleted successfully"
    }
  }

Bookings with check-in date less than 2 days away, cannot be deleted
```
