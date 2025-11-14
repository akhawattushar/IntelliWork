// Real-Time Monitoring Dashboard with Demo/Hardware Mode Toggle
// Save this as: monitor_v2_with_toggle.js

const API_URL = 'https://akhawattushar-intelliwork-backend.hf.space';

// Global state
let monitoringInterval = null;
let isMonitoring = false;
let waveformChart = null;
let startTime = null;
let statistics = {
    totalScans: 0,
    faultCount: 0,
    normalCount: 0
};

// Mode state
let isHardwareMode = false;

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    initializeWaveformChart();
    updateClockDisplay();
    setInterval(updateClockDisplay, 1000);
    setupEventListeners();
    updateSpeedDisplay();
    updateModeDisplay();
});

// Setup event listeners
function setupEventListeners() {
    const speedControl = document.getElementById('speedControl');
    if (speedControl) {
        speedControl.addEventListener('input', updateSpeedDisplay);
    }

    // Mode toggle listener
    const modeToggle = document.getElementById('modeToggle');
    if (modeToggle) {
        modeToggle.addEventListener('change', handleModeSwitch);
    }
}

// Handle mode switch
function handleModeSwitch() {
    const modeToggle = document.getElementById('modeToggle');
    isHardwareMode = modeToggle.checked;

    console.log('Switched to ' + (isHardwareMode ? 'Hardware' : 'Demo') + ' Mode');

    // Update UI
    updateModeDisplay();

    // Restart monitoring if active
    if (isMonitoring) {
        stopMonitoring();
        setTimeout(() => {
            startMonitoring();
        }, 500);
    }
}

// Update mode display
function updateModeDisplay() {
    const modeInfoBanner = document.getElementById('modeInfoBanner');
    const simulationControl = document.getElementById('simulationControl');
    const hardwareInfo = document.getElementById('hardwareInfo');

    if (isHardwareMode) {
        // Hardware mode
        if (modeInfoBanner) {
            modeInfoBanner.classList.add('hardware-mode');
            modeInfoBanner.querySelector('.banner-icon').textContent = '🔧';
            modeInfoBanner.querySelector('strong').textContent = 'Hardware Mode Active';
            modeInfoBanner.querySelector('p').textContent = 'Receiving real-time data from ESP32 sensors';
        }

        if (simulationControl) simulationControl.classList.add('hidden');
        if (hardwareInfo) hardwareInfo.classList.remove('hidden');
    } else {
        // Demo mode
        if (modeInfoBanner) {
            modeInfoBanner.classList.remove('hardware-mode');
            modeInfoBanner.querySelector('.banner-icon').textContent = '🧪';
            modeInfoBanner.querySelector('strong').textContent = 'Demo Mode Active';
            modeInfoBanner.querySelector('p').textContent = 'Using simulated waveform data for testing and presentation';
        }

        if (simulationControl) simulationControl.classList.remove('hidden');
        if (hardwareInfo) hardwareInfo.classList.add('hidden');
    }
}

// Update clock and uptime
function updateClockDisplay() {
    const now = new Date();
    const timeDisplay = document.getElementById('currentTime');
    if (timeDisplay) {
        timeDisplay.textContent = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
    }

    if (startTime) {
        const uptime = Math.floor((now - startTime) / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = uptime % 60;
        const uptimeDisplay = document.getElementById('uptime');
        if (uptimeDisplay) {
            uptimeDisplay.textContent = 
                String(hours).padStart(2, '0') + ':' + 
                String(minutes).padStart(2, '0') + ':' + 
                String(seconds).padStart(2, '0');
        }
    }
}

// Initialize Chart.js waveform chart
function initializeWaveformChart() {
    const ctx = document.getElementById('waveformChart');
    if (!ctx) return;

    waveformChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Resistance (mOhm)',
                data: [],
                borderColor: '#14b8a6',
                backgroundColor: 'rgba(20, 184, 166, 0.1)',
                borderWidth: 2.5,
                tension: 0.4,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 400
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        color: 'rgba(20, 184, 166, 0.1)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)',
                        maxTicksLimit: 12,
                        font: { size: 11 }
                    }
                },
                y: {
                    display: true,
                    grid: {
                        color: 'rgba(20, 184, 166, 0.1)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)',
                        font: { size: 11 }
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        font: { size: 13, weight: '600' }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#14b8a6',
                    bodyColor: '#ffffff',
                    borderColor: '#14b8a6',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false
                }
            }
        }
    });
}

// Generate synthetic waveform (Demo Mode)
function generateSyntheticWaveform(faultType) {
    const samples = 1000;
    const waveform = [];

    for (let i = 0; i < samples; i++) {
        const t = i * 0.3;
        let value = 2.5 + 0.1 * Math.sin(2 * Math.PI * t / 100);

        if (faultType === 'spike' && i >= 300 && i < 320) {
            value += (i - 300) * 0.25;
        } else if (faultType === 'plateau' && i >= 600 && i < 650) {
            value += 2.0;
        } else if (faultType === 'unstable' && i >= 900 && i < 930) {
            value += 0.5 * Math.sin(8 * Math.PI * (i - 900) / 30);
        }

        value += (Math.random() - 0.5) * 0.1;
        waveform.push(value);
    }

    return waveform;
}

// Fetch data from ESP32 hardware (Hardware Mode)
async function fetchHardwareData() {
    try {
        const response = await fetch(API_URL + '/stream', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch hardware data');
        }

        const data = await response.json();

        if (data.success && data.waveform) {
            console.log('Hardware data received from ESP32');
            return data.waveform;
        } else {
            console.warn('No waveform data in response, falling back to demo mode');
            return null;
        }
    } catch (error) {
        console.error('Error fetching hardware data:', error);
        console.warn('Temporarily falling back to demo mode');
        return null;
    }
}

// Analyze waveform with API
async function analyzeWaveformData(waveformData) {
    try {
        const response = await fetch(API_URL + '/predict', {
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
function updateWaveformChart(waveformData) {
    if (!waveformChart) return;

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

// Update fault detection display
function updateFaultDetectionDisplay(result) {
    const faultDisplay = document.getElementById('faultDisplay');
    const faultIcon = document.getElementById('faultIcon');
    const faultText = document.getElementById('faultText');
    const faultConfidence = document.getElementById('faultConfidence');
    const switchWrapper = document.getElementById('switchWrapper');
    const statusIndicator = document.getElementById('statusIndicator');
    const breakerStateText = document.getElementById('breakerStateText');

    const predictedFault = result.predicted_fault;
    const confidence = result.confidence;
    const maxConfidence = Math.max(...Object.values(confidence));

    statistics.totalScans++;

    if (predictedFault !== 'normal') {
        statistics.faultCount++;

        if (faultDisplay) faultDisplay.classList.add('fault-active');
        if (faultIcon) faultIcon.textContent = '⚠️';
        if (faultText) faultText.textContent = predictedFault.toUpperCase() + ' FAULT DETECTED';
        if (switchWrapper) {
            switchWrapper.classList.add('fault');
            switchWrapper.classList.remove('active');
        }
        if (statusIndicator) statusIndicator.classList.add('fault');
        if (breakerStateText) {
            breakerStateText.textContent = 'OPEN - FAULT';
            breakerStateText.classList.add('fault');
        }

        addAlertToHistory(predictedFault, maxConfidence);
    } else {
        statistics.normalCount++;

        if (faultDisplay) faultDisplay.classList.remove('fault-active');
        if (faultIcon) faultIcon.textContent = '✓';
        if (faultText) faultText.textContent = 'NO FAULT DETECTED';
        if (switchWrapper) {
            switchWrapper.classList.add('active');
            switchWrapper.classList.remove('fault');
        }
        if (statusIndicator) statusIndicator.classList.remove('fault');
        if (breakerStateText) {
            breakerStateText.textContent = 'CLOSED - NORMAL';
            breakerStateText.classList.remove('fault');
        }
    }

    if (faultConfidence) {
        faultConfidence.textContent = 'Confidence: ' + maxConfidence.toFixed(2) + '%';
    }

    updateConfidenceBars(confidence);
    updateStatisticsDisplay();
}

// Update confidence bars
function updateConfidenceBars(confidence) {
    const confidenceBars = document.getElementById('confidenceBars');
    if (!confidenceBars) return;

    confidenceBars.innerHTML = '';

    for (const [label, score] of Object.entries(confidence)) {
        const barHTML = 
            '<div class="confidence-row">' +
                '<div class="confidence-row-header">' +
                    '<span class="confidence-type">' + label + '</span>' +
                    '<span class="confidence-percent">' + score.toFixed(2) + '%</span>' +
                '</div>' +
                '<div class="confidence-track">' +
                    '<div class="confidence-progress" style="width: ' + score + '%"></div>' +
                '</div>' +
            '</div>';

        confidenceBars.innerHTML += barHTML;
    }
}

// Add alert to history
function addAlertToHistory(faultType, confidence) {
    const alertsContainer = document.getElementById('alertsContainer');
    if (!alertsContainer) return;

    const emptyState = alertsContainer.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const modeLabel = isHardwareMode ? '[Hardware]' : '[Demo]';

    const alertHTML = 
        '<div class="alert-entry">' +
            '<div class="alert-top">' +
                '<span class="alert-fault-type">' + faultType.toUpperCase() + ' FAULT ' + modeLabel + '</span>' +
                '<span class="alert-timestamp">' + timeString + '</span>' +
            '</div>' +
            '<div class="alert-description">' +
                'Fault detected with ' + confidence.toFixed(2) + '% confidence. Immediate inspection recommended.' +
            '</div>' +
        '</div>';

    alertsContainer.insertAdjacentHTML('afterbegin', alertHTML);

    const alerts = alertsContainer.querySelectorAll('.alert-entry');
    if (alerts.length > 15) {
        alerts[alerts.length - 1].remove();
    }
}

// Update statistics display
function updateStatisticsDisplay() {
    const totalScansEl = document.getElementById('totalScans');
    const faultCountEl = document.getElementById('faultCount');
    const successRateEl = document.getElementById('successRate');

    if (totalScansEl) totalScansEl.textContent = statistics.totalScans;
    if (faultCountEl) faultCountEl.textContent = statistics.faultCount;

    if (successRateEl) {
        const healthRate = statistics.totalScans > 0 
            ? ((statistics.normalCount / statistics.totalScans) * 100).toFixed(1)
            : 100;
        successRateEl.textContent = healthRate + '%';
    }
}

// Start monitoring
function startMonitoring() {
    if (isMonitoring) return;

    isMonitoring = true;
    startTime = new Date();

    const systemStatus = document.getElementById('systemStatus');
    const monitorIcon = document.getElementById('monitorIcon');
    const monitorText = document.getElementById('monitorText');

    if (systemStatus) systemStatus.textContent = 'Monitoring Active';
    if (monitorIcon) monitorIcon.textContent = '⏸️';
    if (monitorText) monitorText.textContent = 'Pause';

    const speed = parseInt(document.getElementById('speedControl').value);

    console.log('Starting monitoring in ' + (isHardwareMode ? 'Hardware' : 'Demo') + ' mode');

    monitoringInterval = setInterval(async () => {
        let waveform;

        if (isHardwareMode) {
            // Hardware mode: Fetch from ESP32
            waveform = await fetchHardwareData();

            // Fallback to demo if hardware fails
            if (!waveform) {
                console.warn('Hardware data unavailable, using demo data');
                const simType = 'normal';
                waveform = generateSyntheticWaveform(simType);
            }
        } else {
            // Demo mode: Generate synthetic data
            const simType = document.getElementById('simulationType').value;
            let waveformType = simType;

            if (simType === 'random') {
                const types = ['normal', 'spike', 'plateau', 'unstable'];
                waveformType = types[Math.floor(Math.random() * types.length)];
            }

            waveform = generateSyntheticWaveform(waveformType);
        }

        updateWaveformChart(waveform);

        const result = await analyzeWaveformData(waveform);
        if (result && result.success) {
            updateFaultDetectionDisplay(result);
        }
    }, speed);
}

// Stop monitoring
function stopMonitoring() {
    if (!isMonitoring) return;

    isMonitoring = false;
    clearInterval(monitoringInterval);

    const systemStatus = document.getElementById('systemStatus');
    const monitorIcon = document.getElementById('monitorIcon');
    const monitorText = document.getElementById('monitorText');

    if (systemStatus) systemStatus.textContent = 'Monitoring Paused';
    if (monitorIcon) monitorIcon.textContent = '▶️';
    if (monitorText) monitorText.textContent = 'Start';
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

    statistics = {
        totalScans: 0,
        faultCount: 0,
        normalCount: 0
    };
    startTime = null;

    document.getElementById('totalScans').textContent = '0';
    document.getElementById('faultCount').textContent = '0';
    document.getElementById('uptime').textContent = '00:00:00';
    document.getElementById('successRate').textContent = '100%';

    clearChart();
    clearAlerts();

    const faultDisplay = document.getElementById('faultDisplay');
    if (faultDisplay) faultDisplay.classList.remove('fault-active');

    const faultIcon = document.getElementById('faultIcon');
    if (faultIcon) faultIcon.textContent = '✓';

    const faultText = document.getElementById('faultText');
    if (faultText) faultText.textContent = 'NO FAULT DETECTED';

    const faultConfidence = document.getElementById('faultConfidence');
    if (faultConfidence) faultConfidence.textContent = 'Confidence: --';

    const confidenceBars = document.getElementById('confidenceBars');
    if (confidenceBars) confidenceBars.innerHTML = '';

    const switchWrapper = document.getElementById('switchWrapper');
    if (switchWrapper) {
        switchWrapper.classList.remove('active', 'fault');
    }

    const statusIndicator = document.getElementById('statusIndicator');
    if (statusIndicator) statusIndicator.classList.remove('fault');

    const breakerStateText = document.getElementById('breakerStateText');
    if (breakerStateText) {
        breakerStateText.textContent = 'STANDBY';
        breakerStateText.classList.remove('fault');
    }
}

// Clear chart
function clearChart() {
    if (waveformChart) {
        waveformChart.data.labels = [];
        waveformChart.data.datasets[0].data = [];
        waveformChart.update();
    }
}

// Clear alerts
function clearAlerts() {
    const alertsContainer = document.getElementById('alertsContainer');
    if (alertsContainer) {
        alertsContainer.innerHTML = 
            '<div class="empty-state">' +
                '<div class="empty-icon">📭</div>' +
                '<p class="empty-text">No alerts yet</p>' +
            '</div>';
    }
}

// Update speed display
function updateSpeedDisplay() {
    const speed = parseInt(document.getElementById('speedControl').value);
    const speedDisplay = document.getElementById('speedDisplay');
    if (speedDisplay) {
        speedDisplay.textContent = (speed / 1000).toFixed(1) + 's';
    }

    if (isMonitoring) {
        stopMonitoring();
        startMonitoring();
    }
}
