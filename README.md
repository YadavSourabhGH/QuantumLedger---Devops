# Project QuantumLedger — Global CBDC DevOps Operations Platform

QuantumLedger is an enterprise-grade, multi-national Central Bank Digital Currency (CBDC) DevOps ecosystem designed to support secure digital currency issuance, transaction settlement, compliance monitoring, and high-availability disaster recovery.

This repository implements the DevOps automation, Kubernetes orchestration, secret management, monitoring configurations, and a web-based **CBDC Operations Dashboard** to simulate and evaluate platform resilience under real-world stressors.

> **Live Demo**: [http://3.84.104.8](http://3.84.104.8)  
> **GitHub**: [YadavSourabhGH/QuantumLedger---Devops](https://github.com/YadavSourabhGH/QuantumLedger---Devops)

---

## Architecture and Components

The ecosystem consists of the following production-ready components:

1. **Interactive Operations Dashboard (`index.html`, `app.css`, `app.js`)**: A dark-themed, glassmorphic dashboard with a landing page and multi-view operations center featuring real-time metrics, network state topology, Kubernetes pod grid visualization, and interactive stress simulators. Uses **Lucide** SVG vector icons throughout (no emoji characters).
2. **Infrastructure Automation (`terraform/`)**: Modular multi-region AWS scripts setting up EKS, private subnets, KMS Vault unsealing keys, and Aurora Global Databases.
3. **Containerization & Orchestration (`docker/`, `kubernetes/`)**: Production-grade Dockerfiles, local `docker-compose.yml` for monitoring stacks, and Kubernetes manifests defining StatefulSets, Deployments, HPAs, and PodDisruptionBudgets.
4. **CI/CD Software Delivery (`jenkins/`)**: Declarative `Jenkinsfile` configuring checkouts, lints, Trivy security scans, Terraform applications, and rolling updates.
5. **Monitoring & Logging (`kubernetes/monitoring/`)**: Prometheus configuration scraping rules, alerting rules (latency/outage alerts), Logstash log parsing filters, and Grafana JSON dashboards.
6. **Secret Management (`kubernetes/vault-agent.yaml`)**: Configurations showing dynamic database secrets and certificate injection.
7. **Automated Deployment (`deploy.sh`)**: One-command deployment script that syncs files to EC2, installs Docker, and launches the containerized stack with automatic restart on boot.

---

## Quick Start: Run the Platform Locally

To spin up the CBDC Operations Dashboard and its local DevOps stack (Prometheus, Grafana, HashiCorp Vault), follow these steps.

### Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop/) installed and running.
- [Docker Compose](https://docs.docker.com/compose/install/) (comes bundled with Docker Desktop).

### Step 1: Boot the Docker Compose Stack
Navigate to the repository and launch the stack:

```bash
docker compose -f docker/docker-compose.yml up --build -d
```

### Step 2: Access the Services
Once running, you can access the following interfaces:
- **CBDC Operations Dashboard**: [http://localhost](http://localhost) (Port 80)
- **HashiCorp Vault**: [http://localhost:8200](http://localhost:8200) (Token: `quantum-root-token`)
- **Prometheus Server**: [http://localhost:9090](http://localhost:9090)
- **Grafana Dashboards**: [http://localhost:3000](http://localhost:3000) (User/Pass: `admin` / `admin`)

---

## Deploy to AWS EC2

Use the included deployment script to deploy to a live EC2 instance:

```bash
chmod +x deploy.sh
./deploy.sh
```

The script will:
1. Connect to the EC2 instance via SSH (using `QuantumLedger.pem`)
2. Sync all project files via `rsync`
3. Install Docker and Docker Compose if missing
4. Enable Docker to auto-start on system reboot
5. Build and launch the containerized stack on port 80

**Docker Auto-Restart**: All containers are configured with `restart: unless-stopped` and the Docker service is enabled on boot, ensuring the platform survives EC2 reboots.

---

## User Experience Flow

### Landing Page
The landing page introduces QuantumLedger's platform capabilities:
- **Hero Section**: Title, subtitle, and a prominent "Enter Operations Dashboard" CTA button
- **Capabilities Grid**: Three feature cards explaining CBDC Settlement, Self-Healing Infrastructure, and DevSecOps Compliance
- **Navigation Bar**: Logo with "Launch Control Center" button

### Operations Dashboard
Clicking "Enter Operations Dashboard" transitions to the detailed multi-view dashboard with a persistent sidebar:

| Sidebar View | Description |
|---|---|
| **System Overview** | Live throughput, latency, pod count, error rate. Infrastructure health status and incident monitor table. |
| **Stress Simulators** | Interactive stress test cards with visual feedback and Kubernetes pod grid. |
| **Consensus & Network** | SVG topology map of ledger consensus nodes with live sync state and voting logs. |
| **Live Telemetry** | Real-time Chart.js graphs, CPU/Memory dials, and ELK log stream. |
| **Vault & Security** | Cyber attack simulator, key rotation, credential audit dashboard, and compliance gauge. |

---

## Interactive Simulator Scenarios

### 1. Transaction Surge
- **Trigger**: Click `Trigger Surge` in Stress Simulators.
- **Behavior**: Simulates 12,000 TPS load. CPU spikes, latency increases.
- **Recovery**: HPA scales API Gateway pods from 3 to 12. CPU load balances to 45%, latency recovers to 30ms.

### 2. Region Outage & Disaster Recovery
- **Trigger**: Click `Trigger Outage` in Stress Simulators.
- **Behavior**: Simulates us-east-1 failure. Primary ledger offline, error rate climbs to 100%.
- **Failover Recovery**: Within 3.5 seconds, DR protocol promotes us-west-2 backup. DNS shifts, connectivity re-establishes, transaction success returns to 100%.

### 3. Ledger Desynchronization
- **Trigger**: Click `Simulate Consensus Desync` in Consensus & Network.
- **Behavior**: Network partition between Chase node and core ledger. Chase shows "Index Lag".
- **Recovery**: Raft reconciliation catches up missing blocks, Chase node recovers.

### 4. Cyber Attack & Vault Key Rotation
- **Trigger**: Click `Simulate Attack` then `Rotate Vault Keys` in Vault & Security.
- **Behavior**: Compromised credentials attack retail endpoint. Vault rejects requests, logs failures.
- **Mitigation**: Vault rotates PostgreSQL credentials, EKS performs rolling pod update.

### 5. Jenkins CI/CD Pipeline
- **Trigger**: Click `Trigger CI/CD Pipeline` in Stress Simulators.
- **Behavior**: Visualizes 6-stage Jenkins pipeline: Checkout → Lint & Test → Build → Scan → TF Apply → Deploy.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Cloud Infrastructure** | AWS EC2, VPC, EKS, RDS Aurora Global DB, KMS, Route 53 |
| **Infrastructure as Code** | Terraform (modular multi-region) |
| **Containerization** | Docker, Docker Compose |
| **Container Orchestration** | Kubernetes (StatefulSets, Deployments, HPA) |
| **CI/CD Pipeline** | Jenkins (Declarative Jenkinsfile) |
| **Secret Management** | HashiCorp Vault (AppRole, dynamic leases, PKI) |
| **Monitoring** | Prometheus + Grafana |
| **Logging** | ELK Stack (Elasticsearch, Logstash, Filebeat) |
| **Web Server** | Nginx Alpine (security-hardened) |
| **Frontend** | Vanilla HTML5, CSS3, JavaScript |
| **Icons** | Lucide SVG (CDN) |
| **Charts** | Chart.js |
| **Typography** | Google Fonts (Inter, JetBrains Mono) |

---

## Repository Structure

```
QuantumLedger/
├── index.html                       # Landing page + Dashboard (624 lines)
├── app.css                          # Complete stylesheet (39 KB)
├── app.js                           # Dashboard controller (912 lines)
├── deploy.sh                        # Automated EC2 deployment
├── docker/
│   ├── Dockerfile                   # Nginx Alpine production image
│   ├── docker-compose.yml           # 4-service stack orchestration
│   └── nginx.conf                   # Security-hardened web config
├── terraform/
│   ├── main.tf                      # Core AWS infrastructure
│   ├── variables.tf                 # Input variables
│   ├── outputs.tf                   # Output values
│   └── modules/                     # Reusable modules
├── kubernetes/
│   ├── api-gateway.yaml             # API Gateway + HPA
│   ├── central-bank-node.yaml       # Ledger StatefulSet
│   ├── commercial-bank-node.yaml    # Bank gateways
│   ├── vault-agent.yaml             # Vault sidecar config
│   └── monitoring/                  # Prometheus, Grafana, Logstash
├── jenkins/
│   └── Jenkinsfile                  # Declarative CI/CD pipeline
└── docs/
    ├── architecture_diagram.md      # Mermaid infra topology
    ├── deployment_diagram.md        # K8s pod layout
    ├── compliance_controls.md       # Security controls
    └── disaster_recovery_plan.md    # DR runbook
```

---

## Academic Profile

| Field | Details |
|---|---|
| **Student** | Sourabh Dinesh Yadav |
| **Roll Number** | 150096724013 |
| **Cohort** | MZ |
| **Batch** | 2024-28 |
