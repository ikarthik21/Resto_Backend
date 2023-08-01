import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    item_id: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
});

const OrderSchema = new mongoose.Schema({

    orderId: {
        type: String,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    totalItems: {
        type: Number,
        required: true
    },
    status: {
        type: String
    },
    cartId: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    Items: [itemSchema]

}, { timestamps: true })


const Order = mongoose.model('Order', OrderSchema);

export default Order;
