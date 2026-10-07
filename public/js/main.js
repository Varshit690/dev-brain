// Basic form handling demo
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication state on page load
    checkAuthState();

    // Sign In Form
    const signinForm = document.getElementById('signin-form');
    if (signinForm) {
        signinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = signinForm.querySelector('button');
            const originalText = btn.innerText;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            btn.innerText = 'Authenticating...';
            btn.style.opacity = '0.7';

            try {
                const resp = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await resp.json();
                if (data.status === 'success' && data.token) {
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('username', data.user.name || data.user.email);
                    localStorage.setItem('authToken', data.token);
                    window.location.href = '/#workspace';
                } else {
                    alert(data.message || 'Login failed. Please check your credentials.');
                    btn.innerText = originalText;
                    btn.style.opacity = '1';
                }
            } catch (err) {
                alert('Sign in failed: ' + err.message);
                btn.innerText = originalText;
                btn.style.opacity = '1';
            }
        });
    }

    // Sign Up Form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = signupForm.querySelector('button');
            const originalText = btn.innerText;
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            btn.innerText = 'Creating Account...';
            btn.style.opacity = '0.7';

            try {
                const resp = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                const data = await resp.json();
                if (data.status === 'success' && data.token) {
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('username', data.user.name || name);
                    localStorage.setItem('authToken', data.token);
                    alert('Account created successfully!');
                    window.location.href = '/#workspace';
                } else {
                    alert(data.message || 'Signup failed.');
                    btn.innerText = originalText;
                    btn.style.opacity = '1';
                }
            } catch (err) {
                alert('Sign up failed: ' + err.message);
                btn.innerText = originalText;
                btn.style.opacity = '1';
            }
        });
    }

    initThreeJS();
    initWorkspaceTabs();

    // Handle Start Reasoning button - simplified approach
    // Handle Start Reasoning button - always scroll to workspace
    const startReasoningBtn = document.querySelector('.hero-actions a[href="#workspace"]');
    if (startReasoningBtn) {
        startReasoningBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const workspaceSection = document.getElementById('workspace');
            if (workspaceSection) {
                workspaceSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Handle navigation links
    // Link handled directly in HTML now

    // Link handled directly in HTML now
});

// Authentication state management functions
function checkAuthState() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const username = localStorage.getItem('username');
    const authButtons = document.querySelector('.auth-buttons');

    if (isAuthenticated && username && authButtons) {
        // Show authenticated user UI
        authButtons.innerHTML = `
            <span class="user-info">Welcome, ${username}!</span>
            <button id="logout-btn" class="btn btn-outline">Logout</button>
        `;

        // Add logout functionality
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('username');
                localStorage.removeItem('authToken');
                location.reload(); // Reload to show sign in buttons again
            });
        }
    }
}

function initWorkspaceTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resetBtn = document.getElementById('reset-btn');
    const editor = document.getElementById('code-editor');

    function showTab(name) {
        tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
        contents.forEach(c => c.classList.toggle('active', c.id === name));
    }

    tabs.forEach(t => t.addEventListener('click', () => showTab(t.dataset.tab)));

    // Populate mock content
    const reasoning = document.getElementById('reasoning');
    const issues = document.getElementById('issues');
    const optimization = document.getElementById('optimization');
    const complexity = document.getElementById('complexity');
    const flow = document.getElementById('flow');
    const security = document.getElementById('security');
    const execution = document.getElementById('execution');
    const history = document.getElementById('history');
    const report = document.getElementById('report');

    function renderReasoning() {
        reasoning.innerHTML = '';
        const steps = [
            'Accepts input from user',
            'Initializes a variable max = 0',
            'Iterates through array using for loop',
            'Compares each element with max',
            'Returns the largest value'
        ];

        steps.forEach((s, i) => {
            const card = document.createElement('div');
            card.className = 'card step-card';
            card.innerHTML = `<div class="step-number">${i + 1}</div><div><strong>${s}</strong><div class="small-muted">Step ${i + 1}</div></div>`;
            reasoning.appendChild(card);
        });

        const explanation = document.createElement('div');
        explanation.className = 'card';
        explanation.innerHTML = `<strong>Logical Explanation</strong><p class="small-muted" style="margin-top:0.5rem">This function uses a linear scan approach to determine the maximum element. The loop iterates n times where n is the size of the input array, making the time complexity linear.</p>`;
        reasoning.appendChild(explanation);

        const trace = document.createElement('div');
        trace.className = 'card';
        trace.innerHTML = `<strong>AI Thought Trace</strong><ul style="margin-top:0.5rem"><li>✔ Parsing code</li><li>✔ Building AST</li><li>✔ Detecting loops</li><li>✔ Analyzing conditions</li><li>✔ Generating explanation</li></ul>`;
        reasoning.appendChild(trace);
    }

    function renderIssues() {
        issues.innerHTML = '';
        const issueCard = document.createElement('div');
        issueCard.className = 'card issue-critical';
        issueCard.innerHTML = `<strong>❌ Null Pointer Risk</strong><div class="small-muted">Line: 12</div><p style="margin-top:0.5rem">Variable <code>user</code> can be null before calling <code>user.getName()</code>. Suggestion: Add null check before accessing.</p>`;
        issues.appendChild(issueCard);

        const sample = document.createElement('div');
        sample.className = 'card issue-warning';
        sample.innerHTML = `<strong>⚠️ Unused Variable</strong><div class="small-muted">Line: 4</div><p style="margin-top:0.5rem">Variable <code>tmp</code> is declared but never used.</p>`;
        issues.appendChild(sample);
    }

    function renderOptimization() {
        optimization.innerHTML = '';
        const comp = document.createElement('div');
        comp.className = 'card';
        comp.innerHTML = `<strong>Current Approach</strong><p class="small-muted">Nested loops — Time: O(n²)</p><hr/><strong>Suggested Approach</strong><p class="small-muted">Use a HashMap — Time: O(n)</p><button class="btn btn-primary apply-btn" id="apply-opt">Apply Suggestion</button>`;
        optimization.appendChild(comp);

        document.getElementById('apply-opt').addEventListener('click', () => {
            const suggested = `const map = new Map();\n// suggested approach`;
            editor.value = suggested + "\n\n" + editor.value;
            alert('Suggestion applied to editor (demo)');
        });
    }

    function renderComplexity() {
        complexity.innerHTML = '';
        const badge = document.createElement('div');
        badge.className = 'card';
        badge.innerHTML = `<div style="font-size:1.2rem;font-weight:700">Time Complexity: <span style="color:var(--accent-primary)">O(n)</span></div><div class="small-muted" style="margin-top:0.5rem">Space Complexity: O(1)</div><div class="graph-placeholder" style="margin-top:0.75rem"></div>`;
        complexity.appendChild(badge);
    }

    function renderFlow() {
        flow.innerHTML = '';
        const flowBox = document.createElement('div');
        flowBox.className = 'card';
        flowBox.innerHTML = `<div class="flow-box">Start</div><div class="flow-box">Read Input</div><div class="flow-box">Initialize Variables</div><div class="flow-box">Loop</div><div class="flow-box">Condition Check</div><div class="flow-box">Return Output</div>`;
        flow.appendChild(flowBox);
    }

    function renderSecurity(vulnerabilities) {
        security.innerHTML = '';
        if (!vulnerabilities || vulnerabilities.length === 0) {
            const sec = document.createElement('div');
            sec.className = 'card';
            sec.innerHTML = `<strong>🛡️ Security Scan Clear</strong><p class="small-muted" style="margin-top:0.5rem">No hardcoded secrets or dangerous execution calls detected.</p>`;
            security.appendChild(sec);
            return;
        }

        vulnerabilities.forEach((v) => {
            const sec = document.createElement('div');
            const isCrit = v.severity === 'Critical';
            sec.className = `card ${isCrit ? 'issue-critical' : 'issue-warning'}`;
            const icon = isCrit ? '🚨' : '🔐';
            sec.innerHTML = `<strong>${icon} ${v.type} [${v.severity}]</strong><div class="small-muted">Line: ${v.line}</div><p style="margin-top:0.5rem">${v.message}</p>`;
            security.appendChild(sec);
        });
    }

    function renderExecution() {
        execution.innerHTML = '';
        const callstack = document.createElement('div');
        callstack.className = 'card';
        callstack.innerHTML = `<strong>Call Stack</strong><pre style="margin-top:0.5rem">main()\n  └── solve()\n      └── helper()</pre>`;
        execution.appendChild(callstack);

        const mem = document.createElement('div');
        mem.className = 'card';
        mem.innerHTML = `<strong>Memory Usage</strong><div style="margin-top:0.5rem"><div style="background:#0b0b0b;border-radius:6px;height:10px;overflow:hidden"><div style="width:45%;height:100%;background:linear-gradient(90deg,var(--accent-primary),var(--accent-secondary))"></div></div><div class="small-muted" style="margin-top:0.4rem">45% used</div></div>`;
        execution.appendChild(mem);
    }

    async function renderHistory() {
        history.innerHTML = '';
        const token = localStorage.getItem('authToken');
        if (!token) {
            history.innerHTML = `<div class="card"><p class="small-muted">Sign in with an account to view and restore your analysis history across sessions.</p></div>`;
            return;
        }

        try {
            const resp = await fetch('/api/history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await resp.json();
            if (data.status === 'success' && data.history && data.history.length > 0) {
                data.history.forEach((item) => {
                    const it = document.createElement('div');
                    it.className = 'history-item card';
                    const timeStr = item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                    it.innerHTML = `<div><strong>${(item.language || 'JS').toUpperCase()} • ${item.complexity}</strong> <span class="small-muted">${timeStr}</span></div><div class="small-muted" style="margin-top:0.3rem; font-family:monospace; font-size:0.75rem;">${(item.code || '').split('\n')[0].slice(0, 32)}...</div>`;
                    it.style.cursor = 'pointer';
                    it.title = 'Click to reload code in editor';
                    it.addEventListener('click', () => {
                        editor.value = item.code;
                        const langSelect = document.getElementById('language-select');
                        if (langSelect && item.language) {
                            for (let opt of langSelect.options) {
                                if (opt.text.toLowerCase().startsWith(item.language.toLowerCase().slice(0, 2))) {
                                    langSelect.value = opt.text;
                                    break;
                                }
                            }
                        }
                    });
                    history.appendChild(it);
                });
            } else {
                history.innerHTML = `<div class="card"><p class="small-muted">No analysis history found. Run an analysis to start tracking!</p></div>`;
            }
        } catch (e) {
            history.innerHTML = `<div class="card"><p class="small-muted">Unable to load history.</p></div>`;
        }
    }

    function renderReport() {
        report.innerHTML = '';
        const r = document.createElement('div');
        r.className = 'card';
        r.innerHTML = `<strong>Export</strong><div class="report-actions"><button class="btn btn-primary" id="download-report">📄 Download AI Analysis Report</button></div>`;
        report.appendChild(r);

        document.getElementById('download-report').addEventListener('click', () => {
            const content = 'Report\n\nCode:\n' + editor.value + '\n\n(Reasoning and issues omitted in demo)';
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'analysis-report.txt';
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    analyzeBtn.addEventListener('click', async () => {
        const code = editor.value || '';
        const language = (document.getElementById('language-select') || {}).value || 'JavaScript';
        showTab('reasoning');
        reasoning.innerHTML = '<div class="card">Analyzing…</div>';

        const token = localStorage.getItem('authToken');
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const resp = await fetch('/analyze', {
                method: 'POST',
                headers,
                body: JSON.stringify({ code, language })
            });

            const result = await resp.json();
            if (result.status && result.status === 'error') {
                reasoning.innerHTML = `<div class="card issue-warning"><strong>Error</strong><div class="small-muted">${result.message || 'Analysis failed'}</div></div>`;
            } else {
                renderFromAnalysis(result);
                // populate remaining secondary panels
                renderIssues();
                renderOptimization();
                renderFlow();
                renderExecution();
                renderHistory();
                renderReport();
            }
        } catch (err) {
            reasoning.innerHTML = `<div class="card issue-warning"><strong>Error</strong><div class="small-muted">${err.message}</div></div>`;
        }
    });

    function renderFromAnalysis(analysis) {
        // Reasoning: step-by-step loop and structure details
        reasoning.innerHTML = '';
        const details = analysis.details || [];
        details.forEach((d, i) => {
            const card = document.createElement('div');
            card.className = 'card step-card';
            card.innerHTML = `<div class="step-number">${i + 1}</div><div><strong>${d}</strong></div>`;
            reasoning.appendChild(card);
        });

        // Dynamic logical explanation generated from analysis response
        let explanationText = '';
        if (analysis.max_depth === 0) {
            explanationText = `The analyzed code contains sequential statements without iterative loops, resulting in constant time complexity ${analysis.complexity || 'O(1)'}. Execution time remains predictable regardless of input scale.`;
        } else if (analysis.max_depth === 1) {
            explanationText = `The analyzed code contains a single level of iteration (maximum loop depth of 1). Execution scales linearly with input size, yielding ${analysis.complexity || 'O(n)'} time complexity.`;
        } else {
            explanationText = `The analyzed code contains nested loops with a maximum depth of ${analysis.max_depth}. The execution time scales polynomially with input size, resulting in ${analysis.complexity || `O(n^${analysis.max_depth})`} complexity.`;
        }

        const expl = document.createElement('div');
        expl.className = 'card';
        expl.innerHTML = `<strong>Logical Explanation</strong><p class="small-muted" style="margin-top:0.5rem">${explanationText}</p>`;
        reasoning.appendChild(expl);

        const trace = document.createElement('div');
        trace.className = 'card';
        trace.innerHTML = `<strong>AI Thought Trace</strong><ul style="margin-top:0.5rem"><li>✔ Parsing code AST</li><li>✔ Identifying loop structures</li><li>✔ Measuring loop nesting depth</li><li>✔ Scanning for vulnerabilities</li><li>✔ Computing complexity class</li></ul>`;
        reasoning.appendChild(trace);

        // Complexity panel: display real complexity and max_depth
        complexity.innerHTML = '';
        const ccard = document.createElement('div');
        ccard.className = 'card';
        ccard.innerHTML = `<div style="font-size:1.2rem;font-weight:700">Time Complexity: <span style="color:var(--accent-primary)">${analysis.complexity || 'Unknown'}</span></div><div class="small-muted" style="margin-top:0.5rem">Max loop depth: ${analysis.max_depth || 0}</div><div class="graph-placeholder" style="margin-top:0.75rem"></div>`;
        complexity.appendChild(ccard);

        // Security panel: render detected vulnerabilities
        renderSecurity(analysis.vulnerabilities);
    }

    resetBtn.addEventListener('click', () => {
        editor.value = '';
        alert('Editor reset (demo)');
    });

    // initial render for all tabs so each panel is populated
    renderReasoning();
    renderIssues();
    renderOptimization();
    renderComplexity();
    renderFlow();
    renderSecurity();
    renderExecution();
    renderHistory();
    renderReport();
}

function initThreeJS() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Particles
    const geometry = new THREE.BufferGeometry();
    const count = 300;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 80;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        size: 0.2,
        color: 0x7c3aed, // Violet
        transparent: true,
        opacity: 0.8,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Connecting Lines
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x06b6d4, // Cyan
        transparent: true,
        opacity: 0.15
    });

    const linesGeometry = new THREE.BufferGeometry();
    const lines = new THREE.LineSegments(linesGeometry, lineMaterial);
    scene.add(lines);

    function animate() {
        requestAnimationFrame(animate);

        particles.rotation.x += 0.0005;
        particles.rotation.y += 0.0005;

        // Dynamic Line Connections (Reasoning Network Effect)
        const particlePositions = particles.geometry.attributes.position.array;
        const linePositions = [];

        // Check distance between particles (simplified for performance)
        for (let i = 0; i < count; i++) {
            const x1 = particlePositions[i * 3];
            const y1 = particlePositions[i * 3 + 1];
            const z1 = particlePositions[i * 3 + 2];

            // Connect to nearby particles (limited check)
            for (let j = i + 1; j < count; j++) {
                const x2 = particlePositions[j * 3];
                const y2 = particlePositions[j * 3 + 1];
                const z2 = particlePositions[j * 3 + 2];

                const dist = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2);

                if (dist < 8) {
                    linePositions.push(x1, y1, z1, x2, y2, z2);
                }
            }
        }

        lines.geometry.dispose();
        lines.geometry = new THREE.BufferGeometry();
        lines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
