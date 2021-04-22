const express = require('express');

//establishing connection to db
require('./db/mongoose');

//importing refactored endpoints
const userRouter = require('./routers/user.router');
const taskRouter = require('./routers/task.router');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use([userRouter, taskRouter]);

app.listen(port, ()=>{
    console.log('Server running on port', port);
})