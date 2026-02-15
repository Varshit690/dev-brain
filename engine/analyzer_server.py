import json
import os
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse

# Ensure project root is on sys.path so `engine` can be imported when
# running this script directly from the `engine` folder.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from engine.analyzer import analyze_code


class AnalyzerHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.end_headers()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path != "/analyze":
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode("utf-8"))
            return

        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length).decode("utf-8") if length else ""
        if not body:
            self._set_headers(400)
            self.wfile.write(json.dumps({"error": "Empty request body"}).encode("utf-8"))
            return

        result = analyze_code(body)
        self._set_headers(200)
        self.wfile.write(json.dumps(result).encode("utf-8"))


def run(host: str = "127.0.0.1", port: int = 8000):
    server_address = (host, port)
    httpd = HTTPServer(server_address, AnalyzerHandler)
    print(f"Starting analyzer server at http://{host}:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("Shutting down server")
        httpd.server_close()


if __name__ == "__main__":
    run()
