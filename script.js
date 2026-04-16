document.getElementById('prediction-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // UI Elements
    const btn = document.getElementById('submit-btn');
    const placeholder = document.getElementById('placeholder-msg');
    const content = document.getElementById('result-content');
    const badge = document.getElementById('emoji-badge');
    const categoryText = document.getElementById('predicted-category');
    const meterFill = document.getElementById('meter-fill');
    const confidenceVal = document.getElementById('confidence-val');
    const breakdownList = document.getElementById('breakdown-list');

    // Loading State
    btn.textContent = 'Analyzing...';
    btn.style.opacity = '0.8';
    btn.disabled = true;

    // Build Payload
    const payload = {
        login_frequency: parseFloat(document.getElementById('login_frequency').value),
        avg_session_duration: parseFloat(document.getElementById('avg_session_duration').value),
        actions_per_session: parseFloat(document.getElementById('actions_per_session').value),
        days_since_last_login: parseFloat(document.getElementById('days_since_last_login').value),
        total_sessions: parseFloat(document.getElementById('total_sessions').value)
    };

    try {
        // Vercel deployment routes API calls via /predict
        // Local dev via port 8000 might be different but /predict works if served correctly by Vercel rewrites
        // We will detect if we are on localhost vs Vercel
        const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        let apiUrl = '/predict';
        if (window.location.port !== '') {
            // Local fallback assuming uvicorn runs on 8000 if not served by same server
            apiUrl = 'http://localhost:8000/predict';
        }

        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        const result = await response.json();

        // Update UI
        placeholder.classList.add('hidden');
        content.classList.remove('hidden');

        badge.textContent = result.emoji;
        categoryText.textContent = result.prediction.replace('_', ' ');

        // Update confidence meter
        const confPercent = parseFloat(result.confidence);
        meterFill.style.width = '0%';
        setTimeout(() => {
            meterFill.style.width = `${confPercent}%`;
            // Color based on category
            if(result.prediction === 'high_activity') meterFill.style.background = '#10b981'; // Green
            if(result.prediction === 'irregular_usage') meterFill.style.background = '#f59e0b'; // Orange
            if(result.prediction === 'low_activity') meterFill.style.background = '#ef4444'; // Red
        }, 100);

        confidenceVal.textContent = result.confidence;

        // Breakdown List
        breakdownList.innerHTML = '';
        for (const [key, value] of Object.entries(result.all_classes)) {
            const li = document.createElement('li');
            const classSpan = document.createElement('span');
            classSpan.textContent = key.replace('_', ' ').charAt(0).toUpperCase() + key.replace('_', ' ').slice(1);
            
            const valSpan = document.createElement('span');
            valSpan.style.fontWeight = 'bold';
            valSpan.textContent = `${value}%`;

            li.appendChild(classSpan);
            li.appendChild(valSpan);
            breakdownList.appendChild(li);
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to connect to the prediction API. Ensure the backend is running.');
    } finally {
        btn.textContent = 'Classify User';
        btn.style.opacity = '1';
        btn.disabled = false;
    }
});

// CSV Drag & Drop Logic
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('csv-file-input');
const batchResults = document.getElementById('batch-results');
const batchTotal = document.getElementById('batch-total');
const distBars = document.getElementById('distribution-bars');

dropZone.addEventListener('click', () => fileInput.click());

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
});

dropZone.addEventListener('drop', handleDrop, false);
fileInput.addEventListener('change', (e) => handleFiles(e.target.files), false);

function handleDrop(e) { handleFiles(e.dataTransfer.files); }

function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        if (file.name.endsWith('.csv')) {
            dropZone.querySelector('p').innerHTML = `Processing <strong>${file.name}</strong>...`;
            processCSV(file);
        } else {
            alert('Please upload a valid .csv file');
        }
    }
}

async function processCSV(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target.result;
        
        try {
            const response = await fetch('/predict_batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ csv_text: text })
            });
            
            const result = await response.json();
            
            if(result.error) {
                alert(result.error);
                dropZone.querySelector('p').innerHTML = `Drag & Drop your CSV file here or <span style="color: var(--primary); text-decoration: underline;">click to browse</span>`;
                return;
            }
            
            // Build UI
            batchResults.classList.remove('hidden');
            batchTotal.textContent = result.total;
            distBars.innerHTML = '';
            
            const colors = {
                'high_activity': '#10b981',
                'low_activity': '#ef4444',
                'irregular_usage': '#f59e0b'
            };
            
            for (const [key, val] of Object.entries(result.distribution)) {
                let percent = (val / result.total) * 100;
                let color = colors[key] || '#3b82f6';
                
                const barHtml = `
                    <div class="distribution-bar">
                        <div class="dist-label">
                            <span style="font-weight: 600; color: ${color}">${key.replace('_', ' ')}</span>
                            <span>${val} users (${percent.toFixed(1)}%)</span>
                        </div>
                        <div class="dist-track">
                            <div class="dist-fill" style="width: 0%; background: ${color}"></div>
                        </div>
                    </div>
                `;
                distBars.insertAdjacentHTML('beforeend', barHtml);
            }
            
            // Animate bars
            setTimeout(() => {
                const fills = distBars.querySelectorAll('.dist-fill');
                Object.values(result.distribution).forEach((val, i) => {
                    let percent = (val / result.total) * 100;
                    if(fills[i]) fills[i].style.width = percent + '%';
                });
            }, 100);
            
            dropZone.querySelector('p').innerHTML = `Successfully analyzed <strong>${file.name}</strong>. Drop another to replace.`;

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to analyze CSV. Check API connection.');
            dropZone.querySelector('p').innerHTML = `Drag & Drop your CSV file here or <span style="color: var(--primary); text-decoration: underline;">click to browse</span>`;
        }
    };
    reader.readAsText(file);
}
