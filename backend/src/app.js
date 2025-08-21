const express = require('express');
const cookieParser = require('cookie-parser');
const DBController = require('./db/mongoose');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const cron = require('node-cron');
const env = require('dotenv');
const Util = require('./utils/util');
const AdminRoutes = require('./routes/adminRoutes');
const ClientRoutes = require('./routes/clientRoutes');

const app = express();

app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));

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
app.use(ClientRoutes);
app.use('/uploads', express.static(path.join(__dirname,'../uploads')));
app.use('/static_files', express.static(path.join(__dirname, '../static_files')))
app.get("/admin/files/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "../uploads/document", filename);

    if (fs.existsSync(filePath)) {
        res.setHeader("Content-Type", "application/pdf");
        res.sendFile(path.resolve(filePath));
    } else {
        res.status(404).json({ error: "File not found" });
    }
});

 

app.get('/', (req, res) => {
    res.sendStatus(200);
})

DBController.initConnection(async () => {
    const httpServer = require("http").createServer(app);
    httpServer.listen(process.env.PORT, async function() {
        console.log("Server is running on", Util.getBaseURL());

        
    })
})

