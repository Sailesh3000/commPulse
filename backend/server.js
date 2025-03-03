require("dotenv").config();
const express = require("express");
const mysql = require('mysql2');
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { google } = require("googleapis");
const axios = require("axios");
const zlib = require("zlib");
const rateLimit = require("express-rate-limit");


const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: process.env.CLEVER_CLOUD_DB_HOST,
  user: process.env.CLEVER_CLOUD_DB_USER,
  password: process.env.CLEVER_CLOUD_DB_PASSWORD,
  database: process.env.CLEVER_CLOUD_DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, 
}));

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per minute
  message: { error: "Too many requests. Try again later." }
});




passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      const { id, displayName, emails, photos } = profile;
      const email = emails[0].value;
      const photo = photos[0].value;

      db.query('SELECT * FROM users WHERE googleId = ?', [id], (err, results) => {
        if (err) return done(err);
        if (results.length > 0) {
          return done(null, results[0]);
        } else {
          const newUser = { googleId: id, displayName, email, photo };
          db.query('INSERT INTO users SET ?', newUser, (err, res) => {
            if (err) return done(err);
            newUser.id = res.insertId;
            return done(null, newUser);
          });
        }
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) return done(err);
    done(null, results[0]);
  });
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:5173" }),
  (req, res) => {
    res.redirect("http://localhost:5173");
  }
);

app.get('/auth/logout', (req, res) => {
  res.clearCookie('connect.sid', { path: '/', httpOnly: true }); 
  res.status(200).json({ message: 'Logged out successfully' });
});



app.get("/api/auth/status", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      isAuthenticated: true,
      user: {
        name: req.user.displayName,
        email: req.user.email,
        picture: req.user.photo,
      },
    });
  } else {
    res.json({ isAuthenticated: false });
  }
});

app.post("/analyze", async (req, res) => {
  const { videoId } = req.body;
  if (!videoId) return res.status(400).json({ error: "No video ID provided" });

  try {
    const sentimentResponse = await axios.post("http://127.0.0.1:5002/analyze-sentiment", { videoId});
    res.json(sentimentResponse.data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});



app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
