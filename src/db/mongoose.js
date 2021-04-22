const mongoose = require('mongoose');

const dbHostString = process.env.HOST
const dbName = process.env.DB_NAME

mongoose.connect(`${dbHostString}/${dbName}`, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});