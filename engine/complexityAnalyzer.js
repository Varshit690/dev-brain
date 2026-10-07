/**
 * DevBrain.ai Complexity Analyzer
 * Analyzes time complexity and loop nesting depth using AST parsing.
 * - JavaScript: acorn + acorn-walk
 * - Python, Java, C++: web-tree-sitter (WASM)
 */

const acorn = require('acorn');
const walk = require('acorn-walk');
const Parser = require('web-tree-sitter');

let initPromise = null;
const languageCache = {};

async function ensureParserInit() {
  if (!initPromise) {
    initPromise = Parser.init();
  }
  return initPromise;
}

async function getTreeSitterLanguage(langKey) {
  if (languageCache[langKey]) {
    return languageCache[langKey];
  }
  await ensureParserInit();

  let wasmPath;
  switch (langKey) {
    case 'python':
      wasmPath = require.resolve('tree-sitter-wasms/out/tree-sitter-python.wasm');
      break;
    case 'java':
      wasmPath = require.resolve('tree-sitter-wasms/out/tree-sitter-java.wasm');
      break;
    case 'cpp':
      wasmPath = require.resolve('tree-sitter-wasms/out/tree-sitter-cpp.wasm');
      break;
    default:
      throw new Error(`Unsupported tree-sitter language: ${langKey}`);
  }

  const lang = await Parser.Language.load(wasmPath);
  languageCache[langKey] = lang;
  return lang;
}

function normalizeLanguage(lang) {
  if (!lang) return 'javascript';
  const l = String(lang).toLowerCase().trim();
  if (l.includes('py')) return 'python';
  if (l.includes('java') && !l.includes('script')) return 'java';
  if (l.includes('c++') || l.includes('cpp')) return 'cpp';
  if (l === 'c') return 'cpp';
  return 'javascript';
}

function calculateComplexity(maxDepth) {
  if (maxDepth === 0) return 'O(1)';
  if (maxDepth === 1) return 'O(n)';
  return `O(n^${maxDepth})`;
}

/**
 * JavaScript AST analysis using acorn and acorn-walk
 */
function analyzeJavaScript(code) {
  let ast;
  try {
    ast = acorn.parse(code, {
      ecmaVersion: 'latest',
      locations: true,
      sourceType: 'module'
    });
  } catch (modErr) {
    try {
      ast = acorn.parse(code, {
        ecmaVersion: 'latest',
        locations: true,
        sourceType: 'script'
      });
    } catch (scriptErr) {
      const line = (scriptErr.loc && scriptErr.loc.line) || (modErr.loc && modErr.loc.line) || 1;
      return {
        status: 'error',
        message: `Syntax Error at line ${line}: ${scriptErr.message || modErr.message}`,
        complexity: 'Unknown'
      };
    }
  }

  const JS_LOOP_TYPES = new Set([
    'ForStatement',
    'ForInStatement',
    'ForOfStatement',
    'WhileStatement',
    'DoWhileStatement'
  ]);

  const loopMap = {
    ForStatement: 'For-Loop',
    ForInStatement: 'For-In-Loop',
    ForOfStatement: 'For-Of-Loop',
    WhileStatement: 'While-Loop',
    DoWhileStatement: 'Do-While-Loop'
  };

  const detectedLoops = [];
  const functions = [];

  walk.ancestor(ast, {
    FunctionDeclaration(node) {
      if (node.id && node.id.name) {
        functions.push({ line: node.loc.start.line, name: node.id.name });
      }
    },
    ForStatement(node, ancestors) {
      const depth = ancestors.filter(a => JS_LOOP_TYPES.has(a.type)).length;
      detectedLoops.push({ node, type: loopMap[node.type] || 'For-Loop', depth, start: node.start });
    },
    ForInStatement(node, ancestors) {
      const depth = ancestors.filter(a => JS_LOOP_TYPES.has(a.type)).length;
      detectedLoops.push({ node, type: loopMap[node.type] || 'For-In-Loop', depth, start: node.start });
    },
    ForOfStatement(node, ancestors) {
      const depth = ancestors.filter(a => JS_LOOP_TYPES.has(a.type)).length;
      detectedLoops.push({ node, type: loopMap[node.type] || 'For-Of-Loop', depth, start: node.start });
    },
    WhileStatement(node, ancestors) {
      const depth = ancestors.filter(a => JS_LOOP_TYPES.has(a.type)).length;
      detectedLoops.push({ node, type: loopMap[node.type] || 'While-Loop', depth, start: node.start });
    },
    DoWhileStatement(node, ancestors) {
      const depth = ancestors.filter(a => JS_LOOP_TYPES.has(a.type)).length;
      detectedLoops.push({ node, type: loopMap[node.type] || 'Do-While-Loop', depth, start: node.start });
    }
  });

  // Sort loops chronologically by code appearance
  detectedLoops.sort((a, b) => a.start - b.start);

  const details = [];
  details.push('Analyzing language: JavaScript');

  for (const fn of functions) {
    details.push(`Analyzing function: ${fn.name} (Line: ${fn.line})`);
  }

  let maxDepth = 0;
  for (const l of detectedLoops) {
    maxDepth = Math.max(maxDepth, l.depth);
    const line = l.node.loc.start.line;
    details.push(`Found ${l.type} at line ${line} (Depth: ${l.depth})`);
    if (l.depth > 1) {
      details.push(`  -> Nested loop detected! Logic implies O(n^${l.depth}) complexity.`);
    }
  }

  return {
    complexity: calculateComplexity(maxDepth),
    max_depth: maxDepth,
    details,
    status: 'success'
  };
}

/**
 * Tree-sitter AST analysis for Python, Java, C++
 */
async function analyzeTreeSitter(code, langKey, langDisplayName) {
  const language = await getTreeSitterLanguage(langKey);
  const parser = new Parser();
  parser.setLanguage(language);

  const tree = parser.parse(code);
  const root = tree.rootNode;

  // Check for severe syntax errors
  if (root.hasError()) {
    function findFirstError(n) {
      if (n.type === 'ERROR' || n.isMissing()) return n;
      for (let i = 0; i < n.childCount; i++) {
        const found = findFirstError(n.child(i));
        if (found) return found;
      }
      return null;
    }

    const errNode = findFirstError(root);
    const errLine = errNode ? errNode.startPosition.row + 1 : 1;
    return {
      status: 'error',
      message: `Syntax Error at line ${errLine}: Invalid syntax for ${langDisplayName}`,
      complexity: 'Unknown'
    };
  }

  const loopTypeNames = {
    for_statement: 'For-Loop',
    while_statement: 'While-Loop',
    do_statement: 'Do-While-Loop',
    enhanced_for_statement: 'Enhanced-For-Loop',
    for_range_loop: 'Range-For-Loop'
  };

  const loopTypes = new Set(Object.keys(loopTypeNames));
  const details = [];
  details.push(`Analyzing language: ${langDisplayName}`);

  let maxDepth = 0;

  function traverse(node, currentLoopDepth) {
    const isLoop = loopTypes.has(node.type);
    let nextDepth = currentLoopDepth;

    if (isLoop) {
      nextDepth = currentLoopDepth + 1;
      maxDepth = Math.max(maxDepth, nextDepth);
      const line = node.startPosition.row + 1;
      const typeLabel = loopTypeNames[node.type] || 'Loop';
      details.push(`Found ${typeLabel} at line ${line} (Depth: ${nextDepth})`);
      if (nextDepth > 1) {
        details.push(`  -> Nested loop detected! Logic implies O(n^${nextDepth}) complexity.`);
      }
    }

    // Capture function definitions for details logging
    if (node.type === 'function_definition' || node.type === 'method_declaration') {
      const nameNode = node.childForFieldName('name') || node.childForFieldName('declarator');
      if (nameNode) {
        const fnName = nameNode.text || 'anonymous';
        details.push(`Analyzing function: ${fnName}`);
      }
    }

    for (let i = 0; i < node.childCount; i++) {
      traverse(node.child(i), nextDepth);
    }
  }

  traverse(root, 0);

  return {
    complexity: calculateComplexity(maxDepth),
    max_depth: maxDepth,
    details,
    status: 'success'
  };
}

/**
 * Main analyzeComplexity function
 */
async function analyzeComplexity(code, language = 'javascript') {
  if (typeof code !== 'string') {
    return { status: 'error', message: 'No code provided', complexity: 'Unknown' };
  }

  const normLang = normalizeLanguage(language);

  try {
    if (normLang === 'javascript') {
      return analyzeJavaScript(code);
    } else if (normLang === 'python') {
      return await analyzeTreeSitter(code, 'python', 'Python');
    } else if (normLang === 'java') {
      return await analyzeTreeSitter(code, 'java', 'Java');
    } else if (normLang === 'cpp') {
      return await analyzeTreeSitter(code, 'cpp', 'C++');
    } else {
      return analyzeJavaScript(code);
    }
  } catch (err) {
    return {
      status: 'error',
      message: `Analysis failed: ${err.message}`,
      complexity: 'Unknown'
    };
  }
}

module.exports = {
  analyzeComplexity,
  normalizeLanguage,
  calculateComplexity
};
