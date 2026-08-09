# Harvest Harbor - Next-Gen Smart Agriculture Platform

[![Live Demo](https://img.shields.io/badge/Vercel-Live%20Demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://harvest-harbor.vercel.app/)

**Live Web Application**: [https://harvest-harbor.vercel.app/](https://harvest-harbor.vercel.app/)

Welcome to **Harvest Harbor**, an end-to-end smart agriculture ecosystem empowering modern farmers through machine learning, computer vision, and precision agronomy tools.

---

## Project Architecture

The repository is structured into a clean, modular full-stack architecture:

```
Harvest-Harbor-main/
├── frontend/                     # Interactive Web Application UI
│   ├── index.html                # Main application interface
│   ├── script.js                 # Frontend API controller & modal handlers
│   ├── styles.css                # Custom glassmorphism UI design system
│   └── images/                   # Static media assets & sample leaf images
├── backend/                      # Unified Flask Machine Learning REST API
│   ├── app.py                    # Flask API server with CORS enabled
│   ├── train_models.py           # Native ML training & pickle serialization script
│   ├── test_api.py               # REST API test suite
│   ├── requirements.txt          # Python dependencies
│   ├── models/                   # Serialized ML models & scalers
│   │   ├── crop_recommendation/  # Scikit-learn models & scalers for Crop Recommender
│   │   ├── crop_yield/           # DecisionTreeRegressor & ColumnTransformer for Yield Forecast
│   │   ├── fertilizer/           # RandomForestClassifier & Encoders for Fertilizer Predictor
│   │   └── plant_disease/        # Disease classification weights & remedies
│   ├── services/                 # Modular ML inference engines
│   │   ├── crop_recommendation_service.py
│   │   ├── crop_yield_service.py
│   │   ├── fertilizer_service.py
│   │   └── plant_disease_service.py
│   └── notebooks_and_data/       # Preserved datasets & Jupyter training notebooks
│       ├── crop_recommendation/  # crop_recommendation.csv & notebooks
│       ├── crop_yield/           # yield_df.csv & notebooks
│       ├── fertilizer/           # Fertilizer Prediction.csv & notebooks
│       └── plant_disease/        # Leaf disease datasets & test images
└── README.md
```

---

## Quick Start Guide

### 1. Install Backend Dependencies
Ensure Python 3.10+ is installed on your system.

```bash
pip install -r backend/requirements.txt
```

### 2. (Optional) Retrain ML Models
To re-fit the machine learning models on the latest dataset CSVs:

```bash
python backend/train_models.py
```

### 3. Launch the Backend REST API Server
Start the Flask backend server on port 5000:

```bash
python backend/app.py
```

*The server will start at `http://127.0.0.1:5000`.*

### 4. Launch the Web Application
Open `frontend/index.html` in your web browser or serve it using any HTTP static file server (e.g. VS Code Live Server, `python -m http.server`).

---

## ML REST API Endpoints

| Endpoint | Method | Input Parameters | Output Response |
| :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | None | API Status & Available Options Metadata |
| `/api/recommend-crop` | `POST` | `N`, `P`, `K`, `temperature`, `humidity`, `ph`, `rainfall` | Recommended Crop Name & Agronomic Summary |
| `/api/predict-yield` | `POST` | `Year`, `average_rain_fall_mm_per_year`, `pesticides_tonnes`, `avg_temp`, `Area`, `Item` | Predicted Yield (hg/ha) & Quintals per Acre |
| `/api/predict-fertilizer` | `POST` | `temp`, `humid`, `mois`, `soil`, `crop`, `nitro`, `pota`, `phos` | Prescribed Fertilizer & Split Dosing Guide |
| `/api/detect-disease` | `POST` | `sample_name` or Image File | Detected Pathogen, Confidence Score & Treatment Plan |

---

## Key Features & AI Suite
1. **Plant Disease Detection**: Neural network diagnosis of leaf lesions, fungal infections, and pathogens with treatment guides.
2. **Smart Crop Recommendation**: Soil chemical parameter analysis (NPK, pH, rainfall) predicting maximum yield suitability.
3. **Harvest Yield Forecasting**: Historical weather & acreage regression model predicting harvest output in Quintals.
4. **Precision Fertilizer Dosing**: Soil & crop nutrient balancing preventing over-application and soil degradation.
5. **AgroMart Marketplace Integration**: Direct access to buy/sell seeds, fertilizers, and produce without middleman markups.
