import express from 'express';
import UserController from '../app/controllers/UserController.js';
import CartController from '../app/controllers/CartController.js';
import OrderController from '../app/controllers/OrderController.js';
import Auth from '../app/middlewares/Auth.js';
import Admin from '../app/middlewares/Admin.js';
import TableController from '../app/controllers/TableController.js';
import AdminController from '../app/controllers/Admin/AdminController.js'
const router = express.Router();


router.get('/', (req, res) => {
     res.send("<h1>Welcome to the Backend Server</h1>");
})

// User Routes

// Route to register a new user
router.post('/register', UserController().register);

//  Login Route
router.post('/login', UserController().login);

// Route to get the restaurant menu 
router.get('/getmenu', Auth, CartController().getMenu);

// get all tables of the restaurant
router.get('/gettables', Auth, TableController().getTables);


// Get Cart of a user
router.post('/getcart', Auth, CartController().getCart);

// Route to update the cart of a user
router.post('/updatecart', Auth, CartController().update);

// Route to  get profile of a user
router.get('/getprofile', Auth, UserController().getProfile);



// Route to  edit profile of a user
router.post('/editprofile', Auth, UserController().editProfile);

// Route for forget password 
router.post('/forget/password', UserController().forgetPassword);

// Route for reset password 
router.post('/forget/resetPassword', UserController().passwordReset);

// Route for verify email

router.post('/verify/mail', UserController().verifyMail);

// Route for resend verfication email

router.post('/verify/resend', UserController().resendMail);


//  Get all table bookings of a particular user
router.get('/getalltablebooks', Auth, TableController().getallTableOrder);

//get all food orders of a particular user
router.get('/getallorders', Auth, OrderController().getAllOrders);


// Payment Routes

// Route to intialze a table booking
router.post('/booktable', Auth, TableController().bookTable);

// route to intialize a food order
router.post('/payment/orders', Auth, OrderController().createOrder);

// User payment  verification for food orders 
router.post('/payment/success', Auth, OrderController().verifyPayment);

// User payment  verification for table payments
router.post('/payment/table/success', Auth, TableController().verifybookTable);




// admin routes

// route to get the all table orders for admin
router.get('/tableorders', Admin, AdminController().tablebooks);

// route to get all the food orders  for admin
router.get('/foodorders', Admin, AdminController().foodorders);

// route to get all the users
router.get('/allusers', Admin, AdminController().allUsers);




export default router;