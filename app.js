const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('REST API is running.')
})

app.listen(3001);