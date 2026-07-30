import os
import pickle
import json
import numpy as np

class FertilizerEngine:
    def __init__(self, model_dir):
        self.model_path = os.path.join(model_dir, 'fertilizer', 'classifier.pkl')
        self.fert_path = os.path.join(model_dir, 'fertilizer', 'fertilizer.pkl')
        self.encoders_path = os.path.join(model_dir, 'fertilizer', 'encoders.json')

        self.model = pickle.load(open(self.model_path, 'rb'))
        self.fert_le = pickle.load(open(self.fert_path, 'rb'))

        self.encoders = {
            "soil_types": {"Black": 0, "Clayey": 1, "Loamy": 2, "Red": 3, "Sandy": 4},
            "crop_types": {"Barley": 0, "Cotton": 1, "Ground Nuts": 2, "Maize": 3, "Millets": 4, "Oil seeds": 5, "Paddy": 6, "Pulses": 7, "Sugarcane": 8, "Tobacco": 9, "Wheat": 10},
            "fertilizers": ["Urea", "DAP", "14-35-14", "28-28", "17-17-17", "20-20", "10-26-26"]
        }
        if os.path.exists(self.encoders_path):
            with open(self.encoders_path, 'r') as f:
                self.encoders = json.load(f)

    def get_options(self):
        return {
            "soil_types": list(self.encoders["soil_types"].keys()),
            "crop_types": list(self.encoders["crop_types"].keys())
        }

    def predict(self, temp, humid, mois, soil, crop, nitro, pota, phos):
        soil_types = self.encoders["soil_types"]
        crop_types = self.encoders["crop_types"]

        # Encoded values with fallbacks
        soil_code = soil_types.get(soil, 0 if not isinstance(soil, int) else soil)
        crop_code = crop_types.get(crop, 0 if not isinstance(crop, int) else crop)

        input_vec = np.array([[float(temp), float(humid), float(mois), int(soil_code), int(crop_code), float(nitro), float(pota), float(phos)]])

        pred_idx = self.model.predict(input_vec)[0]

        if hasattr(self.fert_le, 'inverse_transform'):
            fert_name = self.fert_le.inverse_transform([pred_idx])[0]
        elif hasattr(self.fert_le, 'classes_'):
            fert_name = self.fert_le.classes_[pred_idx]
        else:
            fert_name = self.encoders["fertilizers"][int(pred_idx)] if int(pred_idx) < len(self.encoders["fertilizers"]) else "Urea"

        recommendations = {
            "Urea": "High Nitrogen content (46%). Apply 50 kg/acre split into 2 doses: during land preparation and 30 days after sowing.",
            "DAP": "Di-Ammonium Phosphate (18-46-0). Ideal for root development. Apply 35 kg/acre during sowing.",
            "14-35-14": "Balanced NPK mixture rich in Phosphate. Recommended dosage: 40 kg/acre.",
            "28-28": "Complex fertilizer. Apply 30 kg/acre during basal dressing.",
            "17-17-17": "Equal NPK balance. Apply 45 kg/acre for uniform foliage and seed set.",
            "20-20": "High Nitrogen and Phosphorous. Recommended 40 kg/acre.",
            "10-26-26": "Potassium & Phosphorous rich. Ideal for grain filling stage. Apply 35 kg/acre."
        }

        guide = recommendations.get(fert_name, f"Apply {fert_name} according to local agronomic soil test guidelines.")

        return {
            "status": "success",
            "recommended_fertilizer": fert_name,
            "dosage_guide": guide,
            "inputs": {
                "temperature": temp, "humidity": humid, "moisture": mois,
                "soil_type": soil, "crop_type": crop,
                "nitrogen": nitro, "potassium": pota, "phosphorous": phos
            },
            "message": f"Prescribed Fertilizer Formulation: {fert_name}"
        }
