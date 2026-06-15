# Disaster Recovery & Continuity Plan - Project QuantumLedger

This document defines the Disaster Recovery (DR) policy, business continuity standards, and operational failover runbook for the QuantumLedger CBDC platform.

## 1. Objectives & Metrics

Given the critical nature of multi-national central bank digital currency operations, failure thresholds must conform to the following regulatory metrics:

| Metric | Target | Description |
|---|---|---|
| **Recovery Time Objective (RTO)** | **&lt; 5.0 Seconds** | The maximum allowable duration of service interruption during a full cloud-region failure. |
| **Recovery Point Objective (RPO)** | **Near-Zero (Synchronous)** | The maximum allowable data age/loss. Transacted ledger states must never be lost. |

---

## 2. Replication & Backup Strategy

### 2.1 Database Layer (Aurora Global Database)
- **Active-Standby Replication**: The primary cluster in `us-east-1` acts as the single-writer database. The standby cluster in `us-west-2` acts as a read-replica with asynchronous replication latency under **1 second**.
- **Backup Policy**: Hourly snapshots are automated using AWS Backup, retained for 7 years to comply with financial auditing regulations, and encrypted using KMS keys.

### 2.2 Secrets & Identities Layer (HashiCorp Vault)
- **HA Replication**: Vault runs in Active/Performance Standby mode across regions. Key material is stored and replicated via a shared Raft consensus storage engine, encrypted with regional AWS KMS master keys for auto-unseal.

### 2.3 Ledger State (Kubernetes StatefulSets)
- **Stateful Replication**: StatefulSet pods in `us-east-1` utilize EBS gp3 volume replication and write to local databases. Transacted receipts are written synchronously to the write-ahead-log (WAL) before confirmation.

---

## 3. Runbook: Full Region Failover Execution

In the event of a catastrophic outage affecting `us-east-1`, follow this procedure to restore services in `us-west-2`.

### Step 1: Promote the Secondary Database Cluster
To accept writes in the standby region, promote the Aurora PostgreSQL cluster in `us-west-2` to be a standalone global cluster writer.

```bash
# Verify replication lag before promotion
aws rds describe-db-clusters \
    --db-cluster-identifier quantumledger-db-dr \
    --region us-west-2 \
    --query "DBClusters[0].Status"

# Remove the cluster from the global database to promote it
aws rds remove-from-global-cluster \
    --region us-west-2 \
    --global-cluster-identifier quantumledger-global-db \
    --db-cluster-identifier arn:aws:rds:us-west-2:123456789012:cluster:quantumledger-db-dr
```

### Step 2: Promote Vault Standby Cluster
Promote the Vault secondary cluster to active primary to enable dynamic credential generation.

```bash
# Log in to secondary EKS Cluster
aws eks update-kubeconfig --name quantumledger-dr --region us-west-2

# Promote secondary Vault using API
kubectl exec -it vault-0 -n security -- vault write -f sys/replication/performance/secondary/promote
```

### Step 3: Shift Route 53 Traffic Weights
Update DNS weights to route 100% of global user traffic to the Application Load Balancer in `us-west-2`.

```bash
# Update Route 53 record sets via JSON payload
aws route53 change-resource-record-sets \
    --hosted-zone-id Z12345678QWERTY \
    --change-batch file://dns-failover-change.json
```
*Note: DNS TTL is set to 2 seconds to ensure global propagation is completed within the 5.0-second RTO boundary.*

### Step 4: Verify Deployment and Consensus Consistency
Validate ledger sync state and run a consensus verification check:

```bash
# Probe EKS API gateway health in us-west-2
curl -s http://alb-us-west-2.amazonaws.com/healthz

# Assert ledger blocks synchronization
kubectl exec -it cbdc-ledger-0 -- ledger-cli consensus verify
```
---

## 4. Disaster Recovery Testing Schedule
- **Stress-Test Simulations**: Automated region outages must be executed **bi-annually** in a staging sandbox.
- **Auditing**: Log audits and reconciliation verification reports must be submitted to financial regulators within 24 hours of each simulation.
