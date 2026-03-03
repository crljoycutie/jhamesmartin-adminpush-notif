const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

// Dito mai-store ang notifications (Temporary lang ito sa RAM)
let notifications = [
  { id: 1, title: "System", message: "API is now online!" }
];

// 1. GET API - Para makuha ang notifications
// URL: myapi.vercel.app/api/get-notifications
app.get('/api/get-notifications', (req, res) => {
  res.status(200).json(notifications);
});

// 2. ADMIN DASHBOARD - Ang UI kung saan ka magta-type
// URL: myapi.vercel.app/route/admin_push
app.get('/route/admin_push', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Admin Push Panel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: sans-serif; padding: 20px; max-width: 500px; margin: auto; }
          input, textarea { width: 100%; margin-bottom: 10px; padding: 10px; border: 1px solid #ccc; border-radius: 5px; }
          button { width: 100%; padding: 10px; background: #0070f3; color: white; border: none; border-radius: 5px; cursor: pointer; }
          .list { margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; }
        </style>
      </head>
      <body>
        <h2>Push Notification Admin</h2>
        <input type="text" id="title" placeholder="Notification Title">
        <textarea id="msg" placeholder="Message content..."></textarea>
        <button onclick="sendPush()">Push Notification</button>

        <div class="list">
          <h3>Recent Pushes:</h3>
          <div id="history"></div>
        </div>

        <script>
          async function sendPush() {
            const title = document.getElementById('title').value;
            const message = document.getElementById('msg').value;
            
            const res = await fetch('/api/admin-post', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title, message })
            });

            if(res.ok) {
              alert('Pushed successfully!');
              location.reload();
            }
          }

          // Fetch history to show on dashboard
          fetch('/api/get-notifications').then(r => r.json()).then(data => {
            const history = document.getElementById('history');
            data.reverse().forEach(n => {
              history.innerHTML += '<p><strong>' + n.title + ':</strong> ' + n.message + '</p>';
            });
          });
        </script>
      </body>
    </html>
  `);
});

// 3. POST API - Dito sinesend ng Dashboard ang data
app.post('/api/admin-post', (req, res) => {
  const { title, message } = req.body;
  const newNotif = {
    id: Date.now(),
    title: title || "No Title",
    message: message || "No Message",
    timestamp: new Date()
  };
  notifications.push(newNotif);
  res.status(200).json({ success: true });
});

module.exports = app;
