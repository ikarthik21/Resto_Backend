import mongoose from "mongoose";

const MenuSchema = new mongoose.Schema({

    item_id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    }

}, { timestamps: true });

const Menu = new mongoose.model("menu", MenuSchema);

export default Menu;