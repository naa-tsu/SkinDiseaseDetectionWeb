#!/usr/bin/env python3
"""
Local server for Skin Disease Classifier Web App
"""
import http.server
import socketserver
import webbrowser
import os

PORT = 8000

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    print("🩺 Skin Disease Classifier - Starting Server")
    print("=" * 50)
    
    with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:
        print(f"🌐 Server running at: http://localhost:{PORT}")
        print(f"📁 Serving from: {os.getcwd()}")
        print(f"⏹️  Press Ctrl+C to stop")
        print("-" * 50)
        
        try:
            webbrowser.open(f'http://localhost:{PORT}')
            print("✅ Browser opened automatically")
        except:
            print("⚠️  Please open http://localhost:{PORT} manually")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped by user")
            print("Thank you for using Skin Disease Classifier!")

if __name__ == "__main__":
    main()
