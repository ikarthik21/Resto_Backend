import mongoose from "mongoose";


const BookingSchema = new mongoose.Schema({

    date: {
        type: String,
        required: true,
    },
    starttime: {
        type: String,
        required: true,
    },
    endtime: {
        type: String,
        required: true,
    },

});

const TableSchema = new mongoose.Schema({
    tableId: {
        type: String,
    },
    tableno: {
        type: Number,
    },
    version: {
        type: Number,
    },
    bookings: [BookingSchema]

});



const Tables = mongoose.model('table', TableSchema);

export default Tables;