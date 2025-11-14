import numpy as np
import pandas as pd
from scipy.signal import savgol_filter, find_peaks
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# Function to generate a synthetic waveform based on label (normal, spike, plateau, unstable)
def generate_waveform(label, num_samples=1000, num_cycles=3):
    time = np.linspace(0, num_cycles*100, num_samples)
    base_resistance = 2.5
    resistance = base_resistance + 0.1 * np.sin(2 * np.pi * time / 100)

    if label == 'spike':
        pos = int(num_samples * 0.3)
        resistance[pos:pos+20] += np.linspace(0, 5, 20)
    elif label == 'plateau':
        pos = int(num_samples * 0.6)
        resistance[pos:pos+50] += 2.0
    elif label == 'unstable':
        pos = int(num_samples * 0.9)
        resistance[pos:pos+30] += 0.5 * np.sin(4 * np.pi * time[pos:pos+30] / 50)

    resistance += 0.05 * np.random.randn(num_samples)
    return time, resistance

# Feature extraction code from previous script
def extract_features(signal, time):
    peaks, _ = find_peaks(signal, height=0.6, distance=20)
    num_peaks = len(peaks)
    max_peak_height = np.max(signal[peaks]) if num_peaks > 0 else 0
    mean_height = np.mean(signal)
    std_height = np.std(signal)
    min_height = np.min(signal)
    max_height = np.max(signal)
    plateau = signal > 0.5
    plateau_duration = np.sum(plateau) * (time[1] - time[0])
    diffs = np.diff(signal)
    max_slope = np.max(diffs)
    min_slope = np.min(diffs)
    return [num_peaks, max_peak_height, mean_height, std_height, min_height, max_height, plateau_duration, max_slope, min_slope]

# Generate labeled dataset
labels = ['normal', 'spike', 'plateau', 'unstable']
num_samples_per_class = 50

X = []
y = []
for label in labels:
    for _ in range(num_samples_per_class):
        t, r = generate_waveform(label)
        r_smooth = savgol_filter(r, window_length=51, polyorder=3)
        r_norm = (r_smooth - r_smooth.min()) / (r_smooth.max() - r_smooth.min())
        features = extract_features(r_norm, t)
        X.append(features)
        y.append(label)

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Random Forest Classifier
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_train, y_train)

# Predict and evaluate
predictions = clf.predict(X_test)
acc = accuracy_score(y_test, predictions)
report = classification_report(y_test, predictions)

print(f'Test Accuracy: {acc * 100:.2f}%')
print('Classification Report:')
print(report)

# Save the trained model for future use if desired
import joblib
joblib.dump(clf, 'dcrm_fault_classifier.joblib')
print('Model saved as dcrm_fault_classifier.joblib')
