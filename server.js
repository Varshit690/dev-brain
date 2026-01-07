const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '1mb' }));

const { spawn } = require('child_process');

// POST /analyze - runs the Python analyzer with provided code (in request body)
app.post('/analyze', (req, res) => {
    const code = req.body && req.body.code;
    const language = req.body && req.body.language ? String(req.body.language).toLowerCase() : 'javascript';
    if (!code) return res.status(400).json({ status: 'error', message: 'No code provided' });

    // If Python selected, run the Python AST analyzer; otherwise use a lightweight JS heuristic analyzer
    if (language.startsWith('py')) {
        // Spawn python process and pass code via stdin
        const py = spawn('python', [path.join(__dirname, 'engine', 'analyzer.py')]);

        let stdout = '';
        let stderr = '';

        py.stdout.on('data', (data) => { stdout += data.toString(); });
        py.stderr.on('data', (data) => { stderr += data.toString(); });

        py.on('close', (codeExit) => {
            if (stderr) {
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
        return;
    }

    // Heuristic analyzer for Java, C++, JavaScript and other C-like languages
    function analyzeJavaCpp(codeStr, langLabel) {
        const lines = codeStr.split(/\r?\n/);
        let maxDepth = 0;
        let braceDepth = 0;
        const details = [];

        for (let i = 0; i < lines.length; i++) {
            const raw = lines[i];
            const line = raw.trim();

            // detect loop keywords
            if (/\bfor\b|\bwhile\b/.test(line)) {
                // approximate nesting depth as current brace depth + 1
                const depth = Math.max(1, braceDepth + 1);
                maxDepth = Math.max(maxDepth, depth);
                const loopType = /\bfor\b/.test(line) ? 'For-Loop' : 'While-Loop';
                details.push(`Found ${loopType} at line ${i+1} (Depth: ${depth})`);
            }

            // update brace depth based on '{' and '}' occurrences
            const open = (raw.match(/{/g) || []).length;
            const close = (raw.match(/}/g) || []).length;
            braceDepth += open - close;
            if (braceDepth < 0) braceDepth = 0;
        }

        const complexity = maxDepth === 0 ? 'O(1)' : (maxDepth === 1 ? 'O(n)' : `O(n^${maxDepth})`);
        // add high-level message
        details.unshift(`Analyzing language: ${langLabel}`);
        return { complexity, max_depth: maxDepth, details, status: 'success' };
    }

    const result = analyzeJavaCpp(code, language);
    return res.json(result);
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
