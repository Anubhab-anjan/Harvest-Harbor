import os
import pickle
import json
import pandas as pd
import numpy as np

class CropYieldEngine:
    def __init__(self, model_dir):
        self.model_path = os.path.join(model_dir, 'crop_yield', 'dtr.pkl')
        self.preprocessor_path = os.path.join(model_dir, 'crop_yield', 'preprocessor.pkl')
        self.metadata_path = os.path.join(model_dir, 'crop_yield', 'metadata.json')

        self.model = pickle.load(open(self.model_path, 'rb'))
        self.preprocessor = pickle.load(open(self.preprocessor_path, 'rb'))
        
        self.metadata = {"areas": ["India", "United States", "China"], "items": ["Maize", "Wheat", "Potatoes", "Rice, paddy"]}
        if os.path.exists(self.metadata_path):
            with open(self.metadata_path, 'r') as f:
                self.metadata = json.load(f)

    def get_metadata(self):
        return self.metadata

    def predict(self, year, rain, pesticides, temp, area, item):
        df_input = pd.DataFrame([{
            'Year': float(year),
            'average_rain_fall_mm_per_year': float(rain),
            'pesticides_tonnes': float(pesticides),
            'avg_temp': float(temp),
            'Area': str(area),
            'Item': str(item)
        }])

        X_trans = self.preprocessor.transform(df_input)
        yield_hg_ha = float(self.model.predict(X_trans)[0])

        # Conversion: 1 hg/ha = 0.001 Quintals/hectare ≈ 0.0004047 Quintals/acre
        # Or standard yield per acre estimate: yield_hg_ha / 2000
        quintals_per_acre = round(max(5.0, yield_hg_ha / 2200.0), 1)

        return {
            "status": "success",
            "predicted_yield_hg_ha": round(yield_hg_ha, 2),
            "estimated_quintals_per_acre": quintals_per_acre,
            "inputs": {
                "Year": year, "Rainfall": rain, "Pesticides": pesticides,
                "Temperature": temp, "Area": area, "Item": item
            },
            "message": f"Estimated Harvest Yield for {item} in {area}: {quintals_per_acre} Quintals per Acre."
        }
