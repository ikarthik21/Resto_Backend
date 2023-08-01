import Menu from '../models/MenuSchema.js';
import UserRegister from '../models/UserSchema.js';

const CartController = () => {

    return {

        async update(req, res) {
            const cart = req.body;
            try {
                await UserRegister.findOneAndUpdate({ _id: cart.cartId }, { cart: cart });
            }
            catch (error) {
                console.log(error);
            }
        },
        async getCart(req, res) {
            const { cartid } = req.body;
            let cart = await UserRegister.findOne({ _id: cartid }, { cart: 1 });
            if (cart) {
                return res.status(200).json(cart);
            }
            return res.json({ message: 'Cart not found' });
        },
        async getBill(req, res) {
            const { cartId, totalPrice } = req.body;

            let cart = await UserRegister.findOne({ _id: cartId }, { cart: 1 });

            if (cart) {
                if (cart.totalPrice === totalPrice) {
                    return res.status(200).json({ message: "proceed" });
                }
                else {
                    return res.status(400).json({ message: "payment failed" });
                }
            }
            return res.status(400).json({ message: "payment failed" });
        },
        async getMenu(req, res) {
            try {
                let menu = await Menu.find();
                return res.status(200).json(menu);
            } catch (error) {
                console.log(error);
            }

        }

    }

}

export default CartController;

