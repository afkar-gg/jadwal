const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3003;

app.use(express.static('public'));
app.use(express.json());

// Viewer
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/jadwal.html'));
});

// Editor
app.get('/edit', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/edit.html'));
});

// Get schedule
app.get('/schedule', (req, res) => {
  const data = fs.readFileSync('./public/schedule.json', 'utf-8');
  res.json(JSON.parse(data));
});

// Save schedule
app.post('/schedule', (req, res) => {
  fs.writeFileSync('./public/schedule.json', JSON.stringify(req.body, null, 2), 'utf-8');
  res.json({ status: 'ok' });
});

// Get current + next subject (WIB synced)
app.get('/current-subject', (req, res) => {
  const schedule = JSON.parse(fs.readFileSync('./public/schedule.json', 'utf-8'));
  const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
  const date = new Date(now);

  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const day = days[date.getDay()];
  const timeNow = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

  const today = schedule[day] || {};
  const times = Object.keys(today).sort();

  let current = "Tidak Ada Pelajaran";
  let next = null;
  let nextTime = null;

  for (let i = 0; i < times.length; i++) {
    if (timeNow >= times[i]) {
      current = today[times[i]];
      next = today[times[i + 1]] || null;
      nextTime = times[i + 1] || null;
    }
  }

  res.json({
    subject: current,
    nextSubject: next,
    nextTime: nextTime,
    day,
    time: timeNow
  });
});

app.listen(PORT, () => {
  console.log(`📅 Jadwal app aktif di http://localhost:${PORT}/jadwal`);
});