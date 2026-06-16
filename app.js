/* ----------------------------------------------------
   QuantumLedger - Clay.com Theme Dashboard Controller
   ---------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize vector icons
  lucide.createIcons();
  
  // --- View Toggle & Landing Page Logic ---
  const landingPage = document.getElementById('landing-page');
  const dashboardApp = document.getElementById('dashboard-app');
  const btnEnterHero = document.getElementById('btn-enter-hero');
  const btnEnterNav = document.getElementById('btn-enter-nav');
  const btnBackToLanding = document.getElementById('btn-back-to-landing');

  function enterDashboard() {
    landingPage.style.display = 'none';
    dashboardApp.style.display = 'block';
    
    // Recalculate chart and network connection coordinates
    setTimeout(() => {
      metricsChart.resize();
      metricsChart.update();
      updateNetworkLines();
      lucide.createIcons();
    }, 100);
  }

  function exitDashboard() {
    dashboardApp.style.display = 'none';
    landingPage.style.display = 'block';
  }

  if (btnEnterHero) btnEnterHero.addEventListener('click', enterDashboard);
  if (btnEnterNav) btnEnterNav.addEventListener('click', enterDashboard);
  if (btnBackToLanding) btnBackToLanding.addEventListener('click', exitDashboard);

  // --- Sidebar View Switching Logic ---
  const sidebarItems = document.querySelectorAll('.sidebar-menu-item');
  const viewPanels = document.querySelectorAll('.view-panel');
  const viewTitle = document.getElementById('view-title');

  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      // Toggle sidebar active item
      sidebarItems.forEach(sib => sib.classList.remove('active'));
      item.classList.add('active');

      // Swap view panels
      const targetView = item.getAttribute('data-view');
      viewPanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === targetView) {
          panel.classList.add('active');
        }
      });

      // Update Header Title
      const name = item.querySelector('span:not(.menu-icon)').innerText;
      viewTitle.innerText = name;

      // Special action on network/topology view active
      if (targetView === 'view-network') {
        setTimeout(updateNetworkLines, 50);
      }
    });
  });

  // --- State Variables ---
  let systemState = 'SAFE'; // SAFE, SURGE, OUTAGE, DESYNC, ATTACK
  let currentTPS = 120;
  let currentLatency = 14;
  let currentCPU = 8;
  let currentMemory = 42;
  let currentErrorRate = 0.00;
  let primaryRegion = 'AWS us-east-1';
  let backupRegion = 'AWS us-west-2';
  
  // Consensus State
  let blockHeight = 9251800;
  let consensusAgreement = 100.0;
  let activeValidatorsCount = 5;
  let syncPercentage = 100;

  // Kubernetes Replica State
  let apiPods = [
    { id: 'api-pod-1', role: 'api-gateway', status: 'running' },
    { id: 'api-pod-2', role: 'api-gateway', status: 'running' },
    { id: 'api-pod-3', role: 'api-gateway', status: 'running' }
  ];
  let bankPods = [
    { id: 'chase-pod', role: 'chase-gateway', status: 'running' },
    { id: 'citi-pod', role: 'citi-gateway', status: 'running' },
    { id: 'hsbc-pod', role: 'hsbc-gateway', status: 'running' }
  ];

  let pipelineRunning = false;

  // Telemetry Chart Configuration
  const chartLabels = Array.from({ length: 15 }, (_, i) => `${15 - i}s ago`);
  const chartDataTPS = Array(15).fill(120);
  const chartDataLatency = Array(15).fill(14);
  const chartDataCPU = Array(15).fill(8);

  // --- Initialize Chart.js with Cream-Theme Styles ---
  const ctx = document.getElementById('metricsChart').getContext('2d');
  const metricsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: [
        {
          label: 'TPS (Throughput)',
          data: chartDataTPS,
          borderColor: '#ff4d8b', // Brand Pink
          backgroundColor: 'rgba(255, 77, 139, 0.05)',
          borderWidth: 2,
          yAxisID: 'y',
          tension: 0.35,
          fill: true
        },
        {
          label: 'CPU Load (%)',
          data: chartDataCPU,
          borderColor: '#1a3a3a', // Brand Teal
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          yAxisID: 'y1',
          tension: 0.35,
          fill: false
        },
        {
          label: 'Latency (ms)',
          data: chartDataLatency,
          borderColor: '#e8b94a', // Brand Ochre
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          yAxisID: 'y1',
          tension: 0.35,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
          ticks: { color: '#6a6a6a', font: { size: 9 } },
          title: { display: true, text: 'Throughput (TPS)', color: '#ff4d8b', font: { size: 10 } }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { color: '#6a6a6a', font: { size: 9 } },
          title: { display: true, text: 'Percentage / Latency', color: '#1a3a3a', font: { size: 10 } }
        },
        x: {
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
          ticks: { color: '#6a6a6a', font: { size: 8 } }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#0a0a0a', font: { size: 9, weight: '600' } },
          position: 'top'
        }
      }
    }
  });

  // --- Dynamic SVG Connection Positioning ---
  function updateNetworkLines() {
    const svg = document.getElementById('network-svg');
    const container = document.querySelector('.network-map-wrapper');
    if (!container || !svg) return;
    const bounds = container.getBoundingClientRect();

    const cb = document.getElementById('node-cb').getBoundingClientRect();
    const cbBackup = document.getElementById('node-cb-backup').getBoundingClientRect();
    const chase = document.getElementById('node-chase').getBoundingClientRect();
    const citi = document.getElementById('node-citi').getBoundingClientRect();
    const hsbc = document.getElementById('node-hsbc').getBoundingClientRect();
    const retail = document.getElementById('node-retail').getBoundingClientRect();

    const getCenter = (rect) => ({
      x: rect.left - bounds.left + rect.width / 2,
      y: rect.top - bounds.top + rect.height / 2
    });

    const cbCenter = getCenter(cb);
    const cbBackupCenter = getCenter(cbBackup);
    const chaseCenter = getCenter(chase);
    const citiCenter = getCenter(citi);
    const hsbcCenter = getCenter(hsbc);
    const retailCenter = getCenter(retail);

    if (systemState === 'OUTAGE' && primaryRegion === 'AWS us-west-2') {
      // Connect to us-west-2 backup node instead
      document.getElementById('line-cb-chase').setAttribute('d', `M ${cbBackupCenter.x} ${cbBackupCenter.y} L ${chaseCenter.x} ${chaseCenter.y}`);
      document.getElementById('line-cb-citi').setAttribute('d', `M ${cbBackupCenter.x} ${cbBackupCenter.y} L ${citiCenter.x} ${citiCenter.y}`);
      document.getElementById('line-cb-hsbc').setAttribute('d', `M ${cbBackupCenter.x} ${cbBackupCenter.y} L ${hsbcCenter.x} ${hsbcCenter.y}`);
      document.getElementById('line-cb-retail').setAttribute('d', `M ${cbBackupCenter.x} ${cbBackupCenter.y} L ${retailCenter.x} ${retailCenter.y}`);
    } else {
      // Standard connections to primary node-cb
      document.getElementById('line-cb-chase').setAttribute('d', `M ${cbCenter.x} ${cbCenter.y} L ${chaseCenter.x} ${chaseCenter.y}`);
      document.getElementById('line-cb-citi').setAttribute('d', `M ${cbCenter.x} ${cbCenter.y} L ${citiCenter.x} ${citiCenter.y}`);
      document.getElementById('line-cb-hsbc').setAttribute('d', `M ${cbCenter.x} ${cbCenter.y} L ${hsbcCenter.x} ${hsbcCenter.y}`);
      document.getElementById('line-cb-retail').setAttribute('d', `M ${cbCenter.x} ${cbCenter.y} L ${retailCenter.x} ${retailCenter.y}`);
    }
    document.getElementById('line-primary-backup').setAttribute('d', `M ${cbCenter.x} ${cbCenter.y} L ${cbBackupCenter.x} ${cbBackupCenter.y}`);
  }

  window.addEventListener('resize', updateNetworkLines);

  // --- Kubernetes Pod Grid Renderer ---
  const podGrid = document.getElementById('pod-grid');
  
  function renderPods() {
    if (!podGrid) return;
    podGrid.innerHTML = '';
    
    // Core Ledger Pods
    for (let i = 0; i < 3; i++) {
      const isOnline = systemState !== 'OUTAGE';
      const podCard = document.createElement('div');
      podCard.className = 'pod-card';
      podCard.innerHTML = `
        <div class="pod-indicator ${isOnline ? 'running' : 'terminating'}"></div>
        <div class="pod-name" title="ledger-node-${i}">ledger-${i}</div>
        <div class="pod-role">statefulset</div>
      `;
      podGrid.appendChild(podCard);
    }

    // API Gateway Pods
    apiPods.forEach(pod => {
      const podCard = document.createElement('div');
      podCard.className = 'pod-card';
      podCard.innerHTML = `
        <div class="pod-indicator ${pod.status}"></div>
        <div class="pod-name" title="${pod.id}">${pod.id}</div>
        <div class="pod-role">api</div>
      `;
      podGrid.appendChild(podCard);
    });

    // Bank Gateways
    bankPods.forEach(pod => {
      const isOnline = !(systemState === 'DESYNC' && pod.id === 'chase-pod');
      const podCard = document.createElement('div');
      podCard.className = 'pod-card';
      podCard.innerHTML = `
        <div class="pod-indicator ${isOnline ? 'running' : 'pending'}"></div>
        <div class="pod-name" title="${pod.id}">${pod.id}</div>
        <div class="pod-role">settle</div>
      `;
      podGrid.appendChild(podCard);
    });
  }
  renderPods();

  // --- Log Append Helpers ---
  const elksLogsBox = document.getElementById('tab-elk');
  const vaultLogsBox = document.getElementById('tab-vault');
  const consensusLogBox = document.getElementById('consensus-log-box');
  
  function addLog(box, type, component, message) {
    if (!box) return;
    const timestamp = new Date().toISOString().substring(11, 19);
    const line = document.createElement('div');
    line.className = 'log-line';
    
    let levelClass = 'info';
    if (type === 'WARN') levelClass = 'warn';
    if (type === 'ERROR') levelClass = 'error';
    if (type === 'SUCCESS') levelClass = 'success';
    if (type === 'VAULT') levelClass = 'vault';

    line.innerHTML = `<span class="timestamp">[${timestamp}]</span> <span class="${levelClass}">[${type}]</span> <span class="component">[${component}]</span> ${message}`;
    box.appendChild(line);
    box.scrollTop = box.scrollHeight;
    
    if (box.children.length > 50) {
      box.removeChild(box.firstChild);
    }
  }

  // Initialize Logs
  addLog(elksLogsBox, 'INFO', 'ConsensusEngine', 'Consensus cluster initialized. Raft election successful. Node-0 elected leader.');
  addLog(elksLogsBox, 'INFO', 'LedgerDB', 'Database schema migration ver: 4.8.2 complete.');
  addLog(elksLogsBox, 'SUCCESS', 'GatewayService', 'Chase Settlement Gateway active and listening on port 8080.');
  addLog(elksLogsBox, 'INFO', 'Route53', 'Health check active. Routing weights: us-east-1 (100%), us-west-2 (0%).');

  addLog(vaultLogsBox, 'VAULT', 'VaultCore', 'Vault server version 1.15.2 initialized in high-availability mode.');
  addLog(vaultLogsBox, 'VAULT', 'SecretsEngine', 'Database dynamic secrets engine enabled at database/postgresql.');
  addLog(vaultLogsBox, 'VAULT', 'PolicyEngine', 'Read policy "cbdc-ledger-read" written successfully.');

  // --- Incident Monitor Table Management ---
  const alertsTableBody = document.getElementById('alerts-table-body');
  let activeIncidents = {};

  function logIncident(id, component, description, severity) {
    const time = new Date().toISOString().substring(11, 19);
    activeIncidents[id] = { time, component, description, severity, status: 'ACTIVE' };
    renderIncidentsTable();
  }

  function resolveIncident(id) {
    if (activeIncidents[id]) {
      activeIncidents[id].status = 'AUTO-HEALED';
      renderIncidentsTable();
    }
  }

  function mitigateIncident(id) {
    if (activeIncidents[id]) {
      activeIncidents[id].status = 'MITIGATED';
      renderIncidentsTable();
    }
  }

  function renderIncidentsTable() {
    if (!alertsTableBody) return;
    const keys = Object.keys(activeIncidents);
    if (keys.length === 0) {
      alertsTableBody.innerHTML = `<tr><td colspan="4" class="table-empty-row">System operational. No active incidents.</td></tr>`;
      return;
    }
    
    alertsTableBody.innerHTML = '';
    keys.forEach(k => {
      const inc = activeIncidents[k];
      let statusClass = 'text-alarm';
      if (inc.status === 'AUTO-HEALED') statusClass = 'success-text';
      if (inc.status === 'MITIGATED') statusClass = 'color-teal';

      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${inc.time}</strong></td>
        <td><span class="badge-pill" style="margin:0; font-size:9px; padding:2px 6px;">${inc.component}</span></td>
        <td>${inc.description}</td>
        <td><strong class="${statusClass}">${inc.status}</strong></td>
      `;
      alertsTableBody.appendChild(row);
    });
  }

  // --- Dynamic System Telemetry Dials & Health Status ---
  const dialCpuBar = document.getElementById('dial-cpu-bar');
  const dialMemBar = document.getElementById('dial-mem-bar');
  const dialLatencyBar = document.getElementById('dial-latency-bar');
  const valMemory = document.getElementById('val-memory');
  const consensusBlockHeight = document.getElementById('consensus-block-height');
  const consensusAgreementText = document.getElementById('consensus-agreement');
  const consensusValidatorsCount = document.getElementById('consensus-validators-count');
  const consensusSyncProgressBar = document.getElementById('consensus-sync-progress-bar');
  const consensusSyncPercentage = document.getElementById('consensus-sync-percentage');

  // --- Metrics Simulation Loop ---
  setInterval(() => {
    // 1. Basic metric generation based on state
    if (systemState === 'SAFE') {
      currentTPS = Math.floor(110 + Math.random() * 25);
      currentLatency = Math.floor(12 + Math.random() * 5);
      currentCPU = Math.floor(6 + Math.random() * 4);
      currentMemory = Math.floor(41 + Math.random() * 3);
      currentErrorRate = 0.00;
      consensusAgreement = 100.0;
      activeValidatorsCount = 5;
      syncPercentage = 100;
    } else if (systemState === 'SURGE') {
      if (apiPods.length < 10) {
        currentTPS = Math.floor(9500 + Math.random() * 1500);
        currentLatency = Math.floor(160 + Math.random() * 40);
        currentCPU = Math.floor(88 + Math.random() * 8);
        currentMemory = Math.floor(75 + Math.random() * 5);
        currentErrorRate = +(0.5 + Math.random() * 2).toFixed(2);
      } else {
        currentTPS = Math.floor(11000 + Math.random() * 1000);
        currentLatency = Math.floor(25 + Math.random() * 10);
        currentCPU = Math.floor(40 + Math.random() * 8);
        currentMemory = Math.floor(58 + Math.random() * 4);
        currentErrorRate = 0.00;
      }
    } else if (systemState === 'OUTAGE') {
      if (primaryRegion === 'AWS us-east-1') {
        currentTPS = 0;
        currentLatency = 999;
        currentCPU = 0;
        currentMemory = 10;
        currentErrorRate = 100.00;
        consensusAgreement = 0.0;
        activeValidatorsCount = 1;
        syncPercentage = 0;
      } else {
        currentTPS = Math.floor(110 + Math.random() * 25);
        currentLatency = Math.floor(16 + Math.random() * 6);
        currentCPU = Math.floor(9 + Math.random() * 5);
        currentMemory = Math.floor(43 + Math.random() * 3);
        currentErrorRate = 0.00;
        consensusAgreement = 100.0;
        activeValidatorsCount = 5;
        syncPercentage = 100;
      }
    } else if (systemState === 'DESYNC') {
      currentTPS = Math.floor(80 + Math.random() * 20);
      currentLatency = Math.floor(15 + Math.random() * 5);
      currentCPU = Math.floor(8 + Math.random() * 4);
      currentMemory = Math.floor(44 + Math.random() * 3);
      currentErrorRate = +(4.5 + Math.random() * 3).toFixed(2);
      consensusAgreement = 80.0;
      activeValidatorsCount = 4;
      syncPercentage = 92;
    } else if (systemState === 'ATTACK') {
      currentTPS = Math.floor(90 + Math.random() * 20);
      currentLatency = Math.floor(35 + Math.random() * 15);
      currentCPU = Math.floor(18 + Math.random() * 8);
      currentMemory = Math.floor(48 + Math.random() * 4);
      currentErrorRate = +(25.0 + Math.random() * 10).toFixed(2);
    }

    // 2. Increment Block Height
    if (systemState !== 'OUTAGE' || primaryRegion === 'AWS us-west-2') {
      blockHeight += Math.floor(1 + Math.random() * 2);
    }

    // 3. Update Text Values
    document.getElementById('val-tps').innerText = `${currentTPS} tps`;
    document.getElementById('val-latency').innerText = `${currentLatency}ms`;
    document.getElementById('val-cpu').innerText = `${currentCPU}%`;
    document.getElementById('val-error').innerText = `${currentErrorRate.toFixed(2)}%`;
    if (valMemory) valMemory.innerText = `${currentMemory}%`;
    if (consensusBlockHeight) consensusBlockHeight.innerText = blockHeight.toLocaleString();
    if (consensusAgreementText) consensusAgreementText.innerText = `${consensusAgreement.toFixed(1)}%`;
    if (consensusValidatorsCount) consensusValidatorsCount.innerText = `${activeValidatorsCount} / 5 Active`;
    if (consensusSyncProgressBar) consensusSyncProgressBar.style.width = `${syncPercentage}%`;
    if (consensusSyncPercentage) consensusSyncPercentage.innerText = `${syncPercentage}%`;

    // Overview Stats
    document.getElementById('hero-val-tps').innerText = `${currentTPS} tps`;
    document.getElementById('hero-val-latency').innerText = `${currentLatency}ms`;
    document.getElementById('hero-val-pods').innerText = `${3 + apiPods.length + bankPods.length} replicas`;
    document.getElementById('hero-val-error').innerText = `${currentErrorRate.toFixed(2)}%`;
    
    // Pink Card TPS Dial
    document.getElementById('tps-dial-val').innerText = currentTPS;

    // Security tab stats
    if (document.getElementById('sec-active-leases')) {
      document.getElementById('sec-active-leases').innerText = systemState === 'ATTACK' ? '0 Leases (Revoked)' : '12 Leases';
      document.getElementById('sec-waf-blocks').innerText = systemState === 'ATTACK' ? '148 blocks' : '0 blocks';
      const score = systemState === 'ATTACK' ? 45 : 100;
      document.getElementById('sec-compliance-score').innerText = `${score}%`;
      document.getElementById('sec-compliance-bar').style.width = `${score}%`;
      const statusBadge = document.getElementById('sec-engine-status');
      if (score < 100) {
        statusBadge.innerText = 'Vulnerable';
        statusBadge.className = 'audit-val text-alarm';
      } else {
        statusBadge.innerText = 'Compliant';
        statusBadge.className = 'audit-val success-text';
      }
    }

    // 4. Update Bar Dials
    if (dialCpuBar) dialCpuBar.style.width = `${currentCPU}%`;
    if (dialMemBar) dialMemBar.style.width = `${currentMemory}%`;
    if (dialLatencyBar) {
      const latPct = Math.min(100, Math.floor((currentLatency / 500) * 100));
      dialLatencyBar.style.width = `${latPct}%`;
    }

    // 5. Alert Indicator Colors
    const errIndicator = document.getElementById('val-error');
    const heroErrIndicator = document.getElementById('hero-val-error');
    if (currentErrorRate > 5) {
      if (errIndicator) errIndicator.className = 'm-val-strong text-alarm';
      if (heroErrIndicator) heroErrIndicator.className = 'stat-num text-alarm';
    } else {
      if (errIndicator) errIndicator.className = 'm-val-strong success-text';
      if (heroErrIndicator) heroErrIndicator.className = 'stat-num success-text';
    }

    // 6. Append Random Telemetry Logs
    if (Math.random() > 0.6) {
      if (systemState === 'SAFE') {
        addLog(elksLogsBox, 'INFO', 'ConsensusEngine', `Committed ledger block #${blockHeight}.`);
        if (consensusLogBox) {
          const timestamp = new Date().toISOString().substring(11, 19);
          consensusLogBox.innerHTML += `<div class="c-log-line">[${timestamp}] [CONSENSUS] Committed block #${blockHeight}. Merkle root matching.</div>`;
          consensusLogBox.scrollTop = consensusLogBox.scrollHeight;
        }
      } else if (systemState === 'SURGE') {
        addLog(elksLogsBox, 'WARN', 'HPA', `Average CPU utilization exceeds threshold (current=${currentCPU}%).`);
      } else if (systemState === 'OUTAGE' && primaryRegion === 'AWS us-east-1') {
        addLog(elksLogsBox, 'ERROR', 'LoadBalancer', 'Connection timed out trying to reach api-gateway backends.');
      } else if (systemState === 'DESYNC') {
        addLog(elksLogsBox, 'ERROR', 'ConsensusEngine', 'Chase Gateway node reported split state. Block hash divergence.');
      } else if (systemState === 'ATTACK') {
        addLog(vaultLogsBox, 'VAULT', 'AuthEngine', 'Token authentication failed for client role "merchant-pos".');
      }
    }

    // 7. Update Chart Data
    chartDataTPS.shift();
    chartDataTPS.push(currentTPS);
    chartDataCPU.shift();
    chartDataCPU.push(currentCPU);
    chartDataLatency.shift();
    chartDataLatency.push(currentLatency === 999 ? 500 : currentLatency);

    metricsChart.update();
  }, 1000);

  // --- Simulators Logic ---

  // Reset Environment
  function resetEnvironment() {
    systemState = 'SAFE';
    primaryRegion = 'AWS us-east-1';
    backupRegion = 'AWS us-west-2';
    
    // Status Badge Reset
    document.getElementById('global-status-text').innerText = 'AWS us-east-1 ● OPERATIONAL';
    document.getElementById('global-status-dot').className = 'status-dot online';

    // Outage Card Pills Reset
    document.getElementById('region-east').className = 'region-pill active';
    document.getElementById('region-west').className = 'region-pill standby';

    // Health Badges Reset
    document.getElementById('health-eks').innerText = 'Normal';
    document.getElementById('health-eks').className = 'health-status-badge success';
    document.getElementById('health-route53').innerText = 'Primary';
    document.getElementById('health-route53').className = 'health-status-badge success';
    document.getElementById('health-rds').innerText = 'Synchronized';
    document.getElementById('health-rds').className = 'health-status-badge success';
    document.getElementById('health-vault').innerText = 'Sealed (Auto)';
    document.getElementById('health-vault').className = 'health-status-badge success';

    // Map Nodes UI Reset
    document.querySelectorAll('.node').forEach(node => {
      node.classList.remove('offline', 'desync');
    });
    document.getElementById('status-cb').innerText = 'Primary';
    document.getElementById('status-cb').className = 'node-status text-online';
    document.getElementById('status-cb-backup').innerText = 'Standby';
    document.getElementById('status-cb-backup').className = 'node-status text-standby';
    document.getElementById('status-chase').innerText = 'Online';
    document.getElementById('status-chase').className = 'node-status text-online';
    document.getElementById('status-retail').innerText = 'Online';
    document.getElementById('status-retail').className = 'node-status text-online';

    // Reset lines connection styles
    document.querySelectorAll('.connection-line').forEach(line => {
      line.className.baseVal = 'connection-line active';
    });

    // Reset Pods
    apiPods = [
      { id: 'api-pod-1', role: 'api-gateway', status: 'running' },
      { id: 'api-pod-2', role: 'api-gateway', status: 'running' },
      { id: 'api-pod-3', role: 'api-gateway', status: 'running' }
    ];
    renderPods();
    document.getElementById('hpa-status').innerText = 'Idle (Min: 3, Max: 15)';

    // Clear Incidents Monitor
    activeIncidents = {};
    renderIncidentsTable();

    addLog(elksLogsBox, 'SUCCESS', 'Operations', 'System environment reset to safe defaults.');
    updateNetworkLines();
  }

  document.getElementById('btn-restore').addEventListener('click', resetEnvironment);
  const sidebarReset = document.getElementById('btn-sidebar-reset');
  if (sidebarReset) sidebarReset.addEventListener('click', resetEnvironment);

  // Scenario 1: Surge simulation
  document.getElementById('btn-surge').addEventListener('click', () => {
    if (systemState !== 'SAFE') return;
    systemState = 'SURGE';
    
    addLog(elksLogsBox, 'WARN', 'GatewayService', 'Incoming transaction request surge detected! Current rate: 12,000 TPS.');
    addLog(elksLogsBox, 'WARN', 'Prometheus', 'ALERT: ApiGatewayAvgCPULoad > 85% triggered.');
    
    document.getElementById('global-status-text').innerText = 'AWS us-east-1 ● PEAK TRAFFIC';
    document.getElementById('global-status-dot').className = 'status-dot alarm';
    document.getElementById('hpa-status').innerText = 'SCALING ACTIVE (HPA triggered)';
    
    // Overview health update
    document.getElementById('health-eks').innerText = 'High CPU Load';
    document.getElementById('health-eks').className = 'health-status-badge warn';

    // Log incident in Monitor table
    logIncident('inc-surge', 'AWS EKS Cluster', 'High traffic surge of 12,000 TPS triggering HPA autoscaler', 'WARNING');

    setTimeout(() => {
      addLog(elksLogsBox, 'INFO', 'KubeScheduler', 'HorizontalPodAutoscaler scaling deployment api-gateway from 3 to 12 replicas.');
      
      for (let i = 4; i <= 12; i++) {
        apiPods.push({ id: `api-pod-${i}`, role: 'api-gateway', status: 'pending' });
      }
      renderPods();

      setTimeout(() => {
        apiPods.forEach(pod => { pod.status = 'running'; });
        renderPods();
        addLog(elksLogsBox, 'SUCCESS', 'KubeController', 'All 12 replicas of deployment api-gateway successfully deployed and reporting healthy.');
        
        document.getElementById('global-status-text').innerText = 'AWS us-east-1 ● OPERATIONAL (SCALED)';
        document.getElementById('global-status-dot').className = 'status-dot online';
        document.getElementById('hpa-status').innerText = 'Balanced (12 Replicas)';
        
        document.getElementById('health-eks').innerText = 'Normal (Scaled)';
        document.getElementById('health-eks').className = 'health-status-badge success';

        resolveIncident('inc-surge');
      }, 3000);
    }, 1500);
  });

  // Scenario 2: Region Outage & DR Failover
  document.getElementById('btn-outage').addEventListener('click', () => {
    if (systemState === 'OUTAGE') return;
    systemState = 'OUTAGE';
    
    addLog(elksLogsBox, 'ERROR', 'AWS-Health', 'CRITICAL FAILURE: Primary Availability Zone failure in us-east-1. Network partitions detected.');
    addLog(elksLogsBox, 'ERROR', 'Prometheus', 'CRITICAL ALARM: Central Bank Primary Node OFFLINE.');

    // Outage Card Pills changes
    document.getElementById('region-east').className = 'region-pill failed';

    // Break node status in consensus map
    document.getElementById('node-cb').classList.add('offline');
    document.getElementById('status-cb').innerText = 'OFFLINE';
    document.getElementById('status-cb').className = 'node-status text-offline';
    
    document.getElementById('global-status-text').innerText = 'AWS us-east-1 ● CRITICAL FAULT';
    document.getElementById('global-status-dot').className = 'status-dot alarm';

    // Update Overview health badges
    document.getElementById('health-eks').innerText = 'Outage';
    document.getElementById('health-eks').className = 'health-status-badge alarm';
    document.getElementById('health-route53').innerText = 'Failing';
    document.getElementById('health-route53').className = 'health-status-badge alarm';
    document.getElementById('health-rds').innerText = 'Lagging';
    document.getElementById('health-rds').className = 'health-status-badge warn';

    // Log incident in table
    logIncident('inc-outage', 'us-east-1 AZ', 'Total infrastructure outage in primary Availability Zone', 'CRITICAL');

    // Connect lines go red/dashed
    document.getElementById('line-cb-chase').className.baseVal = 'connection-line error';
    document.getElementById('line-cb-citi').className.baseVal = 'connection-line error';
    document.getElementById('line-cb-hsbc').className.baseVal = 'connection-line error';
    document.getElementById('line-cb-retail').className.baseVal = 'connection-line error';
    document.getElementById('line-primary-backup').className.baseVal = 'connection-line error';

    renderPods();

    // Trigger failover promotion
    setTimeout(() => {
      addLog(elksLogsBox, 'WARN', 'Route53', 'Primary target us-east-1 unhealthy. Initiating DNS failover to standby DR site us-west-2.');
      addLog(elksLogsBox, 'INFO', 'RaftConsensus', 'us-west-2 standby consensus node promoting itself to LEADER.');
      addLog(vaultLogsBox, 'WARN', 'VaultHA', 'Active Vault instance in us-east-1 uncontactable. us-west-2 replica promoted to active.');
      
      primaryRegion = 'AWS us-west-2';
      backupRegion = 'AWS us-east-1 (FAILED)';
      
      document.getElementById('global-status-text').innerText = 'AWS us-west-2 ● DR ACTIVE';
      document.getElementById('global-status-dot').className = 'status-dot online';

      // Outage Card Pills update
      document.getElementById('region-east').className = 'region-pill standby';
      document.getElementById('region-west').className = 'region-pill active';

      // DR Ledger goes green active
      document.getElementById('status-cb-backup').innerText = 'Primary';
      document.getElementById('status-cb-backup').className = 'node-status text-online';
      document.getElementById('node-cb-backup').classList.add('central-bank-node');

      // Overview health recovery
      document.getElementById('health-eks').innerText = 'DR Active';
      document.getElementById('health-eks').className = 'health-status-badge success';
      document.getElementById('health-route53').innerText = 'us-west-2';
      document.getElementById('health-route53').className = 'health-status-badge success';
      document.getElementById('health-rds').innerText = 'Promoted';
      document.getElementById('health-rds').className = 'health-status-badge success';

      // Recover lines representation connected to us-west-2
      updateNetworkLines();
      document.getElementById('line-cb-chase').className.baseVal = 'connection-line active';
      document.getElementById('line-cb-citi').className.baseVal = 'connection-line active';
      document.getElementById('line-cb-hsbc').className.baseVal = 'connection-line active';
      document.getElementById('line-cb-retail').className.baseVal = 'connection-line active';

      resolveIncident('inc-outage');
      addLog(elksLogsBox, 'SUCCESS', 'Operations', 'Traffic failover complete. RTO: 3.42 seconds. Zero ledger transaction losses recorded.');
    }, 3500);
  });

  // Scenario 3: Consensus split desync
  document.getElementById('btn-desync').addEventListener('click', () => {
    if (systemState !== 'SAFE') return;
    systemState = 'DESYNC';

    addLog(elksLogsBox, 'WARN', 'ConsensusEngine', 'Network drop detected on Chase settlement channel. Transmit timeouts building up.');
    addLog(elksLogsBox, 'WARN', 'LedgerStore', 'Chase Gateway node index lagging behind.');

    document.getElementById('global-status-text').innerText = 'AWS us-east-1 ● DEGRADED SYNC';
    document.getElementById('global-status-dot').className = 'status-dot alarm';

    // Update Overview health badge
    document.getElementById('health-rds').innerText = 'Desynced';
    document.getElementById('health-rds').className = 'health-status-badge warn';

    // Log incident in table
    logIncident('inc-desync', 'Ledger Node', 'Chase settlement node ledger index desynchronization lag', 'WARNING');

    document.getElementById('node-chase').classList.add('desync');
    document.getElementById('status-chase').innerText = 'Desynced';
    document.getElementById('status-chase').className = 'node-status text-warning';
    document.getElementById('line-cb-chase').className.baseVal = 'connection-line desync';
    renderPods();

    // Trigger reconciliation automatically
    setTimeout(() => {
      addLog(elksLogsBox, 'INFO', 'ConsensusEngine', 'Triggering automatic consensus catchup. Validating merkle tree blocks...');
      
      setTimeout(() => {
        document.getElementById('node-chase').classList.remove('desync');
        document.getElementById('status-chase').innerText = 'Online';
        document.getElementById('status-chase').className = 'node-status text-online';
        document.getElementById('line-cb-chase').className.baseVal = 'connection-line active';

        document.getElementById('global-status-text').innerText = 'AWS us-east-1 ● OPERATIONAL';
        document.getElementById('global-status-dot').className = 'status-dot online';

        document.getElementById('health-rds').innerText = 'Synchronized';
        document.getElementById('health-rds').className = 'health-status-badge success';

        resolveIncident('inc-desync');
        renderPods();
        addLog(elksLogsBox, 'SUCCESS', 'ConsensusEngine', 'Chase settlement gateway successfully synchronized.');
        systemState = 'SAFE';
      }, 2000);
    }, 3000);
  });

  // Scenario 4: Cyber Attack
  document.getElementById('btn-attack').addEventListener('click', () => {
    if (systemState !== 'SAFE') return;
    systemState = 'ATTACK';

    addLog(elksLogsBox, 'ERROR', 'WAF', 'IP 45.233.109.12 executing brute-force scan on endpoint /api/v1/settle.');
    addLog(vaultLogsBox, 'WARN', 'VaultCore', 'Secret reading failed: auth lease token revoked or expired.');
    addLog(elksLogsBox, 'ERROR', 'GatewayService', 'POS-API credentials compromised. Leak suspected on developer repository.');

    document.getElementById('global-status-text').innerText = 'AWS us-east-1 ● SECURITY ALERT';
    document.getElementById('global-status-dot').className = 'status-dot alarm';
    document.getElementById('node-retail').classList.add('desync');
    document.getElementById('status-retail').innerText = 'ALERT';
    document.getElementById('status-retail').className = 'node-status text-offline';

    // Update Overview health badge
    document.getElementById('health-vault').innerText = 'Attack Detected';
    document.getElementById('health-vault').className = 'health-status-badge alarm';

    // Log incident in table
    logIncident('inc-attack', 'WAF / Vault', 'Brute force credential leak scan on retail POS endpoint', 'CRITICAL');
  });

  // Vault key rotation
  document.getElementById('btn-rotate').addEventListener('click', () => {
    if (systemState !== 'ATTACK' && systemState !== 'SAFE') return;
    
    addLog(vaultLogsBox, 'VAULT', 'SecretsEngine', 'Force credential rotation initiated by DevSecOps Admin.');
    addLog(vaultLogsBox, 'VAULT', 'DatabaseEngine', 'Generated new dynamic PostgreSQL credentials for api-gateway.');
    
    if (systemState === 'ATTACK') {
      setTimeout(() => {
        addLog(elksLogsBox, 'INFO', 'KubeController', 'Vault-Agent sidecar injected new credentials. Triggering rolling pod restart of api-gateway.');
        
        apiPods.forEach((pod, index) => {
          setTimeout(() => {
            pod.status = 'terminating';
            renderPods();
            setTimeout(() => {
              pod.id = `api-pod-rotated-${index + 1}`;
              pod.status = 'pending';
              renderPods();
              setTimeout(() => {
                pod.status = 'running';
                renderPods();
              }, 1000);
            }, 1000);
          }, index * 800);
        });

        setTimeout(() => {
          document.getElementById('node-retail').classList.remove('desync');
          document.getElementById('status-retail').innerText = 'Online';
          document.getElementById('status-retail').className = 'node-status text-online';
          document.getElementById('global-status-text').innerText = 'AWS us-east-1 ● OPERATIONAL';
          document.getElementById('global-status-dot').className = 'status-dot online';
          
          document.getElementById('health-vault').innerText = 'Sealed (Auto)';
          document.getElementById('health-vault').className = 'health-status-badge success';

          mitigateIncident('inc-attack');
          addLog(elksLogsBox, 'SUCCESS', 'WAF', 'Compromised credentials revoked. Attack mitigated.');
          systemState = 'SAFE';
        }, 4000);
      }, 1500);
    } else {
      addLog(elksLogsBox, 'SUCCESS', 'Operations', 'Secrets rotation complete. Key material refreshed.');
    }
  });

  // Scenario 5: Jenkins CI/CD pipeline
  document.getElementById('btn-jenkins').addEventListener('click', () => {
    if (pipelineRunning) return;
    pipelineRunning = true;

    // Switch sidebar navigation view to live telemetry tab to show logs
    const telemetryTabButton = document.querySelector('.sidebar-menu-item[data-view="view-telemetry"]');
    if (telemetryTabButton) telemetryTabButton.click();
    
    const progressContainer = document.querySelector('.pipeline-progress-container');
    const logsBox = document.getElementById('jenkins-logs-text');
    progressContainer.style.display = 'block';

    document.querySelectorAll('.stage').forEach(stage => {
      stage.className = 'stage';
    });

    logsBox.innerText = 'Started by user Admin\nRunning in Jenkins Agent node: ec2-jenkins-runner-01\n';

    // Log incident in table
    logIncident('inc-jenkins', 'Jenkins CI/CD', 'Automated build pipeline rollout triggered by branch merge', 'INFO');

    const stages = [
      { id: 'stage-checkout', name: 'Checkout', delay: 1500, log: 'Cloning repository... git clone git@github.com:quantumledger/cbdc-ops.git\nCommit hash: a9083f211c\nSUCCESS: Branch main checked out.' },
      { id: 'stage-lint', name: 'Lint & Test', delay: 2000, log: 'Running lint tools...\nnpm run lint:css\nRunning unit tests...\nTest suites: 18 passed, 18 total\nSUCCESS: All unit tests and linters passed.' },
      { id: 'stage-build', name: 'Docker Build', delay: 2500, log: 'Building Docker image: quantumledger/cbdc-dashboard:latest...\nSUCCESS: Image built. Tagged as quantumledger/cbdc-dashboard:latest.' },
      { id: 'stage-scan', name: 'Trivy Scan', delay: 1800, log: 'Executing Trivy vulnerability scan...\nTarget: quantumledger/cbdc-dashboard:latest\nVulnerabilities: 0 Critical, 0 High, 2 Medium, 12 Low\nSUCCESS: Security compliance gate PASSED.' },
      { id: 'stage-terraform', name: 'Terraform Apply', delay: 3000, log: 'Configuring Terraform context...\nterraform init\nterraform apply -auto-approve\nApply complete! Resources: 0 added, 0 changed, 0 destroyed.' },
      { id: 'stage-deploy', name: 'K8s Deploy', delay: 2500, log: 'Configuring kubeconfig...\nkubectl set image deployment/api-gateway gateway-app=quantumledger/cbdc-dashboard:latest --record\nRolling update initiated.' }
    ];

    let currentStageIndex = 0;

    function runStage() {
      if (currentStageIndex >= stages.length) {
        logsBox.innerText += '\n\nFinished: SUCCESS\nPipeline executed in 12.8s\n';
        logsBox.scrollTop = logsBox.scrollHeight;
        pipelineRunning = false;
        
        addLog(elksLogsBox, 'INFO', 'KubeController', 'Rolling update deployment api-gateway ver. v1.12.0 started.');
        
        apiPods.forEach((pod, index) => {
          setTimeout(() => {
            pod.status = 'terminating';
            renderPods();
            setTimeout(() => {
              pod.status = 'pending';
              renderPods();
              setTimeout(() => {
                pod.status = 'running';
                renderPods();
              }, 1200);
            }, 800);
          }, index * 1000);
        });

        setTimeout(() => {
          addLog(elksLogsBox, 'SUCCESS', 'KubeController', 'Deployment api-gateway rolling update successfully completed.');
          resolveIncident('inc-jenkins');
        }, 4000);

        return;
      }

      const stage = stages[currentStageIndex];
      const el = document.getElementById(stage.id);
      el.classList.add('active');
      
      logsBox.innerText += `\n[Stage: ${stage.name}]\n${stage.log}\n`;
      logsBox.scrollTop = logsBox.scrollHeight;

      setTimeout(() => {
        el.classList.remove('active');
        el.classList.add('success');
        currentStageIndex++;
        runStage();
      }, stage.delay);
    }

    runStage();
  });

});
