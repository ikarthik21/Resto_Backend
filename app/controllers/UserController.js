import UserRegister from '../models/UserSchema.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';




const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    }

});


//testing success
transporter.verify((err, success) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log("ready for messgaes");

    }
})

const UserController = () => {
    return {
        async register(req, res) {

            const { name, phone, email, password } = req.body;

            const user = await UserRegister.findOne({ email: email });

            if (user) {
                return res.status(200).json({ message: "<h3>User already exists 🙄</h3>" });
            } else {
                try {
                    const hashedPassword = await bcrypt.hash(password, 10);

                    const newUser = new UserRegister({
                        name: name,
                        phone: phone,
                        email: email,
                        password: hashedPassword
                    });

                    const registeredUser = await newUser.save();

                    const token = jwt.sign({ userId: registeredUser._id }, process.env.TOKEN_SECRET, { expiresIn: '1h' });


                    const mailOptions = {
                        from: process.env.AUTH_EMAIL,
                        to: email,
                        subject: 'Email Verification',
                        html: `
                        <p>Hi ${registeredUser.name}</p>
                        <p>Welcome to Restobay 😊 </p>
                        <p>Click the following link to verify your email: 
                            <a href="${process.env.FRONTEND_URL}/verify/email/${token}">verify email</a></p>`,
                    };


                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.error(error);
                            res.status(500).json({ message: 'Failed to send the email.' });
                        } else {

                            res.status(200).json({ message: 'email sent successfully.' });
                        }
                    });

                    return res.json({ message: " <h3> User Added, Please verify your mail 😊 </h3> " });
                } catch (err) {
                    console.log(err);
                    return res.json({ message: " <h3> Error in adding the User </h3> 😓" });
                }
            }

        },

        async login(req, res) {
            const { lemail, lpassword } = req.body;
            const user = await UserRegister.findOne({ email: lemail });

            if (user) {
                if (user.verified !== true) {
                    return res.json({ message: '<h3>Verify your mail and try again </h3>' });
                }


                const user_role = user.role;
                const userid = user._id.toHexString();

                try {
                    const rslt = await bcrypt.compare(lpassword, user.password);

                    if (rslt) {
                        const token = jwt.sign(
                            {
                                username: userid,
                                role: user_role
                            },
                            process.env.TOKEN_SECRET
                        );

                        return res.json({ token, message: '<h3> Login successful😊 </h3> ' })
                    }
                    else {
                        return res.json({ message: '<h3> Wrong Username or Password </h3> 😓' });
                    }
                } catch (err) {
                    return res.status(500).json({ message: 'Internal Server Error' });
                }
            } else {
                return res.json({ message: '<h3> User Doesn\'t Exist </h3> ' });
            }
        },
        async getProfile(req, res) {


            const token = req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
            const { username } = decoded;
            const user = await UserRegister.findOne({ _id: username }, { name: 1, email: 1, phone: 1, _id: 0 });
            if (user) {
                return res.status(200).json(user);
            }
            return res.json({ message: '<h3> User Doesn\'t Exist </h3> ' });
        },
        async editProfile(req, res) {


            const token = req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
            const { username } = decoded;
            const { newpassword, name, phone, oldpassword } = req.body;



            try {
                const user = await UserRegister.findOne({ _id: username });
                if (user) {

                    const rslt = await bcrypt.compare(oldpassword, user.password);
                    if (!rslt) {
                        return res.json({ message: 'Wrong Password' })
                    }

                    if (newpassword === "") {
                        const User = await UserRegister.findOneAndUpdate({ _id: username },
                            { name: name, phone: phone })
                        return res.status(200).json({ message: 'User details updated' })
                    }
                    else {
                        const hashedPassword = await bcrypt.hash(newpassword, 10);
                        await UserRegister.findOneAndUpdate({ _id: username },
                            { name: name, phone: phone, password: hashedPassword })
                        return res.status(200).json({ message: 'Password successfully changed' })
                    }
                }
                else {
                    return res.json({ message: 'No User' })
                }
            } catch (error) {
                console.log(error);
            }



        },


        async forgetPassword(req, res) {
            const { femail } = req.body;

            const user = await UserRegister.findOne({ email: femail });

            if (!user) {
                return res.json({ message: 'User not found.' });
            }

            const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;

            await user.save();

            const mailOptions = {
                from: process.env.AUTH_EMAIL,
                to: femail,
                subject: 'Password Reset',
                html: `
                <p>Hi ${user.name}</p>
                <p>Click the following link to reset your password: 
                    <a href="${process.env.FRONTEND_URL}/resetPassword/${token}">Reset Password</a></p>`,
            };


            // Send the password reset email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(error);
                    res.status(500).json({ message: 'Failed to send the password reset email.' });
                } else {

                    res.status(200).json({ message: 'Password reset email sent successfully.' });
                }
            });




        }
        , async passwordReset(req, res) {


            const { password, token } = req.body;
         

            try {
                const user = await UserRegister.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });

                if (!user) {
                    return res.json({ message: 'Invalid or expired token.' });
                }

                const hashedPassword = await bcrypt.hash(password, 10);
                user.password = hashedPassword;
                user.resetToken = null;
                user.resetTokenExpiration = null;
                await user.save();
                res.status(200).json({ message: 'Password reset successful.' });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Something went wrong.' });
            }
        }
        , async resendMail(req, res) {
            const { vemail } = req.body;


            try {
                const user = await UserRegister.findOne({ email: vemail });

                if (!user) {
                    return res.json({ message: 'User not found.' });
                }

                if (user.verified) {
                    return res.json({ message: 'User already verified.' });
                }

                const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, { expiresIn: '1h' });

                const verificationLink = `${process.env.FRONTEND_URL}/verify/email/${token}`;

                const mailOptions = {
                    from: process.env.AUTH_EMAIL,
                    to: user.email,
                    subject: 'Email Verification',
                    html: `<p>Thank you for registering. Click the following link to verify your email address: 
                      <a href="${verificationLink}">Verify Email</a></p>`,
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error(error);
                        res.status(500).json({ message: 'Failed to resend the verification email.' });
                    } else {

                        res.status(200).json({ message: 'Verification email sent again.' });
                    }
                });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Something went wrong.' });
            }

        }
        , async verifyMail(req, res) {
            const { token } = req.body;

            try {
                const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);

                const { userId } = decodedToken;
                const user = await UserRegister.findOne({ _id: userId });

                if (!user) {
                    return res.json({ message: 'User not found.' });
                }

                if (user.verified) {
                    return res.json({ message: 'Email already verified.' });
                }


                user.verified = true;
                await user.save();

                return res.status(200).json({ message: 'User successfully verified.' });
            } catch (error) {
                console.error(error);
                res.status(401).json({ message: 'Invalid or expired token.' });
            }
        }
    }
}


export default UserController;


