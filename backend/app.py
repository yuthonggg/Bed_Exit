import logging
import os
from werkzeug.utils import secure_filename
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

BASE_DIR = os.path.dirname(__file__)
UPLOAD_DIR = os.path.join(BASE_DIR, "captures")
os.makedirs(UPLOAD_DIR, exist_ok=True)

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
            timestamp=data["timestamp"],
            sensor_data=data.get("sensor_data")
        )
        logging.info(f"Inserted new event with id {new_id}")
        return jsonify({"status": "ok", "id": new_id}), 201
    except Exception as e:
        logging.error(f"Failed to insert event: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/alert-with-image', methods=['POST'])
def handle_alert_with_image():
    form = request.form
    image = request.files.get("image")

    required_fields = ["bed_id", "classification", "confidence", "timestamp"]
    for field in required_fields:
        if field not in form:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    try:
        image_url = ""
        if image and image.filename:
            filename = secure_filename(image.filename)
            timestamp = form["timestamp"].replace(":", "-").replace(".", "-")
            filename = f"{form['bed_id']}_{timestamp}_{filename}"
            image.save(os.path.join(UPLOAD_DIR, filename))
            image_url = f"/captures/{filename}"

        sensor_data = form.get("sensor_data")
        new_id = database.insert_event(
            bed_id=form["bed_id"],
            classification=form["classification"],
            confidence=float(form["confidence"]),
            image_path=image_url,
            timestamp=form["timestamp"],
            sensor_data=sensor_data
        )
        logging.info(f"Inserted new image alert with id {new_id}")
        return jsonify({"status": "ok", "id": new_id, "image_url": image_url}), 201
    except Exception as e:
        logging.error(f"Failed to insert image alert: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/captures/<path:filename>', methods=['GET'])
def serve_capture(filename):
    return send_from_directory(UPLOAD_DIR, filename)

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

@app.route('/api/sensor-readings', methods=['POST'])
def create_sensor_reading():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    required_fields = ["bed_id", "x", "y", "timestamp"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    try:
        new_id = database.insert_sensor_reading(
            bed_id=data["bed_id"],
            x=float(data["x"]),
            y=float(data["y"]),
            risk=float(data["risk"]) if data.get("risk") is not None else None,
            z_score=float(data["z_score"]) if data.get("z_score") is not None else None,
            status=data.get("status", ""),
            timestamp=data["timestamp"],
        )
        return jsonify({"status": "ok", "id": new_id}), 201
    except Exception as e:
        logging.error(f"Failed to insert sensor reading: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/sensor-readings', methods=['GET'])
def get_sensor_readings():
    limit_str = request.args.get('limit', '120')
    bed_id = request.args.get('bed_id')
    try:
        limit = int(limit_str)
    except ValueError:
        limit = 120

    try:
        readings = database.get_recent_sensor_readings(bed_id=bed_id, limit=limit)
        return jsonify(readings), 200
    except Exception as e:
        logging.error(f"Error fetching sensor readings: {e}")
        return jsonify([]), 200

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
