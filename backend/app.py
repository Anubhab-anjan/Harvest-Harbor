import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')

# Add services folder to path
sys.path.append(os.path.join(BASE_DIR, 'services'))

from crop_recommendation_service import CropRecommendationEngine
from crop_yield_service import CropYieldEngine
from fertilizer_service import FertilizerEngine
from plant_disease_service import PlantDiseaseEngine

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for frontend

# Initialize ML engines
print("[Backend] Initializing ML Models...")
crop_rec_engine = CropRecommendationEngine(MODELS_DIR)
crop_yield_engine = CropYieldEngine(MODELS_DIR)
fertilizer_engine = FertilizerEngine(MODELS_DIR)
plant_disease_engine = PlantDiseaseEngine(MODELS_DIR)
print("[Backend] All 4 ML Engines Ready.")

@app.route('/api/health', methods=['GET'])
def health_check():
    yield_meta = crop_yield_engine.get_metadata()
    fert_meta = fertilizer_engine.get_options()
    return jsonify({
        "status": "online",
        "service": "Harvest Harbor ML REST API",
        "version": "2.0.0",
        "metadata": {
            "yield_areas": yield_meta.get("areas", []),
            "yield_items": yield_meta.get("items", []),
            "soil_types": fert_meta.get("soil_types", []),
            "crop_types": fert_meta.get("crop_types", [])
        }
    })

@app.route('/api/recommend-crop', methods=['POST'])
def recommend_crop():
    try:
        data = request.get_json(silent=True) or request.form
        n = float(data.get('N', data.get('Nitrogen', 90)))
        p = float(data.get('P', data.get('Phosporus', 42)))
        k = float(data.get('K', data.get('Potassium', 43)))
        temp = float(data.get('temperature', data.get('Temperature', 24.0)))
        humidity = float(data.get('humidity', data.get('Humidity', 80.0)))
        ph = float(data.get('ph', data.get('Ph', 6.5)))
        rainfall = float(data.get('rainfall', data.get('Rainfall', 200.0)))

        result = crop_rec_engine.predict(n, p, k, temp, humidity, ph, rainfall)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/api/predict-yield', methods=['POST'])
def predict_yield():
    try:
        data = request.get_json(silent=True) or request.form
        year = float(data.get('Year', 2024))
        rain = float(data.get('average_rain_fall_mm_per_year', data.get('rainfall', 1485.0)))
        pesticides = float(data.get('pesticides_tonnes', data.get('pesticides', 121.0)))
        temp = float(data.get('avg_temp', data.get('temp', 16.37)))
        area = str(data.get('Area', data.get('area', 'India')))
        item = str(data.get('Item', data.get('item', 'Maize')))

        result = crop_yield_engine.predict(year, rain, pesticides, temp, area, item)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/api/predict-fertilizer', methods=['POST'])
def predict_fertilizer():
    try:
        data = request.get_json(silent=True) or request.form
        temp = float(data.get('temp', data.get('temperature', 26)))
        humid = float(data.get('humid', data.get('humidity', 52)))
        mois = float(data.get('mois', data.get('moisture', 38)))
        soil = str(data.get('soil', data.get('soil_type', 'Clayey')))
        crop = str(data.get('crop', data.get('crop_type', 'Maize')))
        nitro = float(data.get('nitro', data.get('nitrogen', 37)))
        pota = float(data.get('pota', data.get('potassium', 0)))
        phos = float(data.get('phos', data.get('phosphorous', 0)))

        result = fertilizer_engine.predict(temp, humid, mois, soil, crop, nitro, pota, phos)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/api/detect-disease', methods=['POST'])
def detect_disease():
    try:
        sample_name = "PotatoEarlyBlight1.JPG"

        if 'image' in request.files:
            file = request.files['image']
            sample_name = file.filename
        elif request.is_json:
            data = request.get_json()
            sample_name = data.get('sample_name', data.get('filename', sample_name))
        elif request.form:
            sample_name = request.form.get('sample_name', request.form.get('filename', sample_name))

        result = plant_disease_engine.predict(sample_name)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Harvest Harbor ML API Server on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
