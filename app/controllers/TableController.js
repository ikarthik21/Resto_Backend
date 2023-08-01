import Tables from '../models/TableSchema.js';
import Razorpay from 'razorpay';
import UserRegister from '../models/UserSchema.js';
import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import TableOrder from '../models/TableOrderSchema.js';
import crypto from 'crypto';
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


const TableController = () => {
    return {
        async getTables(req, res) {
            try {
                const tables = await Tables.find({}, { tableId: 1, tableno: 1, version: 1, _id: 0 });
                res.status(200).json(tables);
            }
            catch (error) {
                console.log(error);
            }
        },
        async bookTable(req, res) {

            const token = req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
            const { username } = decoded;

            const { tableId, tableno, date, endtime, starttime, version } = req.body;


            // Check if the table payement already exists

            try {
                const existingorder = await TableOrder.findOne({ userId: username, tableno: tableno, endtime: endtime, starttime: starttime, date: date });


                if (existingorder) {
                    return res.status(200).json({
                        orderId: existingorder.orderId,
                        amount: existingorder.totalPrice,
                    });
                }

            }
            catch (error) {
                console.log(error)
            }


            // check for table is available at that instance

            try {

                const table = await Tables.findOne({ tableId: tableId });

                if (!table) {
                    return res.json({ message: 'Table not found.' });
                }

                if (table.version !== version) {
                    return res.json({ message: 'Table has been modified by another user. Please try again.' });
                }

                table.version += 1;

                const isTableBooked = table.bookings.some(booking => {
                    return (
                        booking.date === date &&
                        booking.starttime < endtime &&
                        booking.endtime > starttime
                    );
                });

                if (isTableBooked) {
                    return res.json({ message: 'Table is not available at the chosen date and time.' });
                }

                const duration = parseInt(endtime.split(':')) - parseInt(starttime.split(':'));
                const totalPrice = duration * 100;
                const razorpayOrder = await razorpay.orders.create({
                    amount: totalPrice * 100,
                    currency: 'INR',
                });

                // Create a new order and store it in the db

                try {

                    const tables = await UserRegister.findOne({ _id: username }, { name: 1, email: 1, phone: 1, _id: 0 });
                    const order = new TableOrder({
                        orderId: razorpayOrder.id,
                        totalPrice: totalPrice,
                        tableno: tableno,
                        tableId: tableId,
                        date: date,
                        starttime: starttime,
                        endtime: endtime,
                        status: "payment pending",
                        userId: username,
                        name: tables.name,
                        email: tables.email,
                        phone: tables.phone
                    });

                    await order.save();

                    return res.status(200).json({
                        orderId: razorpayOrder.id,
                        amount: totalPrice,
                    });

                }
                catch (error) {
                    console.log(error);
                }
                return res.json({
                    message: 'Try after sometime'
                })

            } catch (error) {
                console.error(error);
                return res.json({ message: 'An error occurred while processing your request.' });
            }
        },
        async verifybookTable(req, res) {

            const { orderCreationId, razorpayPaymentId, date, starttime, endtime, razorpayOrderId, razorpaySignature, tableId } = req.body;

            const text = orderCreationId + '|' + razorpayPaymentId;

            const generatedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(text)
                .digest('hex');

            if (generatedSignature === razorpaySignature) {

                await TableOrder.findOneAndUpdate({ orderId: razorpayOrderId }, { status: "payment successful" });
                const table = await Tables.findOne({ tableId: tableId });
                table.bookings.push({ date, starttime, endtime });
                table.version += 1;
                await table.save();
                res.status(200).json({ message: '<h3>Payment successful Table booked Successfuly</h3>' });

            } else {
                await TableOrder.deleteOne({ orderId: razorpayOrderId });
                res.status(400).json({ message: '<h3>Payment verification failed</h3>' });
            }

        },
        async getallTableOrder(req, res) {

            const token = req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
            const { username } = decoded;
            try {
                const orders = await TableOrder.find({ userId: username }).sort({ createdAt: -1 });
                return res.status(200).json(orders);
            } catch (error) {
                return res.status(400).json({ msg: "<h3>Unable to Fetch Orders</h3>" });
            }

        }


    }
}

export default TableController