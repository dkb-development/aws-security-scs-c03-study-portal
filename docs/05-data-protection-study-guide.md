# AWS Security Specialty SCS-C03 Data Protection Study Guide

Beginner links for this topic:

- [KMS](00-aws-security-foundations-for-beginners.md#kms), [KMS Key Policy](00-aws-security-foundations-for-beginners.md#kms-key-policy), [KMS Grant](00-aws-security-foundations-for-beginners.md#kms-grant), [Envelope Encryption](00-aws-security-foundations-for-beginners.md#envelope-encryption), [Multi-Region KMS Key](00-aws-security-foundations-for-beginners.md#multi-region-kms-key)
- [Imported Key Material](00-aws-security-foundations-for-beginners.md#imported-key-material), [CloudHSM and Custom Key Store](00-aws-security-foundations-for-beginners.md#cloudhsm-and-custom-key-store)
- [S3 Encryption](00-aws-security-foundations-for-beginners.md#s3-encryption), [S3 Bucket Policy](00-aws-security-foundations-for-beginners.md#s3-bucket-policy), [S3 Block Public Access](00-aws-security-foundations-for-beginners.md#s3-block-public-access), [S3 Object Lock](00-aws-security-foundations-for-beginners.md#s3-object-lock)
- [Macie](00-aws-security-foundations-for-beginners.md#macie), [Secrets Manager](00-aws-security-foundations-for-beginners.md#secrets-manager), [Parameter Store](00-aws-security-foundations-for-beginners.md#parameter-store), [ACM](00-aws-security-foundations-for-beginners.md#acm), [AWS Private CA](00-aws-security-foundations-for-beginners.md#aws-private-ca), [TLS and mTLS](00-aws-security-foundations-for-beginners.md#tls-and-mtls), [AWS Backup](00-aws-security-foundations-for-beginners.md#aws-backup)
- [KMS Condition Keys](00-aws-security-foundations-for-beginners.md#kms-condition-keys-kmsviaservice-and-kmsgrantisforawsresource), [S3 Bucket Keys](00-aws-security-foundations-for-beginners.md#s3-bucket-keys), [CloudWatch Logs Data Protection](00-aws-security-foundations-for-beginners.md#cloudwatch-logs-data-protection), [SNS Message Data Protection](00-aws-security-foundations-for-beginners.md#sns-message-data-protection), [CloudFront Field-Level Encryption](00-aws-security-foundations-for-beginners.md#cloudfront-field-level-encryption), [Data in Transit and SageMaker](00-aws-security-foundations-for-beginners.md#data-in-transit-nitro-emr-eks-and-sagemaker), [Data Lifecycle Manager](00-aws-security-foundations-for-beginners.md#amazon-data-lifecycle-manager), [S3 Access Grants](00-aws-security-foundations-for-beginners.md#s3-access-grants), [Glacier Vault Lock](00-aws-security-foundations-for-beginners.md#s3-glacier-vault-lock)

Generated: 2026-10-06

This guide is exam-focused. It is based on the question bank and topic signals collected in this workspace, official AWS documentation, and original synthesis. It does not contain copied real exam questions, paid course content, or dumps.

Use it as a reverse-engineered study path: learn the data-protection patterns that appear repeatedly, then practice the related questions in the portal.

---

## 0. AWS Component Primer: What Each Service Does First

This section explains the AWS components in simple words before going into exam decision rules.

Official references used for service meaning:

- SCS-C03 Data Protection domain: https://docs.aws.amazon.com/aws-certification/latest/security-specialty-03/security-specialty-03-domain5.html
- AWS KMS overview: https://docs.aws.amazon.com/kms/latest/developerguide/overview.html
- KMS key policies: https://docs.aws.amazon.com/kms/latest/developerguide/key-policies.html
- KMS grants: https://docs.aws.amazon.com/kms/latest/developerguide/grants.html
- KMS multi-Region keys: https://docs.aws.amazon.com/kms/latest/developerguide/multi-region-keys-overview.html
- KMS imported key material: https://docs.aws.amazon.com/kms/latest/developerguide/importing-keys.html
- KMS condition keys: https://docs.aws.amazon.com/kms/latest/developerguide/conditions-kms.html
- AWS CloudHSM: https://docs.aws.amazon.com/cloudhsm/latest/userguide/introduction.html
- S3 SSE-S3 default encryption: https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingServerSideEncryption.html
- S3 SSE-KMS: https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html
- S3 Object Lock: https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html
- Amazon Macie: https://docs.aws.amazon.com/macie/latest/user/what-is-macie.html
- AWS Secrets Manager: https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html
- Systems Manager Parameter Store: https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html
- AWS Private CA: https://docs.aws.amazon.com/privateca/latest/userguide/PcaWelcome.html
- AWS Certificate Manager: https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html
- CloudWatch Logs data protection: https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/mask-sensitive-log-data.html
- SNS message data protection: https://docs.aws.amazon.com/sns/latest/dg/message-data-protection.html
- CloudFront field-level encryption: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/field-level-encryption.html
- EMR encryption options: https://docs.aws.amazon.com/emr/latest/ManagementGuide/emr-data-encryption-options.html
- AWS Backup: https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html
- Amazon Data Lifecycle Manager: https://docs.aws.amazon.com/ebs/latest/userguide/snapshot-lifecycle.html
- RDS SSL/TLS: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html

I am using text diagrams instead of screenshots because AWS console screens change often. Text diagrams are searchable, easy to revise, and work offline.

---

### 0.1 Data Protection In AWS: What It Means

Data Protection means keeping sensitive data safe while it is stored, moving, backed up, replicated, logged, or used by applications.

Plain English:

> Data Protection is about encryption, keys, secrets, certificates, sensitive-data discovery, masking, retention, and recovery.

Real-world example:

A payment application stores data in S3 and RDS, sends notifications through SNS, logs to CloudWatch Logs, and uses database credentials. The data-protection design must answer:

- How is data encrypted at rest?
- How are TLS connections enforced?
- Who can use the KMS key?
- How are secrets rotated?
- How are sensitive values found and masked?
- How are records retained immutably?
- How are backups protected from deletion?

Simple flow:

```text
Data created
   |
   +--> Encrypt in transit
   |
   +--> Encrypt at rest
   |
   +--> Protect keys and secrets
   |
   +--> Discover sensitive data
   |
   +--> Mask or redact where needed
   |
   +--> Retain, replicate, and back up safely
```

Exam angle:

Data Protection questions usually test:

- KMS key policy vs IAM policy
- KMS grants and service use
- imported key material vs AWS-generated key material
- multi-Region keys
- CloudHSM vs KMS
- S3 SSE-S3 vs SSE-KMS vs client-side encryption
- Object Lock and backup immutability
- Secrets Manager vs Parameter Store
- certificate and TLS choices
- sensitive-data discovery and masking

---

### 0.2 AWS KMS: Managed Key Service

AWS KMS is a managed service for creating and controlling cryptographic keys.

Plain English:

> KMS protects the keys that protect your data.

Real-world example:

An S3 bucket stores financial records. You encrypt objects with a customer managed KMS key so you can control key policy, rotation, auditing, and cross-account access.

Simple flow:

```text
Application or AWS service
      |
      v
Requests data key or decrypt operation
      |
      v
AWS KMS key
      |
      v
Encrypt/decrypt data key
      |
      v
Data encrypted by data key
```

Exam angle:

Choose KMS when:

- AWS managed key control
- customer managed key
- key policy and audit control
- SSE-KMS
- envelope encryption
- grants
- key rotation
- cross-account encrypted data access

Trap:

KMS is not used to encrypt large objects directly in the normal pattern. KMS protects data keys. Data keys encrypt the data.

---

### 0.3 KMS Key Policy: Required Authorization Layer

A KMS key policy controls access to a KMS key.

Plain English:

> A KMS key policy is the front door for the key. IAM permission alone might not be enough.

Real-world example:

A role has `kms:Decrypt` in IAM. The KMS key policy does not allow the role or the account to use IAM policies for the key.

Result:

```text
Decrypt is denied.
```

Simple flow:

```text
Caller has IAM allow?
      |
      v
KMS key policy allows this path?
      |
      +-- no -> Deny
      |
      +-- yes -> Continue evaluation
```

Exam angle:

If a question says:

```text
IAM policy allows KMS action, but key policy does not
```

Think:

```text
Denied unless key policy enables that access path.
```

Trap:

The account root user or key creator does not automatically have unlimited KMS key access unless the key policy allows it.

---

### 0.4 KMS Grants: Temporary Or Service-Mediated Key Use

A KMS grant gives allow-only permissions to use a KMS key.

Plain English:

> A grant is a temporary permission slip for a KMS key.

Real-world example:

EBS needs to use your customer managed KMS key for an encrypted volume. The AWS service may create a grant so it can use the key on behalf of the principal.

Simple flow:

```text
Principal creates encrypted AWS resource
      |
      v
AWS service needs KMS key access
      |
      v
KMS grant allows service use
      |
      v
Service encrypts/decrypts data keys
```

Exam angle:

Choose KMS grants when:

- AWS service needs temporary permission to use a KMS key
- service integrates with KMS
- `kms:CreateGrant` appears
- `kms:GrantIsForAWSResource` appears
- delegated use without editing key policy each time

Trap:

Grants can allow, not deny. Deny logic comes from policies.

---

### 0.5 kms:ViaService And kms:GrantIsForAWSResource

These are KMS condition keys that often appear in tricky questions.

Plain English:

> `kms:ViaService` limits key use to requests that come through a specific AWS service. `kms:GrantIsForAWSResource` limits grant creation to AWS services acting on behalf of a principal.

Example `kms:ViaService` idea:

```json
{
  "Effect": "Allow",
  "Action": [
    "kms:Encrypt",
    "kms:Decrypt",
    "kms:GenerateDataKey*"
  ],
  "Resource": "*",
  "Condition": {
    "StringEquals": {
      "kms:ViaService": "s3.us-east-1.amazonaws.com"
    }
  }
}
```

Example `kms:GrantIsForAWSResource` idea:

```json
{
  "Effect": "Allow",
  "Action": "kms:CreateGrant",
  "Resource": "*",
  "Condition": {
    "Bool": {
      "kms:GrantIsForAWSResource": true
    }
  }
}
```

Exam angle:

Use `kms:ViaService` when:

- key should be used only through S3, EBS, RDS, etc.
- direct KMS API calls should not be allowed
- service-mediated KMS use matters

Use `kms:GrantIsForAWSResource` when:

- AWS service creates grants on behalf of the principal
- direct grant creation should be limited

Trap:

`kms:ViaService` is not the same as an S3 bucket policy. It limits KMS key use path.

---

### 0.6 Envelope Encryption

Envelope encryption uses a data key to encrypt data, and a KMS key to protect the data key.

Plain English:

> Encrypt the big data with a small data key. Encrypt the data key with KMS.

Simple flow:

```text
KMS key
  |
  v
GenerateDataKey
  |
  +--> plaintext data key -> encrypt large data locally -> discard plaintext key
  |
  +--> encrypted data key -> store with encrypted data
```

Decrypt flow:

```text
Encrypted data + encrypted data key
      |
      v
KMS Decrypt encrypted data key
      |
      v
Plaintext data key
      |
      v
Decrypt data locally
```

Exam angle:

Choose envelope encryption when:

- large object or application-side encryption
- efficient encryption with KMS-backed key control
- AWS Encryption SDK style pattern

Trap:

KMS has request-size limits and is not the right tool to encrypt a multi-GB file directly.

---

### 0.7 Multi-Region KMS Keys

Multi-Region keys are related KMS keys in different Regions with the same key ID and key material.

Plain English:

> Multi-Region keys let you encrypt in one Region and decrypt in another without a cross-Region KMS call.

Real-world example:

A disaster recovery application encrypts data in `us-east-1` and must decrypt in `us-west-2` if the primary Region is unavailable.

Simple flow:

```text
Primary multi-Region key in Region A
      |
      v
Replica multi-Region key in Region B
      |
      v
Same key ID and key material
```

Exam angle:

Choose multi-Region KMS keys when:

- client-side encryption across Regions
- disaster recovery
- active-active multi-Region crypto use
- avoid cross-Region KMS calls

Important details:

- You cannot convert an existing single-Region key into a multi-Region key.
- AWS managed keys are single-Region.
- Multi-Region keys are not global; each key is a Regional KMS key.
- Replica keys have independent key policies, grants, aliases, and tags.

Trap:

For many AWS services, replication still decrypts and re-encrypts in the destination Region. Read the service-specific wording.

---

### 0.8 Imported Key Material

Imported key material means you supply the key material for a KMS key.

Plain English:

> BYOK: you bring the key material, and KMS uses a copy.

Real-world example:

A company must prove key material was generated in its own environment, then imported into KMS for use with AWS services.

Exam angle:

Choose imported key material when:

- customer must generate key material
- customer owns original key material outside AWS
- expiration/reimport requirements exist
- BYOK wording appears

Important details:

- You are responsible for retaining original key material.
- If imported key material expires or is deleted, ciphertext can become unusable until matching material is reimported.
- Imported key material rotation is more manual than AWS-generated key material.
- For multi-Region keys with imported material, key material must be imported into each replica.

Trap:

Even with imported symmetric key material, AWS KMS ciphertext is decrypted through AWS KMS. Do not assume you can decrypt AWS KMS ciphertext outside KMS.

---

### 0.9 CloudHSM And Custom Key Stores

CloudHSM provides dedicated HSMs that you control.

Plain English:

> CloudHSM is for when managed KMS is not enough and you need direct HSM control.

Real-world example:

A regulated workload requires dedicated, single-tenant HSMs and direct control over users, keys, algorithms, and cryptographic operations.

Simple flow:

```text
Application
   |
   v
CloudHSM client
   |
   v
Customer-controlled HSM cluster
```

Exam angle:

Choose CloudHSM when:

- dedicated HSMs
- customer controls HSM users and keys
- direct PKCS#11/JCE/CNG/KSP integration
- FIPS 140 Level 3 hardware requirement with customer control

Choose KMS when:

- managed key service is enough
- AWS service integration matters
- key policy/grants/audit/rotation with less operational overhead

Trap:

CloudHSM gives more control and more responsibility. KMS is usually the simpler managed answer unless the requirement clearly points to HSM control.

---

### 0.10 S3 Encryption: SSE-S3, SSE-KMS, DSSE-KMS, Client-Side

S3 encrypts new uploads by default with SSE-S3.

Plain English:

> S3 already encrypts new objects by default, but you may need SSE-KMS or client-side encryption for stronger control.

Comparison:

| Encryption type | Meaning | Choose when |
|---|---|---|
| SSE-S3 | S3 managed keys | Basic server-side encryption, lowest ops |
| SSE-KMS | KMS keys | Audit/control key policy, cross-account customer managed key |
| DSSE-KMS | Dual-layer server-side encryption with KMS | Extra compliance layer where required |
| SSE-C | Customer-provided key per request | Rare; you manage key outside AWS and send it with requests |
| Client-side encryption | App encrypts before upload | App must control encryption before S3 sees plaintext |

Exam angle:

Choose SSE-KMS when:

- customer managed KMS key
- CloudTrail audit of KMS use
- fine-grained key policy
- cross-account KMS access
- bucket policy must require specific key

Trap:

Default bucket encryption does not retroactively change existing objects. Use copy or S3 Batch Operations to re-encrypt existing objects.

---

### 0.11 S3 Bucket Keys

S3 Bucket Keys reduce SSE-KMS request cost.

Plain English:

> Bucket Keys reduce how often S3 calls KMS for object encryption.

Simple flow:

```text
KMS key
  |
  v
Bucket-level key
  |
  v
Object-level data keys
```

Exam angle:

Choose S3 Bucket Keys when:

- many SSE-KMS objects
- reduce KMS request costs
- reduce KMS request volume from S3

Trap:

S3 Bucket Keys are a cost/scale optimization. They are not a replacement for KMS permissions.

---

### 0.12 S3 Object Lock

S3 Object Lock prevents object versions from being deleted or overwritten for a retention period or legal hold.

Plain English:

> Object Lock is WORM-style protection for S3 object versions.

Real-world example:

Financial records must be immutable for seven years.

Modes:

| Mode | Meaning |
|---|---|
| Governance | privileged users with bypass permission can override |
| Compliance | protected versions cannot be overwritten or deleted until retention expires, even by root |

Simple flow:

```text
Object version
  |
  v
Retention period / legal hold
  |
  v
Delete or overwrite blocked
```

Exam angle:

Choose Object Lock when:

- WORM retention
- immutable S3 records
- legal hold
- prevent deletion or overwrite
- compliance retention

Trap:

Versioning matters. Object Lock protects object versions.

---

### 0.13 Amazon Macie

Macie discovers and classifies sensitive data in S3.

Plain English:

> Macie finds sensitive data, such as PII or credentials, in S3 buckets.

Real-world example:

The security team needs to find S3 objects containing national ID numbers, credit card numbers, or custom employee IDs.

Simple flow:

```text
S3 buckets
   |
   v
Macie discovery/classification job
   |
   +--> managed data identifiers
   +--> custom data identifiers
   |
   v
Findings
```

Exam angle:

Choose Macie when:

- sensitive-data discovery in S3
- PII/PHI/credentials in S3
- custom data identifiers
- classification findings

Trap:

Macie does not encrypt data, patch workloads, or inspect network packets. It discovers sensitive data in S3.

---

### 0.14 Secrets Manager

Secrets Manager stores, retrieves, and rotates secrets.

Plain English:

> Secrets Manager is where you put credentials that should not be hardcoded.

Real-world example:

An application needs an RDS password. Instead of putting it in code or an environment file, store it in Secrets Manager and retrieve it at runtime.

Simple flow:

```text
Application
   |
   v
GetSecretValue
   |
   v
Secrets Manager
   |
   v
Secret encrypted with KMS
```

Rotation flow:

```text
Rotation schedule
      |
      v
Lambda rotation function
      |
      +--> create new credential
      +--> test new credential
      +--> mark new version current
      +--> retire old credential
```

Exam angle:

Choose Secrets Manager when:

- database credentials
- API keys/OAuth tokens
- automatic secret rotation
- native database rotation workflows
- cross-Region secret replication
- fine-grained audit of secret retrieval

Trap:

Secrets Manager is not for encryption keys. Use KMS for encryption keys.

---

### 0.15 Parameter Store

Parameter Store stores configuration values and SecureString parameters.

Plain English:

> Parameter Store is for configuration values; Secrets Manager is stronger for secrets that need rotation.

Real-world example:

Store an approved AMI ID, environment name, endpoint URL, or small SecureString value.

Comparison:

| Requirement | Choose |
|---|---|
| Static app config | Parameter Store |
| Approved AMI ID | Parameter Store |
| Database credential with native rotation | Secrets Manager |
| API key with rotation and audit | Secrets Manager |
| Feature flags and deployment validation | AppConfig |

Exam angle:

Choose Parameter Store when:

- hierarchical configuration
- low-cost config values
- SecureString for encrypted configuration
- reference AMI IDs or settings

Trap:

Parameter Store SecureString can encrypt values, but Secrets Manager is the purpose-built choice for secret lifecycle and automatic rotation.

---

### 0.16 ACM And AWS Private CA

ACM manages TLS certificates. AWS Private CA creates private certificate authorities.

Plain English:

> ACM manages certificates for AWS services. Private CA lets you issue private certificates for internal trust.

Real-world examples:

- Use ACM public certificates for CloudFront or ALB TLS.
- Use AWS Private CA for internal mTLS between services.
- Use private certificates for internal APIs, devices, or workloads.

Simple flow:

```text
Private CA
   |
   v
Issues private certificate
   |
   v
Internal service uses certificate for TLS/mTLS
```

Exam angle:

Choose ACM when:

- manage public/private TLS certificates for integrated AWS services
- ALB/CloudFront/API Gateway certificate association

Choose AWS Private CA when:

- private PKI
- internal certificates
- mTLS between services
- issue X.509 certificates for internal workloads

Trap:

ACM public certificates cannot be directly installed on EC2 instances. For EC2-hosted software, use imported/private certificates or your own certificate management pattern.

---

### 0.17 CloudWatch Logs Data Protection

CloudWatch Logs data protection policies detect and mask sensitive data in log events.

Plain English:

> CloudWatch Logs data protection hides sensitive values in logs from normal viewers.

Real-world example:

Application logs contain credit card numbers or AWS secret access keys. Viewers should see masked values, and security should get findings.

Simple flow:

```text
Log event ingested
      |
      v
Data protection policy
      |
      +--> audit sensitive match
      +--> mask at egress
      |
      v
Only logs:Unmask users can view raw value
```

Exam angle:

Choose CloudWatch Logs data protection when:

- sensitive data in CloudWatch Logs
- mask PII/credentials in log views
- audit findings from logs
- `logs:Unmask` permission matters

Trap:

Masking applies to events ingested after the data protection policy is set. It does not clean up older log events retroactively.

---

### 0.18 SNS Message Data Protection

SNS message data protection can audit, mask, redact, or block sensitive information in SNS messages.

Plain English:

> SNS message data protection protects sensitive data moving through SNS topics.

Important current-doc note:

AWS documentation currently says SNS message data protection is no longer available to new customers. For exam prep, recognize it because it appears in SCS-C03 topic signals, but be cautious in new-design reasoning.

Exam angle:

Recognize SNS message data protection when:

- sensitive data in SNS standard topic messages
- audit/de-identify/deny sensitive data in messages
- older practice question wording explicitly names SNS data protection

Trap:

For a current new design, prefer services/features that are available to new customers unless the exam question specifically asks about SNS message data protection.

---

### 0.19 CloudFront Field-Level Encryption

CloudFront field-level encryption encrypts selected fields in HTTPS POST requests at the edge.

Plain English:

> CloudFront can encrypt only selected sensitive form fields before they reach the origin.

Real-world example:

A payment form sends `CreditCardNumber`. Only the payment-processing component should decrypt that field. Other backend services should see it encrypted.

Simple flow:

```text
User POST request
      |
      v
CloudFront edge encrypts selected fields with public key
      |
      v
Origin receives encrypted sensitive fields
      |
      v
Only holder of private key decrypts
```

Exam angle:

Choose CloudFront field-level encryption when:

- selected POST fields
- encrypt at edge
- protect sensitive fields through app stack
- only certain backend components can decrypt

Trap:

Field-level encryption is not for encrypting every part of every request. It applies to configured fields.

---

### 0.20 Data In Transit: TLS, mTLS, Nitro, EMR, EKS

Data in transit is data moving over a network.

Plain English:

> Data in transit protection usually means TLS, mTLS, private connectivity, or service-specific inter-node encryption.

Examples:

- RDS/Aurora client uses TLS and validates the CA bundle.
- API Gateway custom domain requires mTLS with a truststore.
- EMR security configuration enables in-transit encryption.
- Nitro-based EC2 instances can have in-transit encryption between supported instances.
- Internal services use private certificates from AWS Private CA.

Exam angle:

Choose TLS/mTLS/private certificates when:

- client/server connection encryption
- client certificate authentication
- internal service-to-service encryption
- private PKI

Choose service-specific setting when:

- EMR inter-node encryption
- EKS control plane or workload encryption pattern
- RDS SSL/TLS enforcement
- Nitro inter-instance encryption wording

Trap:

Security group rules do not encrypt data. They control reachability.

---

### 0.21 AWS Backup And Backup Vault Lock

AWS Backup centralizes backup policies across services. Backup Vault Lock helps protect backups with WORM controls.

Plain English:

> AWS Backup handles backup plans. Backup Vault Lock helps stop backups from being deleted or retention from being shortened.

Real-world example:

A company wants ransomware-resistant backups copied to another account and Region, with retention protected from administrators.

Simple flow:

```text
Protected resources
      |
      v
AWS Backup plan
      |
      v
Backup vault
      |
      +--> encryption
      +--> vault access policy
      +--> Vault Lock
      +--> cross-account/cross-Region copy
```

Exam angle:

Choose AWS Backup when:

- centralized backup management
- backup plans
- cross-account backup
- cross-Region backup
- backup audit
- ransomware protection

Choose Backup Vault Lock when:

- prevent backup deletion
- prevent retention changes
- WORM backup protection

Trap:

AWS Backup does not govern backups created outside AWS Backup.

---

### 0.22 Amazon Data Lifecycle Manager

Amazon Data Lifecycle Manager automates EBS snapshots and EBS-backed AMIs.

Plain English:

> Data Lifecycle Manager is for scheduled EBS snapshot and AMI lifecycle automation.

Real-world example:

Create daily EBS snapshots, retain them for 30 days, then delete old snapshots.

Simple flow:

```text
Tagged EBS volume
      |
      v
DLM lifecycle policy
      |
      v
Create snapshot on schedule
      |
      v
Retain / copy / delete based on policy
```

Exam angle:

Choose Data Lifecycle Manager when:

- EBS snapshot lifecycle
- EBS-backed AMI lifecycle
- automate create/retain/delete
- no need for broad multi-service backup management

Trap:

Data Lifecycle Manager cannot manage snapshots or AMIs created by other means.

---

### 0.23 Quick Component Map

| Need | Best-fit service or feature |
|---|---|
| Managed encryption keys | AWS KMS |
| KMS required access layer | KMS key policy |
| Temporary/service KMS permissions | KMS grants |
| Restrict key to service path | `kms:ViaService` |
| AWS service grant only | `kms:GrantIsForAWSResource` |
| Customer-generated KMS key material | Imported key material |
| Dedicated customer-controlled HSM | CloudHSM |
| Same key material across Regions | KMS multi-Region key |
| Encrypt large data efficiently | Envelope encryption |
| S3 basic default encryption | SSE-S3 |
| S3 encryption with key audit/control | SSE-KMS |
| S3 immutable records | Object Lock |
| S3 sensitive data discovery | Macie |
| Secret with native rotation | Secrets Manager |
| Static config value | Parameter Store |
| Internal private certificates | AWS Private CA |
| AWS-integrated TLS certificates | ACM |
| Mask sensitive CloudWatch logs | CloudWatch Logs data protection |
| Selected POST field encryption at edge | CloudFront field-level encryption |
| Central backup policy | AWS Backup |
| Immutable backup vault | Backup Vault Lock |
| EBS snapshot lifecycle | Amazon Data Lifecycle Manager |

---

## 1. What This Domain Means In The Exam

Data Protection is 18% of scored SCS-C03 content.

Official SCS-C03 task groups:

| Official task | Meaning in simple words |
|---|---|
| Task 5.1: Data in transit | TLS, private connectivity, inter-resource encryption, mTLS, service-specific transit encryption. |
| Task 5.2: Data at rest | KMS, CloudHSM, S3 encryption, Object Lock, lifecycle, backup, replication. |
| Task 5.3: Confidential data, secrets, and key material | Secrets Manager, key rotation, imported key material, masking, certificates, multi-Region keys. |

Local question-bank signal:

| Data Protection cluster | Local question count |
|---|---:|
| Secrets and key material | 228 |
| S3 and KMS controls | 51 |
| Data at rest | 23 |
| Data in transit | 17 |
| Total | 319 |

What this tells us:

- KMS and key material are the core of this topic.
- Secrets Manager and certificate questions repeat.
- S3 encryption, Object Lock, and Macie are high-value.
- Data in transit has fewer questions, but the official guide explicitly calls out TLS and inter-resource encryption.
- Backup and retention appear as supporting patterns.

---

## 2. The Core Mental Model

Use this model:

```text
Classify:
  What kind of data is it?

Encrypt:
  At rest and in transit

Control keys:
  Key policy, IAM, grants, rotation, imported material, CloudHSM

Protect secrets:
  Store, retrieve, rotate, audit

Find sensitive data:
  Macie, CloudWatch Logs data protection

Retain and recover:
  Object Lock, AWS Backup, Vault Lock, DLM, replication
```

Short version:

```text
Know the data -> encrypt it -> guard the key -> rotate secrets -> mask leaks -> lock backups
```

---

## 3. High-Return Topics From The Question Signals

| Priority | Topic | Why it matters | Exam action |
|---|---|---|---|
| Very high | KMS key policy vs IAM | Most repeated data-protection trap | Key policy is required for KMS access path |
| Very high | Cross-account SSE-KMS access | Common S3/KMS scenario | Need S3 access and KMS key policy/IAM permissions |
| Very high | KMS grants | AWS service-mediated use | Recognize `kms:CreateGrant` and `kms:GrantIsForAWSResource` |
| Very high | Imported vs AWS-generated key material | Explicit SCS-C03 topic | Customer manages imported material retention/reimport/rotation |
| High | Multi-Region KMS keys | DR/global encryption pattern | Same key ID/material; independent policies/grants |
| High | Secrets Manager rotation | Repeated credential lifecycle scenario | Lambda rotation function or managed rotation |
| High | S3 Object Lock | WORM/immutability | Governance vs compliance mode |
| High | S3 SSE-KMS enforcement | Bucket policy denies bad uploads | Enforce encryption headers and key ID |
| High | CloudHSM vs KMS | Dedicated HSM control | Choose CloudHSM only when control/FIPS HSM requirement is clear |
| High | Macie | Sensitive data in S3 | Discovery/classification/custom identifiers |
| Medium-high | Private CA and mTLS | Internal certificate trust | Use AWS Private CA for private certificates |
| Medium-high | CloudWatch Logs data protection | Mask logs | Protect PII/credentials in log events |
| Medium | Field-level encryption | Edge encryption for selected form fields | CloudFront encrypts specific POST fields |
| Medium | Backup immutability | Ransomware/retention | AWS Backup Vault Lock or S3 Object Lock |
| Medium | Data in transit | Official SCS-C03 skill | TLS/mTLS/service-specific encryption |

---

## 4. Scenario 1: KMS Key Policy vs IAM Policy

This is the most important Data Protection scenario.

### What The Question Usually Says

```text
An IAM policy allows kms:Decrypt.
The KMS key policy does not allow the principal or account to use IAM policies.
What happens?
```

### Correct Answer

```text
Denied.
```

### Why

KMS key policy is a required authorization layer. IAM permission alone does not help unless the key policy enables that path.

### Diagram

```text
IAM policy allows kms:Decrypt
      |
      v
Key policy allows use?
      |
      +-- no -> Deny
      |
      +-- yes -> Allowed if no other deny
```

### Memory Rule

```text
For KMS, do not stop at IAM.
Always ask: what does the key policy say?
```

---

## 5. Scenario 2: Cross-Account SSE-KMS S3 Access

### What The Question Usually Says

```text
Account A must read objects from Account B's S3 bucket.
Objects are encrypted with a customer managed KMS key in Account B.
```

### Required Layers

```text
S3 bucket/object access:
  Account B bucket policy or object policy allows Account A principal
  Account A IAM policy allows S3 action

KMS key access:
  Account B KMS key policy allows Account A principal/account
  Account A IAM policy allows kms:Decrypt
```

### Diagram

```text
Account A principal
      |
      +--> s3:GetObject allowed by IAM and bucket policy?
      |
      +--> kms:Decrypt allowed by IAM and key policy?
      |
      v
Read succeeds only if both paths work
```

### Exam Trap

S3 access alone is not enough for SSE-KMS objects. KMS authorization is also required.

Another trap:

AWS managed key `aws/s3` is not the right answer for cross-account sharing. Use a customer managed key when cross-account KMS access is required.

---

## 6. Scenario 3: Enforcing S3 Encryption

### What The Question Usually Says

```text
Bucket has default SSE-KMS encryption.
Company must reject uploads unless callers explicitly request the approved KMS key.
```

### Best Pattern

Use a bucket policy explicit deny based on encryption headers and KMS key ID.

Example shape:

```json
{
  "Effect": "Deny",
  "Principal": "*",
  "Action": "s3:PutObject",
  "Resource": "arn:aws:s3:::example-bucket/*",
  "Condition": {
    "StringNotEquals": {
      "s3:x-amz-server-side-encryption": "aws:kms"
    }
  }
}
```

And require the expected key:

```json
{
  "Effect": "Deny",
  "Principal": "*",
  "Action": "s3:PutObject",
  "Resource": "arn:aws:s3:::example-bucket/*",
  "Condition": {
    "StringNotEquals": {
      "s3:x-amz-server-side-encryption-aws-kms-key-id": "arn:aws:kms:us-east-1:111122223333:key/1234abcd"
    }
  }
}
```

### Exam Trap

Default encryption encrypts uploads by default, but if the requirement says "reject uploads that do not explicitly request the approved key," you need a bucket policy deny.

---

## 7. Scenario 4: KMS Grants For AWS Services

### What The Question Usually Says

```text
An AWS service needs permission to use a customer managed KMS key on behalf of a principal.
```

### Best Concept

```text
KMS grant
```

### Common Conditions

```text
kms:CreateGrant
kms:GrantIsForAWSResource
kms:GrantOperations
kms:GranteePrincipal
kms:ViaService
```

### Exam Trap

Grant creation is powerful. When allowing `kms:CreateGrant`, constrain it where possible, especially for AWS service use.

---

## 8. Scenario 5: Imported Key Material vs AWS-Generated Key Material

### AWS-Generated Key Material

Best for:

- least operational burden
- automatic or on-demand rotation
- fully managed KMS lifecycle

### Imported Key Material

Best for:

- BYOK requirement
- prove entropy/source of key material
- keep original key material outside AWS
- expiration and reimport control

### Comparison

| Feature | AWS-generated key material | Imported key material |
|---|---|---|
| Who generates material | AWS KMS | Customer |
| Automatic rotation | Supported for eligible keys | More manual/customer-managed |
| Customer must retain original | No | Yes |
| Can expire material | No typical imported-expiration pattern | Yes |
| Reimport responsibility | No | Customer |

### Exam Trap

If imported material is deleted or expires, encrypted data can become unusable until the same key material is reimported.

---

## 9. Scenario 6: Multi-Region KMS Keys

### What The Question Usually Says

```text
Data encrypted in one Region must be decrypted in another Region without a cross-Region KMS call.
```

### Best Answer

```text
KMS multi-Region key
```

### Key Details

```text
Same:
  key ID
  key material

Independent per Region:
  key policy
  grants
  aliases
  tags
  enabled/disabled state
```

### Diagram

```text
Region A primary key
      |
      v
Region B replica key
      |
      v
Decrypt ciphertext encrypted by related key
```

### Exam Trap

Replica keys have independent key policies. Do not assume permissions replicate automatically.

---

## 10. Scenario 7: CloudHSM vs KMS

### Decision Table

| Requirement | Choose |
|---|---|
| Managed key service integrated with AWS services | KMS |
| Customer managed key policy, audit, rotation | KMS customer managed key |
| Dedicated single-tenant HSM control | CloudHSM |
| Direct PKCS#11/JCE/CNG/KSP integration | CloudHSM |
| Customer controls HSM users and key extraction rules | CloudHSM |
| KMS interface backed by CloudHSM cluster | KMS custom key store |

### Exam Trap

CloudHSM is not the default answer just because "high security" appears. Choose it when the question clearly requires dedicated HSM control or direct HSM integration.

---

## 11. Scenario 8: Secrets Manager Rotation

### What The Question Usually Says

```text
Database password must rotate automatically.
Application should not store credentials in code.
Custom rotation steps are needed.
```

### Best Answer

```text
AWS Secrets Manager with Lambda rotation function.
```

### Rotation Diagram

```text
Secret version AWSCURRENT
      |
      v
Rotation schedule
      |
      v
Lambda rotation function
      |
      +--> create pending credential
      +--> set credential in database
      +--> test credential
      +--> mark AWSPENDING as AWSCURRENT
```

### Secrets Manager vs Parameter Store

| Requirement | Choose |
|---|---|
| Native credential rotation | Secrets Manager |
| Database password lifecycle | Secrets Manager |
| API token lifecycle | Secrets Manager |
| Static config value | Parameter Store |
| Approved AMI ID | Parameter Store |

### Exam Trap

Parameter Store SecureString encrypts a value, but it does not provide the same native secret rotation lifecycle as Secrets Manager.

---

## 12. Scenario 9: S3 Object Lock

### What The Question Usually Says

```text
Records must not be deleted or overwritten for seven years.
Even privileged users must not shorten retention.
```

### Best Answer

```text
S3 Object Lock compliance mode.
```

### Governance vs Compliance

| Mode | Who can bypass? |
|---|---|
| Governance | Users with special bypass permission |
| Compliance | Nobody during retention, including root |

### Exam Trap

If the phrase is "even root cannot shorten retention," choose compliance mode.

---

## 13. Scenario 10: Macie Sensitive Data Discovery

### What The Question Usually Says

```text
Find national IDs, credit card numbers, credentials, or custom sensitive patterns in S3.
```

### Best Answer

```text
Amazon Macie
```

### Custom Pattern Example

```text
Employee ID format:
  EMP-[0-9]{6}

Use:
  Macie custom data identifier
```

### Exam Trap

Macie finds/classifies sensitive S3 data. It does not automatically encrypt or delete the object unless you build remediation around findings.

---

## 14. Scenario 11: Data Masking In Logs And Messages

### CloudWatch Logs

Use CloudWatch Logs data protection when:

- sensitive data appears in log events
- mask at egress
- audit findings
- `logs:Unmask` controls raw value access

### SNS

SNS message data protection is a recognized feature for:

- audit
- de-identify
- deny/block
- sensitive data in standard topic messages

Current-doc caution:

```text
SNS message data protection is no longer available to new customers.
```

### Exam Trap

If the question explicitly says CloudWatch Logs, choose CloudWatch Logs data protection. If it explicitly says SNS message data protection in a feature-recognition way, recognize the feature but remember the current availability caveat.

---

## 15. Scenario 12: Certificates And mTLS

### What The Question Usually Says

```text
Internal services need private certificates for mutual TLS.
```

### Best Answer

```text
AWS Private CA
```

### Flow

```text
Private CA
   |
   v
Issue service certificate
   |
   v
Service presents certificate
   |
   v
Peer validates certificate chain
```

### ACM vs Private CA

| Requirement | Choose |
|---|---|
| Public TLS cert for ALB/CloudFront/API Gateway | ACM |
| Private certificates for internal trust | AWS Private CA |
| Internal mTLS at scale | AWS Private CA |
| Direct install on EC2 web server | Exportable/imported/private cert pattern, not ACM public cert direct install |

---

## 16. Scenario 13: Data In Transit

### RDS/Aurora TLS

Use TLS/SSL connection settings and the proper CA certificate bundle.

```text
Client -> TLS -> RDS/Aurora endpoint
```

### API Gateway mTLS

Use custom domain with truststore in S3.

```text
Client certificate -> API Gateway custom domain -> truststore validation
```

### EMR Inter-Node Encryption

Use EMR security configuration for in-transit encryption and certificates as required.

```text
EMR nodes -> encrypted traffic -> EMR nodes
```

### Nitro Inter-Instance Encryption

Recognize wording about supported Nitro-based instances and encryption in transit without application changes.

### Exam Trap

Do not answer "security group" when the question asks for encryption in transit. Security groups restrict traffic; TLS/encryption protects data moving through that traffic.

---

## 17. Scenario 14: Backup, Replication, And Retention

### AWS Backup

Choose AWS Backup when:

- many services need backup plans
- central backup policy
- cross-account or cross-Region backup
- backup audit/compliance
- backup vault access policies

### Backup Vault Lock

Choose Backup Vault Lock when:

- backup deletion must be blocked
- retention must not be shortened
- ransomware-resistant backup posture

### Data Lifecycle Manager

Choose DLM when:

- EBS snapshots
- EBS-backed AMIs
- scheduled create/retain/delete lifecycle

### S3 Replication

Choose S3 replication when:

- objects must be copied to another bucket/Region/account
- SSE-KMS permissions must support source and destination keys

### Exam Trap

Backup and replication are not the same:

```text
Replication = copy data to another place.
Backup = recovery point with retention/recovery controls.
```

---

## 18. Decision Trees

### 18.1 Key Management

```text
Need managed key control integrated with AWS services?
    -> AWS KMS

Need key policy control and audit?
    -> Customer managed KMS key

Need cross-account encrypted data access?
    -> Customer managed KMS key with key policy + IAM

Need same key material across Regions?
    -> KMS multi-Region key

Need customer-supplied key material?
    -> Imported key material

Need dedicated HSM control?
    -> CloudHSM or KMS custom key store

Need temporary AWS service permission to key?
    -> KMS grant
```

### 18.2 S3 Data Protection

```text
Need basic default encryption?
    -> SSE-S3

Need key policy/audit/cross-account control?
    -> SSE-KMS with customer managed key

Need reject uploads without approved key?
    -> S3 bucket policy explicit deny

Need reduce KMS request cost?
    -> S3 Bucket Keys

Need immutable records?
    -> S3 Object Lock

Need find PII in S3?
    -> Macie

Need cross-Region/object copy?
    -> S3 replication with KMS permissions
```

### 18.3 Secrets And Sensitive Data

```text
Need rotating database password?
    -> Secrets Manager

Need static config value?
    -> Parameter Store

Need mask PII in CloudWatch Logs?
    -> CloudWatch Logs data protection

Need find sensitive S3 data?
    -> Macie

Need selected form fields encrypted at edge?
    -> CloudFront field-level encryption
```

### 18.4 Certificates And Transit

```text
Need public TLS cert for AWS integrated service?
    -> ACM

Need private certificates/internal mTLS?
    -> AWS Private CA

Need database connection encryption?
    -> RDS/Aurora TLS settings and CA bundle

Need client certificate auth for API?
    -> API Gateway mTLS

Need EMR node-to-node encryption?
    -> EMR security configuration
```

---

## 19. Common Exam Traps

| Trap | Better thinking |
|---|---|
| IAM policy alone allows KMS decrypt | KMS key policy must allow the access path |
| S3 access is enough for SSE-KMS object | Need S3 access and KMS decrypt access |
| AWS managed KMS key is fine for cross-account sharing | Use customer managed key for cross-account control |
| KMS encrypts multi-GB objects directly | Use envelope encryption |
| Multi-Region key policies replicate automatically | Key policies are independent per Region |
| Imported key material rotation is fully automatic | Customer has more responsibility |
| CloudHSM is always better security | CloudHSM is for direct HSM control; KMS is simpler and managed |
| Default S3 encryption enforces approved key headers | Use bucket policy deny to enforce headers/key ID |
| Object Lock governance mode blocks everyone | Compliance mode is stricter |
| Macie fixes sensitive objects automatically | Macie discovers/classifies; remediation is separate |
| Parameter Store is equal to Secrets Manager for rotation | Secrets Manager is purpose-built for secret rotation |
| Security groups encrypt traffic | They restrict traffic; TLS/mTLS encrypts traffic |
| Field-level encryption encrypts entire request | It encrypts configured fields only |
| SNS data protection is a default new-design answer | Current docs say it is not available to new customers |

---

## 20. Memory Tables

### 20.1 KMS Memory Table

| Term | Meaning |
|---|---|
| KMS key | Logical key resource in KMS |
| Key material | Cryptographic secret used by the key |
| Key policy | Required KMS resource policy |
| Grant | Allow-only delegated KMS permission |
| `kms:ViaService` | Restricts key use through service path |
| `kms:GrantIsForAWSResource` | Grant creation only for AWS resource/service use |
| Multi-Region key | Same key ID/material across related Regional keys |
| Imported key material | Customer supplies material |
| CloudHSM | Dedicated customer-controlled HSMs |

### 20.2 S3 Protection Table

| Requirement | Feature |
|---|---|
| Default encryption | SSE-S3 |
| Customer key control | SSE-KMS |
| Extra dual server-side layer | DSSE-KMS |
| Customer encrypts before upload | Client-side encryption |
| Immutable retention | Object Lock |
| Sensitive data discovery | Macie |
| Reduce KMS costs | S3 Bucket Keys |
| Cross-Region copy | S3 replication |

### 20.3 Secrets And Config Table

| Requirement | Service |
|---|---|
| Database credential rotation | Secrets Manager |
| OAuth/API token storage | Secrets Manager |
| Static config | Parameter Store |
| Approved AMI ID | Parameter Store |
| Feature flag rollout | AppConfig |
| Encryption key | KMS |
| Private certificate authority | AWS Private CA |

---

## 21. Worked Examples

### Example 1: KMS Decrypt Denied

Scenario:

A role has IAM permission for `kms:Decrypt`, but the KMS key policy does not allow the role or the account.

Answer:

```text
Decrypt is denied.
```

Why:

KMS key policy is required. IAM permission alone is insufficient unless the key policy enables IAM access.

---

### Example 2: Cross-Account S3 SSE-KMS

Scenario:

Account A reads S3 objects from Account B. Objects are encrypted with a customer managed KMS key in Account B.

Good answer:

```text
Bucket policy allows Account A principal.
Account A IAM allows s3:GetObject.
KMS key policy in Account B allows Account A principal.
Account A IAM allows kms:Decrypt.
```

Why:

Both S3 and KMS authorization paths must work.

---

### Example 3: Secret Rotation

Scenario:

A database password must rotate every 30 days and the app must retrieve it at runtime.

Good answer:

```text
Store it in Secrets Manager and configure automatic rotation with Lambda or managed rotation.
```

Why:

Secrets Manager is purpose-built for secret lifecycle and rotation.

---

### Example 4: Immutable Financial Records

Scenario:

Financial records in S3 must not be deleted or overwritten for seven years, even by administrators.

Good answer:

```text
S3 Object Lock in compliance mode.
```

Why:

Compliance mode prevents deletion/overwrite during retention even by privileged users.

---

### Example 5: Sensitive Data In Logs

Scenario:

Credit card numbers appear in CloudWatch Logs. Analysts should see masked values unless they have special permission.

Good answer:

```text
CloudWatch Logs data protection policy and tightly control logs:Unmask.
```

Why:

CloudWatch Logs data protection can detect and mask sensitive values at egress.

---

## 22. Original Mini Practice Set

These questions are original and are designed around the repeated topic signals.

### Q1. KMS Key Policy

A role has an IAM policy allowing `kms:Decrypt`, but the customer managed KMS key policy does not allow the role or the account to use IAM policies for the key. What happens?

A. Decrypt succeeds because IAM always overrides key policy  
B. Decrypt is denied because the KMS key policy must allow the access path  
C. Decrypt succeeds if S3 default encryption is enabled  
D. Decrypt succeeds only in the management account

**Answer:** B

**Explanation:** KMS key policy is a required authorization layer.

---

### Q2. Cross-Account SSE-KMS

Account A must read SSE-KMS encrypted S3 objects from Account B. Which permission set is required?

A. Only Account A IAM `s3:GetObject`  
B. Only Account B bucket policy  
C. S3 access plus KMS key policy/IAM permissions for the Account A principal  
D. Only an SCP allow

**Answer:** C

**Explanation:** Cross-account encrypted object access requires both S3 authorization and KMS authorization.

---

### Q3. kms:ViaService

A company wants a KMS key usable only when requests come through Amazon S3 in the same Region, not through direct KMS API calls. Which condition key is most relevant?

A. `kms:ViaService`  
B. `aws:MultiFactorAuthPresent`  
C. `s3:prefix`  
D. `ec2:SourceInstanceARN`

**Answer:** A

**Explanation:** `kms:ViaService` limits KMS key use to requests through specified AWS services.

---

### Q4. Imported Key Material

Which statement about imported KMS key material is correct?

A. AWS owns the original key material forever  
B. The customer is responsible for retaining and reimporting the key material if needed  
C. Imported material cannot be used with KMS  
D. Imported material removes the need for key policies

**Answer:** B

**Explanation:** Imported key material shifts more lifecycle responsibility to the customer.

---

### Q5. Multi-Region Key

A workload encrypts data in one AWS Region and must decrypt it in another without cross-Region KMS calls. Which key type is designed for this?

A. Single-Region AWS managed key  
B. KMS multi-Region key  
C. S3 Bucket Key  
D. Parameter Store SecureString

**Answer:** B

**Explanation:** Multi-Region keys share key ID and key material across related Regional keys.

---

### Q6. Secret Rotation

A database password is stored in AWS and must rotate automatically with custom application logic. What component commonly performs the rotation steps?

A. Lambda rotation function  
B. VPC Flow Logs  
C. CloudTrail Lake  
D. NACL rule

**Answer:** A

**Explanation:** Secrets Manager rotation commonly uses Lambda rotation functions.

---

### Q7. Object Lock

Records in S3 must be immutable for seven years, and even privileged users must not shorten retention. Which mode is appropriate?

A. Object Lock compliance mode  
B. Object Lock governance mode only  
C. SSE-S3  
D. S3 Bucket Keys

**Answer:** A

**Explanation:** Compliance mode is the stricter WORM retention mode.

---

### Q8. Macie

A company must discover files containing national ID numbers in S3 buckets. Which service is most targeted?

A. Amazon Macie  
B. Amazon Inspector  
C. AWS Shield Advanced  
D. AWS Backup

**Answer:** A

**Explanation:** Macie discovers and classifies sensitive data in S3.

---

### Q9. Matching

Match the requirement to the best service or feature.

| Requirement | Answer |
|---|---|
| A. Managed encryption keys | AWS KMS |
| B. Dedicated customer-controlled HSM | CloudHSM |
| C. Secret rotation | Secrets Manager |
| D. Sensitive data in S3 | Macie |
| E. Immutable S3 object retention | Object Lock |
| F. Mask sensitive CloudWatch Logs values | CloudWatch Logs data protection |

---

### Q10. Ordering

Place the envelope encryption steps in a sensible order.

```text
1. Ask KMS for a data key.
2. Encrypt large data locally with the plaintext data key.
3. Store the encrypted data key with the encrypted data.
4. Discard plaintext data key from memory.
5. Later, ask KMS to decrypt the encrypted data key.
6. Use the plaintext data key to decrypt the data.
```

Why:

KMS protects the data key; the data key protects the large data.

---

## 23. Final Audit Addendum: Thin Data Protection Topics

This section was added after rechecking the full question bank and important-topic matrix.

### 23.1 S3 Access Grants

S3 Access Grants provides scalable, temporary, least-privilege access to S3 data for users, groups, roles, and applications.

Plain English:

> S3 Access Grants is useful when normal IAM and bucket policies become too large or too hard to manage for many datasets and users.

Real-world example:

A data lake has thousands of prefixes and many analysts from a corporate identity provider. Instead of writing enormous bucket policies, the platform team defines grants. Users request access, and S3 Access Grants vends temporary credentials scoped to the allowed S3 data.

Simple flow:

```text
User or application needs S3 data
      |
      v
Requests credentials from S3 Access Grants
      |
      v
Matching grant found
      |
      v
Temporary least-privilege credentials
      |
      v
Access allowed S3 prefix/object set
```

Exam angle:

Choose S3 Access Grants when the question says:

- scalable S3 permissions for many datasets
- S3 access for directory users or groups
- temporary least-privilege S3 credentials
- policy size/complexity is becoming hard to manage

Common trap:

For simple S3 access, IAM policies, bucket policies, and access points may still be enough. Access Grants is for scale and complexity.

### 23.2 S3 Server Access Logging Constraints

S3 server access logging records detailed requests made to a bucket.

Plain English:

> S3 server access logs help audit bucket requests, but the destination design matters.

Important exam facts:

- Logs can be delivered to S3 or CloudWatch Logs.
- For S3 bucket delivery, design the target carefully.
- Avoid writing access logs into the same source bucket unless the question specifically accepts that design, because it can create confusing recursive logging and messy analysis.
- For traditional S3 target-bucket delivery, target and source constraints can matter by account and Region depending on delivery mode.

Simple pattern:

```text
Source bucket
      |
      v
Server access logs
      |
      v
Dedicated logging bucket or CloudWatch Logs
```

Exam angle:

Choose S3 server access logging when the question asks for detailed bucket request records for audit or security analysis.

Common trap:

S3 server access logging is not the same as CloudTrail S3 data events. CloudTrail data events are API audit events; server access logs are bucket access log records.

### 23.3 S3 Glacier Vault Lock

S3 Glacier Vault Lock applies compliance controls to an S3 Glacier vault and can lock the policy so it cannot be changed.

Plain English:

> Glacier Vault Lock is WORM-style compliance for legacy S3 Glacier vault archives.

Real-world example:

A regulated archive must deny deletion of archives for a fixed retention period. A Vault Lock policy is tested, then completed. After completion, the lock policy cannot be changed or removed.

Simple flow:

```text
Create vault lock policy
      |
      v
Initiate Vault Lock
      |
      v
24-hour validation window
      |
      +--> Abort if wrong
      +--> Complete lock if correct
              |
              v
        Policy locked
```

Exam angle:

Choose Glacier Vault Lock when the question specifically says:

- S3 Glacier vault
- archive vault policy
- regulatory lock on vault archives
- two-step lock process

Common trap:

For modern S3 object-level immutability, S3 Object Lock is more common. For backup vault immutability, AWS Backup Vault Lock is the better answer. For old-style Glacier vault archive controls, Glacier Vault Lock is the clue.

### 23.4 SageMaker Encryption

SageMaker AI encrypts many artifacts at rest by default, and you can use customer managed KMS keys for stronger control and cross-account scenarios.

Plain English:

> SageMaker security questions often test whether training data, model artifacts, notebooks, storage volumes, and inter-node traffic are encrypted.

Useful exam points:

- SageMaker API and console requests use secure connections.
- Model artifacts and system artifacts are encrypted in transit and at rest.
- You can pass KMS keys for notebook instances, training jobs, processing jobs, batch transform jobs, and endpoints.
- Cross-account access often requires a customer managed KMS key because AWS managed keys are not shareable across accounts.
- Some distributed training or processing designs can require explicit inter-node encryption choices.

Simple flow:

```text
Training input/output in S3
      |
      v
KMS or S3 encryption
      |
      v
Training/processing storage volume
      |
      v
KMS key if specified
      |
      v
Model artifact / endpoint
```

Exam angle:

Choose SageMaker encryption controls when the question says:

- ML training artifacts
- notebook storage volume encryption
- processing/training job encryption
- model artifact encryption
- cross-account KMS for ML output
- inter-node encryption for distributed ML

Common trap:

Do not answer with generic S3 encryption only if the question explicitly asks about SageMaker job volumes or inter-node training traffic.

---

## 24. Last-Day Revision Checklist

Before the exam, make sure you can answer these quickly:

- Why is KMS key policy special?
- What do you need for cross-account SSE-KMS S3 reads?
- When do you use `kms:ViaService`?
- When do you use KMS grants?
- What does `kms:GrantIsForAWSResource` restrict?
- What is envelope encryption?
- When do you choose multi-Region KMS keys?
- What is different about imported key material?
- When do you choose CloudHSM over KMS?
- How do you enforce a specific S3 KMS key on upload?
- What do S3 Bucket Keys reduce?
- What is the difference between Object Lock governance and compliance mode?
- What does Macie discover?
- When is Secrets Manager better than Parameter Store?
- What does CloudWatch Logs data protection do?
- What current caveat exists for SNS message data protection?
- When do you choose AWS Private CA?
- What is CloudFront field-level encryption for?
- What is AWS Backup Vault Lock for?
- When do you choose Data Lifecycle Manager?
- When do you choose S3 Access Grants?
- What is the difference between S3 server access logging and CloudTrail S3 data events?
- When is Glacier Vault Lock the better answer than S3 Object Lock or Backup Vault Lock?
- What SageMaker encryption details matter for SCS-C03?

Final mental model:

```text
KMS:
  key policy + IAM + grants + conditions + rotation + key material

S3:
  SSE-S3 / SSE-KMS / bucket policy enforcement / Object Lock / Macie / Access Grants / access logs

Secrets:
  Secrets Manager for rotating credentials
  Parameter Store for configuration

Transit:
  TLS / mTLS / Private CA / service-specific encryption / SageMaker inter-node encryption

Masking:
  CloudWatch Logs data protection
  CloudFront field-level encryption

Recovery:
  AWS Backup / Backup Vault Lock / Glacier Vault Lock / DLM / replication
```
