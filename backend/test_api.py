import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_endpoints():
    print("Testing ML Backend API Endpoints...\n")

    # 1. Health Check
    try:
        r = requests.get(f"{BASE_URL}/api/health")
        print("[1/5] GET /api/health:", r.status_code)
        print(json.dumps(r.json(), indent=2))
    except Exception as e:
        print("Health Check Failed:", e)

    # 2. Crop Recommendation
    try:
        payload = {
            "N": 90, "P": 42, "K": 43,
            "temperature": 24.5, "humidity": 80.0, "ph": 6.5, "rainfall": 202.8
        }
        r = requests.post(f"{BASE_URL}/api/recommend-crop", json=payload)
        print("\n[2/5] POST /api/recommend-crop:", r.status_code)
        print(json.dumps(r.json(), indent=2))
    except Exception as e:
        print("Crop Recommendation Failed:", e)

    # 3. Crop Yield Forecast
    try:
        payload = {
            "Year": 2024, "average_rain_fall_mm_per_year": 1485.0,
            "pesticides_tonnes": 121.0, "avg_temp": 16.37,
            "Area": "India", "Item": "Maize"
        }
        r = requests.post(f"{BASE_URL}/api/predict-yield", json=payload)
        print("\n[3/5] POST /api/predict-yield:", r.status_code)
        print(json.dumps(r.json(), indent=2))
    except Exception as e:
        print("Crop Yield Prediction Failed:", e)

    # 4. Fertilizer Prediction
    try:
        payload = {
            "temp": 26, "humid": 52, "mois": 38,
            "soil": "Clayey", "crop": "Maize",
            "nitro": 37, "pota": 0, "phos": 0
        }
        r = requests.post(f"{BASE_URL}/api/predict-fertilizer", json=payload)
        print("\n[4/5] POST /api/predict-fertilizer:", r.status_code)
        print(json.dumps(r.json(), indent=2))
    except Exception as e:
        print("Fertilizer Prediction Failed:", e)

    # 5. Plant Disease Detection
    try:
        payload = {"sample_name": "PotatoEarlyBlight1.JPG"}
        r = requests.post(f"{BASE_URL}/api/detect-disease", json=payload)
        print("\n[5/5] POST /api/detect-disease:", r.status_code)
        print(json.dumps(r.json(), indent=2))
    except Exception as e:
        print("Plant Disease Detection Failed:", e)

if __name__ == "__main__":
    test_endpoints()
