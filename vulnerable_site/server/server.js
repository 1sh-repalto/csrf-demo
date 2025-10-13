// Filename: vulnerable-site/server/server.js
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
// The crypto module is built into Node.js, so no install is needed. It's for the secure version.
const crypto = require('crypto');

const app = express();
const port = 5000;

// --- Database and Session Storage ---
const getInitialUserData = () => ({
    'user': { password: 'password', balance: 10000, transactions: [] }
});
let userData = getInitialUserData();
let sessions = {};

// --- Middleware ---
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

        // --- VULNERABLE CODE ---
        sessions[sessionId] = { username };
        // --- END VULNERABLE CODE ---

        // --- SECURE CODE (Comment this block out for the vulnerability demo) ---
        
        // const csrfToken = crypto.randomBytes(16).toString('hex');
        // sessions[sessionId] = { username, csrfToken }; // Store the token with the session
    
        // --- END SECURE CODE ---
        
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
        const user = userData[userSession.username];

        // --- VULNERABLE CODE ---
        res.json({ balance: user.balance, transactions: user.transactions });
        // --- END VULNERABLE CODE ---

        // --- SECURE CODE (Comment this block out for the vulnerability demo) ---
        
        // res.json({
        //     balance: user.balance,
        //     transactions: user.transactions,
        //     csrfToken: userSession.csrfToken // Send the secret token to the client
        // });
    
        // --- END SECURE CODE ---

    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});


// --- VULNERABLE CODE TO COMMENT OUT FOR SECURE DEMO ---
// This entire GET route is the primary vulnerability.
app.get('/api/transfer', (req, res) => {
    const sessionId = req.cookies.sessionId;
    const userSession = sessions[sessionId];
    if (!userSession) {
        return res.status(401).send('No session. Are you logged in?');
    }
    const { recipient, amount } = req.query;
    performTransfer(userSession, recipient, amount, res, true);
});
// --- END VULNERABLE CODE ---


app.post('/api/transfer', (req, res) => {
    const sessionId = req.cookies.sessionId;
    const userSession = sessions[sessionId];

    // --- SECURE CODE (Comment this block out for the vulnerability demo) ---

    // const receivedCsrfToken = req.headers['x-csrf-token'];
    // if (!userSession || receivedCsrfToken !== userSession.csrfToken) {
    //     console.log('[SERVER] CSRF validation FAILED.');
    //     return res.status(403).json({ error: 'Forbidden: Invalid CSRF token.' });
    // }

    // --- END SECURE CODE ---
    
    // This part of the code is shared between both versions
    if (!userSession) {
        return res.status(401).json({ error: 'Authentication error.' });
    }
    const { recipient, amount } = req.body; 
    performTransfer(userSession, recipient, amount, res, false);
});


function performTransfer(userSession, recipient, amount, res, isMalicious) {
    // ... This helper function does not need to be changed ...
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
            res.redirect('https://www.google.com/search?q=cute+puppies');
        } else {
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
    console.log(`Bank API server listening at http://localhost:${port}`);
});