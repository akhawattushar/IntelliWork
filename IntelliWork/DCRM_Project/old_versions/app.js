const API_URL = 'http://localhost:5000';

// Hide all result sections
function hideAll() {
    document.getElementById('results').classList.add('hidden');
    document.getElementById('error').classList.add('hidden');
    document.getElementById('loading').classList.add('hidden');
}

// Show loading
function showLoading() {
    hideAll();
    document.getElementById('loading').classList.remove('hidden');
}

// Show error
function showError(message) {
    hideAll();
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

// Show results
function showResults(data) {
    hideAll();
    const resultsDiv = document.getElementById('results');

    // Display fault type
    const faultTypeDiv = document.getElementById('faultType');
    faultTypeDiv.textContent = data.predicted_fault;
    faultTypeDiv.className = 'fault-type ' + data.predicted_fault;

    // Display confidence scores
    const confidenceDiv = document.getElementById('confidenceScores');
    confidenceDiv.innerHTML = '';
    for (const [label, score] of Object.entries(data.confidence)) {
        confidenceDiv.innerHTML += `
            <div class="confidence-bar">
                <div class="confidence-label">
                    <span>${label}</span>
                    <span>${score.toFixed(2)}%</span>
                </div>
                <div class="bar">
                    <div class="bar-fill" style="width: ${score}%"></div>
                </div>
            </div>
        `;
    }

    // Display features
    const featuresDiv = document.getElementById('featuresList');
    const features = data.features_extracted;
    featuresDiv.innerHTML = `
        <div class="features-grid">
            <div class="feature-item">
                <div class="feature-label">Number of Spikes</div>
                <div class="feature-value">${features.num_peaks}</div>
            </div>
            <div class="feature-item">
                <div class="feature-label">Max Peak Height</div>
                <div class="feature-value">${features.max_peak_height.toFixed(3)}</div>
            </div>
            <div class="feature-item">
                <div class="feature-label">Mean Resistance</div>
                <div class="feature-value">${features.mean.toFixed(3)}</div>
            </div>
            <div class="feature-item">
                <div class="feature-label">Std Deviation</div>
                <div class="feature-value">${features.std.toFixed(3)}</div>
            </div>
            <div class="feature-item">
                <div class="feature-label">Plateau Duration</div>
                <div class="feature-value">${features.plateau_duration}</div>
            </div>
            <div class="feature-item">
                <div class="feature-label">Max Slope</div>
                <div class="feature-value">${features.max_slope.toFixed(4)}</div>
            </div>
        </div>
    `;

    resultsDiv.classList.remove('hidden');
}

// Send waveform data to API
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
            throw new Error('API request failed');
        }

        const data = await response.json();

        if (data.success) {
            showResults(data);
        } else {
            showError(data.error || 'Unknown error occurred');
        }
    } catch (error) {
        showError('Failed to connect to API. Make sure the Flask server is running on port 5000.');
        console.error('Error:', error);
    }
}

// Upload CSV file
function uploadCSV() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];

    if (!file) {
        showError('Please select a CSV file');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const text = e.target.result;
            const lines = text.split('\n');

            // Try to find resistance column
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
                showError('Not enough valid data points in CSV file');
                return;
            }

            analyzeWaveform(waveform);
        } catch (error) {
            showError('Error parsing CSV file: ' + error.message);
        }
    };

    reader.readAsText(file);
}

// Analyze manual input
function analyzeManual() {
    const textarea = document.getElementById('waveformData');
    const text = textarea.value.trim();

    if (!text) {
        showError('Please paste waveform data');
        return;
    }

    try {
        const values = text.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));

        if (values.length < 10) {
            showError('Please provide at least 10 valid data points');
            return;
        }

        analyzeWaveform(values);
    } catch (error) {
        showError('Error parsing data: ' + error.message);
    }
}

// Generate test sample
function generateTest() {
    const type = document.getElementById('testType').value;

    // Generate synthetic waveform
    const numSamples = 1000;
    const waveform = [];

    for (let i = 0; i < numSamples; i++) {
        const t = i * 0.3;
        let value = 2.5 + 0.1 * Math.sin(2 * Math.PI * t / 100);

        if (type === 'spike' && i >= 300 && i < 320) {
            value += (i - 300) * 0.25;
        } else if (type === 'plateau' && i >= 600 && i < 650) {
            value += 2.0;
        } else if (type === 'unstable' && i >= 900 && i < 930) {
            value += 0.5 * Math.sin(8 * Math.PI * (i - 900) / 30);
        }

        value += (Math.random() - 0.5) * 0.1;
        waveform.push(value);
    }

    analyzeWaveform(waveform);
}
