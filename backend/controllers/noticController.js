// Notification Controller

const Notification = require("../models/Notification");
const { v4: uuid } = require('uuid');

async function SubmitNotice(req, res) {

    try {

        const { text } = req.body;

        const authUser = req.user;

        const time = new Date();
        const id = uuid();

        const newNotice = new Notification({
            noticeId: id,
            textBox: text,
            date: time,
        });

        await newNotice.save();

        res.status(201).send({ status: 1, message: 'Notice created successfully' });


    } catch (error) {
        console.error(error);
        return res.status(500).send('Error registering user');
    }
}

async function getNoticeData(req, res) {

    try {

        const authUser = req.user;

        const notices = await Notification.find();

        return res.status(200).send({ status: 1, data: notices });


    } catch (error) {
        console.error(error);
        return res.status(500).send('Error registering user');
    }
}

module.exports = { SubmitNotice, getNoticeData };

