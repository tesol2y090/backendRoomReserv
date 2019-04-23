const express = require('express')
const cors = require('cors')
const firebase = require('firebase')

const configServer = require('./config.json');
const port = process.env.PORT || 4000;

const config = {
    apiKey: configServer.apiKey,
    authDomain: configServer.authDomain,
    databaseURL: configServer.databaseURL,
    storageBucket: configServer.storageBucket,
};

firebase.initializeApp(config);
const database = firebase.database(); 

const app = express()

app.use(cors());
app.use(express.json())

function isValid(room) {
    return room.roomid && room.roomid.toString().trim() !== "" &&
    room.Abuildingselect && room.Abuildingselect.toString().trim() !== "" &&
    room.Broomselect && room.Broomselect.toString().trim() !== "" &&
    room.Dfacilities && room.Dfacilities.toString().trim() !== ""

}

function isValidBookings(booking) {
    return booking.bookId && booking.bookId.toString().trim() !== "" &&
    booking.AstudentId && booking.AstudentId.toString().trim() !== "" &&
    booking.Creason && booking.Creason.toString().trim() !== ""
}

function isValidBookId(book) {
    return book.bookId && book.bookId.toString().trim() !== ""
}

function wirteData(roomid, buildingselect, roomselect, amount, facilities) {

    // Set room detail to rooms
    database.ref('rooms/' + roomid).set({
        Abuildingselect: buildingselect,
        Broomselect: roomselect,
        Camount: amount,
        Dfacilities: facilities
    });

    // Set time detail to reserv
    const timetable = [false, false, false, false, false, false, false, false,]
    database.ref('roomsReserv/' + roomid).set({
        "20|04|2562": timetable,
        "21|04|2562": timetable,
        "22|04|2562": timetable,
        "23|04|2562": timetable,
        "24|04|2562": timetable
    })
}

function writeBooking(bookId, studentId, timeSelect, reason) {
    database.ref('bookings/' + bookId).set({
        AstudentId : studentId,
        BtimeSelect: timeSelect,
        Creason: reason,
        DisApprove: false
    })
}

function approveRoom(bookId) {
    database.ref('bookings/' + bookId + '/DisApprove').set(true);
}

app.get('/', (req, res) => {
    res.json({
        message: 'Room Reservation'
    });
});

app.get('/rooms', (req, res) => {
    database.ref().once('value').then((snapShot) => {
        const rooms = snapShot.val();
        res.json(rooms)
    })
});

app.get('/bookings', (req, res) => {
    database.ref().once('value').then((snapShot) => {
        const rooms = snapShot.val();
        res.json(rooms)
    })
});

app.post('/rooms', (req, res) => {
    if(isValid(req.body)) {
        const room = {
            roomid: req.body.roomid.toString(),
            Abuildingselect: req.body.Abuildingselect.toString(),
            Broomselect: req.body.Broomselect.toString(),
            Camount: req.body.Camount.toString(),
            Dfacilities: req.body.Dfacilities.toString()
        }
        wirteData(room.roomid, room.Abuildingselect, room.Broomselect, room.Camount, room.Dfacilities);
    } else {
        res.status(422);
        res.json({
            message: `Name And Content are required`
        });
    }
});


app.post('/bookings', (req, res) => {
    if(isValidBookings(req.body)) {
        const booking = {
            bookId: req.body.bookId.toString(),
            AstudentId: req.body.AstudentId.toString(),
            BtimeSelect: req.body.BtimeSelect.toString(),
            Creason: req.body.Creason.toString()
        }
        writeBooking(booking.bookId, booking.AstudentId, booking.BtimeSelect, booking.Creason);
    } else {
        res.status(422);
        res.json({
            message: `Name And Content are required`
        });
    }
});

app.post('/approve', (req, res) => {
    if(isValidBookId(req.body)) {
        const bookId = req.body.bookId;
        approveRoom(bookId);
    } else {
        res.status(422);
        res.json({
            message: `Name And Content are required`
        });
    }
});

app.listen(port, () => {
    console.log('Listen on Backend')
})
