import os
import pickle
import numpy as np

class CropRecommendationEngine:
    def __init__(self, model_dir):
        self.model_path = os.path.join(model_dir, 'crop_recommendation', 'model-2.pkl')
        self.sc_path = os.path.join(model_dir, 'crop_recommendation', 'standscaler.pkl')
        self.ms_path = os.path.join(model_dir, 'crop_recommendation', 'minmaxscaler.pkl')
        self.le_path = os.path.join(model_dir, 'crop_recommendation', 'label_encoder.pkl')

        self.model = pickle.load(open(self.model_path, 'rb'))
        self.sc = pickle.load(open(self.sc_path, 'rb'))
        self.ms = pickle.load(open(self.ms_path, 'rb'))
        self.le = pickle.load(open(self.le_path, 'rb')) if os.path.exists(self.le_path) else None

        self.crop_dict = {
            1: "Rice", 2: "Maize", 3: "Jute", 4: "Cotton", 5: "Coconut", 6: "Papaya", 7: "Orange",
            8: "Apple", 9: "Muskmelon", 10: "Watermelon", 11: "Grapes", 12: "Mango", 13: "Banana",
            14: "Pomegranate", 15: "Lentil", 16: "Blackgram", 17: "Mungbean", 18: "Mothbeans",
            19: "Pigeonpeas", 20: "Kidneybeans", 21: "Chickpea", 22: "Coffee"
        }

    def predict(self, n, p, k, temp, humidity, ph, rainfall):
        features = np.array([[n, p, k, temp, humidity, ph, rainfall]], dtype=float)
        scaled_ms = self.ms.transform(features)
        scaled_final = self.sc.transform(scaled_ms)

        pred_idx = self.model.predict(scaled_final)[0]

        if self.le is not None and isinstance(pred_idx, (int, np.integer)):
            crop_name = self.le.inverse_transform([pred_idx])[0].capitalize()
        elif isinstance(pred_idx, str):
            crop_name = pred_idx.capitalize()
        else:
            crop_name = self.crop_dict.get(int(pred_idx), "Unknown Crop")

        return {
            "status": "success",
            "recommended_crop": crop_name,
            "inputs": {
                "N": n, "P": p, "K": k, "temperature": temp,
                "humidity": humidity, "ph": ph, "rainfall": rainfall
            },
            "message": f"{crop_name} is the optimal crop for your soil and climate profile."
        }
