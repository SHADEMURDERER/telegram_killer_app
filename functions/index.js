const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

admin.initializeApp();
const app = express();
app.use(cors({ origin: true }));

// Регистрация пользователя
app.post('/register', async (req, res) => {
  const { user_id, username, first_name } = req.body;
  
  try {
    await admin.database().ref(`users/${user_id}`).set({
      username,
      first_name,
      nickname: username,
      created_at: Date.now(),
      last_active: Date.now()
    });
    res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновление ника
app.post('/update_nickname', async (req, res) => {
  const { user_id, nickname } = req.body;
  
  try {
    await admin.database().ref(`users/${user_id}/nickname`).set(nickname);
    res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

exports.api = functions.https.onRequest(app);