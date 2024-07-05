const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Import CORS middleware
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Use CORS middleware with options
app.use(cors({
    origin: 'https://th-calendar.vercel.app', // Replace with your Vercel deployment URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

// Serve the index.html file at the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoints
app.post('/api/save-event', (req, res) => {
    const event = req.body;
    fs.readFile(path.join(__dirname, 'events.json'), (err, data) => {
        if (err && err.code !== 'ENOENT') {
            res.status(500).send('Error reading events file');
            return;
        }

        let events = [];
        if (data && data.length > 0) {
            events = JSON.parse(data);
        }
        events.push(event);
        fs.writeFile(path.join(__dirname, 'events.json'), JSON.stringify(events, null, 2), (err) => {
            if (err) {
                res.status(500).send('Error saving event');
                return;
            }
            res.status(200).send('Event saved');
        });
    });
});

app.post('/api/delete-event', (req, res) => {
    const event = req.body;
    fs.readFile(path.join(__dirname, 'events.json'), (err, data) => {
        if (err && err.code !== 'ENOENT') {
            res.status(500).send('Error reading events file');
            return;
        }

        let events = [];
        if (data && data.length > 0) {
            events = JSON.parse(data);
        }
        events = events.filter(e => !(new Date(e.date).toISOString() === new Date(event.date).toISOString() && e.name === event.name));
        fs.writeFile(path.join(__dirname, 'events.json'), JSON.stringify(events, null, 2), (err) => {
            if (err) {
                res.status(500).send('Error deleting event');
                return;
            }
            res.status(200).send('Event deleted');
        });
    });
});

app.get('/api/events', (req, res) => {
    fs.readFile(path.join(__dirname, 'events.json'), (err, data) => {
        if (err && err.code !== 'ENOENT') {
            res.status(500).send('Error reading events file');
            return;
        }
        res.status(200).send(data || '[]');
    });
});

// For handling unknown routes
app.all('*', (req, res) => {
    res.status(404).send('Not Found');
});

module.exports = app;
