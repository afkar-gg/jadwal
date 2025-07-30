const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3003;
const AUTH_TOKEN = 'rahasia123';

app.use(express.json());
app.use(express.static('public'));

function authMiddleware(req, res, next) {
  const token = req.headers['authorization'] || req.query.token;
  if (token === AUTH_TOKEN) {
    next();
  } else {
    res.status(401).send('Unauthorized: Token required');
  }
}

app.get('/jadwal', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/jadwal.html'));
});

app.get('/edit', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/edit.html'));
});

app.get('/edit-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

app.get('/schedule', (req, res) => {
  const schedule = JSON.parse(fs.readFileSync('./schedule.json', 'utf-8'));
  res.json(schedule);
});

app.post('/schedule', authMiddleware, (req, res) => {
  fs.writeFileSync('./schedule.json', JSON.stringify(req.body, null, 2));
  res.json({ status: 'saved' });
});

app.get('/current-subject', (req, res) => {
  const schedule = JSON.parse(fs.readFileSync('./schedule.json', 'utf-8'));
  const now = new Date();
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const day = days[now.getDay()];
  const timeNow = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const hariIni = schedule[day] || {};
  const times = Object.keys(hariIni).sort();

  let current = 'Tidak Ada Pelajaran';
  let next = '—';
  let nextTime = '—';

  for (let i = 0; i < times.length; i++) {
    if (timeNow >= times[i]) {
      current = hariIni[times[i]];
      next = hariIni[times[i + 1]] || '—';
      nextTime = times[i + 1] || '—';
    }
  }

  res.json({
    subject: current,
    nextSubject: next,
    nextTime,
    day,
    time: timeNow
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});