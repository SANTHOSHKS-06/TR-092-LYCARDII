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

async function analyzeBatchText(text, filename, targetConfig = null) {
    const config = targetConfig || {
        resultsId: 'batch-results',
        totalId: 'batch-total',
        barsId: 'distribution-bars',
        insightId: 'developer-insight'
    };

    const resultsArea = document.getElementById(config.resultsId);
    const totalEl = document.getElementById(config.totalId);
    const barsEl = document.getElementById(config.barsId);
    const insightEl = document.getElementById(config.insightId);
    
    try {
        const response = await fetch('/predict_batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ csv_text: text })
        });
        
        const result = await response.json();
        
        if(result.error) {
            alert(result.error);
            return;
        }
        
        // Build UI
        resultsArea.classList.remove('hidden');
        totalEl.textContent = result.total;
        barsEl.innerHTML = '';
        
        const colors = {
            'high_activity': '#10b981',
            'low_activity': '#ef4444',
            'irregular_usage': '#f59e0b'
        };
        
        let lowPatternCount = (result.distribution['low_activity'] || 0) + (result.distribution['irregular_usage'] || 0);
        let lowPatternPercent = (lowPatternCount / result.total) * 100;

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
            barsEl.insertAdjacentHTML('beforeend', barHtml);
        }
        
        // Animate bars
        setTimeout(() => {
            const fills = barsEl.querySelectorAll('.dist-fill');
            Object.values(result.distribution).forEach((val, i) => {
                let percent = (val / result.total) * 100;
                if(fills[i]) fills[i].style.width = percent + '%';
            });
        }, 100);
        
        // --- Developer Insights Logic ---
        insightEl.classList.remove('hidden', 'warning', 'success');
        if (lowPatternPercent > 50) {
            insightEl.classList.add('warning');
            insightEl.innerHTML = `
                <h4>⚠️ High Churn Risk Detected</h4>
                <p>Over <strong>${lowPatternPercent.toFixed(1)}%</strong> of users in this dataset show Low or Irregular activity patterns.</p>
            `;
        } else {
            insightEl.classList.add('success');
            insightEl.innerHTML = `
                <h4>✅ Healthy Engagement</h4>
                <p>The majority of your users are showing High Activity patterns.</p>
            `;
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to analyze data.');
    }
}

async function processCSV(file) {
    dropZone.querySelector('p').innerHTML = `Processing <strong>${file.name}</strong>...`;
    const reader = new FileReader();
    reader.onload = async (e) => {
        await analyzeBatchText(e.target.result, file.name);
        dropZone.querySelector('p').innerHTML = `Successfully analyzed <strong>${file.name}</strong>.`;
    };
    reader.readAsText(file);
}

// --- Wikipedia Feature ---

async function fetchWikipediaData() {
  const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/Python/daily/20260401/20260416`;
  
  const res = await fetch(url);
  const data = await res.json();
  
  const items = data.items || [];
  const csvRows = ['login_frequency,avg_session_duration,actions_per_session,days_since_last_login,total_sessions'];
  
  items.forEach(item => {
    const views = item.views;
    csvRows.push(`${Math.min(views/1000,10).toFixed(1)},${(views/500).toFixed(1)},${(views/2000).toFixed(1)},${Math.floor(Math.random()*30)},${Math.floor(views/100)}`);
  });
  
  return csvRows.join('\n');
}

async function analyzeWikipedia() {
    const wikiBtn = document.getElementById('wiki-btn');
    const ogHtml = wikiBtn.innerHTML;
    
    wikiBtn.innerHTML = '🔄 Fetching...';
    wikiBtn.disabled = true;
    
    try {
        const csvText = await fetchWikipediaData();
        await analyzeBatchText(csvText, "Live Wikipedia Traffic", {
            resultsId: 'wiki-results',
            totalId: 'wiki-total',
            barsId: 'wiki-distribution-bars',
            insightId: 'wiki-insight'
        });
    } catch (e) {
        console.error(e);
        alert("Failed to fetch Wikipedia API.");
    } finally {
        wikiBtn.innerHTML = ogHtml;
        wikiBtn.disabled = false;
    }
}
