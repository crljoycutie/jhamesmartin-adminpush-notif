const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

// In-memory storage (Dito nakatabi ang notifications)
let notifications = [];

// --- AUTO-RESTART/CLEAR LOGIC (Every 1 minute) ---
// Buburahin nito ang lahat ng laman ng array kada 60 segundo
setInterval(() => {
    if (notifications.length > 0) {
        notifications = [];
        console.log("Figuro Master: Notifications auto-cleared (1min cycle).");
    }
}, 30000); 

// 1. GET API - Para sa mobile app or frontend
app.get('/api/get-notifications', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(notifications);
});

// 2. FIGURO MASTER ADMIN DASHBOARD
app.get('/route/admin_push', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Figuro Master | Admin Panel</title>
        <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;800&display=swap" rel="stylesheet">
        <style>
            :root {
                --figuro-green: #27ae60;
                --figuro-blue: #2980b9;
                --figuro-yellow: #f1c40f;
                --figuro-bg: #f0f4f8;
            }

            body { 
                font-family: 'Lexend', sans-serif; 
                background-color: var(--figuro-bg); 
                margin: 0; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh;
            }

            .container {
                width: 95%;
                max-width: 450px;
                animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }

            @keyframes popIn {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }

            .card {
                background: #ffffff;
                padding: 30px;
                border-radius: 28px;
                box-shadow: 0 20px 40px rgba(41, 128, 185, 0.1);
                border-top: 10px solid var(--figuro-yellow);
                position: relative;
                overflow: hidden;
            }

            .header { text-align: center; margin-bottom: 25px; }
            .header h1 { color: var(--figuro-blue); margin: 0; font-size: 28px; font-weight: 800; }
            .header p { color: var(--figuro-green); margin: 5px 0; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }

            .cleanup-badge {
                background: #fff9db;
                border: 1px solid var(--figuro-yellow);
                padding: 8px;
                font-size: 11px;
                margin-bottom: 20px;
                border-radius: 12px;
                color: #856404;
                text-align: center;
                font-weight: 600;
            }

            .input-group { margin-bottom: 18px; }
            label { display: block; font-weight: 600; margin-bottom: 8px; color: var(--figuro-blue); font-size: 14px; }
            
            input, textarea {
                width: 100%;
                padding: 14px 18px;
                border: 2px solid #e2e8f0;
                border-radius: 15px;
                font-family: inherit;
                font-size: 15px;
                box-sizing: border-box;
                transition: all 0.2s;
            }

            input:focus, textarea:focus {
                outline: none;
                border-color: var(--figuro-blue);
                background: #f8fbff;
            }

            button {
                width: 100%;
                padding: 16px;
                background: var(--figuro-green);
                color: white;
                border: none;
                border-radius: 16px;
                font-weight: 800;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s;
                box-shadow: 0 6px 0 #1e8449;
                margin-top: 10px;
            }

            button:hover { background: #2ecc71; transform: translateY(-2px); }
            button:active { transform: translateY(3px); box-shadow: none; }

            .preview {
                margin-top: 30px;
                background: #f7fafc;
                border-radius: 20px;
                padding: 18px;
                border: 2px dashed var(--figuro-blue);
            }

            .preview-label { font-size: 10px; color: var(--figuro-blue); font-weight: 800; margin-bottom: 10px; text-transform: uppercase; opacity: 0.6; }
            .p-title { color: var(--figuro-green); font-weight: 700; margin: 0; font-size: 17px; }
            .p-msg { font-size: 14px; color: #4a5568; margin-top: 6px; line-height: 1.5; }

            #status { text-align: center; margin-top: 15px; font-size: 13px; font-weight: 700; min-height: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="card">
                <div class="header">
                    <h1>Figuro Master 🎓</h1>
                    <p>Push Notification Center</p>
                </div>

                <div class="cleanup-badge">
                    ⏱️ Auto-Clear System: Active (1 Minute Cycle)
                </div>

                <div class="input-group">
                    <label>Broadcast Title</label>
                    <input type="text" id="title" placeholder="Ex: Welcome Students!" onkeyup="syncPreview()">
                </div>

                <div class="input-group">
                    <label>Announcement Message</label>
                    <textarea id="message" rows="3" placeholder="What's the update today?" onkeyup="syncPreview()"></textarea>
                </div>

                <button onclick="sendPush()">SEND TO STUDENTS 🚀</button>

                <div id="status"></div>

                <div class="preview">
                    <div class="preview-label">App Preview Snapshot</div>
                    <p id="p-title" class="p-title">No Title Yet</p>
                    <p id="p-msg" class="p-msg">Your message will appear here for the students to read...</p>
                </div>
            </div>
        </div>

        <script>
            function syncPreview() {
                document.getElementById('p-title').innerText = document.getElementById('title').value || "No Title Yet";
                document.getElementById('p-msg').innerText = document.getElementById('message').value || "Your message will appear here...";
            }

            async function sendPush() {
                const title = document.getElementById('title').value;
                const message = document.getElementById('message').value;
                const status = document.getElementById('status');

                if(!title || !message) {
                    status.innerText = "⚠️ Please provide content!";
                    status.style.color = "#d35400";
                    return;
                }

                status.innerText = "Processing...";
                status.style.color = "#3498db";

                try {
                    const res = await fetch('/api/admin_push', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title, message })
                    });

                    if(res.ok) {
                        status.innerText = "✅ Successfully sent to Figuro Master!";
                        status.style.color = "var(--figuro-green)";
                        document.getElementById('title').value = '';
                        document.getElementById('message').value = '';
                        syncPreview();
                    }
                } catch (e) {
                    status.innerText = "❌ Connection failed";
                    status.style.color = "#e74c3c";
                }
            }
        </script>
    </body>
    </html>
    `);
});

// 3. POST HANDLER - Receiving new push requests
app.post('/api/admin_push', (req, res) => {
    const { title, message } = req.body;
    if (title && message) {
        notifications.unshift({
            id: Date.now(),
            title,
            message,
            date: new Date()
        });
        res.status(200).json({ success: true });
    } else {
        res.status(400).json({ error: "Data missing" });
    }
});

// Export module
module.exports = app;
