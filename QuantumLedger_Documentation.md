# Academic Project Profile

| Field | Details |
| :--- | :--- |
| **Student Name** | Sourabh Dinesh Yadav |
| **Roll Number** | 150096724013 |
| **Cohort** | MZ |
| **Academic Batch** | 2024-28 |

---

# Project QuantumLedger - Technical Architecture & Operations Manual
**Global Central Bank Digital Currency (CBDC) Operations Platform**

---

## 1. Executive Overview

### 1.1 What is QuantumLedger?
**QuantumLedger** is a highly resilient, enterprise-scale Central Bank Digital Currency (CBDC) DevOps ecosystem and transactional platform. It provides the technological foundation for central banks, commercial institutions, retail merchants, and citizens to execute digital currency issuance, settlement, identity verification, and cross-border payments. The platform is designed for near-zero downtime and strict compliance under regulatory scrutiny.

### 1.2 QuantumLedger in Simple Terms
Imagine a digital replacement for physical cash that is issued directly by a nation's central bank. Instead of paper money traveling in wallets, digital money travels securely over a blockchain-inspired network of computers. 
* **QuantumLedger** is the system of engines, pipes, and security guards that makes this network run.
* It ensures that even if a whole cloud data center goes offline (like in a storm), the money doesn't disappear, and citizens can keep buying goods without delay.
* It uses automated "security guards" (Vault) to change passwords every hour so hackers can't steal keys, and "monitoring sensors" (Prometheus/Grafana) to warn operators if traffic spikes.

---

## 2. Problem Statement & Proposed Solution

### 2.1 The Problem Statement
Existing retail and commercial payment networks are highly fragmented across jurisdictions. During stress events (such as financial panics, cyberattacks, or cloud infrastructure outages), central banking authorities suffer from:
1. **Settlement Delays**: Slow ledger processing under peak transactional surges.
2. **Synchronization Failures**: Distributed ledgers diverging due to network partitions.
3. **Security Vulnerabilities**: Compromised credentials allowing unauthorized database or API access.
4. **Slow Disaster Recovery**: Inability to recover operations within strict regulatory timeframes (RTO < 5s).

### 2.2 Proposed Solution
The modernized QuantumLedger platform implements a cloud-native DevOps ecosystem:
* **Infrastructure as Code (Terraform)**: Rapid, consistent multi-region cloud provisioning.
* **Containerization & Orchestration (Docker & Kubernetes)**: Isolated services that scale dynamically via Horizontal Pod Autoscalers (HPA).
* **Automated CI/CD (Jenkins)**: Declarative delivery pipelines with integrated security scanning.
* **Security & Secret Management (HashiCorp Vault)**: Dynamic credentials lease and TLS certificate injection.
* **Observability (Prometheus, Grafana, ELK)**: Real-time alerting and tamper-proof log aggregation.

---

## 3. System Architecture

The QuantumLedger infrastructure is partitioned into regional EKS clusters connected via high-speed database replication channels and DNS global failover endpoints.

### 3.1 Overview
The architectural design emphasizes high availability, zero transaction loss, and regulatory observability. Below are the design specifications:

### 3.2 Low-Fidelity Architecture Sketch
This wireframe illustrates the simplified routing path of transactional request flows from user devices through the load balancer to the application gateway replicas and database instances:

![Low-Fidelity Architecture Sketch](./low_fidelity_architecture.png)

---

### 3.3 High-Fidelity Enterprise Architecture Diagram
This diagram presents the full enterprise-scale deployment topology, illustrating multi-region active-standby redundancy across AWS zones:

![High-Fidelity Enterprise Architecture](./high_fidelity_architecture.png)

---

## 6. Technology Stack

QuantumLedger integrates production-grade open source tools and AWS services. The diagram below illustrates the technology architecture layer integration:

![Technology Stack Architecture](./technology_architecture.png)

### 6.1 Component Breakdown
* **Infrastructure**: AWS (EC2, VPC, EKS, RDS Aurora Global Database, KMS, Route 53), provisioned via **Terraform**.
* **Containerization**: **Docker** for local stacks and multi-stage packaging; **Kubernetes** StatefulSets and Deployments for EKS workloads orchestration.
* **Secrets Management**: **HashiCorp Vault** using AppRole auth, dynamic PostgreSQL engines, PKI certificate generation, and KMS auto-unseal.
* **Monitoring & Alerting**: **Prometheus** metrics scraping and alert rule definitions; **Grafana** visualization dashboards.
* **Logging & Observability**: **ELK Stack** (Elasticsearch, Logstash parsing filters, Filebeat).
* **Application Delivery**: **Nginx** reverse proxies and static file servers hosting a responsive **Vanilla CSS & HTML5** operations dashboard.

---

## 7. Implementation Details

### 7.1 AWS EC2 Deployment
The static operations platform is successfully deployed on a production-grade AWS EC2 instance:
* **Public IP Address**: `http://3.84.104.8`
* **Web Server**: Nginx hosting static assets on Port 80.
* **Access Guide**: Connect via standard web browser to `http://3.84.104.8` to view the live responsive simulator.

