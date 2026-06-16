from http.server import HTTPServer, BaseHTTPRequestHandler
import sys

class MockHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/healthz':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status":"healthy"}')
        else:
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'OK')

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
print(f"Starting mock server on port {port}...")
HTTPServer(('0.0.0.0', port), MockHandler).serve_forever()
