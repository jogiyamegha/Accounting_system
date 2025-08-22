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
    path: './config/dev.env'
});
 
// JSON payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '5mb', parameterLimit: 50000 }));
app.use('/uploads/document', express.static(path.join(__dirname, '../uploads/document')));
app.use('/uploads/invoice', express.static(path.join(__dirname, '../uploads/invoice')));
app.use('/static_files', express.static(path.join(__dirname, '../static_files')));
 

app.use(AdminRoutes);
app.use(ClientRoutes);
 
// 🔹 API route to serve documents by filename
app.get("/admin/document/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "../uploads/document", filename);
    if (fs.existsSync(filePath)) {
        res.setHeader("Content-Type", "application/pdf");
        res.sendFile(path.resolve(filePath));
    } else {
        res.status(404).json({ error: "Document not found" });
    }
});
 
// 🔹 API route to serve invoices by filename
app.get("/admin/invoice/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "../uploads/invoice", filename);

    if (fs.existsSync(filePath)) {
        res.setHeader("Content-Type", "application/pdf");

        if (req.query.download === "true") {
            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        }

        res.sendFile(path.resolve(filePath));
    } else {
        res.status(404).json({ error: "Invoice not found" });
    }
});

 
 
app.get('/', (req, res) => {
    res.sendStatus(200);
});

DBController.initConnection(async () => {
    const httpServer = require("http").createServer(app);
    httpServer.listen(process.env.PORT, async function () {
        console.log("Server is running on", Util.getBaseURL());
    });
});

 