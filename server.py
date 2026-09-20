import http.server
import socketserver
import json
import traceback
import os
import sys
import time
from collections import defaultdict
import re

# Rate limiting
request_history = defaultdict(list)
RATE_LIMIT = 20
RATE_WINDOW = 60
from agents import scoutClassify, matcherRankUnits
from recycling_agent import ClassifierAgent, FacilityMatcherAgent
from rag_plant import retrieve_and_generate

PORT = int(os.environ.get("PORT", 8001))

class APIHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With')
        super().end_headers()

    def do_POST(self):
        client_ip = self.client_address[0]
        now = time.time()
        
        # Clean up old requests and check rate limit
        request_history[client_ip] = [t for t in request_history[client_ip] if now - t < RATE_WINDOW]
        if len(request_history[client_ip]) >= RATE_LIMIT:
            self.send_error(429, "Too Many Requests")
            return
            
        request_history[client_ip].append(now)

        try:
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 6 * 1024 * 1024:  # roughly 6MB max to allow ~5MB base64
                self.send_error(413, "Payload Too Large")
                return

            post_data = self.rfile.read(content_length)
            
            if not post_data:
                self.send_error(400, "Empty request body")
                return
                
            try:
                payload = json.loads(post_data.decode('utf-8'))
            except json.JSONDecodeError:
                self.send_error(400, "Malformed JSON")
                return

            image_base64 = payload.get('image')
            if image_base64 and len(image_base64) > 5.5 * 1024 * 1024:
                self.send_error(413, "Image payload exceeds 5MB limit")
                return

            description = payload.get('description', '')
            
            # Basic Sanitization to prevent prompt injection
            if description:
                injection_patterns = r'(?i)(ignore previous|system prompt|<script>|override instructions)'
                description = re.sub(injection_patterns, '', description).strip()
                
            if not image_base64 and not description:
                self.send_error(400, "Missing required fields: must provide 'image' or 'description'")
                return

            if self.path == '/api/scout':
                # 1. Scout Agent
                classification = scoutClassify(description, image_base64)
                
                # 2. Matcher Agent (using real user location if provided)
                user_lat = float(payload.get('lat', 12.9716))
                user_lon = float(payload.get('lon', 77.5946))
                matches = matcherRankUnits(classification, user_lat, user_lon)
                
                response_data = {
                    "classification": classification,
                    "matches": matches
                }
                self.send_json_response(response_data)
                
            elif self.path == '/api/inorganic':
                # 1. Inorganic Classifier
                trace = ClassifierAgent().run(description, image_base64)
                category = trace.data.get("category", "Mixed/Non-recyclable")
                confidence = trace.confidence
                
                # 2. Facility Matcher
                user_lat = float(payload.get('lat', 12.9716))
                user_lon = float(payload.get('lon', 77.5946))
                match_trace = FacilityMatcherAgent().run(category, confidence, user_lat, user_lon)
                
                response_data = {
                    "classification": trace.data,
                    "confidence": confidence,
                    "match": match_trace.data
                }
                self.send_json_response(response_data)
                
            elif self.path == '/api/plant_id':
                # RAG Plant ID
                trace = retrieve_and_generate(description, "unknown", image_base64)
                
                response_data = {
                    "response": trace.data.get("response")
                }
                self.send_json_response(response_data)
                
            else:
                self.send_error(404, "API endpoint not found")
                
        except Exception as e:
            traceback.print_exc()
            self.send_error(500, f"Internal Server Error: {str(e)}")

    def send_json_response(self, data):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
        
    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.end_headers()

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    
    if not os.environ.get("GEMINI_API_KEY"):
        print("CRITICAL: GEMINI_API_KEY not set in environment.", file=sys.stderr)
        sys.exit(1)
        
    with socketserver.TCPServer(("", PORT), APIHandler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        print("API endpoints:")
        print("  POST /api/scout")
        print("  POST /api/inorganic")
        print("  POST /api/plant_id")
        httpd.serve_forever()
