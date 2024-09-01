const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const UserAdmin = require('../models/UserAdmin');
const UserSuperAdmin = require('../models/UserSuperAdmin');

async function userRegister(req, res) {
    try {

        const { phoneNumber, mpin } = req.body;
        const user = await User.findOne({ phoneNumber });
        var myRes = {}

        if (user) {
            if (user.status == "reset-mpin") {
                // update mpin and status
                const newUser = await User.findOneAndUpdate({ phoneNumber }, { mpin, status: "active" });

                const token = jwt.sign({ phoneNumber: phoneNumber, time: Date.now(), type: "user", name: newUser.name }, process.env.JWT_SECRET);
                return res.status(200).json({ status: 1, message: "Successful", token, phoneNumber, name: newUser.name });
            } else {
                myRes = {
                    status: 2,
                    message: "User already exists"
                }
                res.status(200).json(myRes);
                return;
            }
        } else {
            const newUser = new User({ phoneNumber, mpin, name: "InkTown User" });
            await newUser.save();
            const token = jwt.sign({ phoneNumber: phoneNumber, time: Date.now(), type: "user", name: "InkTown User" }, process.env.JWT_SECRET);
            return res.status(200).json({ status: 1, message: "Successful", token, phoneNumber, name: "InkTown User" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering user');
    }
}

async function userMPinReset(req, res) {
    try {
        const { phoneNumber } = req.body;
        const user = await User.findOne({ phoneNumber });
        var myRes = {}

        if (user) {
            if (user.status == "active") {
                // update mpin and status
                const newUser = await User.findOneAndUpdate({ phoneNumber }, { status: "reset-mpin" });
                return res.status(200).json({ status: 1, message: "Successful" });
            }
        }
        return res.status(200).json({ status: 2, message: 'User not found' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering user');
    }
}

async function userNumberCheck(req, res) {
    try {
        const { phoneNumber } = req.body;
        const user = await User.findOne({ phoneNumber });

        var myRes = {}

        if (user) {
            if (user.status != "reset-mpin") {
                myRes = {
                    status: 2,
                    message: "User mpin already exists"
                }

                return res.status(200).json(myRes);
            }
        }
        myRes = {
            status: 1,
            message: "User mpin does not exist"
        }

        return res.status(200).json(myRes);


    } catch (error) {
        console.error(error);
        return res.status(500).send('Error logging in');
    }
}


async function userLogin(req, res) {

    try {
        const { phoneNumber, mpin } = req.body;
        const user = await User.findOne({ phoneNumber });
        if (user.status == "active") {
            if (mpin !== user.mpin) {
                return res.status(200).json({ status: 2, message: 'Incorrect mpin' });
            } else {
                const token = jwt.sign({ phoneNumber: phoneNumber, time: Date.now(), type: "user", name: user.name }, process.env.JWT_SECRET);
                return res.status(200).json({ status: 1, message: "Successful", token, phoneNumber, name: user.name });
            }
        } else {
            return res.status(200).json({ status: 2, message: 'User not found' });
        }
    } catch (error) {
        return res.status(500).json('Something went wrong');
    }

}

async function myProfile(req, res) {
    try {

        const authUser = req.user;
        const phoneNumber = authUser.phoneNumber;
        const type = authUser.type;
        if (type != 'user') return res.status(401).send();



        const user = await User.findOne({ phoneNumber });

        if (user) {
            return res.status(200).json({ status: 1, message: "Successful", data: user });

        } else {
            return res.status(200).json({ status: 2, message: 'User not found' });
        }
    } catch (error) {
        return res.status(500).json('Something went wrong');
    }

}

async function userProfile(req, res) {
    try {
        const { phoneNumber } = req.body;


        const authUser = req.user;
        const phoneNumberAdmin = authUser.phoneNumber;
        const type = authUser.type;
        if (type != 'super-admin') return res.status(401).send();



        const user = await User.findOne({ phoneNumber });

        if (user) {
            return res.status(200).json({ status: 1, message: "Successful", data: user });

        } else {
            return res.status(200).json({ status: 2, message: 'User not found' });
        }
    } catch (error) {
        return res.status(500).json('Something went wrong');
    }

}

async function updateMyProfile(req, res) {
    try {
        const { name, email, whatsappNumber, address, pincode, state } = req.body;

        const authUser = req.user;
        const phoneNumber = authUser.phoneNumber;
        const type = authUser.type;
        if (type != 'user') return res.status(401).send();



        const user = await User.findOne({ phoneNumber });

        if (user) {

            const finalData = await User.updateOne(

                {
                    phoneNumber: phoneNumber
                }
                ,
                {
                    $set: {
                        name, email, whatsappNumber, address, pincode, state
                    }
                }
                ,
                { upsert: true }
            );
            const user = await User.findOne({ phoneNumber });

            return res.status(200).json({ status: 1, message: "Successful", data: user });

        } else {
            return res.status(200).json({ status: 2, message: 'User not found' });
        }
    } catch (error) {
        return res.status(500).json('Something went wrong');
    }

}

async function adminLogin(req, res) {
    try {
        const { phoneNumber, mpin } = req.body;
        const user = await UserAdmin.findOne({ phoneNumber });

        if (user) {
            if (mpin !== user.mpin) {
                return res.status(200).json({ status: 2, message: 'Incorrect mpin' });
            } else {
                const token = jwt.sign({ phoneNumber: phoneNumber, time: Date.now(), type: "admin", name: user.name }, process.env.JWT_SECRET);
                return res.status(200).json({ status: 1, message: "Successful", token, phoneNumber, name: user.name });
            }
        } else {
            return res.status(200).json({ status: 2, message: 'User not found' });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).send('Error registering user');
    }


}

async function SuperAdminLogin(req, res) {
    try {
        const { phoneNumber, mpin } = req.body;
        const user = await UserSuperAdmin.findOne({ phoneNumber });

        if (user) {
            if (mpin !== user.mpin) {
                return res.status(200).json({ status: 2, message: 'Incorrect mpin' });
            } else {

                const token = jwt.sign({ phoneNumber: phoneNumber, time: Date.now(), type: "super-admin", name: user.name }, process.env.JWT_SECRET);
                return res.status(200).json({ status: 1, message: "Successful", token, phoneNumber, name: user.name });
            }
        } else {
            return res.status(200).json({ status: 2, message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error registering user');
    }
}

async function SuperAdminRegister(req, res) {
    try {
        const { phoneNumber, mpin, name, } = req.body;
        console.log(req.body);
        const user = await UserSuperAdmin.findOne({ phoneNumber });

        if (user) {
            return res.status(200).json({ status: 2, message: 'Admin Already Register' });
        } else {


            const newUser = new UserSuperAdmin({
                phoneNumber,
                mpin,
                name,
                status: "active",
                type: 'super-admin'
            });

            await newUser.save();

            return res.status(200).json({ status: 1, message: 'Registration Successful', phoneNumber, name });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error registering user');
    }
}

module.exports = { userRegister, userMPinReset, userNumberCheck, userLogin, adminLogin, SuperAdminLogin, SuperAdminRegister, myProfile, userProfile, updateMyProfile };

