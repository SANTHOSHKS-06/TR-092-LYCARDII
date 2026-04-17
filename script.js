// Global chart instances to handle updates/destruction
let wikiLineChart = null;
let wikiDonutChart = null;
let wikiSevenDayChart = null;
let batchDonutChart = null;
let batchBarChart = null;
let lastAnalyzedData = null;

document.addEventListener('DOMContentLoaded', () => {
    // Determine which page we are on and initialize accordingly
    if (document.getElementById('prediction-form')) initDashboard();
    if (document.getElementById('wiki-btn')) initWikipediaPage();
    if (document.getElementById('drop-zone')) initBatchPage();
});

// --- Dashboard Logic (Home) ---
function initDashboard() {
    const form = document.getElementById('prediction-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = document.getElementById('submit-btn');
        const placeholder = document.getElementById('placeholder-msg');
        const content = document.getElementById('result-content');
        const badge = document.getElementById('emoji-badge');
        const categoryText = document.getElementById('predicted-category');
        const meterFill = document.getElementById('meter-fill');
        const confidenceVal = document.getElementById('confidence-val');
        const breakdownList = document.getElementById('breakdown-list');

        btn.textContent = '🔄 Generating AI Profile...';
        btn.disabled = true;

        const payload = {
            login_frequency: parseFloat(document.getElementById('login_frequency').value),
            avg_session_duration: parseFloat(document.getElementById('avg_session_duration').value),
            actions_per_session: parseFloat(document.getElementById('actions_per_session').value),
            days_since_last_login: parseFloat(document.getElementById('days_since_last_login').value),
            total_sessions: parseFloat(document.getElementById('total_sessions').value)
        };

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            placeholder.classList.add('hidden');
            content.classList.remove('hidden');

            badge.textContent = result.emoji;
            categoryText.textContent = result.prediction.replace(/_/g, ' ');

            const confPercent = parseFloat(result.confidence);
            meterFill.style.width = '0%';
            setTimeout(() => {
                meterFill.style.width = `${confPercent}%`;
                if(result.prediction === 'high_activity') meterFill.style.background = '#10b981';
                if(result.prediction === 'irregular_usage') meterFill.style.background = '#ef4444';
                if(result.prediction === 'low_activity') meterFill.style.background = '#f59e0b';
            }, 100);

            confidenceVal.textContent = result.confidence;

            breakdownList.innerHTML = '';
            for (const [key, value] of Object.entries(result.all_classes)) {
                let color = '#475569';
                if(key === 'high_activity') color = '#10b981';
                if(key === 'irregular_usage') color = '#ef4444';
                if(key === 'low_activity') color = '#f59e0b';

                const li = document.createElement('li');
                li.style.marginBottom = '1.25rem';
                li.innerHTML = `
                    <div class="dist-meta">
                        <span style="color:${color}; font-size:0.8rem; text-transform:uppercase; font-weight:800;">${key.replace(/_/g, ' ')}</span>
                        <strong style="color:var(--text-bright);">${value}%</strong>
                    </div>
                    <div class="dist-rail">
                        <div class="dist-fill" style="width:${value}%; background:${color}; opacity:0.9;"></div>
                    </div>
                `;
                breakdownList.appendChild(li);
            }

            // Sync context with AI Assistant
            lastAnalyzedData = { 
                topic: "Individual User Profile", 
                result: { distribution: result.all_classes, total: 1 }, 
                timestamp: new Date().toLocaleString() 
            };

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to connect to the classification engine.');
        } finally {
            btn.textContent = 'Analyze User Profile';
            btn.disabled = false;
        }
    });
}

// --- Wikipedia Logic ---
function initWikipediaPage() {}

async function fetchWikipediaData(article) {
  const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/${article}/daily/20260401/20260415`;
  const res = await fetch(url);
  return await res.json();
}

async function analyzeWikipedia() {
  const btn = document.getElementById('wiki-btn');
  const topics = [
      'Artificial_intelligence', 'SpaceX', 'Tesla,_Inc.', 'Bitcoin', 
      'Internet_of_things', 'Quantum_computing', 'NASA', 'Apple_Inc.', 
      'Deep_learning', 'Renewable_energy'
  ];
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  
  btn.textContent = `🔄 Mapping: ${randomTopic.replace(/_/g, ' ')}...`;
  btn.disabled = true;

  try {
      const data = await fetchWikipediaData(randomTopic);
      const items = data.items;
      
      const viewsSeries = items.map(item => item.views);
      const labels = items.map(item => item.timestamp.slice(4, 6) + '/' + item.timestamp.slice(6, 8)); // MM/DD
      
      const csvRows = ['login_frequency,avg_session_duration,actions_per_session,days_since_last_login,total_sessions'];
      items.forEach(item => {
        const views = item.views;
        // Injecting pseudo-telemetry derived from real pageview volatility
        csvRows.push(`${Math.min(views/1000,10).toFixed(1)},${(views/500).toFixed(1)},${(views/2000).toFixed(1)},${Math.floor(Math.random()*30)},${Math.floor(views/100)}`);
      });

      const result = await analyzeBatchProcess(csvRows.join('\n'), {
          resultsId: 'wiki-results', totalId: 'wiki-total', barsId: 'wiki-distribution-bars', insightId: 'wiki-insight'
      });

      // Render Advanced Modules
      renderWikiLineChart(viewsSeries, labels);
      renderWikiDonutChart(result.distribution);
      renderAdvancedIntelligence(result, randomTopic);

      lastAnalyzedData = { topic: randomTopic, result, viewsSeries, labels, timestamp: new Date().toLocaleString() };
      document.getElementById('fetch-timestamp').textContent = `SYSTEM LIVE: ${lastAnalyzedData.timestamp}`;

  } catch (e) {
      alert(`Wikipedia API Error: ${e.message}`);
  } finally {
      btn.textContent = 'Analyze Live Traffic Stream';
      btn.disabled = false;
  }
}

function renderWikiLineChart(data, labels) {
    const options = {
        series: [{ name: 'Pageviews', data: data }],
        chart: { type: 'line', height: 280, toolbar: { show: false }, background: 'transparent' },
        colors: ['#6366f1'],
        stroke: { curve: 'smooth', width: 3 },
        theme: { mode: 'light' },
        xaxis: { categories: labels, labels: { style: { colors: '#475569', fontWeight: 600 } } },
        yaxis: { labels: { style: { colors: '#475569', fontWeight: 600 } } },
        grid: { borderColor: '#e2e8f0', strokeDashArray: 4 }
    };
    if (wikiLineChart) wikiLineChart.destroy();
    document.getElementById('wiki-chart-container').innerHTML = '';
    wikiLineChart = new ApexCharts(document.querySelector("#wiki-chart-container"), options);
    wikiLineChart.render();
}

function renderWikiDonutChart(distribution) {
    const labels = Object.keys(distribution).map(k => k.replace(/_/g, ' '));
    const data = Object.values(distribution);
    const categoryColors = { 'high activity': '#10b981', 'low activity': '#f59e0b', 'irregular usage': '#ef4444' };
    const finalColors = labels.map(l => categoryColors[l.toLowerCase()] || '#475569');

    const options = {
        series: data,
        chart: { type: 'donut', height: 280, background: 'transparent' },
        labels: labels,
        colors: finalColors,
        theme: { mode: 'light' },
        legend: { position: 'bottom', labels: { colors: '#334155', useSeriesColors: false } },
        stroke: { show: false }
    };
    if (wikiDonutChart) wikiDonutChart.destroy();
    document.getElementById('wiki-donut-container').innerHTML = '';
    wikiDonutChart = new ApexCharts(document.querySelector("#wiki-donut-container"), options);
    wikiDonutChart.render();
}

// --- Batch Processing Logic ---
function initBatchPage() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('csv-file-input');
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = 'var(--primary)'; });
    dropZone.addEventListener('dragleave', () => dropZone.style.borderColor = 'var(--border)');
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border)';
        if (e.dataTransfer.files.length > 0) handleCSVFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleCSVFile(e.target.files[0]);
    });
}

function handleCSVFile(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        await analyzeBatchProcess(e.target.result, {
            resultsId: 'batch-results', totalId: 'batch-total', barsId: 'distribution-bars', insightId: 'developer-insight',
            donutContainer: 'batch-donut-container', barContainer: 'batch-bar-container'
        });
    };
    reader.readAsText(file);
}

async function analyzeBatchProcess(csvText, config) {
    const resultsArea = document.getElementById(config.resultsId);
    const totalEl = document.getElementById(config.totalId);
    const barsEl = document.getElementById(config.barsId);
    const insightEl = document.getElementById(config.insightId);
    
    try {
        const response = await fetch('/predict_batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ csv_text: csvText })
        });
        
        const result = await response.json();
        if(result.error) return alert(result.error);
        
        resultsArea.classList.remove('hidden');
        totalEl.textContent = result.total;
        barsEl.innerHTML = '';
        
        const colors = { 'high_activity': '#10b981', 'low_activity': '#f59e0b', 'irregular_usage': '#ef4444' };

        for (const [key, val] of Object.entries(result.distribution)) {
            let percent = (val / result.total) * 100;
            let color = colors[key] || '#3b82f6';
            barsEl.insertAdjacentHTML('beforeend', `
                <div class="dist-bar">
                    <div class="dist-meta">
                        <span style="color: ${color}; font-weight: 700;">${key.replace(/_/g, ' ')}</span>
                        <span>${val} Users (${percent.toFixed(1)}%)</span>
                    </div>
                    <div class="dist-rail">
                        <div class="dist-fill" id="fill-${key}" style="width: ${percent}%; background: ${color}; box-shadow: 0 0 10px ${color}44;"></div>
                    </div>
                </div>
            `);
        }

        // Feature: Mix of Graphs
        if (config.donutContainer) renderBatchDonutChart(result.distribution, config.donutContainer);
        if (config.barContainer) renderBatchBarChart(result.distribution, config.barContainer);
        
        lastAnalyzedData = { 
            topic: "Batch Process Dataset", 
            result: result, 
            timestamp: new Date().toLocaleString() 
        };
        
        let lowPatternPercent = (( (result.distribution['low_activity'] || 0) + (result.distribution['irregular_usage'] || 0) ) / result.total) * 100;
        insightEl.classList.remove('hidden', 'warning', 'success');
        insightEl.className = 'insight-premium'; // Reset classes
        if (lowPatternPercent > 40) {
            insightEl.classList.add('warning');
            insightEl.innerHTML = `<h4>⚠️ Neural Divergence Detected</h4><p>High volatility markers identified in <strong>${lowPatternPercent.toFixed(1)}%</strong> of population segments. Retention intervention suggested.</p>`;
        } else {
            insightEl.classList.add('success');
            insightEl.innerHTML = `<h4>✅ Pattern Equilibrium</h4><p>Dataset confirms stable engagement rhythms with high predictive reliability across all active user cohorts.</p>`;
        }
        return result;
    } catch (error) {
        console.error('Batch Processing Error:', error);
    }
}

function renderBatchDonutChart(distribution, containerId) {
    const labels = Object.keys(distribution).map(k => k.replace(/_/g, ' '));
    const data = Object.values(distribution);
    const categoryColors = { 'high activity': '#10b981', 'low activity': '#f59e0b', 'irregular usage': '#ef4444' };
    const finalColors = labels.map(l => categoryColors[l.toLowerCase()] || '#475569');

    const options = {
        series: data,
        chart: { type: 'donut', height: 280, background: 'transparent' },
        labels: labels,
        colors: finalColors,
        theme: { mode: 'light' },
        plotOptions: { pie: { donut: { size: '75%' } } },
        legend: { position: 'bottom', labels: { colors: '#334155', useSeriesColors: false } },
        stroke: { show: false }
    };
    if (batchDonutChart) batchDonutChart.destroy();
    document.getElementById(containerId).innerHTML = '';
    batchDonutChart = new ApexCharts(document.getElementById(containerId), options);
    batchDonutChart.render();
}

function renderBatchBarChart(distribution, containerId) {
    const categoryColors = { 
        'high activity': '#10b981', 
        'low activity': '#f59e0b', 
        'irregular usage': '#ef4444' 
    };

    // Constructing bulletproof data points with explicit colors
    const chartData = Object.entries(distribution).map(([key, val]) => {
        const label = key.replace(/_/g, ' ');
        return {
            x: label,
            y: val,
            fillColor: categoryColors[label.toLowerCase()] || '#27187E'
        };
    });

    const options = {
        series: [{ name: 'User Count', data: chartData }],
        chart: { 
            type: 'bar', 
            height: 320, 
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        xaxis: { 
            type: 'category',
            labels: { style: { colors: '#334155', fontWeight: 600, fontSize: '12px' } } 
        },
        yaxis: { 
            labels: { style: { colors: '#334155', fontWeight: 600 } } 
        },
        plotOptions: { 
            bar: { 
                borderRadius: 10, 
                columnWidth: '55%',
                dataLabels: { position: 'center' }
            } 
        },
        dataLabels: {
            enabled: true,
            formatter: function (val) { return val; },
            style: { colors: ['#fff'], fontWeight: 700 }
        },
        grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
        legend: { show: false },
        tooltip: { theme: 'light' }
    };
    
    if (batchBarChart) batchBarChart.destroy();
    document.getElementById(containerId).innerHTML = '';
    batchBarChart = new ApexCharts(document.getElementById(containerId), options);
    batchBarChart.render();
}

function renderAdvancedIntelligence(result, topic) {
    const dist = result.distribution;
    const total = result.total;
    
    // 1. Stat Cards
    const stHigh = document.getElementById('stat-high');
    const stIrr = document.getElementById('stat-irregular');
    const stLow = document.getElementById('stat-low');
    if(stHigh) stHigh.textContent = dist['high_activity'] || 0;
    if(stIrr) stIrr.textContent = dist['irregular_usage'] || 0;
    if(stLow) stLow.textContent = dist['low_activity'] || 0;

    // 2. Churn Risk Score
    const irregular = dist['irregular_usage'] || 0;
    const low = dist['low_activity'] || 0;
    const riskScore = Math.min(100, Math.round(((irregular * 1.5) + (low * 0.8)) / total * 100));
    const scoreEl = document.getElementById('risk-score');
    const fillEl = document.getElementById('risk-meter-fill');
    const badgeEl = document.getElementById('risk-badge');

    if (scoreEl) scoreEl.textContent = riskScore;
    if (fillEl) fillEl.style.width = `${riskScore}%`;
    
    if (badgeEl) {
        if (riskScore < 30) {
            badgeEl.textContent = 'Low Risk';
            badgeEl.style.background = '#dcfce7';
            badgeEl.style.color = '#10b981';
        } else if (riskScore < 60) {
            badgeEl.textContent = 'Medium Risk';
            badgeEl.style.background = '#fef3c7';
            badgeEl.style.color = '#d97706';
        } else {
            badgeEl.textContent = 'High Risk';
            badgeEl.style.background = '#fee2e2';
            badgeEl.style.color = '#ef4444';
        }
    }

    // 3. Session Quality Index
    const stability = Math.max(0, 100 - (irregular / total * 100));
    const engagement = Math.min(100, (dist['high_activity'] || 0) / total * 150);
    const health = Math.max(0, 100 - riskScore);
    
    updateQualityBar('q-stability', stability);
    updateQualityBar('q-engagement', engagement);
    updateQualityBar('q-retention', 85); // Simulated baseline
    updateQualityBar('q-health', health);

    // 4. AI Recommendations
    renderRecommendations(riskScore, dist);

    // 5. 7-Day Longitudinal Distribution
    renderSevenDayDistribution(total);
}

function updateQualityBar(id, val) {
    const valEl = document.getElementById(`${id}-val`);
    const fillEl = document.getElementById(`${id}-fill`);
    if (valEl) valEl.textContent = `${Math.round(val)}%`;
    if (fillEl) fillEl.style.width = `${val}%`;
}

function renderRecommendations(risk, dist) {
    const list = document.getElementById('recommendations-list');
    if (!list) return;
    list.innerHTML = '';
    
    const recs = [];
    if (risk > 50) {
        recs.push({ icon: '⚠️', title: 'Volatility Audit', desc: 'Irregular patterns detected. Initiate fraud/bot audit protocols.', priority: 'high' });
    }
    if ((dist['low_activity'] || 0) > (dist['high_activity'] || 0)) {
        recs.push({ icon: '📧', title: 'Re-engagement Loop', desc: 'User interest is waning. Trigger automated notification sync.', priority: 'med' });
    }
    if (risk < 20) {
        recs.push({ icon: '💎', title: 'Loyalty Rewards', desc: 'High stability detected. Enroll premium cohorts in beta program.', priority: 'low' });
    }
    recs.push({ icon: '⚙️', title: 'Elastic Scaling', desc: 'Predictive load balancing recommended for upcoming peak.', priority: 'low' });

    recs.forEach(r => {
        const div = document.createElement('div');
        div.className = 'rec-card';
        div.innerHTML = `
            <div class="rec-icon">${r.icon}</div>
            <div class="rec-text" style="width: 100%; text-align: left;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h5 style="margin:0;">${r.title}</h5>
                    <span class="priority-tag priority-${r.priority}">${r.priority}</span>
                </div>
                <p style="margin:5px 0 0 0;">${r.desc}</p>
            </div>
        `;
        list.appendChild(div);
    });
}

function renderSevenDayDistribution(baseTotal) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const series = [
        { name: 'Peak Usage', data: days.map(() => Math.floor(baseTotal * (0.8 + Math.random() * 0.4))) },
        { name: 'Baseline', data: days.map(() => Math.floor(baseTotal * (0.4 + Math.random() * 0.2))) }
    ];

    const options = {
        series: series,
        chart: { type: 'bar', height: 350, stacked: true, toolbar: { show: false }, background: 'transparent' },
        colors: ['#00f2ff', '#27187E'],
        plotOptions: { bar: { borderRadius: 6, columnWidth: '45%' } },
        xaxis: { categories: days, labels: { style: { colors: '#334155', fontWeight: 600 } } },
        yaxis: { labels: { style: { colors: '#334155', fontWeight: 600 } } },
        legend: { position: 'top', horizontalAlign: 'right', labels: { colors: '#334155', fontWeight: 600 } },
        grid: { borderColor: '#f1f5f9' },
        dataLabels: { enabled: false }
    };

    const chartEl = document.getElementById('wiki-seven-day-chart');
    if (!chartEl) return;
    if (wikiSevenDayChart) wikiSevenDayChart.destroy();
    chartEl.innerHTML = '';
    wikiSevenDayChart = new ApexCharts(chartEl, options);
    wikiSevenDayChart.render();
}

function exportIntelligenceReport() {
    if (!lastAnalyzedData) return alert('Please analyze a stream before exporting.');
    
    const report = {
        report_id: `INTEL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        generated_at: lastAnalyzedData.timestamp,
        source: `Wikipedia Context: ${lastAnalyzedData.topic}`,
        telemetry: {
            sample_size: lastAnalyzedData.result.total,
            distribution: lastAnalyzedData.result.distribution
        },
        ai_meta: {
            engine: "Usage Pattern Analysis Core v4.0",
            status: "High Fidelity Mapping"
        }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UsagePattern_Report_${lastAnalyzedData.topic}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

/* --- AI Chat Assistant Logic --- */
function toggleChat() {
    const win = document.getElementById('chat-window');
    win.classList.toggle('active');
    if(win.classList.contains('active')) {
        document.getElementById('chat-input').focus();
    }
}

function handleChatKey(e) {
    if (e.key === 'Enter') sendMessage();
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    appendMessage('user', text);
    input.value = '';

    // Show thinking indicator
    const typingId = 'typing-' + Date.now();
    appendMessage('bot', '...', typingId);

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: text,
                context: lastAnalyzedData
            })
        });
        
        const data = await response.json();
        document.getElementById(typingId).textContent = data.response;
    } catch (err) {
        document.getElementById(typingId).textContent = "My neural link is briefly interrupted. Please check the network connectivity.";
    }
}

function appendMessage(sender, text, id = null) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `msg msg-${sender}`;
    if(id) div.id = id;
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

