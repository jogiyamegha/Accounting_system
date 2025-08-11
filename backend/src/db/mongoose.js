const mongoose = require('mongoose');
mongoose.connection.on('connected', () => {
    console.log('Database connection Established');
})

mongoose.connection.on('reconnected', () => {
    console.log('Database connection Reestablished');
})

mongoose.connection.on('disconnected', () => {
    console.log('Database connection disconnected');
})

mongoose.connection.on('close', () => {
    console.log('Database connection closed');
})

mongoose.connection.on('error', (error) => {
    console.log('Database Error' + error);
})

class MongoUtil {
    static newObjectId() {
        return new mongoose.Types.ObjectId()
    }

    static toObjectId(stringId) {
        return new mongoose.Types.ObjectId(stringId);
    }

    static isValidObjectID(id) { 
        return mongoose.isValidObjectId(id);
    }
}

const initConnection = (callback) => {
    let options = {};
    if(process.env.isProduction == true || process.env.isProduction == 'true') {

    }
    mongoose.connect(process.env.Database_URL);
    var db = mongoose.connection;
    db.once('open', function() {
        callback()
    })
}

module.exports = {
    initConnection,
    mongoose,
    MongoUtil
}