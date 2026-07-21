import http.server, socketserver, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # suppress logs to avoid terminal noise

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

PORT = 8080
with socketserver.ThreadingTCPServer(("", PORT), Handler) as httpd:
    httpd.daemon_threads = True
    print(f"http://localhost:{PORT}")
    httpd.serve_forever()
