import UserVerification from '../models/UserVerification.js';
import UserRegister from '../models/UserSchema.js';
import bcrypt from "bcrypt";
import moment from 'moment';

function verifyMail() {
    return {
        async verify(req, res) {

            let { userId, uniqueString } = req.params;

            UserVerification.findOne({ userId: userId }).then((result) => {
                if (result) {
                    const expiresAt = result.expiresAt;
                    const hashedUniqueString = result.uniqueString;
                    let expire_fomrmatted = parseInt(moment(expiresAt).unix());

                    const now = new Date();
                    const utcMilllisecondsSinceEpoch = now.getTime() + (now.getTimezoneOffset() * 60 * 1000)
                    let current_time = parseInt(Math.round(utcMilllisecondsSinceEpoch / 1000));


                    if (current_time > expire_fomrmatted) {

                        UserVerification.deleteOne({ userId }).then((result) => {
                            UserRegister.deleteOne({ _id: userId }).then(() => {
                                let message = "Link has expired .Please Sign up again.";
                                res.send(`<h2 style="text-align="center">${message}</h2>`)

                            }).catch((error) => {
                                let message = "clearing user with expired unique string failed";
                                res.send(`<h2 style="text-align="center">${message}</h2>`)
                            })
                        }
                        ).catch((error) => {

                            let message = "An error occured while clearing the expired user";
                            res.send(`<h2 style="text-align="center">${message}</h2>`)

                        })
                    }
                    else {


                        bcrypt.compare(uniqueString, hashedUniqueString).then((result) => {


                            if (result) {

                                UserRegister.updateOne({ _id: userId }, { verified: "true" }).then(() => {
                                    UserVerification.deleteOne({ userId }).then(() => {
                                        return res.status(200).json({ message: "Verification Successful" });
                                    }
                                    ).catch((error) => {
                                        let message = "Error occured while finalising the successful verification ";
                                        return res.status(200).json({ message: `${message}` });

                                    })

                                }).catch((error) => {
                                    let message = "Error occured while updating user record to show verified ";
                                    return res.status(200).json({ message: `${message}` });
                                })
                            }

                            else {
                                let message = "Invalid verfication details passsed. Please check your Inbox";
                                return res.status(200).json({ message: `${message}` });

                            }
                        }).catch((error) => {

                            let message = "An error occured while comparing unique strings";
                            return res.status(200).json({ message: `${message}` });
                        })


                    }
                }
                else {
                    let message = "Account record doesn`t exist or already have been verified.Please SignUp or Login";
                    return res.status(200).json({ message: `${message}` });


                }
            }).catch((err) => {
                let message = "An error occured while verifying the user";
                return res.status(200).json({ message: `${message}` });
            })
        }

    }


}

export default verifyMail;