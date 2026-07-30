import os
import pickle
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler, OneHotEncoder, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestClassifier

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
DATA_DIR = os.path.join(BASE_DIR, 'notebooks_and_data')

def train_crop_recommendation():
    print("[1/3] Training Crop Recommendation Model...")
    csv_path = os.path.join(DATA_DIR, 'crop_recommendation', 'crop_recommendation.csv')
    df = pd.read_csv(csv_path)

    X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    y = df['label']

    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    ms = MinMaxScaler()
    sc = StandardScaler()

    X_ms = ms.fit_transform(X)
    X_sc = sc.fit_transform(X_ms)

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_sc, y_encoded)

    out_dir = os.path.join(MODELS_DIR, 'crop_recommendation')
    os.makedirs(out_dir, exist_ok=True)

    with open(os.path.join(out_dir, 'model-2.pkl'), 'wb') as f:
        pickle.dump(model, f)
    with open(os.path.join(out_dir, 'standscaler.pkl'), 'wb') as f:
        pickle.dump(sc, f)
    with open(os.path.join(out_dir, 'minmaxscaler.pkl'), 'wb') as f:
        pickle.dump(ms, f)
    with open(os.path.join(out_dir, 'label_encoder.pkl'), 'wb') as f:
        pickle.dump(label_encoder, f)

    print(f"Crop Recommendation model trained successfully ({len(label_encoder.classes_)} crops).")

def train_crop_yield():
    print("[2/3] Training Crop Yield Forecast Model...")
    csv_path = os.path.join(DATA_DIR, 'crop_yield', 'yield_df.csv')
    df = pd.read_csv(csv_path)
    if 'Unnamed: 0' in df.columns:
        df = df.drop(columns=['Unnamed: 0'])

    X = df[['Year', 'average_rain_fall_mm_per_year', 'pesticides_tonnes', 'avg_temp', 'Area', 'Item']]
    y = df['hg/ha_yield']

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), ['Year', 'average_rain_fall_mm_per_year', 'pesticides_tonnes', 'avg_temp']),
            ('cat', OneHotEncoder(drop='first', handle_unknown='ignore'), ['Area', 'Item'])
        ]
    )

    X_trans = preprocessor.fit_transform(X)
    dtr = DecisionTreeRegressor(max_depth=15, random_state=42)
    dtr.fit(X_trans, y)

    out_dir = os.path.join(MODELS_DIR, 'crop_yield')
    os.makedirs(out_dir, exist_ok=True)

    with open(os.path.join(out_dir, 'dtr.pkl'), 'wb') as f:
        pickle.dump(dtr, f)
    with open(os.path.join(out_dir, 'preprocessor.pkl'), 'wb') as f:
        pickle.dump(preprocessor, f)

    metadata = {
        "areas": sorted(df['Area'].dropna().unique().tolist()),
        "items": sorted(df['Item'].dropna().unique().tolist())
    }
    with open(os.path.join(out_dir, 'metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=2)

    print(f"Crop Yield model trained successfully ({len(metadata['areas'])} countries, {len(metadata['items'])} crops).")

def train_fertilizer():
    print("[3/3] Training Fertilizer Prediction Model...")
    csv_path = os.path.join(DATA_DIR, 'fertilizer', 'Fertilizer Prediction.csv')
    df = pd.read_csv(csv_path)

    col_map = {
        'Temparature': 'temperature',
        'Humidity ': 'humidity',
        'Humidity': 'humidity',
        'Moisture': 'moisture',
        'Soil Type': 'soil_type',
        'Crop Type': 'crop_type',
        'Nitrogen': 'nitrogen',
        'Potassium': 'potassium',
        'Phosphorous': 'phosphorous',
        'Fertilizer Name': 'fertilizer'
    }
    df = df.rename(columns=col_map)

    soil_le = LabelEncoder()
    crop_le = LabelEncoder()
    fert_le = LabelEncoder()

    df['soil_type_enc'] = soil_le.fit_transform(df['soil_type'])
    df['crop_type_enc'] = crop_le.fit_transform(df['crop_type'])
    y_encoded = fert_le.fit_transform(df['fertilizer'])

    X = df[['temperature', 'humidity', 'moisture', 'soil_type_enc', 'crop_type_enc', 'nitrogen', 'potassium', 'phosphorous']]

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y_encoded)

    out_dir = os.path.join(MODELS_DIR, 'fertilizer')
    os.makedirs(out_dir, exist_ok=True)

    with open(os.path.join(out_dir, 'classifier.pkl'), 'wb') as f:
        pickle.dump(model, f)
    with open(os.path.join(out_dir, 'fertilizer.pkl'), 'wb') as f:
        pickle.dump(fert_le, f)

    encoders = {
        "soil_types": {str(k): int(v) for k, v in zip(soil_le.classes_, soil_le.transform(soil_le.classes_))},
        "crop_types": {str(k): int(v) for k, v in zip(crop_le.classes_, crop_le.transform(crop_le.classes_))},
        "fertilizers": fert_le.classes_.tolist()
    }
    with open(os.path.join(out_dir, 'encoders.json'), 'w') as f:
        json.dump(encoders, f, indent=2)

    print("Fertilizer prediction model trained successfully.")

if __name__ == '__main__':
    train_crop_recommendation()
    train_crop_yield()
    train_fertilizer()
    print("All ML models trained and serialized successfully!")
