const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

// 1. GINAWANG EMPTY ARRAY (Wala munang laman sa simula)
let notifications = [];

// 2. GET API - Dito kukunin ng app mo ang mga notifications
// Endpoint: /api/get-notifications
app.get('/api/get-notifications', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.status(200).json(notifications);
});

// 3. ADMIN DASHBOARD - UI para sa pag-push
// Endpoint: /route/admin_push
app.get('/route/admin_push', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Push Dashboard</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
            .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
            h2 { color: #333; margin-top: 0; text-align: center; }
            input, textarea { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; font-size: 14px; }
            button { width: 100%; padding: 12px; background-color: #0070f3; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; transition: background 0.3s; }
            button:hover { background-color: #005bc1; }
            .status { margin-top: 15px; font-size: 13px; text-align: center; color: #666; }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>Admin Push Panel</h2>
            <input type="text" id="title" placeholder="Pamagat (Title)">
            <textarea id="message" rows="4" placeholder="Mensahe (Message)"></textarea>
            <button onclick="submitPush()">I-send ang Notification</button>
            <div id="status" class="status"></div>
            <div style="margin-top:20px; text-align:center;">
                <a href="/api/get-notifications" target="_blank" style="font-size: 12px; color: #0070f3; text-decoration: none;">View JSON API ➔</a>
            </div>
        </div>

        <script>
            async function submitPush() {
                const title = document.getElementById('title').value;
                const message = document.getElementById('message').value;
                const status = document.getElementById('status');

                if(!title || !message) {
                    status.innerText = "Pakisulat ang title at message.";
                    status.style.color = "red";
                    return;
                }

                status.innerText = "Ipinapadala...";
                
                try {
                    const response = await fetch('/api/admin_push', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title, message })
                    });

                    if(response.ok) {
                        status.innerText = "Success: Na-push na ang notification!";
                        status.style.color = "green";
                        document.getElementById('title').value = '';
                        document.getElementById('message').value = '';
                    } else {
                        status.innerText = "Error sa pag-push.";
                        status.style.color = "red";
                    }
                } catch (err) {
                    status.innerText = "Hindi makakonekta sa server.";
                }
            }
        </script>
    </body>
    </html>
  `);
});

// 4. ADMIN POST HANDLER - Dito tinatanggap ng server ang bagong notification
app.post('/api/admin_push', (req, res) => {
  const { title, message } = req.body;
  if (title && message) {
    const newEntry = {
      id: Date.now(),
      title,
      message,
      date: new Date()
    };
    // Nilalagay sa unahan ng array para laging bago ang nasa taas
    notifications.unshift(newEntry);
    res.status(200).json({ success: true });
  } else {
    res.status(400).json({ error: "Missing data" });
  }
});

// Export para sa Vercel
module.exports = app;
