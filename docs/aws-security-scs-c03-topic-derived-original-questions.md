# AWS Security Specialty SCS-C03 Topic-Signal Practice Questions

Generated: 2026-10-06

This file does not copy real AWS exam questions or proprietary question-bank content. It summarizes public GitHub study-topic signals and turns those signals into original practice questions with immediate answers. Use it for direction, not memorization.

## GitHub Sources Used For Topic Signals

- RaduLupan/aws-security-specialty-study-guide: https://github.com/RaduLupan/aws-security-specialty-study-guide — SCS-C03 domain guides, new-topic list, and quiz topic coverage.
- maxpoe/aws-security-specialty-study-notes: https://github.com/maxpoe/aws-security-specialty-study-notes — SCS-C03 change notes, domain files, and updated service coverage.
- kiquetal/aws-security-speciality-2026: https://github.com/kiquetal/aws-security-speciality-2026 — Attack roadmap, exam-day cheat sheet, C03 new-topic notes, and FAQ topic map.
- BrandoBank/aws-security-study-guide: https://github.com/BrandoBank/aws-security-study-guide — High-level concept coverage and study-game topic emphasis.
- tltaylor1/anki-decks aws-scs-c03: https://github.com/tltaylor1/anki-decks/tree/main/aws-scs-c03 — Flashcard-style service facts and recurring gotchas.
- mykter/aws-security-cert-service-notes: https://github.com/mykter/aws-security-cert-service-notes — Legacy Security Specialty service checklist used only for durable service-level topics.

## Synthesized High-Yield Topic Signals

### Detection
- GuardDuty protections and findings flow
- Security Hub vs Detective vs Security Lake
- OCSF normalization
- CloudTrail management/data/Insights events
- CloudTrail Lake vs S3 + Athena vs CloudWatch Logs Insights
- Macie sensitive-data discovery in S3
- EventBridge-driven alerting and remediation

### Incident Response
- Validate findings and determine blast radius
- Isolate compromised EC2 without destroying evidence
- Snapshot EBS volumes for forensics
- Revoke exposed access keys and active sessions
- Step Functions/Lambda runbooks
- Automation with SSM and EventBridge
- Evidence preservation and least-disruptive containment

### Infrastructure Security
- Security groups vs NACLs vs Network Firewall
- WAF rules, Bot Control, CAPTCHA/challenge, Shield Advanced
- CloudFront OAC and edge protections
- Verified Access and private app access
- Inspector for EC2/ECR/Lambda
- GenAI/Bedrock guardrails
- Network Access Analyzer and VPC endpoint policy limitations

### Identity and Access Management
- Full policy evaluation chain
- SCP vs RCP vs permission boundary vs session policy
- Trust policies and ExternalId
- IAM Identity Center federation and session tags
- Verified Permissions/Cedar for app authorization
- Access Analyzer unused access and custom policy checks
- ABAC with PrincipalTag/ResourceTag

### Data Protection
- KMS key policy vs IAM policy vs grants
- kms:ViaService and encryption context
- AWS-managed vs customer-managed vs imported vs CloudHSM/XKS
- Multi-Region keys and independent key policies
- Secrets Manager rotation patterns
- CloudWatch Logs/SNS data masking
- Nitro, EKS, EMR, SageMaker encryption in transit
- S3 Object Lock and Glacier Vault Lock

### Security Foundations and Governance
- Organizations delegated admin
- Control Tower guardrails
- SCPs and RCPs at scale
- Declarative policies vs SCP API blocking
- AWS Config aggregators and conformance packs
- Audit Manager, Artifact, Well-Architected Tool
- Firewall Manager and centralized security policy rollout

---

# Original Practice Questions

Total original questions: 150

## Detection

### Q1. CloudTrail Lake vs Security Lake

A security team needs to investigate API activity for the last 60 days with SQL queries and minimal data-pipeline setup. The team does not need to normalize third-party security logs. Which service is the best fit?

A. Amazon Security Lake
B. CloudTrail Lake
C. Amazon Detective
D. Amazon Athena over VPC Flow Logs

**Answer:** B. CloudTrail Lake

**Explanation:** CloudTrail Lake is optimized for SQL queries over CloudTrail events in a managed event data store. Security Lake is better when the requirement is a broad OCSF-normalized security data lake across sources.

### Q2. OCSF

A company wants CloudTrail, VPC Flow Logs, Route 53 Resolver logs, GuardDuty findings, and partner security events in one common schema for downstream SIEM analysis. Which design best matches this requirement?

A. Send every source to separate CloudWatch log groups
B. Use Amazon Security Lake with OCSF normalization
C. Create one CloudTrail organization trail
D. Enable AWS Config advanced queries

**Answer:** B. Use Amazon Security Lake with OCSF normalization

**Explanation:** Security Lake centralizes security data and normalizes supported sources into OCSF. CloudTrail and Config solve narrower problems.

### Q3. GuardDuty flow

GuardDuty produces a high-severity finding for suspected credential exfiltration. The team wants automatic notification and containment workflow kickoff. Which integration is most appropriate?

A. GuardDuty finding to EventBridge rule that starts Step Functions
B. GuardDuty finding directly to AWS Config remediation
C. CloudTrail Lake scheduled query that calls IAM every 24 hours
D. Macie classification job that invokes Lambda

**Answer:** A. GuardDuty finding to EventBridge rule that starts Step Functions

**Explanation:** GuardDuty findings are available through EventBridge. EventBridge can trigger Lambda or Step Functions for notification, enrichment, and containment.

### Q4. Macie scope

A team must discover unencrypted files containing national ID numbers in S3 buckets across an organization. Which service is the most targeted choice?

A. Amazon Inspector
B. Amazon Macie
C. Amazon GuardDuty Malware Protection
D. AWS Audit Manager

**Answer:** B. Amazon Macie

**Explanation:** Macie is for S3 sensitive-data discovery and classification. Inspector scans workloads and code/package vulnerabilities, not object content classification.

### Q5. Security Hub vs Detective

Security Hub shows multiple findings related to an IAM principal, EC2 instance, and unusual network activity. The analyst needs entity relationship graphs and investigation context. Which service should they use next?

A. Amazon Detective
B. AWS Artifact
C. AWS Config conformance packs
D. IAM Access Analyzer

**Answer:** A. Amazon Detective

**Explanation:** Detective helps investigate and visualize relationships around security findings. Security Hub aggregates findings; Detective supports deeper investigation.

### Q6. Log source choice

A security engineer wants to see accepted and rejected traffic metadata for ENIs in private subnets. Which log source is most relevant?

A. CloudTrail management events
B. VPC Flow Logs
C. Route 53 Resolver query logs
D. AWS Config configuration snapshots

**Answer:** B. VPC Flow Logs

**Explanation:** VPC Flow Logs capture network flow metadata for VPC interfaces/subnets/VPCs. They do not capture full packet payloads.

### Q7. CloudTrail events

An S3 object was deleted, but the existing CloudTrail trail only logs management events. What is the most likely reason the delete is missing from the trail?

A. CloudTrail cannot record S3 actions
B. S3 object-level data events were not enabled
C. The bucket uses SSE-S3 encryption
D. The trail is multi-region

**Answer:** B. S3 object-level data events were not enabled

**Explanation:** S3 object operations are CloudTrail data events and are not logged by default in a management-event-only trail.

### Q8. CloudWatch Logs Insights

Application logs already land in CloudWatch Logs. The team needs ad hoc filtering by request ID and source IP without moving logs elsewhere. What should they use?

A. CloudWatch Logs Insights
B. Amazon Security Lake
C. AWS Config advanced query
D. Amazon Detective behavior graph

**Answer:** A. CloudWatch Logs Insights

**Explanation:** CloudWatch Logs Insights is the quickest fit for querying log groups already in CloudWatch Logs.

### Q9. Security Hub delegated admin

An organization wants one security account to aggregate findings from GuardDuty, Inspector, Macie, and other security services across accounts. What recurring setup pattern is most relevant?

A. Create one IAM user in every account
B. Use Organizations delegated administrator where supported
C. Share every CloudWatch alarm manually
D. Put all workloads in the management account

**Answer:** B. Use Organizations delegated administrator where supported

**Explanation:** Many AWS security services support delegated administration through AWS Organizations, allowing central security accounts to manage and aggregate findings.

### Q10. DNS investigation

GuardDuty reports communication with a known malicious domain. Which additional source helps investigate domain lookups from workloads that use the VPC resolver?

A. Route 53 Resolver query logs
B. AWS Backup vault logs
C. ACM certificate transparency logs
D. EBS direct API logs

**Answer:** A. Route 53 Resolver query logs

**Explanation:** Route 53 Resolver query logs help analyze DNS queries from VPC resources using the resolver.

## Incident Response

### Q11. EC2 containment

A public EC2 instance is suspected of compromise. The team must stop command-and-control traffic while preserving the instance for forensics. What is a strong first containment step?

A. Terminate the instance immediately
B. Detach the IAM role and apply an isolation security group
C. Delete the root EBS volume
D. Disable the entire VPC route table

**Answer:** B. Detach the IAM role and apply an isolation security group

**Explanation:** Removing credentials and isolating network access preserves evidence better than terminating or deleting resources.

### Q12. Forensics order

Place the response steps in the best order for suspected EC2 compromise: 1. Analyze copied evidence. 2. Isolate the instance. 3. Snapshot attached EBS volumes. 4. Preserve relevant logs.

A. 2, 3, 4, 1
B. 1, 2, 3, 4
C. 3, 2, 1, 4
D. 4, 1, 2, 3

**Answer:** A. 2, 3, 4, 1

**Explanation:** Contain first, preserve disk evidence, preserve logs, then analyze copies. The exact runbook may vary, but evidence-preserving containment comes before destructive remediation.

### Q13. Credential compromise

An IAM access key is accidentally committed to a public repository. Which action set is most appropriate?

A. Delete the IAM user before checking CloudTrail
B. Make the key inactive, rotate credentials, investigate CloudTrail, then delete after validation
C. Attach AdministratorAccess temporarily
D. Wait for Access Advisor to update

**Answer:** B. Make the key inactive, rotate credentials, investigate CloudTrail, then delete after validation

**Explanation:** Make the exposed key unusable quickly, rotate, investigate use, then remove it. Deleting first can lose useful context and break dependent workloads unexpectedly.

### Q14. Session revocation

A federated role session is suspected to be compromised. The role policy has been fixed, but existing sessions may remain active. What helps invalidate existing temporary sessions for the role?

A. Revoke active sessions by adding a time-based deny condition or using the IAM revoke-session pattern
B. Delete CloudTrail logs
C. Disable S3 Block Public Access
D. Enable GuardDuty Malware Protection

**Answer:** A. Revoke active sessions by adding a time-based deny condition or using the IAM revoke-session pattern

**Explanation:** Temporary credentials remain valid until expiry unless explicitly blocked through a policy-based revocation pattern.

### Q15. Automated runbooks

A team wants a repeatable containment workflow that disables a key, isolates an EC2 instance, snapshots disks, and sends notifications with approvals. Which orchestration service is the best fit?

A. AWS Step Functions
B. Amazon CloudFront
C. AWS Artifact
D. Route 53 Resolver

**Answer:** A. AWS Step Functions

**Explanation:** Step Functions is suitable for orchestrating multi-step response workflows with branching, approvals, and Lambda/SSM integrations.

### Q16. Validate finding scope

A single GuardDuty finding indicates possible credential use from an unusual geography. What should the responder do before broad remediation?

A. Assume the whole organization is compromised
B. Correlate CloudTrail, IAM, GuardDuty, and affected-resource logs to determine scope
C. Delete every access key in the organization
D. Disable all regions

**Answer:** B. Correlate CloudTrail, IAM, GuardDuty, and affected-resource logs to determine scope

**Explanation:** SCS-C03 emphasizes validating findings and assessing scope/impact before disruptive remediation.

### Q17. SSM access

During incident response, SSH access to private EC2 instances is blocked by policy. The team needs auditable shell access without opening inbound ports. What should they use?

A. AWS Systems Manager Session Manager
B. A public bastion with port 22 open to the internet
C. S3 pre-signed URLs
D. CloudFront signed cookies

**Answer:** A. AWS Systems Manager Session Manager

**Explanation:** Session Manager provides audited interactive access without inbound SSH exposure when prerequisites are met.

### Q18. Evidence integrity

A responder snapshots an EBS volume from a compromised instance. What should they do for analysis?

A. Analyze the production volume directly
B. Create and analyze a copy of the snapshot/volume in an isolated forensic account or subnet
C. Attach it to the original instance
D. Make the snapshot public

**Answer:** B. Create and analyze a copy of the snapshot/volume in an isolated forensic account or subnet

**Explanation:** Analyze copies in an isolated environment to preserve original evidence and reduce contamination risk.

### Q19. Containment tradeoff

A workload is actively exfiltrating data but supports a critical business process. Which response principle is most appropriate?

A. Always terminate immediately
B. Balance containment with business impact using a preapproved incident runbook
C. Ignore the event until business hours
D. Only monitor because exfiltration is expected

**Answer:** B. Balance containment with business impact using a preapproved incident runbook

**Explanation:** Incident response plans should define containment choices and approval paths that consider severity and business impact.

### Q20. IR readiness

Which activity best tests whether security response automation works before a real incident?

A. Never run the workflow until production compromise
B. Use simulations/tabletops and controlled experiments such as FIS where appropriate
C. Delete EventBridge rules monthly
D. Disable all automated remediation

**Answer:** B. Use simulations/tabletops and controlled experiments such as FIS where appropriate

**Explanation:** Practice, simulations, and controlled fault experiments improve response readiness without waiting for real incidents.

## Infrastructure Security

### Q21. Network Firewall

A company needs stateful inspection and domain-based egress filtering for traffic leaving private subnets. Security groups and NACLs are insufficient. What service is most appropriate?

A. AWS Network Firewall
B. AWS Shield Standard
C. ACM Private CA
D. IAM Access Analyzer

**Answer:** A. AWS Network Firewall

**Explanation:** Network Firewall provides managed network firewall capabilities including stateful rules and domain list filtering.

### Q22. SG vs NACL

A subnet-level rule must explicitly deny traffic from a known bad CIDR before it reaches instances. Which control supports this?

A. Security group inbound rule
B. Network ACL deny rule
C. IAM permissions boundary
D. KMS key policy

**Answer:** B. Network ACL deny rule

**Explanation:** Security groups are stateful and allow-only. NACLs are stateless and support explicit allow and deny at subnet boundaries.

### Q23. CloudFront OAC

A static website uses CloudFront in front of private S3 content. For a new design, which access pattern should be preferred over legacy OAI?

A. Origin Access Control with a bucket policy allowing CloudFront
B. Public bucket with hidden object names
C. IAM user access keys in Lambda@Edge
D. NACL allow rule for CloudFront IPs only

**Answer:** A. Origin Access Control with a bucket policy allowing CloudFront

**Explanation:** Origin Access Control is the modern CloudFront-to-S3 private access model.

### Q24. WAF vs Shield

A web app needs protection against credential-stuffing patterns and suspicious bots at Layer 7. Which service feature is most aligned?

A. AWS WAF Bot Control / Fraud Control features
B. AWS KMS grants
C. VPC Flow Logs
D. EBS encryption by default

**Answer:** A. AWS WAF Bot Control / Fraud Control features

**Explanation:** AWS WAF handles Layer 7 web request inspection and bot/fraud-oriented controls. Shield focuses on DDoS protection.

### Q25. Shield Advanced

A company with internet-facing critical applications wants DDoS cost protection and access to specialized DDoS response support. What should it consider?

A. AWS Shield Advanced
B. Amazon Inspector
C. AWS Artifact
D. CloudTrail Lake

**Answer:** A. AWS Shield Advanced

**Explanation:** Shield Advanced adds enhanced DDoS protections, cost protection, and response support features beyond Shield Standard.

### Q26. Verified Access

Employees need access to internal web apps without a traditional VPN, with decisions based on identity and device posture per request. Which service fits?

A. AWS Verified Access
B. VPC peering
C. AWS Direct Connect only
D. Amazon Cognito identity pools

**Answer:** A. AWS Verified Access

**Explanation:** Verified Access provides zero-trust access to private applications using identity and device context.

### Q27. Inspector

A security team wants continuous vulnerability scanning for EC2 instances, ECR container images, and Lambda functions. Which service is most relevant?

A. Amazon Inspector
B. Amazon Macie
C. AWS Audit Manager
D. AWS Firewall Manager

**Answer:** A. Amazon Inspector

**Explanation:** Current Amazon Inspector supports continuous vulnerability management for EC2, ECR, and Lambda.

### Q28. GenAI guardrails

An application invokes Amazon Bedrock and must reduce prompt-injection and unsafe-content risk. Which control is most directly relevant?

A. Amazon Bedrock Guardrails
B. AWS Shield Advanced
C. S3 Object Lock
D. Route 53 DNSSEC

**Answer:** A. Amazon Bedrock Guardrails

**Explanation:** Bedrock Guardrails are intended for LLM application safety controls such as content filtering and denied topics. WAF is HTTP-layer protection, not model-output governance.

### Q29. Network reachability

A team wants to identify unintended network paths to sensitive resources before attackers use them. Which capability is most aligned?

A. VPC Network Access Analyzer
B. AWS Artifact reports
C. KMS automatic rotation
D. CloudWatch metric math

**Answer:** A. VPC Network Access Analyzer

**Explanation:** Network Access Analyzer helps reason about reachability paths in VPC networking.

### Q30. Endpoint policies

A developer says an S3 gateway endpoint policy allows a bucket, so the bucket policy no longer matters. What is the correct interpretation?

A. Endpoint policies replace all bucket policies
B. Endpoint policies are one layer; S3 bucket policies and IAM policies can still allow or deny
C. Endpoint policies only affect CloudFront
D. Endpoint policies grant root access

**Answer:** B. Endpoint policies are one layer; S3 bucket policies and IAM policies can still allow or deny

**Explanation:** Endpoint policies are an additional authorization layer. They do not replace identity policies, bucket policies, SCPs, or RCPs.

## Identity and Access Management

### Q31. Policy layers

A role has an identity policy allowing s3:PutObject. An SCP attached to the account denies s3:PutObject. What is the result?

A. Allowed because identity policies override SCPs
B. Denied because explicit deny wins
C. Allowed if the bucket policy allows it
D. Allowed only in us-east-1

**Answer:** B. Denied because explicit deny wins

**Explanation:** Any applicable explicit deny wins. SCPs set account-level permission boundaries for principals in member accounts.

### Q32. RCP vs SCP

A company wants to prevent external principals from accessing organization-owned S3 buckets, even if a bucket policy is accidentally opened. Which policy type is most relevant?

A. Resource Control Policy
B. Session policy
C. IAM group policy
D. AWS managed policy

**Answer:** A. Resource Control Policy

**Explanation:** RCPs apply to resources and help establish resource-side data perimeters. SCPs restrict principals in accounts; RCPs restrict resources.

### Q33. Permission boundary

A developer can create IAM roles but must never create a role with permissions beyond a defined maximum. What should be required?

A. Permission boundary on created roles
B. CloudTrail Lake
C. S3 Object Lock
D. Route 53 Resolver DNS firewall

**Answer:** A. Permission boundary on created roles

**Explanation:** Permission boundaries define the maximum effective permissions for IAM entities and are commonly used for delegated administration.

### Q34. ExternalId

A third-party SaaS provider assumes a role in your AWS account for monitoring. What reduces confused-deputy risk?

A. ExternalId condition in the trust policy
B. Public read access to the role
C. Long-lived IAM user keys shared with the provider
D. Disabling CloudTrail

**Answer:** A. ExternalId condition in the trust policy

**Explanation:** ExternalId helps ensure the third party assumes the role only for the intended customer context.

### Q35. ABAC

A company wants project-tagged roles to access only resources with the same project tag. Which IAM strategy best fits?

A. ABAC using aws:PrincipalTag and resource tags
B. One administrator policy for all roles
C. NACL rules based on username
D. KMS aliases only

**Answer:** A. ABAC using aws:PrincipalTag and resource tags

**Explanation:** ABAC uses attributes/tags on principals and resources to drive authorization decisions.

### Q36. IAM Identity Center

A company uses an external IdP and wants workforce users to access multiple AWS accounts with centrally managed permission sets. Which service is intended for this?

A. IAM Identity Center
B. Amazon Cognito identity pools
C. AWS WAF
D. Amazon Detective

**Answer:** A. IAM Identity Center

**Explanation:** IAM Identity Center is the workforce access service for multi-account access with permission sets and IdP integration.

### Q37. Verified Permissions

A SaaS application needs fine-grained authorization such as “user can approve invoice only for their department.” The authorization is inside the app, not AWS API access. Which service fits?

A. Amazon Verified Permissions with Cedar policies
B. AWS Organizations SCPs
C. VPC security groups
D. AWS Shield Standard

**Answer:** A. Amazon Verified Permissions with Cedar policies

**Explanation:** Verified Permissions is for application-level authorization using Cedar policies. IAM controls AWS API access.

### Q38. Access Analyzer

A security engineer wants to identify unused access granted to IAM roles and generate least-privilege policy suggestions. Which service capability is relevant?

A. IAM Access Analyzer unused access / policy generation
B. Amazon Macie classification jobs
C. AWS Backup restore testing
D. CloudFront Functions

**Answer:** A. IAM Access Analyzer unused access / policy generation

**Explanation:** IAM Access Analyzer can analyze access and help refine policies based on usage.

### Q39. Session policy

A broker assumes a role for a short-lived task and passes a session policy. How does that policy affect permissions?

A. It can only reduce the permissions available to the session
B. It adds administrator permissions
C. It replaces all SCPs
D. It disables resource policies

**Answer:** A. It can only reduce the permissions available to the session

**Explanation:** Session policies limit the effective permissions of a role session; they do not expand beyond the role permissions.

### Q40. KMS special case

An IAM policy allows kms:Decrypt on a customer managed key, but the key policy does not allow the principal or account to use IAM policies for the key. What happens?

A. Decrypt is allowed by IAM alone
B. Decrypt is denied because KMS key policy must allow the path
C. SCPs are ignored
D. The key automatically becomes public

**Answer:** B. Decrypt is denied because KMS key policy must allow the path

**Explanation:** For KMS customer managed keys, the key policy is a required authorization layer. IAM permission alone is not sufficient unless enabled by the key policy.

## Data Protection

### Q41. kms:ViaService

A company wants a KMS key to be usable only when requests come through Amazon S3 in the same region, not through direct KMS API calls. Which condition is most relevant?

A. kms:ViaService
B. aws:MultiFactorAuthAge
C. s3:prefix
D. ec2:InstanceType

**Answer:** A. kms:ViaService

**Explanation:** kms:ViaService restricts KMS key use to requests made via specified AWS services.

### Q42. Imported key material

Which statement about imported KMS key material is correct?

A. AWS automatically rotates imported key material every year
B. The customer is responsible for retaining and reimporting the key material if needed
C. Imported material can never expire
D. Imported material makes the key multi-region by default

**Answer:** B. The customer is responsible for retaining and reimporting the key material if needed

**Explanation:** With imported key material, the customer owns durability outside AWS and manages expiration/reimport/rotation processes.

### Q43. MRKs

A workload encrypts data in one AWS Region and must decrypt it in another without cross-region KMS calls. Which key type is designed for this?

A. KMS multi-Region key
B. AWS managed key for S3 only
C. CloudHSM cluster with no replication
D. One alias copied manually

**Answer:** A. KMS multi-Region key

**Explanation:** KMS multi-Region keys share key material across primary/replica keys while each regional key has its own policy and lifecycle controls.

### Q44. KMS grants

An AWS service needs temporary permission to use a customer managed KMS key on behalf of a principal. Which KMS mechanism is commonly used?

A. KMS grant
B. S3 lifecycle policy
C. CloudFront signed URL
D. Route 53 health check

**Answer:** A. KMS grant

**Explanation:** KMS grants provide allow-only permissions on keys and are frequently used by AWS services for delegated use.

### Q45. Secrets rotation

A database password is stored in Secrets Manager and must rotate automatically using custom application logic. What component commonly performs the rotation steps?

A. Lambda rotation function
B. CloudFront distribution
C. Network ACL
D. AWS Artifact report

**Answer:** A. Lambda rotation function

**Explanation:** Secrets Manager rotation commonly uses Lambda functions, either managed templates or custom logic.

### Q46. CloudWatch data protection

PII appears in application logs. The team wants viewers to see masked values in CloudWatch Logs and wants audit records of sensitive-data findings. What feature should they use?

A. CloudWatch Logs data protection policy
B. Amazon Inspector SBOM export
C. S3 Transfer Acceleration
D. Route 53 DNSSEC

**Answer:** A. CloudWatch Logs data protection policy

**Explanation:** CloudWatch Logs data protection can detect and mask sensitive data and send audit findings to configured destinations.

### Q47. SNS data protection

A topic may receive messages containing credit card numbers, and subscribers should not receive raw sensitive values. Which feature is most direct?

A. SNS message data protection
B. GuardDuty EKS protection
C. AWS Config recorder
D. EBS fast snapshot restore

**Answer:** A. SNS message data protection

**Explanation:** SNS message data protection can audit, de-identify, or block sensitive data in messages.

### Q48. Nitro encryption

Two Nitro-based EC2 instances communicate within the same VPC. The requirement says encrypt inter-instance traffic without application changes. What feature should you recognize?

A. Nitro system in-transit encryption between supported instances
B. S3 Object Lock
C. Cognito managed login
D. Macie automated discovery

**Answer:** A. Nitro system in-transit encryption between supported instances

**Explanation:** Supported Nitro-based instance traffic can be automatically encrypted at the infrastructure layer without app changes.

### Q49. Object Lock

Financial records in S3 must be immutable for seven years and even privileged users must not shorten retention. Which mode is appropriate?

A. S3 Object Lock compliance mode
B. S3 Intelligent-Tiering only
C. Lifecycle expiration after 30 days
D. Public bucket ACLs disabled only

**Answer:** A. S3 Object Lock compliance mode

**Explanation:** Compliance mode is the stricter Object Lock mode for WORM retention where protected versions cannot be overwritten or deleted until retention expires.

### Q50. Private CA

A company needs private certificates for internal mTLS between services at scale. Which AWS service is most relevant?

A. AWS Private Certificate Authority
B. AWS Shield Standard
C. Amazon Detective
D. AWS Cost Explorer

**Answer:** A. AWS Private Certificate Authority

**Explanation:** AWS Private CA issues private X.509 certificates for internal TLS/mTLS use cases.

## Security Foundations and Governance

### Q51. Control Tower

A company wants a prescriptive multi-account landing zone with preventive and detective guardrails. Which service is most aligned?

A. AWS Control Tower
B. Amazon Macie
C. AWS KMS
D. CloudFront Functions

**Answer:** A. AWS Control Tower

**Explanation:** Control Tower builds and governs a landing zone using Organizations and guardrails/controls.

### Q52. Declarative policies

A governance team wants certain EC2/VPC/EBS configurations to be impossible to violate regardless of which API is used. Which Organizations feature should they evaluate?

A. Declarative policies
B. IAM access keys
C. CloudTrail Insights
D. SNS FIFO topics

**Answer:** A. Declarative policies

**Explanation:** Declarative policies set desired configuration constraints for supported services, different from blocking API actions with SCPs.

### Q53. SCP limitations

Which statement about SCPs is correct?

A. SCPs grant permissions directly
B. SCPs set maximum permissions for principals in member accounts
C. SCPs apply only to S3 buckets as resources
D. SCPs replace IAM identity policies

**Answer:** B. SCPs set maximum permissions for principals in member accounts

**Explanation:** SCPs do not grant access. They define the maximum available permissions for affected principals in member accounts.

### Q54. Config aggregator

A security team needs compliance visibility across many accounts and Regions for resource configuration. Which service pattern fits?

A. AWS Config aggregator with conformance packs or rules
B. One EC2 instance running cron in each account
C. S3 pre-signed URLs
D. KMS grants only

**Answer:** A. AWS Config aggregator with conformance packs or rules

**Explanation:** AWS Config aggregators centralize configuration/compliance data across accounts and Regions.

### Q55. Audit Manager vs Artifact

A compliance team needs AWS compliance reports such as SOC reports. Which service is usually the starting point?

A. AWS Artifact
B. Amazon GuardDuty
C. Network Firewall
D. Verified Permissions

**Answer:** A. AWS Artifact

**Explanation:** AWS Artifact provides access to AWS compliance reports and agreements. Audit Manager helps collect evidence for audits.

### Q56. Firewall Manager

An organization wants to roll out WAF policies consistently across many accounts and CloudFront distributions. Which service helps centrally manage this?

A. AWS Firewall Manager
B. AWS Secrets Manager
C. Amazon Detective
D. AWS Backup

**Answer:** A. AWS Firewall Manager

**Explanation:** Firewall Manager centrally manages security policies such as WAF, Shield Advanced, security groups, and Network Firewall policies across Organizations.

### Q57. Delegated admin

Why use delegated administrator accounts for security services instead of the management account?

A. To centralize security operations while reducing routine use of the management account
B. Because delegated admins bypass all SCPs
C. Because findings cannot cross accounts
D. Because AWS requires every workload in the management account

**Answer:** A. To centralize security operations while reducing routine use of the management account

**Explanation:** Delegated administration supports central security operations without using the Organizations management account for daily service administration.

### Q58. Well-Architected

A team wants a structured review of workload security design against AWS best practices. Which tool is most relevant?

A. AWS Well-Architected Tool security pillar
B. S3 Select
C. CloudFront key groups only
D. Route 53 traffic policies

**Answer:** A. AWS Well-Architected Tool security pillar

**Explanation:** The Well-Architected Tool helps review workloads against pillars including Security.

### Q59. RCP and service principals

A resource control policy blocks broad external access, but some AWS service access must continue. What policy-design detail is commonly important?

A. Use conditions such as aws:PrincipalIsAWSService where appropriate
B. Disable every service-linked role
C. Make the resource public
D. Remove CloudTrail

**Answer:** A. Use conditions such as aws:PrincipalIsAWSService where appropriate

**Explanation:** Data perimeter policies often need explicit handling for AWS service principals so that legitimate service-to-resource access is not broken.

### Q60. AI service governance

An organization wants to centrally control whether AWS AI services may use content for service improvement where opt-out policies are supported. Which governance area is relevant?

A. AWS Organizations AI services opt-out policies
B. NACL ephemeral port rules
C. CloudFront cache behaviors
D. Macie custom data identifiers only

**Answer:** A. AWS Organizations AI services opt-out policies

**Explanation:** AWS Organizations supports policy types for centralized governance, including AI services opt-out policies where applicable.


---

## Community Source Addendum

These added topic signals came from Reddit pass reports and developer-community posts. They are summarized as broad study direction only; no real/recalled exam questions were copied.

### Community Sources

- Reddit: Am I ready for the AWS Certified Security Specialty (SCS-C03)?: https://www.reddit.com/r/AWSCertifications/comments/1twmy3p/am_i_ready_for_the_aws_certified_security/ — Passer comment reinforced KMS key selection, IAM/S3 bucket policies, GuardDuty/Detective/Inspector, Organizations restrictions.
- Reddit: I Passed the AWS SCS-C03: https://www.reddit.com/r/AWSCertifications/comments/1rsdf1m/i_passed_the_aws_scsc03_aws_certified_security/ — Reinforced KMS key policy vs IAM policy, cross-account roles, delegated admin, centralized CloudTrail, CloudTrail to GuardDuty to Security Hub to EventBridge.
- Reddit: Passed AWS Certified Security - Specialty SCS-C03: https://www.reddit.com/r/AWSCertifications/comments/1tozsjr/passed_aws_certified_security_specialty_scsc03/ — Reinforced KMS, GuardDuty, incident response, credential exposure, DDoS, credential stuffing, EC2 takeover.
- Reddit: Earned the AWS Certified Security - Specialty (SCS-C03): https://www.reddit.com/r/AWSCertifications/comments/1un8ffn/earned_the_aws_certified_security_specialty/ — Reinforced IAM/cross-account, KMS, network security, logging/monitoring, incident response, Organizations/SCP/governance.
- Reddit: Preparing for the AWS Security Specialty SCS-C03 new exam: https://www.reddit.com/r/AWSCertifications/comments/1q2rs1r/preparing_for_the_aws_security_specialty_scsc03/ — Reinforced IAM edge cases, KMS, logging, networking, and service-specific permissions as weak areas to close with docs.
- Reddit: AWS Certified Security Speciality SCS-C03 - passed!: https://www.reddit.com/r/AWSCertifications/comments/1r3qnpg/aws_certified_security_speciality_scsc03_passed/ — Reinforced Organizations, GuardDuty/CloudTrail org setup, IAM Identity Center with SAML/OIDC/AD, SG/NACL, WAF/Shield, Macie, S3, KMS, Secrets Manager, Cognito.
- Reddit: Passed AWS Security - Specialty SCS-C03: https://www.reddit.com/r/AWSCertifications/comments/1t0m404/passed_aws_security_specialty_scsc03/ — Reinforced service integrations: CloudWatch alarms to SNS, centralized S3 to Athena, GuardDuty to EventBridge/SNS, Config to SSM Automation, IAM Identity Center, Cognito, KMS, IR/DR.
- Reddit: Passed AWS Certified Security - Specialty (SCS-C03): https://www.reddit.com/r/AWSCertifications/comments/1r7a0pr/passed_aws_certified_security_specialty_scsc03/ — Reinforced GuardDuty, Macie, KMS, WAF/DDoS, Security Hub, encryption, Cognito, Amazon Q, Detective, IAM, SageMaker AI.
- DEV Community: 2026 Passed the AWS Certified Security Specialty (SCS-C03): https://dev.to/lugerlogic/2026-passed-the-aws-certified-security-specialty-scs-c03-2dfa — Reinforced practice-exam-driven weak-area review, targeted topic review, and hands-on AWS experience.
- CertLand: AWS Security Specialty Exam Traps: https://certland.net/blog/aws-security-specialty-exam-traps-scps-kms-guardduty/ — Reinforced SCP evaluation, KMS key policy/root delegation, cross-account KMS, GuardDuty suppression vs trusted IP, WAF scope distinctions.

### Community-Reinforced Concepts

- **KMS and encryption decision trees:** KMS key policy vs IAM policy, grants, MRKs, key rotation/deletion, CloudHSM, envelope encryption, cross-account KMS.
- **IAM and multi-account access:** Cross-account roles, trust policies, permission boundaries, SCPs, Organizations, delegated administrators, IAM Identity Center federation.
- **Detection-service pipelines:** GuardDuty, Detective, Inspector, Security Hub, EventBridge, CloudWatch, SNS, and automated remediation chains.
- **Incident response and credential exposure:** Credential leaks, compromised EC2, EC2 takeover, DDoS, credential stuffing, lost credentials, DR and availability response.
- **Centralized logging and investigation:** Organization CloudTrail, centralized S3 logging buckets, Athena queries, CloudWatch Logs, CloudTrail Lake, Config and Security Hub.
- **Network and edge security:** Security groups, NACLs, WAF, Shield, DDoS, Network Firewall, API Gateway mTLS, CloudFront OAC/field-level encryption.
- **Data and S3 security:** Bucket policies, S3 encryption, CRR, Object Lock, server access logs, Macie discovery, access grants.
- **Identity app services:** Cognito, IAM Identity Center with SAML/OIDC/AD, Verified Access/Permissions, session tags and ABAC.
- **Governance automation:** Config to SSM Automation, Firewall Manager, Service Catalog, Control Tower, Config proactive checks, CloudFormation Guard.
- **New/edge SCS-C03 items:** GenAI/Amazon Q/SageMaker AI security, ordering and matching question styles, data masking, inter-resource encryption.

## Community-Derived Original Questions

### Q61. KMS key type selection

**Domain:** Data Protection

A regulated workload requires keys to be generated and stored in dedicated FIPS 140-2 Level 3 validated hardware that the customer controls. Which option is the best fit?

A. AWS managed KMS key
B. Customer managed KMS key with AWS-generated key material
C. AWS CloudHSM or a KMS custom key store backed by CloudHSM
D. S3 managed encryption only

**Answer:** C. AWS CloudHSM or a KMS custom key store backed by CloudHSM

**Explanation:** Community pass reports repeatedly call out KMS decision questions. CloudHSM/custom key stores are the dedicated HSM path when the requirement is customer-controlled FIPS hardware.

### Q62. KMS key policy versus IAM

**Domain:** Data Protection

A role has an IAM policy allowing kms:Decrypt, but the customer managed KMS key policy does not allow the role or delegate to IAM. What is the result?

A. Allowed because IAM always overrides key policies
B. Denied because the KMS key policy is a required authorization layer
C. Allowed only if CloudTrail is enabled
D. Allowed if the key has automatic rotation enabled

**Answer:** B. Denied because the KMS key policy is a required authorization layer

**Explanation:** KMS key policies are mandatory. IAM permission alone is insufficient unless the key policy enables that access path.

### Q63. Cross-account encrypted S3

**Domain:** Data Protection

Account A must read SSE-KMS encrypted S3 objects from Account B. Which permission set is required?

A. Only the bucket policy in Account B
B. Only the IAM policy in Account A
C. S3 access plus KMS permissions from the key policy in Account B and IAM permissions for the Account A principal
D. Only an Organizations SCP allow

**Answer:** C. S3 access plus KMS permissions from the key policy in Account B and IAM permissions for the Account A principal

**Explanation:** Cross-account encrypted object access requires both S3 object access and KMS key authorization across accounts.

### Q64. KMS rotation and deletion

**Domain:** Data Protection

A team wants annual automatic key rotation with minimal operations. Which key type supports this most directly?

A. Customer managed KMS key with AWS-generated key material
B. Imported key material with manual reimport only
C. CloudHSM key with no KMS integration
D. Deleted KMS key pending deletion

**Answer:** A. Customer managed KMS key with AWS-generated key material

**Explanation:** Automatic rotation applies to supported customer managed KMS keys with AWS-generated key material. Imported key material requires customer-managed rotation handling.

### Q65. Envelope encryption

**Domain:** Data Protection

A large object must be encrypted efficiently with KMS-backed controls. What is the standard envelope-encryption pattern?

A. Use KMS to encrypt the whole multi-GB object directly
B. Generate a data key, encrypt data locally with the plaintext data key, and store the encrypted data key with the object
C. Disable KMS and rely only on IAM
D. Use CloudTrail to encrypt the object

**Answer:** B. Generate a data key, encrypt data locally with the plaintext data key, and store the encrypted data key with the object

**Explanation:** Envelope encryption uses data keys for bulk encryption and KMS to protect those data keys.

### Q66. GuardDuty to EventBridge

**Domain:** Detection

A GuardDuty finding should automatically notify responders and start a containment workflow. Which integration is most direct?

A. GuardDuty finding to EventBridge rule to SNS/Step Functions/Lambda
B. Macie job to CloudFront
C. AWS Artifact report to SQS
D. KMS grant to Security Hub

**Answer:** A. GuardDuty finding to EventBridge rule to SNS/Step Functions/Lambda

**Explanation:** Reddit pass reports repeatedly mention integration chains like GuardDuty to EventBridge to SNS/automation.

### Q67. Security service comparison

**Domain:** Detection

A finding appears in Security Hub and the analyst needs behavior graphs showing involved principals, IPs, and resources. Which service is best for investigation?

A. Amazon Detective
B. AWS Artifact
C. S3 Inventory
D. IAM Access Advisor

**Answer:** A. Amazon Detective

**Explanation:** Security Hub aggregates findings; Detective helps investigate relationships and activity context.

### Q68. Inspector versus GuardDuty

**Domain:** Detection

Which pairing is most accurate?

A. Inspector detects package/software vulnerabilities; GuardDuty detects threats and suspicious activity
B. GuardDuty scans ECR images; Inspector classifies PII in S3
C. Inspector manages SCPs; GuardDuty issues TLS certificates
D. Both only inspect IAM policies

**Answer:** A. Inspector detects package/software vulnerabilities; GuardDuty detects threats and suspicious activity

**Explanation:** Several community posts list GuardDuty/Detective/Inspector together; the exam often tests which service does which job.

### Q69. GuardDuty trusted IP versus suppression

**Domain:** Detection

A vulnerability scanner from a known public IP creates noisy GuardDuty findings, but the team still wants a record of matching findings in some cases. Which option preserves more visibility?

A. Suppression rule for specific low-value findings
B. Trusted IP list for the scanner IP
C. Disable GuardDuty in the Region
D. Delete the detector

**Answer:** A. Suppression rule for specific low-value findings

**Explanation:** Trusted IP lists prevent findings for those IPs. Suppression rules filter/archive matching findings after detection, preserving a different visibility model.

### Q70. Centralized CloudTrail

**Domain:** Detection

An organization wants account-wide API activity stored centrally for all member accounts. Which pattern is most appropriate?

A. Organization trail delivering to a centralized logging bucket
B. Separate local trails only, no aggregation
C. Macie custom identifier
D. CloudFront signed cookies

**Answer:** A. Organization trail delivering to a centralized logging bucket

**Explanation:** Community sources repeatedly mention centralized CloudTrail logging across multiple accounts.

### Q71. S3 logs to Athena

**Domain:** Detection

A SOC stores VPC Flow Logs and CloudTrail logs in S3 and wants SQL-style investigation. What is the typical query service?

A. Amazon Athena
B. AWS Shield
C. Amazon Cognito
D. AWS Private CA

**Answer:** A. Amazon Athena

**Explanation:** Community reports explicitly cite centralized S3 bucket to Athena query patterns.

### Q72. CloudWatch alarm notification pipeline

**Domain:** Detection

A metric crosses a threshold and should notify an operations team. Which simple pattern fits?

A. CloudWatch Alarm to SNS topic
B. KMS alias to IAM user
C. S3 Object Lock to Macie
D. CloudHSM to CloudFront

**Answer:** A. CloudWatch Alarm to SNS topic

**Explanation:** A common integration chain is source metrics/logs to CloudWatch alarm to SNS notification.

### Q73. Credential exposure response

**Domain:** Incident Response

An IAM access key is exposed publicly. What is the best immediate response?

A. Disable or delete the exposed key after safe rotation, inspect CloudTrail for use, and issue new credentials
B. Leave the key active until the next audit
C. Only enable Macie
D. Add the key to a trusted IP list

**Answer:** A. Disable or delete the exposed key after safe rotation, inspect CloudTrail for use, and issue new credentials

**Explanation:** Community pass reports highlight credential exposure. Response should quickly stop abuse and investigate scope.

### Q74. EC2 takeover

**Domain:** Incident Response

An EC2 instance appears compromised and is communicating externally. Which response preserves evidence while reducing harm?

A. Apply an isolation security group and snapshot/acquire evidence before rebuild
B. Terminate immediately with no snapshots
C. Make the instance public for easier SSH
D. Delete CloudTrail logs

**Answer:** A. Apply an isolation security group and snapshot/acquire evidence before rebuild

**Explanation:** IR questions often hinge on containment plus evidence preservation.

### Q75. DDoS service choice

**Domain:** Infrastructure Security

A public application needs enhanced DDoS protection, cost protection, and access to AWS response support. Which service tier fits?

A. AWS Shield Advanced
B. Amazon Macie
C. IAM Identity Center
D. CloudTrail Lake

**Answer:** A. AWS Shield Advanced

**Explanation:** Community pass reports mention DDoS; Shield Advanced is the enhanced AWS DDoS protection option.

### Q76. Credential stuffing

**Domain:** Infrastructure Security

A web application sees automated login attempts against user accounts. Which control family is most relevant at the edge?

A. AWS WAF managed rules/Bot Control/account takeover protections
B. AWS KMS imported key material
C. S3 Glacier Vault Lock
D. CloudTrail organization trail only

**Answer:** A. AWS WAF managed rules/Bot Control/account takeover protections

**Explanation:** Credential stuffing is an application-layer abuse pattern; WAF managed protections are the relevant family.

### Q77. Security groups versus NACLs

**Domain:** Infrastructure Security

Which statement is correct?

A. Security groups are stateful allow controls; NACLs are stateless subnet controls that can allow and deny
B. Security groups are stateless and deny-only
C. NACLs attach to IAM roles
D. Both replace KMS key policies

**Answer:** A. Security groups are stateful allow controls; NACLs are stateless subnet controls that can allow and deny

**Explanation:** Multiple community posts call out SG/NACLs; this distinction is foundational and exam-friendly.

### Q78. Identity Center federation order

**Domain:** Identity and Access Management

A company integrates an external SAML IdP with IAM Identity Center. Which high-level order is most sensible?

A. Connect/configure IdP, map users/groups, create permission sets, assign access to accounts/apps, test sign-in
B. Create KMS keys first, then disable Organizations
C. Configure WAF, then create S3 lifecycle rules
D. Enable Macie, then create VPC NACLs

**Answer:** A. Connect/configure IdP, map users/groups, create permission sets, assign access to accounts/apps, test sign-in

**Explanation:** A Reddit pass report mentioned ordering/matching around IAM Identity Center federation. This is an original high-level workflow question.

### Q79. Cognito versus Identity Center

**Domain:** Identity and Access Management

A customer-facing mobile app needs user sign-up/sign-in and token-based access. Which service is usually the better fit than IAM Identity Center?

A. Amazon Cognito
B. AWS Organizations
C. AWS Firewall Manager
D. CloudTrail Lake

**Answer:** A. Amazon Cognito

**Explanation:** Cognito is for customer/application identities; IAM Identity Center is workforce/multi-account access.

### Q80. Permission boundaries

**Domain:** Identity and Access Management

A platform team delegates IAM role creation but must ensure created roles never exceed a maximum permission set. What should they require?

A. A permissions boundary on created roles
B. A CloudWatch alarm only
C. Macie sensitive data discovery
D. Route 53 health checks

**Answer:** A. A permissions boundary on created roles

**Explanation:** Community reports call out IAM policies, SCPs, permission boundaries, and resource policies as frequent themes.

### Q81. NotAction trap

**Domain:** Identity and Access Management

Why can Allow with NotAction be risky?

A. It can allow every action except the listed ones, including future or unintended services, if not tightly scoped
B. It always creates an explicit deny
C. It only works for KMS keys
D. It disables CloudTrail

**Answer:** A. It can allow every action except the listed ones, including future or unintended services, if not tightly scoped

**Explanation:** One community report mentioned policy details like NotAction. The common trap is overbroad permissions.

### Q82. SCP root behavior

**Domain:** Governance

A root user in a member account cannot perform an action that AdministratorAccess would normally allow. What is a likely cause?

A. An SCP explicit deny attached to the account or OU
B. Macie is disabled
C. The root user lacks an access key
D. CloudWatch Logs retention is too short

**Answer:** A. An SCP explicit deny attached to the account or OU

**Explanation:** SCPs apply to principals in member accounts, including root; management account behavior is different.

### Q83. Delegated administrator

**Domain:** Governance

A security account should manage GuardDuty and Security Hub organization-wide without using the management account for daily operations. What should be configured?

A. Delegated administrator for supported security services
B. A shared IAM user password
C. Public S3 bucket policies
D. One CloudFront distribution per account

**Answer:** A. Delegated administrator for supported security services

**Explanation:** Community sources repeatedly mention delegated administrator setup for GuardDuty/Security Hub.

### Q84. Organizations GuardDuty setup

**Domain:** Governance

A new account is added to AWS Organizations. The security team wants GuardDuty enabled automatically across accounts. Which pattern fits?

A. Use GuardDuty delegated admin/organization configuration with auto-enable where supported
B. Manually create one detector only in the management account
C. Use only an S3 lifecycle rule
D. Rely on CloudHSM

**Answer:** A. Use GuardDuty delegated admin/organization configuration with auto-enable where supported

**Explanation:** Organization-level GuardDuty configuration is a recurring prep signal.

### Q85. Config to SSM automation

**Domain:** Governance

A noncompliant EC2 configuration should trigger an automated remediation document. Which service pairing is most relevant?

A. AWS Config rule/remediation with SSM Automation
B. Macie and ACM
C. CloudFront and KMS alias
D. Athena and Cognito

**Answer:** A. AWS Config rule/remediation with SSM Automation

**Explanation:** Community pass reports mention Config to SSM Automation as a recurring integration pattern.

### Q86. Service Catalog

**Domain:** Governance

A central cloud team wants developers to self-service approved infrastructure products while staying inside guardrails. Which service is relevant?

A. AWS Service Catalog
B. Amazon Detective
C. AWS Shield Standard
D. S3 Select

**Answer:** A. AWS Service Catalog

**Explanation:** Service Catalog appears in community pass reports and governance study notes.

### Q87. S3 Object Lock

**Domain:** Data Protection

A company must prevent deletion or alteration of records for a fixed regulatory retention period. Which S3 feature is designed for WORM retention?

A. S3 Object Lock
B. S3 Transfer Acceleration
C. S3 Select
D. S3 EventBridge notifications only

**Answer:** A. S3 Object Lock

**Explanation:** S3 encryption, replication, and object locks show up repeatedly in community topic lists.

### Q88. S3 CRR encryption

**Domain:** Data Protection

An encrypted S3 object must replicate cross-Region and remain encrypted with a destination KMS key. What must be configured?

A. Replication rules plus appropriate source/destination KMS permissions and replica encryption configuration
B. Only a public bucket ACL
C. Only WAF Bot Control
D. Only CloudWatch Contributor Insights

**Answer:** A. Replication rules plus appropriate source/destination KMS permissions and replica encryption configuration

**Explanation:** Cross-Region replication with SSE-KMS needs the replication role and KMS permissions set correctly.

### Q89. Aurora TLS

**Domain:** Data Protection

A database client must verify encrypted connections to Aurora/RDS. What should be used?

A. TLS/SSL connection using the proper RDS/Aurora CA certificate bundle and client settings
B. AWS WAF CAPTCHA
C. CloudTrail Lake query validation
D. S3 Object Lock legal hold

**Answer:** A. TLS/SSL connection using the proper RDS/Aurora CA certificate bundle and client settings

**Explanation:** A community pass report listed Aurora TLS. This is a straightforward data-in-transit control.

### Q90. GenAI and SageMaker security

**Domain:** Infrastructure Security

A new SCS-C03 topic asks how to protect GenAI workloads. Which control family is most relevant?

A. Bedrock Guardrails, IAM/model access controls, network/data perimeter controls, and SageMaker encryption/isolation settings
B. Only S3 website hosting
C. Only Route 53 latency routing
D. Only AWS Artifact agreements

**Answer:** A. Bedrock Guardrails, IAM/model access controls, network/data perimeter controls, and SageMaker encryption/isolation settings

**Explanation:** Community and official update discussions repeatedly point to GenAI/ML security as a new C03 area, even if individual exam forms vary.


---

## Extended Web Research Addendum

These additional sources were used for topic and style signals only. Public sample/practice-question pages were not copied; the questions below are newly written from the repeated concepts.

### Additional Sources

- AWS Certified Security - Specialty certification page: https://aws.amazon.com/certification/certified-security-specialty/ — Official preparation path, practice-question-set pointer, exam languages, and exam prep workflow.
- AWS Skill Builder official practice question set listing: https://skillbuilder.aws/search?searchText=exam-prep-official-practice-question-set-database — Confirms an official SCS-C03 practice question set exists and aligns to the current exam guide.
- AWS official SCS-C03 exam guide / PDF: https://docs.aws.amazon.com/aws-certification/latest/security-specialty-03/security-specialty-03.html — Granular domain skills such as STS, presigned URLs, IAM Roles Anywhere, Verified Permissions, PrivateLink, VPC endpoints, Client VPN, data masking, and governance.
- Tutorials Dojo SCS-C03 video course page: https://portal.tutorialsdojo.com/courses/aws-certified-security-specialty-scs-c03-video-course/ — Reinforces IAM policy evaluation, Access Analyzer, security groups vs NACLs, CloudFront security, SNS/SQS/Step Functions, Route 53, Direct Connect, EC2 Image Builder, IMDS, and labs.
- Tutorials Dojo SCS-C03 exam guide study path: https://tutorialsdojo.com/aws-certified-security-specialty-scs-c03-exam-guide-study-path/ — Study path, services to focus on, common scenario categories, and validation approach.
- Instiq SCS-C03 study guide: https://instiq.net/en/learn/scs-c03/ — Organizes SCS-C03 into chapters/sections and original practice flow; useful for broad topic coverage.
- CloudaQube SCS-C03 study guide 2026: https://cloudaqube.com/blog/aws-security-specialty-scs-c03-study-guide-2026 — Reinforces KMS key-policy structure, cross-account scenarios, updated domains, and 6-8 week preparation structure.
- Tech Exam Lexicon SCS-C03 sample questions page: https://techexamlexicon.com/aws/scs-c03/sample-questions/ — Topic labels emphasize IAM evaluation, KMS access, logging/detection, containment, governance, and data protection.
- Mastery Exam Prep SCS-C03 cheat sheet: https://masteryexamprep.com/exams/aws/scs-c03/cheat-sheet/ — Cheat sheet for IAM, KMS, logging, network security, detection, governance, and incident response decisions.
- Global Exam Atlas SCS-C03 study guide: https://globalexamatlas.com/en/exams/cybersecurity/aws-security-specialty/study-guide/ — Reinforces integrity note and highlights current domain structure, IAM weight, ordering/matching, GenAI, and OCSF.
- Hiiragi SCS-C03 study guide and tips: https://hiiragiexam.com/blog/how-to-pass-aws-security-specialty-scs-c03-study-guide — Reinforces current-version checking, staged prep, multiple practice exams, and official AWS resources.
- PursuitCI free SCS-C03 practice test overview: https://www.pursuitci.com/exam-prep/aws-certified-security-specialty-scs — Uses official domain weights and original practice by objective; useful for topic coverage signal only.
- SaveMyCert SCS-C03 practice overview: https://www.savemycert.com/practice/aws-security-specialty/ — Reinforces domain weights and option-level explanation style across a large public practice bank.
- Courseiva SCS-C03 practice test overview: https://courseiva.com/certifications/aws-scs-c03/practice-test — Reinforces 2026 blueprint alignment and free practice format; topic signal only.

### Additional Repeating Concepts

- **Temporary credentials and delegated authentication:** STS, S3 presigned URLs, IAM Roles Anywhere, Identity Center permission sets, Cognito, and Directory Service troubleshooting.
- **Private access and hybrid connectivity:** PrivateLink, VPC endpoints, Client VPN, Verified Access, Direct Connect, virtual interfaces, and route/DNS troubleshooting.
- **Edge and application delivery security:** CloudFront OAC, signed URLs/cookies, field-level encryption, response headers, WAF association, API Gateway authorizers/resource policies/mTLS.
- **Deployment security controls:** EC2 Image Builder, IMDSv2, Systems Manager Patch/State Manager, CloudFormation Guard, cfn-lint, CloudFormation Hooks, Config proactive controls.
- **Security automation workflows:** EventBridge, SNS, SQS, Step Functions, Lambda, SSM Automation, Config remediation, Security Hub custom actions.
- **Governance and evidence:** Audit Manager, Artifact, Well-Architected Tool, Config aggregators, conformance packs, Security Hub standards, delegated admin.
- **Service comparison traps:** GuardDuty vs Security Hub vs Detective vs Inspector vs Macie vs Access Analyzer vs Config; prevention vs detection vs investigation.
- **Question format readiness:** Ordering and matching formats require selecting the right items and sequence/pairing; practice workflows, not only single facts.
- **Official-practice and public-practice meta-signal:** Many legitimate resources emphasize original practice plus reviewing wrong answers instead of memorizing dumps.
- **New C03 technologies but variable exam appearance:** GenAI guardrails, OCSF/Security Lake, data masking, Nitro/EMR/EKS/SageMaker encryption, and Private CA/MRK must be known even if individual forms vary.

## Extended-Research Original Questions

### Q91. STS temporary credentials

**Domain:** Identity and Access Management

An application running outside AWS needs temporary access to AWS resources without storing long-lived IAM user keys. Which mechanism should be considered?

A. AWS STS AssumeRole with an appropriate trust policy
B. A hard-coded root access key
C. A public S3 bucket ACL
D. CloudTrail Lake query federation

**Answer:** A. AWS STS AssumeRole with an appropriate trust policy

**Explanation:** The official guide calls out temporary credential mechanisms. STS AssumeRole avoids long-lived static credentials when trust and permissions are designed correctly.

### Q92. S3 presigned URL permissions

**Domain:** Identity and Access Management

A user creates a presigned URL for an S3 object. Which permission model applies?

A. The URL is limited by the permissions and expiration of the signer
B. The URL grants permanent public access
C. The URL bypasses bucket policies and KMS policies
D. The URL works even if the signer never had object access

**Answer:** A. The URL is limited by the permissions and expiration of the signer

**Explanation:** Presigned URLs inherit the signer’s allowed access and expire. They do not bypass authorization layers such as bucket or KMS policy requirements.

### Q93. IAM Roles Anywhere

**Domain:** Identity and Access Management

An on-premises workload with X.509 certificates needs temporary AWS credentials without embedding access keys. Which AWS service is designed for this pattern?

A. IAM Roles Anywhere
B. Amazon Cognito user pools
C. AWS Shield Advanced
D. AWS Artifact

**Answer:** A. IAM Roles Anywhere

**Explanation:** IAM Roles Anywhere is in the SCS-C03 IAM scope for external workloads using certificate-based trust anchors.

### Q94. Directory Service troubleshooting

**Domain:** Identity and Access Management

Federated workforce users cannot access assigned AWS accounts through IAM Identity Center after an AD integration change. Which evidence source helps troubleshoot authentication and permission-set activity?

A. CloudTrail and IAM Identity Center/Directory Service configuration review
B. S3 server access logging only
C. GuardDuty trusted IP list
D. KMS automatic rotation logs only

**Answer:** A. CloudTrail and IAM Identity Center/Directory Service configuration review

**Explanation:** The official IAM domain calls out troubleshooting authentication with CloudTrail, Cognito, Identity Center permission sets, and Directory Service.

### Q95. Verified Permissions versus IAM

**Domain:** Identity and Access Management

A retail application needs policies such as “store managers can approve refunds only for their store.” Which service is intended for app-level authorization?

A. Amazon Verified Permissions
B. AWS Organizations SCPs
C. VPC NACLs
D. AWS Shield Standard

**Answer:** A. Amazon Verified Permissions

**Explanation:** Verified Permissions/Cedar handles fine-grained application authorization. IAM/SCPs govern AWS API access.

### Q96. IAM Policy Simulator versus Access Analyzer

**Domain:** Identity and Access Management

A security engineer wants to test whether a specific principal would be allowed to call s3:PutObject under current policies. Which tool is the most direct simulator?

A. IAM Policy Simulator
B. Amazon Macie
C. AWS Artifact
D. CloudFront Functions

**Answer:** A. IAM Policy Simulator

**Explanation:** Policy Simulator is for evaluating effective permissions for specific API actions. Access Analyzer is better for external/unused access and policy validation findings.

### Q97. PrivateLink decision

**Domain:** Data Protection

A workload in private subnets must call a supported AWS service without traversing the public internet. Which design should be evaluated?

A. VPC endpoint / AWS PrivateLink
B. Public NAT plus open security group to 0.0.0.0/0
C. S3 website endpoint
D. CloudFront geo restriction only

**Answer:** A. VPC endpoint / AWS PrivateLink

**Explanation:** The official guide includes secure/private resource access such as PrivateLink and VPC endpoints.

### Q98. Verified Access versus Client VPN

**Domain:** Infrastructure Security

Users need browser-based access to internal applications with per-request identity and device posture evaluation. Which service is more aligned than a network-level VPN?

A. AWS Verified Access
B. AWS Client VPN only
C. S3 Access Points
D. Route 53 failover routing

**Answer:** A. AWS Verified Access

**Explanation:** Verified Access provides zero-trust application access decisions using identity/device context. Client VPN is a network access pattern.

### Q99. Direct Connect VIF choice

**Domain:** Infrastructure Security

A hybrid network must privately access VPC resources over Direct Connect. Which concept should the engineer understand?

A. Private virtual interfaces and Direct Connect gateway patterns
B. CloudFront signed cookies
C. SNS data protection policies
D. IAM access advisor only

**Answer:** A. Private virtual interfaces and Direct Connect gateway patterns

**Explanation:** Tutorials Dojo’s course outline includes Direct Connect and VIFs; hybrid connectivity appears in the infrastructure/data-in-transit scope.

### Q100. API Gateway resource policy

**Domain:** Infrastructure Security

An API Gateway REST API must be callable only from specific AWS accounts and source VPC endpoints. Which control is most relevant?

A. API Gateway resource policy with conditions
B. KMS key alias only
C. S3 lifecycle policy
D. CloudWatch dashboard

**Answer:** A. API Gateway resource policy with conditions

**Explanation:** API Gateway security includes authorizers, resource policies, private APIs, and mTLS. Resource policies can constrain callers and network origins.

### Q101. CloudFront signed URLs

**Domain:** Infrastructure Security

A private CloudFront distribution should let only authorized users download specific objects for a limited time. Which feature fits?

A. CloudFront signed URLs or signed cookies
B. AWS Config conformance packs
C. GuardDuty threat lists
D. CloudHSM cluster users

**Answer:** A. CloudFront signed URLs or signed cookies

**Explanation:** CloudFront signed URLs/cookies are edge authorization mechanisms for private content access.

### Q102. CloudFront field-level encryption

**Domain:** Infrastructure Security

A web application must encrypt only selected sensitive POST fields at the edge before they reach the origin. Which feature is relevant?

A. CloudFront field-level encryption
B. S3 Object Lock
C. AWS Artifact agreements
D. Route 53 health checks

**Answer:** A. CloudFront field-level encryption

**Explanation:** Field-level encryption is a CloudFront edge security feature called out by multiple study/tracker sources.

### Q103. EC2 IMDSv2 enforcement

**Domain:** Infrastructure Security

A security team wants to prevent new EC2 instances from using IMDSv1. Which preventive layer can help enforce this at account or deployment time?

A. Launch template/account defaults plus SCP or Config/CloudFormation controls as appropriate
B. Macie custom data identifiers
C. SNS FIFO topics
D. KMS aliases only

**Answer:** A. Launch template/account defaults plus SCP or Config/CloudFormation controls as appropriate

**Explanation:** IMDSv2 enforcement is a common compute-hardening pattern; governance controls can prevent or detect noncompliant launches.

### Q104. EC2 Image Builder

**Domain:** Infrastructure Security

A company wants repeatable hardened AMIs with tested patches and security baselines. Which service is most relevant?

A. EC2 Image Builder
B. Amazon Detective
C. AWS Artifact
D. Route 53 Resolver DNS Firewall

**Answer:** A. EC2 Image Builder

**Explanation:** EC2 Image Builder appears in compute security preparation topics for hardened images and golden AMI pipelines.

### Q105. Systems Manager Patch Manager

**Domain:** Infrastructure Security

A fleet of EC2 instances needs automated patch compliance reporting and remediation. Which service family fits?

A. AWS Systems Manager Patch Manager
B. AWS Shield Standard
C. Amazon Macie
D. AWS Private CA

**Answer:** A. AWS Systems Manager Patch Manager

**Explanation:** Patch Manager is part of Systems Manager and appears in security operations and compute-hardening study paths.

### Q106. State Manager drift correction

**Domain:** Governance

An organization wants instances to maintain a desired configuration and reapply it on a schedule. Which Systems Manager capability fits?

A. State Manager associations
B. CloudFront OAC
C. S3 Object Lock legal hold
D. KMS key deletion

**Answer:** A. State Manager associations

**Explanation:** State Manager is a desired-state configuration mechanism, reinforced by GitHub tracker notes and broader prep guides.

### Q107. CloudFormation Guard

**Domain:** Governance

A platform team wants to reject CloudFormation templates that create public S3 buckets before deployment. Which tool is relevant?

A. CloudFormation Guard or CloudFormation Hooks
B. Amazon Detective
C. GuardDuty trusted IP list
D. CloudTrail Lake query federation

**Answer:** A. CloudFormation Guard or CloudFormation Hooks

**Explanation:** CloudFormation Guard/Hooks and Config proactive checks are recurring governance-as-code controls.

### Q108. cfn-lint versus cfn-guard

**Domain:** Governance

Which distinction is most accurate?

A. cfn-lint checks template syntax/best-practice issues; cfn-guard evaluates policy-as-code rules against templates
B. cfn-lint rotates KMS keys; cfn-guard stores CloudTrail logs
C. Both replace SCPs completely
D. Both are GuardDuty features

**Answer:** A. cfn-lint checks template syntax/best-practice issues; cfn-guard evaluates policy-as-code rules against templates

**Explanation:** SCS-C03 governance prep increasingly emphasizes knowing deployment-time tools and what each one does.

### Q109. Security Hub custom action

**Domain:** Detection

An analyst wants a button-like action from a Security Hub finding to trigger a remediation workflow. What integration pattern fits?

A. Security Hub custom action to EventBridge target
B. S3 Transfer Acceleration
C. KMS automatic rotation
D. ACM DNS validation

**Answer:** A. Security Hub custom action to EventBridge target

**Explanation:** Security Hub custom actions can emit events to EventBridge, which can trigger Lambda/Step Functions/SSM automation.

### Q110. Config remediation

**Domain:** Governance

A Config rule detects noncompliant security group ingress. The team wants automated correction. Which capability should they configure?

A. AWS Config remediation action with SSM Automation or supported remediation
B. CloudFront signed cookies
C. Macie allow list
D. IAM Access Advisor

**Answer:** A. AWS Config remediation action with SSM Automation or supported remediation

**Explanation:** Config remediation with SSM Automation is a recurring automation pattern.

### Q111. Audit Manager evidence

**Domain:** Governance

A compliance team needs to collect and map evidence against a control framework for an audit. Which service is most aligned?

A. AWS Audit Manager
B. AWS Artifact only
C. Amazon GuardDuty
D. Route 53 Resolver

**Answer:** A. AWS Audit Manager

**Explanation:** Artifact provides reports/agreements; Audit Manager helps collect and organize evidence for audits.

### Q112. Well-Architected review

**Domain:** Governance

A team wants to evaluate a workload against AWS security best practices and identify improvement items. Which tool should they use?

A. AWS Well-Architected Tool
B. Amazon Inspector SBOM export only
C. AWS Shield Standard
D. S3 Select

**Answer:** A. AWS Well-Architected Tool

**Explanation:** Well-Architected Tool supports workload reviews across pillars, including Security.

### Q113. Security Hub standards

**Domain:** Governance

A company wants continuous checks against security best-practice controls and CIS-style benchmarks. Which service provides this aggregation and standards view?

A. AWS Security Hub
B. Amazon Cognito
C. AWS Private CA
D. Route 53 Traffic Flow

**Answer:** A. AWS Security Hub

**Explanation:** Security Hub includes standards and control checks, aggregating findings from AWS security services.

### Q114. Config aggregator

**Domain:** Governance

A central security account needs visibility into AWS Config data across accounts and Regions. Which component is relevant?

A. AWS Config aggregator
B. CloudFront origin request policy
C. KMS grant token
D. S3 multipart upload

**Answer:** A. AWS Config aggregator

**Explanation:** Config aggregators centralize configuration data across accounts and Regions.

### Q115. SNS message data protection

**Domain:** Data Protection

Sensitive data may appear in messages published to an SNS topic. The company wants to audit or de-identify the data before delivery. What feature fits?

A. Amazon SNS message data protection
B. AWS Shield Advanced
C. IAM Roles Anywhere
D. Route 53 DNSSEC

**Answer:** A. Amazon SNS message data protection

**Explanation:** SNS message data protection is explicitly added in SCS-C03 data masking scope.

### Q116. CloudWatch Logs data protection

**Domain:** Data Protection

Application logs contain email addresses and credit card numbers. Viewers should see masked values in CloudWatch Logs. Which feature is relevant?

A. CloudWatch Logs data protection policy
B. S3 Transfer Acceleration
C. EC2 Image Builder
D. VPC Reachability Analyzer only

**Answer:** A. CloudWatch Logs data protection policy

**Explanation:** CloudWatch Logs data protection masks sensitive data in log events and supports audit destinations.

### Q117. KMS deletion window

**Domain:** Data Protection

A customer managed KMS key is scheduled for deletion. What should the engineer remember?

A. Deletion has a waiting period, and encrypted data may become unrecoverable after key deletion
B. Deletion is immediate for all key types with no waiting period
C. Deletion only removes aliases and never affects data access
D. CloudTrail disables deletion risk

**Answer:** A. Deletion has a waiting period, and encrypted data may become unrecoverable after key deletion

**Explanation:** KMS deletion is dangerous because data encrypted under the key can become unrecoverable once the key is deleted.

### Q118. CloudHSM versus KMS

**Domain:** Data Protection

Which requirement most strongly points to CloudHSM rather than ordinary AWS-managed KMS key storage?

A. Customer-managed dedicated HSM control and direct HSM cluster access requirements
B. Basic S3 default encryption
C. CloudWatch alarm notification
D. Security Hub standards dashboard

**Answer:** A. Customer-managed dedicated HSM control and direct HSM cluster access requirements

**Explanation:** CloudHSM is relevant when dedicated HSM control or specific compliance/application integration requirements exceed standard KMS.

### Q119. Secrets Manager versus Parameter Store

**Domain:** Data Protection

A database credential needs native rotation workflow support. Which service is usually more direct?

A. AWS Secrets Manager
B. Systems Manager Parameter Store standard parameter only
C. AWS Artifact
D. Route 53 Resolver

**Answer:** A. AWS Secrets Manager

**Explanation:** Secrets Manager is built for secrets lifecycle and rotation; Parameter Store can store config/secrets but rotation support differs.

### Q120. Private CA for mTLS

**Domain:** Data Protection

Internal services require private certificates for mutual TLS at scale. Which AWS service is most relevant?

A. AWS Private Certificate Authority
B. AWS Shield Standard
C. Amazon Detective
D. AWS Cost Explorer

**Answer:** A. AWS Private Certificate Authority

**Explanation:** AWS Private CA issues private X.509 certificates for internal TLS and mTLS use cases.

### Q121. Ordering: exposed key response

**Domain:** Incident Response

Which order is most appropriate after discovering an exposed IAM access key used to access S3? 1. Investigate CloudTrail scope. 2. Disable/rotate the exposed key. 3. Preserve relevant logs. 4. Tighten affected permissions and validate workload recovery.

A. 2, 3, 1, 4
B. 1, 4, 2, 3
C. 4, 1, 3, 2
D. 3, 4, 1, 2

**Answer:** A. 2, 3, 1, 4

**Explanation:** Contain the credential first, preserve evidence, investigate scope, then remediate permissions and validate recovery.

### Q122. Ordering: EC2 forensic containment

**Domain:** Incident Response

Which order is most evidence-friendly for suspected EC2 compromise? 1. Analyze copies. 2. Isolate network access. 3. Snapshot/acquire disk evidence. 4. Preserve logs/metadata.

A. 2, 3, 4, 1
B. 1, 2, 3, 4
C. 3, 1, 2, 4
D. 4, 1, 2, 3

**Answer:** A. 2, 3, 4, 1

**Explanation:** Contain without destroying evidence, acquire/preserve evidence, then analyze copies.

### Q123. Matching: service role in pipeline

**Domain:** Detection

Which mapping is most accurate for an investigation pipeline?

A. GuardDuty detects threats; Security Hub aggregates findings; Detective investigates relationships; EventBridge triggers automation
B. GuardDuty stores compliance reports; Artifact blocks network traffic; KMS queries logs; Macie patches instances
C. Inspector finds PII in S3; Macie scans EC2 packages; Detective rotates keys; Security Hub issues certificates
D. CloudTrail blocks DDoS; WAF stores audit reports; Shield manages identities; Cognito scans malware

**Answer:** A. GuardDuty detects threats; Security Hub aggregates findings; Detective investigates relationships; EventBridge triggers automation

**Explanation:** A recurring theme across sources is knowing where each security service sits in detection, aggregation, investigation, and response.

### Q124. Matching: governance tools

**Domain:** Governance

Which mapping is most accurate?

A. Artifact = AWS compliance reports; Audit Manager = audit evidence collection; Config = resource compliance; Well-Architected Tool = workload best-practice review
B. Artifact = malware scanning; Audit Manager = DNS firewall; Config = certificate issuance; Well-Architected = KMS rotation
C. Artifact = IAM simulation; Audit Manager = presigned URLs; Config = object lock; Well-Architected = DDoS cost protection
D. Artifact = CloudFront authorization; Audit Manager = SAML federation; Config = GuardDuty finding types; Well-Architected = Athena SQL

**Answer:** A. Artifact = AWS compliance reports; Audit Manager = audit evidence collection; Config = resource compliance; Well-Architected Tool = workload best-practice review

**Explanation:** Governance questions often test service boundaries and which compliance tool fits which job.

### Q125. OCSF third-party ingestion

**Domain:** Detection

A SOC wants AWS and third-party security events normalized into a common schema for downstream analytics. Which concept should be recognized?

A. OCSF, commonly associated with Amazon Security Lake integrations
B. S3 Transfer Acceleration
C. IAM access key rotation only
D. Route 53 geoproximity routing

**Answer:** A. OCSF, commonly associated with Amazon Security Lake integrations

**Explanation:** OCSF and Security Lake are explicit SCS-C03 additions around third-party/security-event integration.

### Q126. Third-party WAF rules

**Domain:** Infrastructure Security

A company wants to use managed third-party rule intelligence with AWS edge protections. Which area of the blueprint does this align with?

A. Integrations with edge services and third-party services in Infrastructure Security
B. KMS imported key material only
C. Audit Manager evidence upload
D. S3 object lifecycle expiration

**Answer:** A. Integrations with edge services and third-party services in Infrastructure Security

**Explanation:** The SCS-C03 appendix calls out edge/third-party integrations including OCSF and third-party WAF rules.

### Q127. Amazon Q/SageMaker security

**Domain:** Infrastructure Security

A development team introduces AI coding and ML notebook workflows. What should the security review include?

A. IAM permissions, data access boundaries, logging, encryption, network isolation, and service-specific guardrails
B. Only S3 static website hosting
C. Only Route 53 failover policy
D. Only public IAM users

**Answer:** A. IAM permissions, data access boundaries, logging, encryption, network isolation, and service-specific guardrails

**Explanation:** New C03/emerging-topic resources reinforce GenAI/ML security controls even when exact services vary by exam form.

### Q128. Practice-review method

**Domain:** Exam Strategy

A candidate repeatedly misses KMS and IAM scenario questions. What is the best study response?

A. Review explanations, map why each wrong option is wrong, then read the matching AWS docs and create targeted drills
B. Memorize answer letters from one practice test
C. Ignore weak topics once the total score improves
D. Search for actual exam dumps

**Answer:** A. Review explanations, map why each wrong option is wrong, then read the matching AWS docs and create targeted drills

**Explanation:** Legitimate community resources consistently recommend practice-driven weak-area review, not memorization or dumps.

### Q129. Long scenario reading

**Domain:** Exam Strategy

For long SCS-C03 scenario questions with two plausible answers, what is the most reliable approach?

A. Identify constraints such as multi-account, least operational effort, immediate containment, managed service, or no application changes
B. Pick the newest AWS service every time
C. Always choose Lambda
D. Ignore qualifiers and read only the last sentence

**Answer:** A. Identify constraints such as multi-account, least operational effort, immediate containment, managed service, or no application changes

**Explanation:** Scenario questions often turn on constraints and tradeoffs. This is emphasized in official and community prep resources.

### Q130. New-topic risk handling

**Domain:** Exam Strategy

Some pass reports say they saw few GenAI or data-masking questions, while official C03 additions list them. How should you study?

A. Cover them enough to answer blueprint-level scenarios, but prioritize repeated heavy areas like IAM/KMS/detection
B. Ignore all new topics completely
C. Study only GenAI and skip IAM/KMS
D. Assume every exam form is identical

**Answer:** A. Cover them enough to answer blueprint-level scenarios, but prioritize repeated heavy areas like IAM/KMS/detection

**Explanation:** Individual exam forms vary. Official blueprint additions still matter, but repeated heavy concepts should dominate study time.

## Supplemental Research Pass: GitHub, Reddit, and Study-Plan Signals

Additional legitimate topic signals checked in this pass:

- maxpoe/aws-security-specialty-study-notes: https://github.com/maxpoe/aws-security-specialty-study-notes — current SCS-C03 notes, domain files, C02-to-C03 changes, and question-format reminders.
- kiquetal/aws-security-speciality-2026: https://github.com/kiquetal/aws-security-speciality-2026 — structured SCS-C03 notes, service deep dives, attack roadmap, and exam-day topic map.
- Reddit pass report, AWS Certified Security Speciality SCS-C03 - passed: https://www.reddit.com/r/AWSCertifications/comments/1r3qnpg/aws_certified_security_speciality_scsc03_passed/ — broad topic emphasis only: Organizations, GuardDuty/CloudTrail org setup, IAM Identity Center, KMS MRKs, S3, WAF/Shield, Macie, Cognito, Service Catalog, IoT.
- Reddit pass report, Passed AWS Security - Specialty SCS-C03: https://www.reddit.com/r/AWSCertifications/comments/1t0m404/passed_aws_security_specialty_scsc03/ — service-integration emphasis only: CloudWatch alarms to SNS, centralized S3 to Athena, GuardDuty to EventBridge/SNS, Config to SSM Automation.
- Reddit pass report, Passed AWS Certified Security - Specialty: https://www.reddit.com/r/AWSCertifications/comments/1vxzci1/passed_aws_certified_security_specialty/ — broad emphasis only: GuardDuty, KMS, IAM, easier SG/NACL, lighter Inspector/Detective on that form.
- Pluralsight SCS-C03 change overview: https://www.pluralsight.com/resources/blog/cloud/new-aws-scs-c03-exam — current-version change signal and study planning.
- Playing AWS renewal report: https://www.playingaws.com/posts/how-i-renewed-the-aws-certified-security-specialty-scs-c03/ — security-lifecycle study framing across governance, identity, data, infrastructure, detection, and response.
- Pruvos SCS-C03 difficulty note: https://www.pruvos.com/blog/aws-security-specialty-scs-c03-harder-than-people-say — scenario-heavy exam signal and need for applied tradeoff practice.

Signals added from this supplemental pass:

- Organization-level enablement is repeatedly important: delegated administrator, auto-enable behavior, regional service behavior, and centralized member-account visibility.
- Integration chains matter more than isolated definitions: GuardDuty to EventBridge, EventBridge to SNS/Step Functions, Config to SSM Automation, CloudTrail/S3 to Athena.
- IAM Identity Center federation shows up as practical workflow knowledge: external IdP, SAML/OIDC, permission sets, AD, and user/group assignment.
- KMS still appears as a decision-tree topic: MRKs, cross-account policies, key policies, grants, rotation/deletion, and service integrations.
- Long scenario questions often hinge on qualifiers: organization-wide, least operational overhead, preserve evidence, no application change, centralized governance, immediate containment.

## Supplemental Original Questions

### Q131. Organization GuardDuty rollout

**Domain:** Detection

A security account must manage GuardDuty findings across all current and future AWS accounts in an organization with minimal per-account setup. What should the team configure?

A. Enable GuardDuty separately in each member account using local IAM users
B. Designate a delegated GuardDuty administrator and configure organization auto-enable where required
C. Send all VPC Flow Logs to one bucket and disable GuardDuty member accounts
D. Create a CloudTrail Lake event data store in only the management account

**Answer:** B. Designate a delegated GuardDuty administrator and configure organization auto-enable where required

**Explanation:** Organization-wide GuardDuty administration is handled through delegated administration and organization/member configuration, not by manually managing every member account.

### Q132. IAM Identity Center federation workflow

**Domain:** Identity and Access Management

A company wants workforce users from an external SAML identity provider to access multiple AWS accounts through centrally assigned permission sets. Which service is the main fit?

A. IAM Identity Center
B. Cognito identity pools
C. AWS Directory Service Simple AD only
D. IAM Roles Anywhere

**Answer:** A. IAM Identity Center

**Explanation:** IAM Identity Center is the workforce-access service for external IdP federation, account assignments, and permission sets.

### Q133. GuardDuty notification chain

**Domain:** Detection

GuardDuty generates high-severity findings and the security team wants near-real-time notifications plus workflow fanout. Which chain is most appropriate?

A. GuardDuty finding -> EventBridge rule -> SNS or Step Functions
B. GuardDuty finding -> AWS Artifact report -> SNS
C. GuardDuty finding -> S3 Object Lock -> IAM Access Analyzer
D. GuardDuty finding -> CloudFormation Guard -> Athena

**Answer:** A. GuardDuty finding -> EventBridge rule -> SNS or Step Functions

**Explanation:** GuardDuty findings are event sources for EventBridge, which can route to notification and orchestration targets.

### Q134. Centralized log query

**Domain:** Detection

Multiple accounts deliver CloudTrail logs to a central S3 bucket. Analysts need SQL-style investigation across those logs. What is the simplest common pattern?

A. Query the centralized S3 logs with Athena and ensure the log bucket/KMS permissions allow the analyst role
B. Use AWS Artifact to query the logs
C. Use IAM Access Analyzer as the SQL engine
D. Query GuardDuty directly for every CloudTrail event

**Answer:** A. Query the centralized S3 logs with Athena and ensure the log bucket/KMS permissions allow the analyst role

**Explanation:** S3 plus Athena is a common centralized-log analysis pattern; access often depends on both S3 and KMS permissions.

### Q135. Config remediation chain

**Domain:** Security Foundations and Governance

An AWS Config managed rule detects public S3 buckets. The team wants automatic correction using an approved runbook. Which target is most appropriate?

A. SSM Automation remediation
B. AWS Artifact
C. CloudTrail Insights
D. Macie custom data identifier

**Answer:** A. SSM Automation remediation

**Explanation:** AWS Config can trigger remediation actions, commonly through SSM Automation documents.

### Q136. Multi-Region KMS key expectation

**Domain:** Data Protection

A workload uses a multi-Region KMS key for disaster recovery. What must the team remember about permissions?

A. Replica keys automatically inherit every future key-policy change from the primary key
B. Key policies and grants must be managed for the relevant key in each Region
C. Multi-Region keys cannot be used with S3
D. IAM policies are ignored for all multi-Region keys

**Answer:** B. Key policies and grants must be managed for the relevant key in each Region

**Explanation:** Multi-Region keys share key material, but regional keys still have regional policy and operational considerations.

### Q137. Service Catalog governance

**Domain:** Security Foundations and Governance

A platform team wants developers to launch only pre-approved infrastructure products while preserving self-service deployment. Which service best fits?

A. AWS Service Catalog
B. Amazon Detective
C. AWS Shield Advanced
D. CloudTrail Lake

**Answer:** A. AWS Service Catalog

**Explanation:** Service Catalog provides governed portfolios of approved products for self-service provisioning.

### Q138. IoT device authentication

**Domain:** Infrastructure Security

An IoT fleet must authenticate devices with certificates and restrict each device to its own MQTT topics. Which controls are most relevant?

A. IoT certificates and IoT policies with topic-level restrictions
B. Cognito hosted UI only
C. CloudFront signed cookies only
D. AWS Artifact reports

**Answer:** A. IoT certificates and IoT policies with topic-level restrictions

**Explanation:** AWS IoT commonly uses X.509 certificates and IoT policies for device authentication and authorization.

### Q139. Aurora TLS enforcement

**Domain:** Data Protection

A security requirement says database clients must use encrypted connections to Amazon Aurora. Which control should be checked first?

A. Database parameter/settings and client configuration that require TLS/SSL connections
B. S3 Block Public Access
C. WAF managed rules
D. IAM Access Analyzer unused access findings

**Answer:** A. Database parameter/settings and client configuration that require TLS/SSL connections

**Explanation:** Aurora in-transit encryption is enforced at the database/client connection layer, not through WAF or S3 controls.

### Q140. Secrets Manager vs Parameter Store

**Domain:** Data Protection

A database credential must rotate automatically using a Lambda rotation function. Which service is usually the best fit?

A. AWS Secrets Manager
B. SSM Parameter Store standard parameter
C. AWS Artifact
D. AWS Config advanced query

**Answer:** A. AWS Secrets Manager

**Explanation:** Secrets Manager has native rotation workflows for secrets such as database credentials.

### Q141. Preserve evidence during EC2 containment

**Domain:** Incident Response

An EC2 instance is suspected of compromise. The team must stop outbound traffic while preserving evidence. What is the best first action?

A. Apply an isolation security group and snapshot attached EBS volumes before destructive changes
B. Immediately terminate the instance and delete all volumes
C. Disable CloudTrail to reduce noise
D. Rotate only the application password and leave networking unchanged

**Answer:** A. Apply an isolation security group and snapshot attached EBS volumes before destructive changes

**Explanation:** Incident response favors containment plus evidence preservation before rebuild or termination.

### Q142. Credential leak response

**Domain:** Incident Response

An IAM access key was accidentally published. What should the response prioritize?

A. Deactivate/rotate the key, identify usage through CloudTrail, and remove unauthorized changes
B. Delete all CloudTrail logs to protect the user
C. Add the key to a trusted IP list
D. Create a broader administrator policy for the same user

**Answer:** A. Deactivate/rotate the key, identify usage through CloudTrail, and remove unauthorized changes

**Explanation:** Exposed long-term credentials require revocation/rotation and investigation of any use during the exposure window.

### Q143. WAF versus Shield

**Domain:** Infrastructure Security

A web application needs protection from SQL injection and suspicious HTTP request patterns. Which service is most directly relevant?

A. AWS WAF
B. AWS Shield Standard only
C. Amazon Macie
D. AWS Artifact

**Answer:** A. AWS WAF

**Explanation:** WAF handles layer 7 HTTP/S inspection. Shield is primarily for DDoS protection.

### Q144. Cognito use case

**Domain:** Identity and Access Management

A mobile app needs user sign-up, sign-in, and token-based access to the app backend. Which identity service is usually the best fit?

A. Amazon Cognito
B. IAM Identity Center
C. AWS Organizations
D. IAM Access Analyzer

**Answer:** A. Amazon Cognito

**Explanation:** Cognito is designed for customer/application user authentication and federation, while IAM Identity Center is workforce access.

### Q145. Ordering-style readiness

**Domain:** Exam Strategy

Why should SCS-C03 preparation include workflow sequencing questions, not only single-answer facts?

A. The current exam guide includes ordering and matching question types
B. The exam no longer includes multiple-choice questions
C. AWS services can only be learned in alphabetical order
D. Workflow sequencing is unrelated to incident response

**Answer:** A. The current exam guide includes ordering and matching question types

**Explanation:** SCS-C03 can include ordering and matching, so practice should cover sequences such as federation setup and incident response.

### Q146. Service comparison in findings workflow

**Domain:** Detection

Which pairing is most accurate for a findings workflow?

A. Security Hub aggregates findings; Detective helps investigate relationships around findings
B. Detective creates SCPs; Security Hub rotates KMS keys
C. Macie deploys WAF rules; Inspector stores compliance reports
D. Access Analyzer performs malware scans; GuardDuty provisions IAM users

**Answer:** A. Security Hub aggregates findings; Detective helps investigate relationships around findings

**Explanation:** Many scenario questions test whether you can place each security service correctly in the workflow.

### Q147. Least operational overhead

**Domain:** Exam Strategy

A scenario asks for organization-wide security visibility with the least operational overhead. What clue should you look for first?

A. Whether the service supports AWS Organizations delegated administration or central aggregation
B. Whether every member account can create local IAM users
C. Whether the solution avoids managed AWS services
D. Whether logs can be manually emailed to auditors

**Answer:** A. Whether the service supports AWS Organizations delegated administration or central aggregation

**Explanation:** "Least operational overhead" often points toward native centralized AWS Organizations integrations.

### Q148. Inspector scope

**Domain:** Detection

Which finding type is Amazon Inspector most suited to produce?

A. Vulnerability findings for EC2, ECR images, or Lambda functions
B. PII classification findings for arbitrary S3 objects
C. DDoS cost protection recommendations
D. Cross-account KMS key grants

**Answer:** A. Vulnerability findings for EC2, ECR images, or Lambda functions

**Explanation:** Inspector focuses on workload vulnerability and exposure assessment; Macie is for sensitive-data discovery.

### Q149. S3 Object Lock

**Domain:** Data Protection

A compliance archive in S3 must prevent object deletion or overwrite for a fixed retention period. Which feature is most relevant?

A. S3 Object Lock in compliance or governance mode
B. S3 Transfer Acceleration
C. S3 Select
D. S3 Intelligent-Tiering only

**Answer:** A. S3 Object Lock in compliance or governance mode

**Explanation:** Object Lock provides WORM-style retention controls for S3 objects.

### Q150. Scenario-heavy study method

**Domain:** Exam Strategy

What is the best way to use public pass reports without crossing into dump memorization?

A. Extract repeated topic signals, study the official docs, and practice original scenario questions
B. Memorize recalled wording and answer letters
C. Ignore official AWS domain weights
D. Study only one Reddit post because every exam form is identical

**Answer:** A. Extract repeated topic signals, study the official docs, and practice original scenario questions

**Explanation:** Legitimate preparation uses topic patterns and official documentation, not copied live-exam content.
