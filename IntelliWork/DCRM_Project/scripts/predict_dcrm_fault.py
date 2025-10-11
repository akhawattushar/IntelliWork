import numpy as np
import pandas as pd
import joblib
import matplotlib.pyplot as plt
from scipy.signal import savgol_filter, find_peaks

# Load the trained model
print('Loading trained DCRM fault classifier...')
model = joblib.load('dcrm_fault_classifier_v2.joblib')
print('Model loaded successfully!')

# Feature extraction function (same as training)
def extract_features(signal):
    # Normalize signal first
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

# Function to generate test waveform (you can replace this with real data loading)
def generate_test_waveform(label='spike', num_samples=1000):
    time = np.linspace(0, 300, num_samples)
    base_resistance = 2.5 + 0.1 * np.sin(2 * np.pi * time / 100)

    if label == 'spike':
        pos = 300
        base_resistance[pos:pos+20] += np.linspace(0, 5, 20)
    elif label == 'plateau':
        pos = 600
        base_resistance[pos:pos+50] += 2.0
    elif label == 'unstable':
        pos = 900
        base_resistance[pos:pos+30] += 0.5 * np.sin(8 * np.pi * time[pos:pos+30] / 50)

    base_resistance += 0.05 * np.random.randn(num_samples)
    return time, base_resistance

# Test the model with a new waveform
print('\nGenerating test waveform...')
test_label = 'spike'  # Change this to 'normal', 'plateau', 'unstable' to test different faults
time, resistance = generate_test_waveform(label=test_label)

print(f'Test waveform type: {test_label}')

# Extract features
features = extract_features(resistance)
features_array = np.array(features).reshape(1, -1)

# Make prediction
prediction = model.predict(features_array)[0]
prediction_proba = model.predict_proba(features_array)[0]

# Display results
print('\n' + '='*60)
print('PREDICTION RESULTS')
print('='*60)
print(f'Predicted Fault Type: {prediction.upper()}')
print(f'\nPrediction Confidence:')
for label, prob in zip(model.classes_, prediction_proba):
    print(f'  {label}: {prob*100:.2f}%')
print('='*60)

# Visualize the waveform and prediction
plt.figure(figsize=(12, 6))
plt.plot(time, resistance, linewidth=1.5)
plt.title(f'DCRM Waveform - Predicted: {prediction.upper()} (Actual: {test_label.upper()})', 
          fontsize=14, fontweight='bold')
plt.xlabel('Time (ms)', fontsize=12)
plt.ylabel('Resistance (mOhm)', fontsize=12)
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()

print('\nTo test with real data:')
print('  1. Load your CSV file using: df = pd.read_csv("your_file.csv")')
print('  2. Extract resistance column: resistance = df["Resistance(mOhm)"].values')
print('  3. Use the same feature extraction and prediction code above')
