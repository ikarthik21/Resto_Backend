
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();


const Admin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.json({ message: " <h3> Authentication Failed </h3> 😓" });
    }
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
            
        // Extract the role from the decoded token
        const { role } = decoded;

        // Check if the role is 'admin'
        if (role !== 'admin') {

            return res.status(403).json({ message: 'Access denied. You are not an admin' });
        }

        // If the user is an admin, proceed to the next middleware or route handler
        next();
    } catch (error) {
        return res.json({ message: " <h3> Error in Authentication </h3> 😓" });
    }

}

export default Admin;
