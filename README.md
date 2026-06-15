# Project QuantumLedger - Global CBDC DevOps Operations Platform

QuantumLedger is an enterprise-grade, multi-national Central Bank Digital Currency (CBDC) DevOps ecosystem designed to support secure digital currency issuance, transaction settlement, compliance monitoring, and high-availability disaster recovery.

This repository implements the DevOps automation, Kubernetes orchestration, secret management, monitoring configurations, and a web-based **CBDC Operations Dashboard** to simulate and evaluate platform resilience under real-world stressors.

---

## 🛠️ Architecture and Components

The ecosystem consists of the following production-ready components:
1. **Interactive Operations Dashboard (`index.html`, `app.css`, `app.js`)**: A dark-themed, glassmorphic dashboard showcasing real-time metrics, network state connections, Kubernetes pod counts, and stress simulators.
2. **Infrastructure Automation (`terraform/`)**: Modular multi-region AWS scripts setting up EKS, private subnets, KMS Vault unsealing keys, and Aurora Global Databases.
3. **Containerization & Orchestration (`docker/`, `kubernetes/`)**: Production-grade Dockerfiles, local `docker-compose.yml` for monitoring stacks, and Kubernetes manifests defining StatefulSets, Deployments, HPAs, and PodDisruptionBudgets.
4. **CI/CD Software Delivery (`jenkins/`)**: Declarative `Jenkinsfile` configuring checkouts, lints, Trivy security scans, Terraform applications, and rolling updates.
5. **Monitoring & Logging (`kubernetes/monitoring/`)**: Prometheus configuration scraping rules, alerting rules (latency/outage alerts), Logstash log parsing filters, and Grafana JSON dashboards.
6. **Secret Management (`kubernetes/vault-agent.yaml`)**: Configurations showing dynamic database secrets and certificate injection.

---

## 🚀 Quick Start: Run the Platform Locally

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
- **CBDC Operations Dashboard**: [http://localhost:8080](http://localhost:8080) (Recommended)
- **HashiCorp Vault**: [http://localhost:8200](http://localhost:8200) (Token: `quantum-root-token`)
- **Prometheus Server**: [http://localhost:9090](http://localhost:9090)
- **Grafana Dashboards**: [http://localhost:3000](http://localhost:3000) (User/Pass: `admin` / `admin`)

---

## 🕹️ Interactive Simulator Scenarios

The web dashboard is equipped with real-time incident simulators to demonstrate system resilience:

### 1. ⚡ Transaction Surge
- **Trigger**: Click `Transaction Surge` in the control center.
- **Behavior**: Simulates an sudden influx of transactions. TPS scales to 12,000, latency increases, and CPU load spikes.
- **Autoscaling Recovery**: The dashboard triggers the **Kubernetes Horizontal Pod Autoscaler (HPA)**. API Gateway replicas scale from 3 to 12. As new pods enter `running` state, CPU load balances to 45% and latency recovers to 30ms.

### 2. ☣️ Region Outage & Disaster Recovery
- **Trigger**: Click `Region Outage` in the control center.
- **Behavior**: Simulates an outage in the primary AWS region (`us-east-1`). The primary ledger node goes offline, the network connections break, and the transaction error rate climbs to 100%.
- **Failover Recovery**: Within 3.5 seconds, the automated disaster recovery protocol promotes the backup standby node in `us-west-2` to primary. DNS weights shift traffic, connectivity re-establishes, and transaction success returns to 100%.

### 3. ⛓️ Ledger Desynchronization
- **Trigger**: Click `Ledger Desync` in the control center.
- **Behavior**: Simulates a network partition between the Chase settlement gateway and the core ledger. The Chase node status goes yellow, showing "Index Lag".
- **Consensus Recovery**: The reconciliation service activates, synchronization catching up missing blocks, and the Chase node recovers to active green status.

### 4. ☠️ Cyber Attack & Secrets Rotation
- **Trigger**: Click `Cyber Attack` in the control center.
- **Behavior**: Simulates a rogue actor attempting to access the retail POS endpoint using compromised credentials. Vault rejects the requests, logging authorization failures.
- **Access Mitigation**: Click `Vault Key Rotation`. Vault rotates the PostgreSQL user role credentials, and EKS performs a rolling update of the API pods, rotating keys and resolving the incident.

### 5. 🤖 CI/CD Pipeline Build
- **Trigger**: Click `Trigger CI/CD Pipeline`.
- **Behavior**: Initiates the simulated Jenkins pipeline. Visualizes checkout, linting, Docker build, Trivy security scan, Terraform check, and rolling Kubernetes update in real-time.
