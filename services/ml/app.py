import json
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from classifier import AccidentClassifier

classifier = AccidentClassifier()
PORT = 5001

class MLRequestHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(204)

    def do_GET(self):
        if self.path == '/health' or self.path == '/':
            self._set_headers(200)
            response = {
                "status": "online",
                "service": "Golden Hour ML Accident Classifier Service",
                "version": "1.0.0",
                "supported_classes": ["NORMAL_RIDING", "HARD_BRAKING", "POTHOLE_OR_BUMP", "POSSIBLE_CRASH"]
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Not Found"}).encode('utf-8'))

    def do_POST(self):
        if self.path == '/predict':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            try:
                data = json.loads(body.decode('utf-8'))
                readings = data.get('readings', [])
                config = data.get('thresholdConfig', None)

                result = classifier.classify_readings(readings, config)
                self._set_headers(200)
                self.wfile.write(json.dumps(result).encode('utf-8'))
            except Exception as e:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint Not Found"}).encode('utf-8'))

    def log_message(self, format, *args):
        # Keep logs clean
        sys.stderr.write(f"[ML Service] {args[0]} - {args[1]}\n")

def run(port=PORT):
    server_address = ('', port)
    httpd = HTTPServer(server_address, MLRequestHandler)
    print(f"\n========================================================")
    print(f"🤖 GOLDEN HOUR ML CLASSIFICATION SERVICE STARTED 🤖")
    print(f"   Port: http://localhost:{port}")
    print(f"   Predict Endpoint: POST http://localhost:{port}/predict")
    print(f"========================================================\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()

if __name__ == '__main__':
    run()
