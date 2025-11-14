// Configuration
const API_URL = 'https://akhawattushar-intelliwork-backend.hf.space';

// Utility Functions
function hideAll() {
    document.getElementById('results').classList.add('hidden');
    document.getElementById('error').classList.add('hidden');
    document.getElementById('loading').classList.add('hidden');
}

function showLoading() {
    hideAll();
    document.getElementById('loading').classList.remove('hidden');
}

function showError(message) {
    hideAll();
    const errorBanner = document.getElementById('error');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorBanner.classList.remove('hidden');

    // Scroll to error
    errorBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showResults(data) {
    hideAll();
    const resultsSection = document.getElementById('results');

    // Display fault type with appropriate styling
    const faultTypeDiv = document.getElementById('faultType');
    faultTypeDiv.textContent = data.predicted_fault.toUpperCase();
    faultTypeDiv.className = 'prediction-badge ' + data.predicted_fault;

    // Display confidence scores
    const confidenceDiv = document.getElementById('confidenceScores');
    confidenceDiv.innerHTML = '';

    for (const [label, score] of Object.entries(data.confidence)) {
        const confidenceItem = `
            <div class="confidence-item">
                <div class="confidence-header">
                    <span class="confidence-name">${label}</span>
                    <span class="confidence-value">${score.toFixed(2)}%</span>
                </div>
                <div class="confidence-bar-track">
                    <div class="confidence-bar-fill" style="width: ${score}%"></div>
                </div>
            </div>
        `;
        confidenceDiv.innerHTML += confidenceItem;
    }

    // Display extracted features
    const featuresDiv = document.getElementById('featuresList');
    const features = data.features_extracted;
    featuresDiv.innerHTML = `
        <div class="feature-box">
            <div class="feature-name">Num Spikes</div>
            <div class="feature-value">${features.num_peaks}</div>
        </div>
        <div class="feature-box">
            <div class="feature-name">Peak Height</div>
            <div class="feature-value">${features.max_peak_height.toFixed(3)}</div>
        </div>
        <div class="feature-box">
            <div class="feature-name">Mean</div>
            <div class="feature-value">${features.mean.toFixed(3)}</div>
        </div>
        <div class="feature-box">
            <div class="feature-name">Std Dev</div>
            <div class="feature-value">${features.std.toFixed(3)}</div>
        </div>
        <div class="feature-box">
            <div class="feature-name">Plateau Dur.</div>
            <div class="feature-value">${features.plateau_duration}</div>
        </div>
        <div class="feature-box">
            <div class="feature-name">Max Slope</div>
            <div class="feature-value">${features.max_slope.toFixed(4)}</div>
        </div>
    `;

    resultsSection.classList.remove('hidden');

    // Smooth scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// API Communication
async function analyzeWaveform(waveformArray) {
    showLoading();

    try {
        const response = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                waveform: waveformArray
            })
        });

        if (!response.ok) {
            throw new Error('API request failed. Status: ' + response.status);
        }

        const data = await response.json();

        if (data.success) {
            // Add slight delay for smooth transition
            setTimeout(() => {
                showResults(data);
            }, 800);
        } else {
            showError(data.error || 'Unknown error occurred');
        }
    } catch (error) {
        showError('Failed to connect to API. Make sure the Flask server is running on port 5000.');
        console.error('Error:', error);
    }
}

// CSV Upload Handler
function uploadCSV() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];

    if (!file) {
        showError('Please select a CSV file first');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const text = e.target.result;
            const lines = text.split('\n').filter(line => line.trim());

            // Try to find resistance column (assume column 2)
            let waveform = [];
            for (let i = 1; i < lines.length; i++) {
                const parts = lines[i].split(',');
                if (parts.length >= 2) {
                    const value = parseFloat(parts[1].trim());
                    if (!isNaN(value)) {
                        waveform.push(value);
                    }
                }
            }

            if (waveform.length < 10) {
                showError('Not enough valid data points in CSV file. Minimum 10 points required.');
                return;
            }

            analyzeWaveform(waveform);
        } catch (error) {
            showError('Error parsing CSV file: ' + error.message);
        }
    };

    reader.onerror = function() {
        showError('Error reading file. Please try again.');
    };

    reader.readAsText(file);
}

// Manual Data Input Handler
function analyzeManual() {
    const textarea = document.getElementById('waveformData');
    const text = textarea.value.trim();

    if (!text) {
        showError('Please paste waveform data first');
        return;
    }

    try {
        // Parse comma-separated values
        const values = text.split(',')
            .map(v => parseFloat(v.trim()))
            .filter(v => !isNaN(v));

        if (values.length < 10) {
            showError('Please provide at least 10 valid data points');
            return;
        }

        analyzeWaveform(values);
    } catch (error) {
        showError('Error parsing data: ' + error.message);
    }
}

// Generate Test Sample
function generateTest() {
    const type = document.getElementById('testType').value;

    // Generate synthetic waveform (1000 samples)
    const numSamples = 1000;
    const waveform = [];

    for (let i = 0; i < numSamples; i++) {
        const t = i * 0.3;
        let value = 2.5 + 0.1 * Math.sin(2 * Math.PI * t / 100);

        // Add fault-specific patterns
        if (type === 'spike' && i >= 300 && i < 320) {
            value += (i - 300) * 0.25;
        } else if (type === 'plateau' && i >= 600 && i < 650) {
            value += 2.0;
        } else if (type === 'unstable' && i >= 900 && i < 930) {
            value += 0.5 * Math.sin(8 * Math.PI * (i - 900) / 30);
        }

        // Add random noise
        value += (Math.random() - 0.5) * 0.1;
        waveform.push(value);
    }

    analyzeWaveform(waveform);
}

// File Input Change Handler
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('csvFile');
    const dropZone = document.getElementById('dropZone');

    // File input change
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            const fileName = e.target.files[0].name;
            const uploadText = dropZone.querySelector('.upload-text');
            uploadText.textContent = '📄 ' + fileName;
        }
    });

    // Drag and drop handlers
    dropZone.addEventListener('click', function() {
        fileInput.click();
    });

    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--primary)';
        dropZone.style.background = 'rgba(99, 102, 241, 0.15)';
    });

    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        dropZone.style.borderColor = 'rgba(99, 102, 241, 0.3)';
        dropZone.style.background = 'rgba(99, 102, 241, 0.05)';
    });

    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.style.borderColor = 'rgba(99, 102, 241, 0.3)';
        dropZone.style.background = 'rgba(99, 102, 241, 0.05)';

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            const fileName = files[0].name;
            const uploadText = dropZone.querySelector('.upload-text');
            uploadText.textContent = '📄 ' + fileName;
        }
    });
});
