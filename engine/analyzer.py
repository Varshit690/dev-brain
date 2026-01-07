import ast
import sys
import json

class ComplexityAnalyzer(ast.NodeVisitor):
    def __init__(self):
        self.complexity = "O(1)"
        self.nesting_level = 0
        self.max_nesting = 0
        self.loops = []
        self.report = []

    def visit_For(self, node):
        self.nesting_level += 1
        self.max_nesting = max(self.max_nesting, self.nesting_level)
        self.loops.append(("For Loop", node.lineno))
        self.report.append(f"Found For-Loop at line {node.lineno} (Depth: {self.nesting_level})")
        
        # Heuristic for O(n^k)
        if self.nesting_level > 1:
            self.report.append(f"  -> Nested loop detected! Logic implies O(n^{self.nesting_level}) complexity.")
        
        self.generic_visit(node)
        self.nesting_level -= 1

    def visit_While(self, node):
        self.nesting_level += 1
        self.max_nesting = max(self.max_nesting, self.nesting_level)
        self.loops.append(("While Loop", node.lineno))
        self.report.append(f"Found While-Loop at line {node.lineno} (Depth: {self.nesting_level})")
        
        if self.nesting_level > 1:
            self.report.append(f"  -> Nested loop detected! Logic implies O(n^{self.nesting_level}) complexity.")

        self.generic_visit(node)
        self.nesting_level -= 1
        
    def visit_FunctionDef(self, node):
        self.report.append(f"Analyzing function: {node.name}")
        self.generic_visit(node)

    def calculate_complexity(self):
        if self.max_nesting == 0:
            return "O(1)"
        elif self.max_nesting == 1:
            return "O(n)"
        else:
            return f"O(n^{self.max_nesting})"

def analyze_code(code_snippet):
    try:
        tree = ast.parse(code_snippet)
        analyzer = ComplexityAnalyzer()
        analyzer.visit(tree)
        
        result = {
            "complexity": analyzer.calculate_complexity(),
            "max_depth": analyzer.max_nesting,
            "details": analyzer.report,
            "status": "success"
        }
        return result
    except SyntaxError as e:
        return {
            "status": "error",
            "message": f"Syntax Error at line {e.lineno}: {e.msg}",
            "complexity": "Unknown"
        }

if __name__ == "__main__":
    # In a real app, we might read from stdin or a file
    # For now, let's take an input file path from args, or read stdin
    input_code = sys.stdin.read()
    if input_code:
        analysis = analyze_code(input_code)
        print(json.dumps(analysis, indent=2))
