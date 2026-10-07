const request = require('supertest');
const app = require('../server');
const { analyzeComplexity } = require('../engine/complexityAnalyzer');
const { scanVulnerabilities } = require('../engine/vulnerabilityScanner');

describe('DevBrain.ai Engine Unit Tests', () => {
  // Case 1: single loop = O(n)
  test('Case 1: single loop returns O(n)', async () => {
    const jsCode = `
      for (let i = 0; i < 10; i++) {
        console.log(i);
      }
    `;
    const res = await analyzeComplexity(jsCode, 'javascript');
    expect(res.status).toBe('success');
    expect(res.complexity).toBe('O(n)');
    expect(res.max_depth).toBe(1);

    const pyCode = `
for i in range(10):
    print(i)
`;
    const pyRes = await analyzeComplexity(pyCode, 'python');
    expect(pyRes.status).toBe('success');
    expect(pyRes.complexity).toBe('O(n)');
    expect(pyRes.max_depth).toBe(1);
  });

  // Case 2: nested loops = O(n^2)
  test('Case 2: nested loops return O(n^2)', async () => {
    const jsCode = `
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          console.log(i, j);
        }
      }
    `;
    const res = await analyzeComplexity(jsCode, 'javascript');
    expect(res.status).toBe('success');
    expect(res.complexity).toBe('O(n^2)');
    expect(res.max_depth).toBe(2);

    const pyCode = `
for i in range(10):
    for j in range(10):
        print(i, j)
`;
    const pyRes = await analyzeComplexity(pyCode, 'python');
    expect(pyRes.status).toBe('success');
    expect(pyRes.complexity).toBe('O(n^2)');
    expect(pyRes.max_depth).toBe(2);
  });

  // Case 3: no loop = O(1)
  test('Case 3: no loop returns O(1)', async () => {
    const code = `
      const a = 10;
      const b = 20;
      const sum = a + b;
      console.log(sum);
    `;
    const res = await analyzeComplexity(code, 'javascript');
    expect(res.status).toBe('success');
    expect(res.complexity).toBe('O(1)');
    expect(res.max_depth).toBe(0);
  });

  // Case 4: a single loop inside a function = O(n) (verifying fix for brace depth bug)
  test('Case 4: single loop inside a function returns O(n) (not O(n^2))', async () => {
    const code = `
      function findMax(arr) {
        let max = -Infinity;
        for (let i = 0; i < arr.length; i++) {
          if (arr[i] > max) max = arr[i];
        }
        return max;
      }
    `;
    const res = await analyzeComplexity(code, 'javascript');
    expect(res.status).toBe('success');
    expect(res.complexity).toBe('O(n)');
    expect(res.max_depth).toBe(1);
  });

  // Case 5: eval detection
  test('Case 5: eval() detection as Critical Remote Code Execution Risk', () => {
    const code = `
      const userInput = "console.log(123)";
      eval(userInput);
    `;
    const vulns = scanVulnerabilities(code);
    expect(vulns.length).toBeGreaterThanOrEqual(1);
    const evalVuln = vulns.find(v => v.message.includes('eval('));
    expect(evalVuln).toBeDefined();
    expect(evalVuln.severity).toBe('Critical');
    expect(evalVuln.type).toBe('Remote Code Execution Risk');
    expect(evalVuln.line).toBe(3);
  });

  // Case 6: hardcoded key detection
  test('Case 6: hardcoded API key detection as High Security Risk', () => {
    const code = `
      const api_key = "abcdefghijklmnopqrstuvwxyz123456789";
      console.log("connecting...");
    `;
    const vulns = scanVulnerabilities(code);
    expect(vulns.length).toBeGreaterThanOrEqual(1);
    const keyVuln = vulns.find(v => v.severity === 'High');
    expect(keyVuln).toBeDefined();
    expect(keyVuln.type).toBe('Security Risk');
    expect(keyVuln.line).toBe(2);
  });

  // Case 7: loop keyword inside comments/strings ignored
  test('Case 7: loop keywords inside comments and strings are ignored', async () => {
    const code = `
      // for (let i = 0; i < 100; i++) {}
      /* while (true) { doSomething(); } */
      const description = "We use a for loop and while loop in documentation";
      const count = 42;
    `;
    const res = await analyzeComplexity(code, 'javascript');
    expect(res.status).toBe('success');
    expect(res.complexity).toBe('O(1)');
    expect(res.max_depth).toBe(0);
  });

  // Case 8: invalid code returns error
  test('Case 8: invalid code returns error status and message', async () => {
    const invalidJs = `
      function broken( {
        return 123;
    `;
    const res = await analyzeComplexity(invalidJs, 'javascript');
    expect(res.status).toBe('error');
    expect(res.message).toBeDefined();
    expect(typeof res.message).toBe('string');
  });

  // Additional Case 9: Java and C++ analysis
  test('Case 9: Java and C++ AST analysis correctly counts loops', async () => {
    const javaCode = `
      public class Solution {
        public void process(int[] arr) {
          for (int i = 0; i < arr.length; i++) {
            for (int j = 0; j < arr.length; j++) {
              System.out.println(i + j);
            }
          }
        }
      }
    `;
    const javaRes = await analyzeComplexity(javaCode, 'java');
    expect(javaRes.status).toBe('success');
    expect(javaRes.complexity).toBe('O(n^2)');
    expect(javaRes.max_depth).toBe(2);

    const cppCode = `
      void run() {
        while (true) {
          break;
        }
      }
    `;
    const cppRes = await analyzeComplexity(cppCode, 'cpp');
    expect(cppRes.status).toBe('success');
    expect(cppRes.complexity).toBe('O(n)');
    expect(cppRes.max_depth).toBe(1);
  });

  // Additional Case 10: All dangerous function variants detected
  test('Case 10: detects exec, os.system, subprocess.call, new Function', () => {
    const dangerousCode = `
      exec("cat /etc/passwd");
      os.system("ls -la");
      subprocess.call(["rm", "-rf", "/"]);
      const fn = new Function("return 42;");
    `;
    const vulns = scanVulnerabilities(dangerousCode);
    expect(vulns.length).toBe(4);
    vulns.forEach(v => {
      expect(v.severity).toBe('Critical');
      expect(v.type).toBe('Remote Code Execution Risk');
    });
  });
});

describe('DevBrain.ai API Integration Tests (POST /analyze)', () => {
  test('POST /analyze returns valid response shape with complexity and vulnerabilities', async () => {
    const snippet = `
      function test(items) {
        for (let i = 0; i < items.length; i++) {
          console.log(items[i]);
        }
      }
    `;
    const response = await request(app)
      .post('/analyze')
      .send({ code: snippet, language: 'javascript' })
      .expect(200);

    expect(response.body).toHaveProperty('complexity', 'O(n)');
    expect(response.body).toHaveProperty('max_depth', 1);
    expect(response.body).toHaveProperty('details');
    expect(Array.isArray(response.body.details)).toBe(true);
    expect(response.body).toHaveProperty('vulnerabilities');
    expect(Array.isArray(response.body.vulnerabilities)).toBe(true);
    expect(response.body).toHaveProperty('status', 'success');
  });

  test('POST /analyze returns 400 when no code is provided', async () => {
    const response = await request(app)
      .post('/analyze')
      .send({})
      .expect(400);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('No code provided');
  });

  test('POST /analyze flags vulnerabilities alongside complexity', async () => {
    const insecureSnippet = `
      const api_key = "abcde12345678901234567890";
      eval("alert('hello')");
    `;
    const response = await request(app)
      .post('/analyze')
      .send({ code: insecureSnippet, language: 'javascript' })
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.vulnerabilities.length).toBe(2);
    expect(response.body.vulnerabilities.map(v => v.severity)).toEqual(
      expect.arrayContaining(['Critical', 'High'])
    );
  });
});

describe('DevBrain.ai Auth & History API Tests', () => {
  const testUser = {
    name: 'Dev Tester',
    email: 'tester@devbrain.ai',
    password: 'SecurePassword123!'
  };
  let authToken = '';

  test('POST /api/auth/signup registers a new user with hashed password and returns JWT', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser)
      .expect(201);

    expect(res.body.status).toBe('success');
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    authToken = res.body.token;
  });

  test('POST /api/auth/login authenticates user and returns JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);

    expect(res.body.status).toBe('success');
    expect(res.body.token).toBeDefined();
  });

  test('POST /analyze with Bearer token saves record to user history', async () => {
    const res = await request(app)
      .post('/analyze')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ code: 'for (let i = 0; i < 5; i++) {}', language: 'javascript' })
      .expect(200);

    expect(res.body.status).toBe('success');

    // Fetch user history
    const histRes = await request(app)
      .get('/api/history')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(histRes.body.status).toBe('success');
    expect(histRes.body.history.length).toBeGreaterThanOrEqual(1);
    expect(histRes.body.history[0].complexity).toBe('O(n)');
  });
});

