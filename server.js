const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const NodeCache = require('node-cache');

const app = express();
const eventCache = new NodeCache();

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html file at the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoints
app.post('/api/save-event', (req, res) => {
    const event = req.body;

    // Save to file
    saveEventToFile(event, (err) => {
        if (err) {
            res.status(500).send('Error saving event to file');
            return;
        }

        // Save to cache
        saveEventToCache(event);

        res.status(200).send('Event saved');
    });
});

app.post('/api/delete-event', (req, res) => {
    const event = req.body;

    // Delete from file
    deleteEventFromFile(event, (err) => {
        if (err) {
            res.status(500).send('Error deleting event from file');
            return;
        }

        // Delete from cache
        deleteEventFromCache(event);

        res.status(200).send('Event deleted');
    });
});

app.get('/api/events', (req, res) => {
    // Check cache first
    let events = eventCache.get('events');
    if (!events) {
        // Fetch from file if not in cache
        fs.readFile(path.join(__dirname, 'events.json'), (err, data) => {
            if (err && err.code !== 'ENOENT') {
                res.status(500).send('Error reading events file');
                return;
            }
            events = JSON.parse(data || '[]');
            eventCache.set('events', events);
            res.status(200).json(events);
        });
    } else {
        res.status(200).json(events);
    }
});

// Function to save event to file
function saveEventToFile(event, callback) {
    fs.readFile(path.join(__dirname, 'events.json'), (err, data) => {
        if (err && err.code !== 'ENOENT') {
            return callback(err);
        }

        let events = JSON.parse(data || '[]');
        events.push(event);

        fs.writeFile(path.join(__dirname, 'events.json'), JSON.stringify(events, null, 2), (err) => {
            if (err) {
                return callback(err);
            }
            callback(null);
        });
    });
}

// Function to delete event from file
function deleteEventFromFile(event, callback) {
    fs.readFile(path.join(__dirname, 'events.json'), (err, data) => {
        if (err && err.code !== 'ENOENT') {
            return callback(err);
        }

        let events = JSON.parse(data || '[]');
        events = events.filter(e => !(new Date(e.date).toISOString() === new Date(event.date).toISOString() && e.name === event.name));

        fs.writeFile(path.join(__dirname, 'events.json'), JSON.stringify(events, null, 2), (err) => {
            if (err) {
                return callback(err);
            }
            callback(null);
        });
    });
}

// Function to save event to cache
function saveEventToCache(event) {
    let events = eventCache.get('events') || [];
    events.push(event);
    eventCache.set('events', events);
}

// Function to delete event from cache
function deleteEventFromCache(event) {
    let events = eventCache.get('events') || [];
    events = events.filter(e => !(new Date(e.date).toISOString() === new Date(event.date).toISOString() && e.name === event.name));
    eventCache.set('events', events);
}

// For handling unknown routes
app.all('*', (req, res) => {
    res.status(404).send('Not Found');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
