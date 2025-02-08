const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
    origin: 'https://ytpolls.framer.website' // Allow requests from your Framer site
}));
app.use(session({ 
    secret: 'your-secret-key', 
    resave: false, 
    saveUninitialized: true 
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport Configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, // Use environment variable
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Use environment variable
    callbackURL: 'https://google-auth-backend.onrender.com/auth/google/callback' // Redirect URI
}, (accessToken, refreshToken, profile, done) => {
    return done(null, { id: profile.id, accessToken });
}));

// Serialize and Deserialize User
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Redirect to your Framer dashboard after successful login
        res.redirect(`https://ytpolls.framer.website/dashboard?token=${req.user.accessToken}`);
    });

// Dashboard Route (Simulate Framer Dashboard)
app.get('/dashboard', (req, res) => {
    res.send(`
        <h1>Welcome to the Dashboard</h1>
        <p>You are logged in with Google!</p>
        <form action="/submit-link" method="POST">
            <label for="youtube_link">Paste YouTube Live Stream Link:</label><br>
            <input type="text" id="youtube_link" name="youtube_link"><br><br>
            <button type="submit">Submit</button>
        </form>
    `);
});

// Submit YouTube Link
app.post('/submit-link', express.json(), (req, res) => {
    const youtubeLink = req.body.youtube_link;
    // Save the link (you can store it in a database or session)
    res.json({ success: true, youtube_link: youtubeLink });
});

// Endpoint to Fetch YouTube Link
app.get('/get-link', (req, res) => {
    // Retrieve the YouTube link (from session or database)
    res.json({ youtube_link: "http://example.com" }); // Replace with actual logic
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
