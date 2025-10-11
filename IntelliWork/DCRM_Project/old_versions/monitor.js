// Configuration
const API_URL = 'http://localhost:5000';
let monitoringInterval = null;
let isMonitoring = false;
let waveformChart = null;
let startTime = null;
let stats = {
    totalScans: 0,
    faultCount: 0,
    normalCount: 0
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeChart();
    updateClock();
    setInterval(updateClock, 1000);
    updateSpeedDisplay();

    // Event listener for speed control
    document.getElementById('speedControl').addEventListener('input', updateSpeedDisplay);
});

// Update clock
function updateClock() {
    const now = new Date();
    document.getElementById('currentTime').textContent = now.toLocaleTimeString();

    // Update uptime
    if (startTime) {
        const uptime = Math.floor((now - startTime) / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = uptime % 60;
        document.getElementById('uptime').textContent = 
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

// Initialize Chart
function initializeChart() {
    const ctx = document.getElementById('waveformChart').getContext('2d');
    waveformChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Resistance (mOhm)',
                data: [],
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 300
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        maxTicksLimit: 10
                    }
                },
                y: {
                    display: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                }
            }
        }
    });
}

// Generate synthetic waveform based on type
function generateWaveform(type) {
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

    return waveform;
}

// Analyze waveform with API
async function analyzeWaveform(waveformData) {
    try {
        const response = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                waveform: waveformData
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error analyzing waveform:', error);
        return null;
    }
}

// Update waveform chart
function updateChart(waveformData) {
    const maxPoints = 100;
    const step = Math.ceil(waveformData.length / maxPoints);
    const sampledData = [];
    const sampledLabels = [];

    for (let i = 0; i < waveformData.length; i += step) {
        sampledData.push(waveformData[i]);
        sampledLabels.push(i);
    }

    waveformChart.data.labels = sampledLabels;
    waveformChart.data.datasets[0].data = sampledData;
    waveformChart.update('none');
}

// Update fault display
function updateFaultDisplay(result) {
    const faultDisplay = document.getElementById('faultDisplay');
    const faultIcon = document.getElementById('faultIcon');
    const faultText = document.getElementById('faultText');
    const faultConfidence = document.getElementById('faultConfidence');
    const breakerSwitch = document.getElementById('switchHandle');
    const statusLed = document.getElementById('statusLed');
    const stateValue = document.getElementById('stateValue');

    const predictedFault = result.predicted_fault;
    const confidence = result.confidence;
    const maxConfidence = Math.max(...Object.values(confidence));

    // Update statistics
    stats.totalScans++;
    if (predictedFault !== 'normal') {
        stats.faultCount++;
        faultDisplay.classList.add('fault-detected');
        faultIcon.textContent = '⚠️';
        faultText.textContent = predictedFault.toUpperCase() + ' FAULT DETECTED';
        breakerSwitch.classList.add('fault');
        breakerSwitch.classList.remove('active');
        statusLed.classList.add('fault');
        stateValue.textContent = 'OPEN - FAULT';
        stateValue.classList.add('fault');

        // Add alert
        addAlert(predictedFault, maxConfidence);
    } else {
        stats.normalCount++;
        faultDisplay.classList.remove('fault-detected');
        faultIcon.textContent = '✓';
        faultText.textContent = 'NO FAULT DETECTED';
        breakerSwitch.classList.add('active');
        breakerSwitch.classList.remove('fault');
        statusLed.classList.remove('fault');
        stateValue.textContent = 'CLOSED - NORMAL';
        stateValue.classList.remove('fault');
    }

    faultConfidence.textContent = `Confidence: ${maxConfidence.toFixed(2)}%`;

    // Update confidence bars
    updateConfidenceBars(confidence);

    // Update stats display
    updateStats();
}

// Update confidence bars
function updateConfidenceBars(confidence) {
    const confidenceBars = document.getElementById('confidenceBars');
    confidenceBars.innerHTML = '';

    for (const [label, score] of Object.entries(confidence)) {
        const barHtml = `
            <div class="confidence-bar">
                <div class="bar-label">
                    <span>${label}</span>
                    <span>${score.toFixed(2)}%</span>
                </div>
                <div class="bar-track">
                    <div class="bar-fill" style="width: ${score}%"></div>
                </div>
            </div>
        `;
        confidenceBars.innerHTML += barHtml;
    }
}

// Add alert to history
function addAlert(faultType, confidence) {
    const alertsContainer = document.getElementById('alertsContainer');
    const noAlerts = alertsContainer.querySelector('.no-alerts');
    if (noAlerts) {
        noAlerts.remove();
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString();

    const alertHtml = `
        <div class="alert-item">
            <div class="alert-header">
                <span class="alert-type">${faultType.toUpperCase()} FAULT</span>
                <span class="alert-time">${timeString}</span>
            </div>
            <div class="alert-message">
                Fault detected with ${confidence.toFixed(2)}% confidence. System recommends immediate inspection.
            </div>
        </div>
    `;

    alertsContainer.insertAdjacentHTML('afterbegin', alertHtml);

    // Keep only last 10 alerts
    const alerts = alertsContainer.querySelectorAll('.alert-item');
    if (alerts.length > 10) {
        alerts[alerts.length - 1].remove();
    }
}

// Update statistics
function updateStats() {
    document.getElementById('totalScans').textContent = stats.totalScans;
    document.getElementById('faultCount').textContent = stats.faultCount;

    const healthRate = stats.totalScans > 0 
        ? ((stats.normalCount / stats.totalScans) * 100).toFixed(1)
        : 100;
    document.getElementById('successRate').textContent = healthRate + '%';
}

// Start monitoring
function startMonitoring() {
    if (isMonitoring) return;

    isMonitoring = true;
    startTime = new Date();
    document.getElementById('monitorIcon').textContent = '⏸️';
    document.getElementById('systemStatus').textContent = 'Monitoring Active';

    const speed = parseInt(document.getElementById('speedControl').value);

    monitoringInterval = setInterval(async () => {
        const simType = document.getElementById('simulationType').value;
        let waveformType = simType;

        if (simType === 'random') {
            const types = ['normal', 'spike', 'plateau', 'unstable'];
            waveformType = types[Math.floor(Math.random() * types.length)];
        }

        const waveform = generateWaveform(waveformType);
        updateChart(waveform);

        const result = await analyzeWaveform(waveform);
        if (result && result.success) {
            updateFaultDisplay(result);
        }
    }, speed);
}

// Stop monitoring
function stopMonitoring() {
    if (!isMonitoring) return;

    isMonitoring = false;
    clearInterval(monitoringInterval);
    document.getElementById('monitorIcon').textContent = '▶️';
    document.getElementById('systemStatus').textContent = 'Monitoring Paused';
}

// Toggle monitoring
function toggleMonitoring() {
    if (isMonitoring) {
        stopMonitoring();
    } else {
        startMonitoring();
    }
}

// Reset system
function resetSystem() {
    stopMonitoring();
    stats = {
        totalScans: 0,
        faultCount: 0,
        normalCount: 0
    };
    startTime = null;

    // Reset displays
    document.getElementById('totalScans').textContent = '0';
    document.getElementById('faultCount').textContent = '0';
    document.getElementById('uptime').textContent = '00:00:00';
    document.getElementById('successRate').textContent = '100%';

    // Clear chart
    clearChart();

    // Clear alerts
    clearAlerts();

    // Reset fault display
    const faultDisplay = document.getElementById('faultDisplay');
    faultDisplay.classList.remove('fault-detected');
    document.getElementById('faultIcon').textContent = '✓';
    document.getElementById('faultText').textContent = 'NO FAULT DETECTED';
    document.getElementById('faultConfidence').textContent = 'Confidence: --';
    document.getElementById('confidenceBars').innerHTML = '';

    // Reset breaker
    const breakerSwitch = document.getElementById('switchHandle');
    breakerSwitch.classList.remove('active', 'fault');
    document.getElementById('statusLed').classList.remove('fault');
    document.getElementById('stateValue').textContent = 'CLOSED - NORMAL';
    document.getElementById('stateValue').classList.remove('fault');
}

// Clear chart
function clearChart() {
    waveformChart.data.labels = [];
    waveformChart.data.datasets[0].data = [];
    waveformChart.update();
}

// Clear alerts
function clearAlerts() {
    const alertsContainer = document.getElementById('alertsContainer');
    alertsContainer.innerHTML = '<div class="no-alerts">No alerts yet</div>';
}

// Update speed display
function updateSpeedDisplay() {
    const speed = parseInt(document.getElementById('speedControl').value);
    document.getElementById('speedDisplay').textContent = (speed / 1000).toFixed(1) + 's';

    // Restart monitoring with new speed if active
    if (isMonitoring) {
        stopMonitoring();
        startMonitoring();
    }
}
