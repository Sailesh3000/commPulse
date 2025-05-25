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
const Redis = require("redis");
const { performance } = require('perf_hooks');
const cluster = require('cluster');
const os = require('os');

// Determine number of CPU cores to use
// Limit workers to 4 to prevent exceeding MySQL connection limits
const numCPUs = Math.min(os.cpus().length, 4);

// Check if this is the master process
if (cluster.isMaster) {
  console.log(`Master process ${process.pid} is running`);
  console.log(`Setting up ${numCPUs} workers to handle comment processing`);
  
  // Fork workers based on CPU cores
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  // Handle worker exit and restart
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died with code: ${code} and signal: ${signal}`);
    console.log('Starting a new worker');
    cluster.fork();
  });
} else {
  // Worker processes share the same port
  const app = express();
  const redisClient = Redis.createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    }
  });
  
  redisClient.on('error', err => console.log(`Redis Client Error in worker ${process.pid}:`, err));
  redisClient.connect().then(() => console.log(`Worker ${process.pid} connected to Redis`)).catch(console.error);
  const PORT = process.env.PORT || 5000;

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Create a connection pool instead of individual connections
const db = mysql.createPool({
  host: process.env.CLEVER_CLOUD_DB_HOST,
  user: process.env.CLEVER_CLOUD_DB_USER,
  password: process.env.CLEVER_CLOUD_DB_PASSWORD,
  database: process.env.CLEVER_CLOUD_DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log(`Worker ${process.pid} connected to MySQL connection pool`);

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
    const startTime = performance.now();
    const cacheKey = `analysis:${videoId}`;
    
    // Try to get cached result
    const cachedResult = await redisClient.get(cacheKey);
    if (cachedResult) {
      const endTime = performance.now();
      return res.json({
        ...JSON.parse(cachedResult),
        cached: true,
        responseTime: endTime - startTime,
        processedBy: process.pid
      });
    }

    console.log(`Worker ${process.pid} processing video ID: ${videoId}`);
    
    // If not cached, fetch from services
    // Using Promise.all for parallel processing of comment analysis
    const [sentimentResponse, keywordResponse, toxicityResponse] = await Promise.all([
      axios.post("http://127.0.0.1:5002/analyze-sentiment", { videoId }),
      axios.post("http://127.0.0.1:5003/extract-keywords", { videoId }),
      axios.post("http://127.0.0.1:5004/analyze-toxicity", { videoId }),
    ]);

    const result = {
      sentiment: sentimentResponse.data,
      keywords: keywordResponse.data,
      toxicity: toxicityResponse.data,
      cached: false,
      processedBy: process.pid
    };

    // Cache the result for 1 hour
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(result));

    const endTime = performance.now();
    const processingTime = endTime - startTime;
    console.log(`Worker ${process.pid} completed analysis in ${processingTime.toFixed(2)}ms`);
    
    res.json({
      ...result,
      responseTime: processingTime
    });

  } catch (error) {
    console.error(`Worker ${process.pid} encountered an error:`, error);
    res.status(500).json({ error: "Something went wrong" });
  }
});



app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

app.listen(PORT, () => {
  console.log(`Worker ${process.pid} is running on port ${PORT}`);
});

} // End of worker process code block
