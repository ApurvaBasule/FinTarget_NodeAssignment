const express = require('express');
const pm2 = require('pm2');
const api = require('./routes/api');

const app = express();

app.use(express.json());
app.use('/v1',api);

app.listen(6000, () => {
    console.log('Server listening on port 6000');
});
