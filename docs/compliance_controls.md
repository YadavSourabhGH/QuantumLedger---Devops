# Security, Compliance, & Secret Management Controls

This document details how the QuantumLedger platform complies with international banking regulations (including SOC2, PCI-DSS, and ISO/IEC 27001) using DevSecOps methodologies and HashiCorp Vault.

## 1. Secret Management Policy (HashiCorp Vault)

To minimize the attack surface, QuantumLedger rejects all static passwords, keys, and environment variables. Secrets are retrieved dynamically at runtime and leased for short durations.

### 1.1 Kubernetes Authentication Setup
Workloads authenticate with Vault using EKS service account tokens. The EKS pod presents its service account JWT to Vault, which validates it against the AWS IAM OpenID Connect (OIDC) provider before issuing a lease token.

```hcl
# Vault Policy: cbdc-api-policy
# Grants read access to dynamic database credentials and signing keys

path "database/creds/cbdc-app-role" {
  capabilities = ["read"]
}

path "pki_int/issue/cbdc-domain" {
  capabilities = ["create", "update"]
}

path "secret/data/jenkins/*" {
  capabilities = ["deny"]
}
```

### 1.2 Database Credential Rotation
Every 60 minutes, Vault rotates the database login credentials for the API gateway. The old credentials are automatically revoked, and new, random credentials are generated on the Aurora PostgreSQL cluster. The Vault Agent sidecar injects these credentials without requiring a container restart.

---

## 2. Audit Trails & Incident Monitoring (ELK Stack)

Compliance guidelines require all monetary operations to be logged in a secure, tamper-proof audit trail.

### 2.1 Audit Trail Ingestion Flow
1. **Filebeat** runs as a DaemonSet on every EKS node, tailing container logs.
2. Filebeat streams lines securely over TLS to **Logstash**.
3. Logstash parses, enriches (resolving container names, IPs, and namespaces), and filters out sensitive customer data.
4. Logs are stored in **Elasticsearch**, which is configured with write-once-read-many (WORM) storage.
5. **Kibana** dashboards allow compliance officers to monitor transaction logs.

### 2.2 Auditing Log Formats
Standard transaction logs contain cryptographic signatures verifying block integrity:
```json
{
  "@timestamp": "2026-06-15T11:45:00.123Z",
  "log_level": "INFO",
  "component": "ConsensusEngine",
  "k8s_pod": "cbdc-ledger-0",
  "tx_signature": "0x8fa90bc72...2ef31",
  "block_height": 9251842,
  "action": "LEDGER_COMMIT",
  "message": "Block committed successfully: hash=0x34a1b8c..."
}
```

---

## 3. Compliance Control Matrix

| Regulatory Requirement | DevOps Implementation | Verification Mechanism |
|---|---|---|
| **Data in Transit Encryption** | Mandatory TLS 1.3 for all gRPC connections between gateways. | Security scan verification via `nmap --ssl` tests in Jenkins. |
| **Data at Rest Encryption** | EKS PVs and Aurora DB volumes encrypted using AWS KMS keys. | Terraform state verification checking encryption flags. |
| **Credential Safety** | Elimination of static passwords; Short-lived dynamic secrets. | Vault Agent sidecar logs asserting successful credential lease renewals. |
| **Separation of Duties** | Multi-account EKS architecture; distinct IAM roles. | AWS IAM credential reports generated daily. |
| **Canary Deployments** | Argo Rollouts performing progressive canary delivery. | Metric monitoring during Jenkins rolling upgrade phases. |
