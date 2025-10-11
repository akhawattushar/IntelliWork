import pandas as pd
import matplotlib.pyplot as plt
from scipy.signal import savgol_filter

# Load synthetic DCRM data
df = pd.read_csv('synthetic_dcrm_waveform.csv')

# Plot raw data
plt.figure(figsize=(10, 4))
plt.plot(df['Time(ms)'], df['Resistance(mOhm)'], label='Raw Signal')
plt.title('Raw Synthetic DCRM Waveform')
plt.xlabel('Time (ms)')
plt.ylabel('Resistance (mOhm)')
plt.grid(True)
plt.legend()
plt.show()

# Apply Savitzky-Golay filter for smoothing (denoising)
window_length = 51  # Choose odd number
polyorder = 3
smoothed_resistance = savgol_filter(df['Resistance(mOhm)'], window_length, polyorder)

# Normalize smoothed signal (min-max normalization)
norm_resistance = (smoothed_resistance - smoothed_resistance.min()) / (smoothed_resistance.max() - smoothed_resistance.min())

# Plot smoothed + normalized signal
plt.figure(figsize=(10, 4))
plt.plot(df['Time(ms)'], norm_resistance, label='Smoothed + Normalized Signal', color='orange')
plt.title('Preprocessed Synthetic DCRM Waveform')
plt.xlabel('Time (ms)')
plt.ylabel('Normalized Resistance')
plt.grid(True)
plt.legend()
plt.show()
