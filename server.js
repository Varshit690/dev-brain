require('dotenv').config({ quiet: true });
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const { analyzeComplexity } = require('./engine/complexityAnalyzer');
const { scanVulnerabilities } = require('./engine/vulnerabilityScanner');
const authRoutes = require('./routes/auth');
const { router: historyRoutes, saveAnalysisRecord } = require('./routes/history');
const { optionalAuthMiddleware } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devbrain';

// Connect to MongoDB with fast timeout fallback (skip in test runner unless URI provided)
if (process.env.NODE_ENV !== 'test' || process.env.MONGODB_URI) {
    mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 })
        .then(() => console.log('Connected to MongoDB'))
        .catch(() => console.log('MongoDB not connected; active in-memory store for auth/history'));
}

app.use(express.json({ limit: '1mb' }));

// Auth & History routes
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);

// POST /analyze - pure Node.js AST complexity analysis and vulnerability scanning
app.post('/analyze', optionalAuthMiddleware, async (req, res) => {
    try {
        const code = req.body && req.body.code;
        const language = req.body && req.body.language ? String(req.body.language).toLowerCase() : 'javascript';

        if (!code) {
            return res.status(400).json({ status: 'error', message: 'No code provided' });
        }

        const complexityResult = await analyzeComplexity(code, language);
        if (complexityResult.status === 'error') {
            return res.json(complexityResult);
        }

        const vulnerabilities = scanVulnerabilities(code);

        // If user is authenticated, save record to history
        if (req.user && req.user.id) {
            try {
                await saveAnalysisRecord({
                    userId: req.user.id,
                    code,
                    language,
                    complexity: complexityResult.complexity,
                    max_depth: complexityResult.max_depth,
                    details: complexityResult.details,
                    vulnerabilities
                });
            } catch (err) {
                // Non-blocking history save
            }
        }

        return res.json({
            complexity: complexityResult.complexity,
            max_depth: complexityResult.max_depth,
            details: complexityResult.details,
            vulnerabilities,
            status: 'success'
        });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message || 'Analysis failed' });
    }
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Basic routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signin.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/how-it-works', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'how-it-works.html'));
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;
