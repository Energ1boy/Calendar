const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html file at the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(bodyParser.json());

app.post('/save-event', (req, res) => {
    const event = req.body;
    fs.readFile('events.json', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            res.status(500).send('Error reading events file');
            return;
        }

        let events = [];
        if (data && data.length > 0) {
            events = JSON.parse(data);
        }
        events.push(event);
        fs.writeFile('events.json', JSON.stringify(events, null, 2), (err) => {
            if (err) {
                res.status(500).send('Error saving event');
                return;
            }
            res.status(200).send('Event saved');
        });
    });
});

app.post('/delete-event', (req, res) => {
    const event = req.body;
    fs.readFile('events.json', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            res.status(500).send('Error reading events file');
            return;
        }

        let events = [];
        if (data && data.length > 0) {
            events = JSON.parse(data);
        }
        events = events.filter(e => !(new Date(e.date).toISOString() === new Date(event.date).toISOString() && e.name === event.name));
        fs.writeFile('events.json', JSON.stringify(events, null, 2), (err) => {
            if (err) {
                res.status(500).send('Error deleting event');
                return;
            }
            res.status(200).send('Event deleted');
        });
    });
});

app.get('/events', (req, res) => {
    fs.readFile('events.json', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            res.status(500).send('Error reading events file');
            return;
        }
        res.status(200).send(data || '[]');
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
