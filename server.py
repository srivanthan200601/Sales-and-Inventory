# Retail Sales and Inventory Copilot (TRACK_DIPHS08)
# Python API & Web Application Server Launcher

import http.server
import socketserver
import json
import urllib.parse
import os

PORT = 5000

class RetailCopilotHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # Health Check
        if path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {
                "status": "OK",
                "project": "Retail - Sales and Inventory Copilot (TRACK_DIPHS08)",
                "timestamp": "2026-09-05T11:00:00Z"
            }
            self.wfile.write(json.dumps(response).encode())
            return

        # Backend API v1 Endpoints
        if path.startswith('/api/v1'):
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()

            if path == '/api/v1/auth/me':
                res = {"success": True, "data": {"id": "usr-101", "email": "alex.morgan@apexretail.com", "role": "STORE_MANAGER"}}
            elif path == '/api/v1/analytics/dashboard':
                res = {"success": True, "data": {"todayRevenue": 14850.50, "grossProfitMarginPercent": 38.2, "activeLowStockAlertsCount": 4, "totalTrackedSkusCount": 8}}
            elif path == '/api/v1/inventory':
                res = {"success": True, "data": [{"id": "inv-101", "sku": "EL-HP-001", "name": "Pro Headphones", "stock": 6, "reorderLevel": 10}]}
            elif path == '/api/v1/products':
                res = {"success": True, "data": [{"id": "prod-101", "sku": "EL-HP-001", "name": "Pro Headphones", "price": 249.99}]}
            else:
                res = {"success": True, "message": f"API Route {path} active"}

            self.wfile.write(json.dumps(res).encode())
            return

        # Serve static frontend files
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else "{}"
        
        try:
            payload = json.loads(body)
        except Exception:
            payload = {}

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()

        if path == '/api/v1/copilot/chat':
            prompt = payload.get('prompt', '')
            res = {
                "success": True,
                "data": {
                    "toolInvoked": "draft_purchase_order",
                    "response": f"AI Copilot processed: '{prompt}'. Draft Purchase Order PO-4093 generated.",
                    "data": {"poNumber": "PO-4093", "estimatedTotal": 1490.00}
                }
            }
        else:
            res = {"success": True, "message": "POST request processed successfully", "data": payload}

        self.wfile.write(json.dumps(res).encode())

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    with socketserver.TCPServer(("", PORT), RetailCopilotHandler) as httpd:
        print(f"[Server] Retail Copilot Server running on http://localhost:{PORT}")
        print(f"[Server] API v1 Endpoints mounted at http://localhost:{PORT}/api/v1")
        print(f"[Server] Health check: http://localhost:{PORT}/health")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[Server] Shutting down...")
