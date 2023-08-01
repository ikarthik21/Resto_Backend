import Order from '../../models/OrderSchema.js';
import UserRegister from '../../models/UserSchema.js';
import TableOrder from '../../models/TableOrderSchema.js'
const AdminController = () => {
    return {
        async foodorders(req, res) {

            try {
                const orders = await Order.find({}).sort({ createdAt: -1 });
                return res.status(200).json(orders);
            }
            catch (err) {
                console.log(err);
            }

        },
        async tablebooks(req, res) {
            try {
                const orders = await TableOrder.find({}).sort({ createdAt: -1 });
                return res.status(200).json(orders);
            }
            catch (err) {
                console.log(err);
            }

        },
        async allUsers(req, res) {
            try {
                const users = await UserRegister.find({},{_id:0 ,password:0 ,cart:0}).sort({ createdAt: -1 });
                return res.status(200).json(users);
            }
            catch (err) {
                console.log(err);
            }

        }
    }
}

export default AdminController;

