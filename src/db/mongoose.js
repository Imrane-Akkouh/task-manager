const mongoose = require('mongoose');

const dbHostString = process.env.MONGODB_URL

mongoose.connect(`${dbHostString}`, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});