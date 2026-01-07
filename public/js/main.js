// Basic form handling demo
document.addEventListener('DOMContentLoaded', () => {

    // Sign In Form
    const signinForm = document.getElementById('signin-form');
    if (signinForm) {
        signinForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = signinForm.querySelector('button');
            const originalText = btn.innerText;

            btn.innerText = 'Authenticating...';
            btn.style.opacity = '0.7';

            setTimeout(() => {
                alert('Demo: Successfully Signed In!');
                btn.innerText = originalText;
                btn.style.opacity = '1';
                window.location.href = '/';
            }, 1000);
        });
    }

    // Sign Up Form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = signupForm.querySelector('button');
            const originalText = btn.innerText;

            btn.innerText = 'Creating Account...';
            btn.style.opacity = '0.7';

            setTimeout(() => {
                alert('Demo: Account Created!');
                btn.innerText = originalText;
                btn.style.opacity = '1';
                window.location.href = '/signin';
            }, 1000);
        });
    }

    initThreeJS();
    initWorkspaceTabs();
});

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
            card.innerHTML = `<div class="step-number">${i+1}</div><div><strong>${s}</strong><div class="small-muted">Step ${i+1}</div></div>`;
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

    function renderSecurity() {
        security.innerHTML = '';
        const sec = document.createElement('div');
        sec.className = 'card issue-critical';
        sec.innerHTML = `<strong>🔐 Hardcoded Secret Detected</strong><div class="small-muted">Line: 5</div><p style="margin-top:0.5rem">API key is directly written in code. Fix: Use environment variables.</p>`;
        security.appendChild(sec);
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

    function renderHistory() {
        history.innerHTML = '';
        const list = ['Analysis #3 – 1:10 PM – O(n)', 'Analysis #2 – 12:45 PM – O(n)', 'Analysis #1 – 12:30 PM – O(n²)'];
        list.forEach((l, idx) => {
            const it = document.createElement('div');
            it.className = 'history-item card';
            it.innerText = l;
            it.addEventListener('click', () => {
                alert('Loaded ' + l + ' (demo)');
            });
            history.appendChild(it);
        });
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

    analyzeBtn.addEventListener('click', () => {
        renderReasoning();
        renderIssues();
        renderOptimization();
        renderComplexity();
        renderFlow();
        renderSecurity();
        renderExecution();
        renderHistory();
        renderReport();
        showTab('reasoning');
    });

    resetBtn.addEventListener('click', () => {
        editor.value = '';
        alert('Editor reset (demo)');
    });

    // initial render for default tab
    renderReasoning();
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
