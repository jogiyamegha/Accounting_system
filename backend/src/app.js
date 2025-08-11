const express = require('express');
const DBController = require('./db/mongoose');
const path = require('path');
const cors = require('cors');
const cron = require('node-cron');
const env = require('dotenv');
const Util = require('./utils/util');
const AdminRoutes = require('./routes/adminRoutes');

const app = express();
app.use(cors());

env.config({
    path : './config/dev.env'
});

app.use(express.json());
app.use(express.urlencoded({extended: true, limit : '5db', parameterLimit: 50000}));
app.use(
    express.json({
        limit: 'sgb'
    })
);

app.use(AdminRoutes);
app.use('/uploads', express.static(path.join(__dirname,'../uploads')));
app.use('/static_files', express.static(path.join(__dirname, '../static_files')))

app.get('/', (req, res) => {
    res.sendStatus(200);
})

DBController.initConnection(async () => {
    const httpServer = require("http").createServer(app);
    httpServer.listen(process.env.PORT, async function() {
        console.log("Server is running on", Util.getBaseURL());

        //This is used to find app usage time of every users
        // cron.schedule(
        //     "0 12 * * *",   //daily check at 11:00 AM
        //     // "* * * * *",
        //     async () => {
        //         console.log("here")
        //         await CronController.bookingStatusPending();
        //         await CronController.inquiryReplyPending()
        //     }
        // )
    })
})

