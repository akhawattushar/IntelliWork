import numpy as np
import pandas as pd
from scipy.signal import savgol_filter, find_peaks
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib

# Load the synthetic DCRM dataset
print('Loading synthetic DCRM dataset...')
df = pd.read_csv('synthetic_dcrm_dataset.csv')

# Separate labels from waveform data
labels = df['label'].values
waveforms = df.drop('label', axis=1).values

print(f'Dataset loaded: {len(labels)} samples with {waveforms.shape[1]} time points each')

# Feature extraction function
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

# Extract features from all waveforms
print('Extracting features from waveforms...')
X = []
for i, waveform in enumerate(waveforms):
    if i % 50 == 0:
        print(f'Processing sample {i}/{len(waveforms)}...')
    features = extract_features(waveform)
    X.append(features)

X = np.array(X)
y = labels

print(f'Feature extraction complete. Shape: {X.shape}')

# Split into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

print(f'Training set: {len(X_train)} samples')
print(f'Testing set: {len(X_test)} samples')

# Train Random Forest Classifier
print('\nTraining Random Forest classifier...')
clf = RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42)
clf.fit(X_train, y_train)

# Make predictions
y_pred = clf.predict(X_test)

# Evaluate model
accuracy = accuracy_score(y_test, y_pred)
print(f'\nTest Accuracy: {accuracy * 100:.2f}%')
print('\nClassification Report:')
print(classification_report(y_test, y_pred))

print('\nConfusion Matrix:')
print(confusion_matrix(y_test, y_pred))

# Save the trained model
model_filename = 'dcrm_fault_classifier_v2.joblib'
joblib.dump(clf, model_filename)
print(f'\nModel saved as {model_filename}')

# Feature importance
feature_names = ['num_peaks', 'max_peak_height', 'mean', 'std', 'min', 'max', 
                 'plateau_duration', 'max_slope', 'min_slope']
importances = clf.feature_importances_
print('\nFeature Importances:')
for name, importance in zip(feature_names, importances):
    print(f'{name}: {importance:.4f}')
