from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib
from scipy.signal import find_peaks

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# Load the trained model at startup
print('Loading DCRM fault classifier model...')
model = joblib.load('dcrm_fault_classifier_v2.joblib')
print('Model loaded successfully!')

# Feature extraction function
def extract_features(signal):
    # Normalize signal
    signal_norm = (signal - signal.min()) / (signal.max() - signal.min() + 1e-10)

    # Find peaks
    peaks, _ = find_peaks(signal_norm, height=0.6, distance=20)
    num_peaks = len(peaks)
    max_peak_height = np.max(signal_norm[peaks]) if num_peaks > 0 else 0

    # Statistical features
    mean_val = np.mean(signal_norm)
    std_val = np.std(signal_norm)
    min_val = np.min(signal_norm)
    max_val = np.max(signal_norm)

    # Plateau detection
    plateau = signal_norm > 0.5
    plateau_duration = np.sum(plateau)

    # Slope features
    diffs = np.diff(signal_norm)
    max_slope = np.max(diffs) if len(diffs) > 0 else 0
    min_slope = np.min(diffs) if len(diffs) > 0 else 0

    return [num_peaks, max_peak_height, mean_val, std_val, min_val, max_val, 
            plateau_duration, max_slope, min_slope]

@app.route('/')
def home():
    return jsonify({
        'message': 'DCRM Fault Detection API',
        'version': '1.0',
        'endpoints': {
            '/predict': 'POST - Submit waveform data for fault prediction',
            '/health': 'GET - Check API health status'
        }
    })

@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'model_loaded': True})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get waveform data from request
        data = request.get_json()

        if 'waveform' not in data:
            return jsonify({'error': 'Missing waveform data'}), 400

        waveform = np.array(data['waveform'])

        if len(waveform) < 10:
            return jsonify({'error': 'Waveform too short (minimum 10 points)'}), 400

        # Extract features
        features = extract_features(waveform)
        features_array = np.array(features).reshape(1, -1)

        # Make prediction
        prediction = model.predict(features_array)[0]
        prediction_proba = model.predict_proba(features_array)[0]

        # Prepare confidence scores
        confidence = {}
        for label, prob in zip(model.classes_, prediction_proba):
            confidence[label] = float(prob * 100)

        # Return results
        return jsonify({
            'success': True,
            'predicted_fault': prediction,
            'confidence': confidence,
            'features_extracted': {
                'num_peaks': int(features[0]),
                'max_peak_height': float(features[1]),
                'mean': float(features[2]),
                'std': float(features[3]),
                'plateau_duration': int(features[6]),
                'max_slope': float(features[7]),
                'min_slope': float(features[8])
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print('Starting DCRM Fault Detection API...')
    print('API will be available at: http://localhost:5000')
    app.run(debug=True, host='0.0.0.0', port=5000)
