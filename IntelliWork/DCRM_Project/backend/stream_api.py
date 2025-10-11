from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import joblib
from scipy.signal import find_peaks
import time
import random

app = Flask(__name__)
CORS(app)

# Load the trained model
print('Loading DCRM fault classifier model...')
try:
    model = joblib.load('dcrm_fault_classifier_v2.joblib')
    print('Model loaded successfully!')
except Exception as e:
    print(f'Error loading model: {e}')
    model = None

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

# Generate synthetic waveform for simulation
def generate_synthetic_waveform(fault_type='normal', num_samples=1000):
    time_array = np.linspace(0, 300, num_samples)
    base_resistance = 2.5 + 0.1 * np.sin(2 * np.pi * time_array / 100)

    if fault_type == 'spike':
        pos = random.randint(250, 350)
        width = random.randint(15, 25)
        magnitude = random.uniform(4, 6)
        base_resistance[pos:pos+width] += np.linspace(0, magnitude, width)
    elif fault_type == 'plateau':
        pos = random.randint(550, 650)
        width = random.randint(40, 60)
        magnitude = random.uniform(1.5, 2.5)
        base_resistance[pos:pos+width] += magnitude
    elif fault_type == 'unstable':
        pos = random.randint(850, 950)
        width = random.randint(25, 35)
        freq = random.uniform(6, 10)
        base_resistance[pos:pos+width] += 0.5 * np.sin(2 * np.pi * freq * np.arange(width) / 50)

    # Add noise
    noise = 0.05 * np.random.randn(num_samples)
    base_resistance += noise

    return base_resistance.tolist(), time_array.tolist()

@app.route('/')
def home():
    return jsonify({
        'message': 'DCRM Real-Time Monitoring API',
        'version': '2.0',
        'status': 'active',
        'endpoints': {
            '/stream': 'GET - Get simulated real-time waveform data',
            '/predict': 'POST - Analyze waveform and predict faults',
            '/health': 'GET - Check API health'
        }
    })

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'timestamp': time.time()
    })

@app.route('/stream')
def stream():
    """Endpoint for simulated real-time data streaming"""
    fault_types = ['normal', 'normal', 'normal', 'spike', 'plateau', 'unstable']  # Bias towards normal
    fault_type = random.choice(fault_types)

    resistance_data, time_data = generate_synthetic_waveform(fault_type)

    return jsonify({
        'success': True,
        'waveform': resistance_data,
        'time': time_data,
        'simulated_type': fault_type,
        'timestamp': time.time()
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Endpoint for fault prediction"""
    try:
        if model is None:
            return jsonify({
                'success': False,
                'error': 'Model not loaded'
            }), 500

        # Get waveform data from request
        data = request.get_json()

        if 'waveform' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing waveform data'
            }), 400

        waveform = np.array(data['waveform'])

        if len(waveform) < 10:
            return jsonify({
                'success': False,
                'error': 'Waveform too short (minimum 10 points)'
            }), 400

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
            },
            'timestamp': time.time()
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/simulate', methods=['POST'])
def simulate():
    """Endpoint for generating and analyzing simulated data"""
    try:
        if model is None:
            return jsonify({
                'success': False,
                'error': 'Model not loaded'
            }), 500

        data = request.get_json()
        fault_type = data.get('fault_type', 'normal')

        # Generate synthetic waveform
        resistance_data, time_data = generate_synthetic_waveform(fault_type)

        # Analyze it
        features = extract_features(np.array(resistance_data))
        features_array = np.array(features).reshape(1, -1)

        prediction = model.predict(features_array)[0]
        prediction_proba = model.predict_proba(features_array)[0]

        confidence = {}
        for label, prob in zip(model.classes_, prediction_proba):
            confidence[label] = float(prob * 100)

        return jsonify({
            'success': True,
            'waveform': resistance_data,
            'time': time_data,
            'simulated_type': fault_type,
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
            },
            'timestamp': time.time()
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print('=' * 60)
    print('DCRM Real-Time Monitoring API Starting...')
    print('=' * 60)
    print('Endpoints available:')
    print('  - http://localhost:5000/        : API info')
    print('  - http://localhost:5000/health  : Health check')
    print('  - http://localhost:5000/stream  : Get simulated data')
    print('  - http://localhost:5000/predict : Analyze waveform')
    print('  - http://localhost:5000/simulate: Generate & analyze')
    print('=' * 60)
    app.run(debug=True, host='0.0.0.0', port=5000)