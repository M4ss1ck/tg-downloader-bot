import express from 'express'

export const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/dl', express.static('Downloads'));
