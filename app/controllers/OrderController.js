
import Menu from "../models/MenuSchema.js";
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config()
import Order from "../models/OrderSchema.js";
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import UserRegister from "../models/UserSchema.js";



const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});



const OrderController = () => {

    return {
        async createOrder(req, res) {

            const token = req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
            const { username } = decoded;

            const { Items, totalItems, cartId } = req.body;
            const OrderPres = await Order.findOne({ $and: [{ cartId: cartId }, { status: "payment pending" }] });

            if (OrderPres) {
                return res.status(200).json({ orderId: OrderPres.orderId, amount: OrderPres.totalPrice });
            }
            else {

                let totalPrice = 0;

                const MenuItems = await Menu.find({});

                for (const cartItem of Items) {
                    const menuItem = MenuItems.find(item => item.item_id === cartItem.item_id);
                    if (menuItem) {
                        totalPrice += menuItem.price * cartItem.quantity;
                    }
                }

                // Create an order in Razorpay
                const razorpayOrder = await razorpay.orders.create({
                    amount: totalPrice * 100,
                    currency: 'INR',
                });

                try {

                    const user_get = await UserRegister.findOne({ _id: username }, { name: 1, email: 1, phone: 1 })
                    const order = new Order({
                        orderId: razorpayOrder.id,
                        totalPrice: totalPrice,
                        status: "payment pending",
                        totalItems: totalItems,
                        Items: Items,
                        cartId: cartId,
                        name: user_get.name,
                        email: user_get.email,
                        phone: user_get.phone,
                    });

                    await order.save();
                    res.json({
                        orderId: razorpayOrder.id,
                        amount: totalPrice,
                    });
                }
                catch (error) {
                    console.log(error);
                }

            }
        },

        async verifyPayment(req, res) {

            const { orderCreationId, razorpayPaymentId, razorpayOrderId, razorpaySignature, cartId } = req.body;
         
            const text = orderCreationId + '|' + razorpayPaymentId;
            const generatedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(text)
                .digest('hex');

            if (generatedSignature === razorpaySignature) {
                await Order.findOneAndUpdate({ orderId: razorpayOrderId }, { status: "payment successful" });
                UserRegister.updateOne({ _id: cartId }, { $unset: { cart: 1 } }).catch(error => {
                    console.log(error);
                });
                res.status(200).json({ msg: '<h3>Payment successful</h3>' });
            }
            else {
                res.status(400).json({ msg: '<h3>Payment verification failed</h3>' });
            }
        },
        async getAllOrders(req, res) {

            const token = req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
            const { username } = decoded;
            try {
                const orders = await Order.find({ cartId: username }).sort({ createdAt: -1 });
                return res.status(200).json(orders);
            }
            catch (error) {
                return res.status(400).json({ msg: "<h3>Unable to Fetch Orders</h3>" });
            }

        }
    }

}

export default OrderController