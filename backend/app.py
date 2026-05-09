import logging
import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

import database

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)

# Initialize Flask app
app = Flask(__name__, static_folder="../frontend")
CORS(app)

# Initialize DB on startup
database.init_db()

@app.route('/api/alert', methods=['POST'])
def handle_alert():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400
        
    required_fields = ["bed_id", "classification", "confidence", "timestamp"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
            
    try:
        new_id = database.insert_event(
            bed_id=data["bed_id"],
            classification=data["classification"],
            confidence=float(data["confidence"]),
            image_path=data.get("image_path", ""),
            timestamp=data["timestamp"]
        )
        logging.info(f"Inserted new event with id {new_id}")
        return jsonify({"status": "ok", "id": new_id}), 201
    except Exception as e:
        logging.error(f"Failed to insert event: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/events', methods=['GET'])
def get_events():
    limit_str = request.args.get('limit', '20')
    try:
        limit = int(limit_str)
    except ValueError:
        limit = 20
        
    try:
        events = database.get_recent_events(limit=limit)
        return jsonify(events), 200
    except Exception as e:
        logging.error(f"Error fetching events: {e}")
        return jsonify([]), 200

@app.route('/api/events/latest', methods=['GET'])
def get_latest_event():
    try:
        event = database.get_latest_event()
        if event:
            return jsonify(event), 200
        else:
            return jsonify({"status": "no_events"}), 200
    except Exception as e:
        logging.error(f"Error fetching latest event: {e}")
        return jsonify({"status": "no_events"}), 200

@app.route('/api/events/<int:event_id>/acknowledge', methods=['PATCH'])
def acknowledge_event(event_id):
    try:
        success = database.acknowledge_event(event_id)
        if success:
            return jsonify({"status": "ok"}), 200
        else:
            return jsonify({"status": "not_found"}), 404
    except Exception as e:
        logging.error(f"Error acknowledging event {event_id}: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    logging.info("Starting Backend Server")
    app.run(host="0.0.0.0", port=5000, debug=False)
