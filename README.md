# DevBrain.ai - Code Reasoning Engine

DevBrain.ai is an intelligent code reasoning platform and static analysis engine built entirely in **pure Node.js**. It performs true Abstract Syntax Tree (AST) traversal to determine algorithmic time complexity, loop nesting depth, and security vulnerabilities across multiple programming languages—without executing untrusted code or relying on external language runtimes.

---

## Features

- **Pure Node.js AST Analysis**: Zero external runtime dependencies (no Python or native C/C++ compilation tools required).
- **Multi-Language Support**:
  - **JavaScript**: Real AST parsing and walking powered by `acorn` and `acorn-walk`.
  - **Python, Java, C++**: Robust AST analysis using `web-tree-sitter` (WebAssembly) with dedicated prebuilt Tree-sitter grammars (`tree-sitter-wasms`).
- **Precise Loop Nesting Detection**: Counts only nested loops (`for`, `while`, `do-while`, `for-in`, `for-of`, `range-for`), strictly ignoring function/class/block braces, comments, and strings.
- **Complexity Classification**: Classifies code time complexity into $O(1)$, $O(n)$, or $O(n^k)$ based on AST depth.
- **Vulnerability Scanner**: Detects dangerous function calls (such as `eval(`, `exec(`, `os.system(`, `subprocess.call(`, `new Function(`) and hardcoded secrets/API keys.
- **Interactive UI**: Responsive web workspace with 3D background visualization, multi-tab reasoning, complexity graphs, and real-time security alerts.

---

## Tech Stack

- **Backend**: Node.js, Express.js
- **AST Parsers**:
  - `acorn` & `acorn-walk` (JavaScript)
  - `web-tree-sitter` & `tree-sitter-wasms` (Python, Java, C++)
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+), Three.js, Lucide Icons
- **Testing**: Jest, Supertest

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` (included with Node.js)

### Installation

1. Clone or navigate to the project directory:
   ```bash
   cd dev-brain-main
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

- **Production Mode**:
  ```bash
  npm start
  ```
- **Development Mode** (with hot reload):
  ```bash
  npm run dev
  ```

Open your browser and navigate to `http://localhost:3000`.

### Running Tests

Execute the comprehensive Jest test suite:
```bash
npm test
```

---

## API Documentation

### `POST /analyze`

Analyzes a code snippet for algorithmic time complexity and security vulnerabilities.

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body
```json
{
  "code": "for (let i = 0; i < n; i++) {\n    for (let j = 0; j < m; j++) {\n        console.log(i, j);\n    }\n}",
  "language": "javascript"
}
```

| Field | Type | Description |
|---|---|---|
| `code` | `string` | **Required**. Source code snippet to analyze. |
| `language` | `string` | **Optional**. Target language: `"javascript"` (default), `"python"`, `"java"`, or `"c++"` / `"cpp"`. |

#### Success Response (`200 OK`)
```json
{
  "complexity": "O(n^2)",
  "max_depth": 2,
  "details": [
    "Analyzing language: JavaScript",
    "Found For-Loop at line 1 (Depth: 1)",
    "Found For-Loop at line 2 (Depth: 2)",
    "  -> Nested loop detected! Logic implies O(n^2) complexity."
  ],
  "vulnerabilities": [],
  "status": "success"
}
```

#### Security Vulnerability Detection Example
If dangerous function calls or hardcoded keys are present:
```json
{
  "complexity": "O(1)",
  "max_depth": 0,
  "details": [
    "Analyzing language: JavaScript"
  ],
  "vulnerabilities": [
    {
      "type": "Remote Code Execution Risk",
      "severity": "Critical",
      "line": 1,
      "message": "Usage of 'eval(' detected. This is extremely dangerous if input is untrusted."
    },
    {
      "type": "Security Risk",
      "severity": "High",
      "line": 2,
      "message": "Possible Hardcoded API Key/Secret detected. Never commit secrets to code."
    }
  ],
  "status": "success"
}
```

#### Error Response (`400 Bad Request` or `200 Error Status`)
```json
{
  "status": "error",
  "message": "Syntax Error at line 1: Unexpected token"
}
```

---

## Project Structure

```
dev-brain-main/
├── engine/
│   ├── complexityAnalyzer.js   # Pure Node.js AST complexity engine
│   └── vulnerabilityScanner.js # Security scanner for dangerous calls & secrets
├── public/
│   ├── css/                    # Frontend styling
│   ├── js/                     # Client application script (main.js)
│   ├── index.html              # Main workspace UI
│   └── ...
├── tests/
│   └── engine.test.js          # Jest unit & integration tests
├── server.js                   # Express application entrypoint
├── package.json
└── README.md
```
