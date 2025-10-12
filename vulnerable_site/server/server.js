// Filename: vulnerable-site/server/server.js
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000; // Your server port

// In-memory 'database' for demonstration
const getInitialUserData = () => ({
    'user': {
        password: 'password',
        balance: 10000,
        transactions: []
    }
});

let userData = getInitialUserData();
let sessions = {};

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000', // Your vulnerable client's actual port
    credentials: true
}));

// --- API Endpoints ---

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (userData[username] && userData[username].password === password) {
        const sessionId = Date.now().toString();
        sessions[sessionId] = { username };
        // This sets the SameSite=Lax cookie, which is the browser default.
        // It correctly protects the POST endpoint but leaves the GET endpoint vulnerable.
        res.cookie('sessionId', sessionId, { httpOnly: true, sameSite: 'lax' });
        res.json({ message: 'Logged in successfully' });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.get('/api/account', (req, res) => {
    const sessionId = req.cookies.sessionId;
    const userSession = sessions[sessionId];
    if (userSession) {
        res.json(userData[userSession.username]);
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// --- THE UNIFIED /api/transfer ROUTE ---

// 1. The LEGITIMATE and SAFE endpoint for the bank's frontend.
// The browser's SameSite=Lax protection will block cross-site POST requests.
app.post('/api/transfer', (req, res) => {
    const sessionId = req.cookies.sessionId;
    const userSession = sessions[sessionId];
    if (!userSession) {
        return res.status(401).json({ error: 'Authentication error.' });
    }
    
    // For POST, data comes from the request body
    const { recipient, amount } = req.body; 
    performTransfer(userSession, recipient, amount, res, false);
});

// 2. THE VULNERABLE endpoint for the attacker's link.
// The browser WILL send the cookie on this GET request because it's simple navigation.
app.get('/api/transfer', (req, res) => {
    const sessionId = req.cookies.sessionId;
    const userSession = sessions[sessionId];
    if (!userSession) {
        return res.status(401).send('No session. Are you logged in?');
    }

    // For GET, data comes from the URL query parameters
    const { recipient, amount } = req.query; 
    performTransfer(userSession, recipient, amount, res, true);
});

// A single function to handle the transfer logic for both GET and POST
function performTransfer(userSession, recipient, amount, res, isMalicious) {
    const parsedAmount = parseInt(amount, 10);
    const user = userData[userSession.username];
    
    if (!recipient || !parsedAmount || parsedAmount <= 0) {
        return res.status(400).send('Invalid recipient or amount.');
    }

    console.log(`[Vulnerable Bank] Transfer attempt received for ${parsedAmount} to ${recipient}`);

    if (user.balance >= parsedAmount) {
        user.balance -= parsedAmount;
        user.transactions.unshift({ type: 'DEBIT', to: recipient, amount: parsedAmount });
        console.log(`[Vulnerable Bank] TRANSFER SUCCESS: ${parsedAmount} transferred to ${recipient}.`);
        
        if (isMalicious) {
            // If it's the attack, redirect to hide the evidence
            res.redirect('https://www.google.com/search?q=cute+puppies');
        } else {
            // If it's legitimate, send back the new account data
            res.json({ success: true, newBalance: user.balance, transactions: user.transactions });
        }
    } else {
        res.status(400).send('Attack failed: insufficient funds.');
    }
}


app.post('/api/logout', (req, res) => {
    delete sessions[req.cookies.sessionId];
    res.clearCookie('sessionId').json({ message: 'Logged out' });
});

app.listen(port, () => {
    console.log(`Vulnerable bank API server listening at http://localhost:${port}`);
});