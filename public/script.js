document.addEventListener('DOMContentLoaded', function() {
    const calendar = {
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear(),
        view: 'month'
    };

    const monthYearEl = document.getElementById('month-year');
    const daysEl = document.getElementById('days');

    const monthNames = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];

    function fetchEvents() {
        return fetch('https://th-calendar.vercel.app/events')
            .then(response => response.json())
            .catch(() => []);
    }

    function renderCalendar(events) {
        const firstDay = new Date(calendar.currentYear, calendar.currentMonth, 1).getDay();
        const lastDate = new Date(calendar.currentYear, calendar.currentMonth + 1, 0).getDate();

        monthYearEl.textContent = `${monthNames[calendar.currentMonth]} ${calendar.currentYear}`;

        daysEl.innerHTML = '';

        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            daysEl.appendChild(emptyCell);
        }

        for (let date = 1; date <= lastDate; date++) {
            const dateCell = document.createElement('div');
            dateCell.textContent = date;

            const currentDate = new Date(calendar.currentYear, calendar.currentMonth, date).toDateString();
            const dayEvents = events.filter(event => new Date(event.date).toDateString() === currentDate);

            dayEvents.forEach(event => {
                const eventEl = document.createElement('div');
                eventEl.textContent = event.name;
                eventEl.className = 'event';
                eventEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm(`Delete event: ${event.name}?`)) {
                        deleteEvent(event).then(() => render());
                    }
                });
                dateCell.appendChild(eventEl);
            });

            dateCell.addEventListener('click', () => {
                const eventName = prompt("Enter event name:");
                if (eventName) {
                    const event = { date: new Date(calendar.currentYear, calendar.currentMonth, date), name: eventName };
                    saveEvent(event).then(() => render());
                }
            });

            daysEl.appendChild(dateCell);
        }
    }

    function renderWeek(events) {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        monthYearEl.textContent = `Week of ${startOfWeek.toDateString()}`;

        daysEl.innerHTML = '';

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dateCell = document.createElement('div');
            dateCell.textContent = date.getDate();

            const currentDate = date.toDateString();
            const dayEvents = events.filter(event => new Date(event.date).toDateString() === currentDate);

            dayEvents.forEach(event => {
                const eventEl = document.createElement('div');
                eventEl.textContent = event.name;
                eventEl.className = 'event';
                eventEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm(`Delete event: ${event.name}?`)) {
                        deleteEvent(event).then(() => render());
                    }
                });
                dateCell.appendChild(eventEl);
            });

            daysEl.appendChild(dateCell);
        }
    }

    function renderDay(events) {
        const today = new Date();
        monthYearEl.textContent = today.toDateString();

        daysEl.innerHTML = '';

        const dateCell = document.createElement('div');
        dateCell.textContent = today.getDate();

        const currentDate = today.toDateString();
        const dayEvents = events.filter(event => new Date(event.date).toDateString() === currentDate);

        dayEvents.forEach(event => {
            const eventEl = document.createElement('div');
            eventEl.textContent = event.name;
            eventEl.className = 'event';
            eventEl.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Delete event: ${event.name}?`)) {
                    deleteEvent(event).then(() => render());
                }
            });
            dateCell.appendChild(eventEl);
        });

        daysEl.appendChild(dateCell);
    }

    function render() {
        fetchEvents().then(events => {
            if (calendar.view === 'month') {
                renderCalendar(events);
            } else if (calendar.view === 'week') {
                renderWeek(events);
            } else if (calendar.view === 'day') {
                renderDay(events);
            }
        });
    }

    function saveEvent(event) {
        return fetch('https://th-calendar.vercel.app/save-event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        });
    }

    function deleteEvent(event) {
        return fetch('https://th-calendar.vercel.app/delete-event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        });
    }

    document.getElementById('prev-month').addEventListener('click', () => {
        calendar.currentMonth--;
        if (calendar.currentMonth < 0) {
            calendar.currentMonth = 11;
            calendar.currentYear--;
        }
        render();
    });

    document.getElementById('next-month').addEventListener('click', () => {
        calendar.currentMonth++;
        if (calendar.currentMonth > 11) {
            calendar.currentMonth = 0;
            calendar.currentYear++;
        }
        render();
    });

    document.getElementById('month-view').addEventListener('click', () => {
        calendar.view = 'month';
        render();
    });

    document.getElementById('week-view').addEventListener('click', () => {
        calendar.view = 'week';
        render();
    });

    document.getElementById('day-view').addEventListener('click', () => {
        calendar.view = 'day';
        render();
    });

    render();
});
