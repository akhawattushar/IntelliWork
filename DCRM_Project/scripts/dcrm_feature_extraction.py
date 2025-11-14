import pandas as pd
import numpy as np
from scipy.signal import savgol_filter, find_peaks

# Load synthetic DCRM data
df = pd.read_csv('synthetic_dcrm_waveform.csv')
resistance = df['Resistance(mOhm)'].to_numpy()
time = df['Time(ms)'].to_numpy()

# Preprocessing: Savitzky-Golay smoothing
window_length = 51 if len(resistance) > 51 else 11
smoothed = savgol_filter(resistance, window_length=window_length, polyorder=3)

# Normalization
normalized = (smoothed - smoothed.min()) / (smoothed.max() - smoothed.min())

# Feature Extraction Functions
def extract_features(signal, time):
    # Detect peaks in the normalized signal
    peaks, peak_props = find_peaks(signal, height=0.6, distance=20)

    num_peaks = len(peaks)
    max_peak_height = np.max(signal[peaks]) if num_peaks > 0 else 0
    mean_height = np.mean(signal)
    std_height = np.std(signal)
    min_height = np.min(signal)
    max_height = np.max(signal)

    # Plateaus: regions where signal is above 0.5
    plateau = signal > 0.5
    plateau_duration = np.sum(plateau) * (time[1] - time[0])

    # Slope features
    diffs = np.diff(signal)
    max_slope = np.max(diffs)
    min_slope = np.min(diffs)

    return {
        'num_spikes': num_peaks,
        'max_spike_height': max_peak_height,
        'mean_resistance': mean_height,
        'std_resistance': std_height,
        'min_resistance': min_height,
        'max_resistance': max_height,
        'plateau_duration_ms': plateau_duration,
        'max_slope': max_slope,
        'min_slope': min_slope
    }

# Extract features
feature_dict = extract_features(normalized, time)
features_df = pd.DataFrame([feature_dict])

# Print and save features
print('Extracted Features from DCRM Waveform:')
print('=' * 50)
print(features_df.T)
print('=' * 50)
print('\nFeatures saved to: dcrm_extracted_features.csv')

features_df.to_csv('dcrm_extracted_features.csv', index=False)
