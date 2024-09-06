const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const port = 8000;

const corsOptions = ({
    origin: 'http://localhost:3000',
    credentials: true
});

app.use(cors(corsOptions));
app.use('/api/v1/', routes);

// Allow preflight CORS requests
app.options('*', cors());

app.listen(port, (error) => {
    if (error) {
        console.error(error);
    } else {
        console.log(`Listening at port ${port}`);
    }
});