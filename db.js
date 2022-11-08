const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true});

const db = mongoose.connection;

db.once('open', () => {
    console.log('connected to DB');
});
db.on('error', (error) => {
    console.log('DB Error', error)
})

module.exports = db;