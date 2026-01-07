const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '1mb' }));

const { spawn } = require('child_process');

// POST /analyze - runs the Python analyzer with provided code (in request body)
app.post('/analyze', (req, res) => {
    const code = req.body && req.body.code;
    if (!code) return res.status(400).json({ status: 'error', message: 'No code provided' });

    // Spawn python process and pass code via stdin
    const py = spawn('python', [path.join(__dirname, 'engine', 'analyzer.py')]);

    let stdout = '';
    let stderr = '';

    py.stdout.on('data', (data) => { stdout += data.toString(); });
    py.stderr.on('data', (data) => { stderr += data.toString(); });

    py.on('close', (codeExit) => {
        if (stderr) {
            // Return stderr as part of error but attempt to parse stdout if available
            try {
                const parsed = JSON.parse(stdout || '{}');
                return res.json(parsed);
            } catch (e) {
                return res.status(500).json({ status: 'error', message: stderr || 'Analyzer failed' });
            }
        }

        try {
            const parsed = JSON.parse(stdout || '{}');
            return res.json(parsed);
        } catch (e) {
            return res.status(500).json({ status: 'error', message: 'Invalid analyzer output' });
        }
    });

    // Send code to analyzer stdin
    py.stdin.write(code);
    py.stdin.end();
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

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
