# AWS Certified Security - Specialty SCS-C03 Original Practice Bank

This file contains original practice questions written for study use. It does not reproduce Udemy course questions, answers, or explanations.

Reference scope:
- AWS Certified Security - Specialty SCS-C03 exam guide: https://docs.aws.amazon.com/aws-certification/latest/security-specialty-03/security-specialty-03.html
- AWS SCS-C02 to SCS-C03 comparison appendix: https://docs.aws.amazon.com/aws-certification/latest/security-specialty-03/security-specialty-03-appendix-b.html

Current SCS-C03 domains:
- Domain 1: Detection, 16%
- Domain 2: Incident Response, 14%
- Domain 3: Infrastructure Security, 18%
- Domain 4: Identity and Access Management, 20%
- Domain 5: Data Protection, 18%
- Domain 6: Security Foundations and Governance, 14%

---

## Domain 1: Detection

### Q1. Security finding aggregation

A company uses GuardDuty, Macie, and Inspector in 80 AWS accounts. The security team wants a centralized place to view findings, enable security standards, and delegate administration to a security account. What should they configure?

A. Amazon Detective in every account  
B. AWS Security Hub with delegated administration  
C. AWS Config custom rules only in the management account  
D. CloudWatch dashboards in each member account  

**Answer: B**

**Explanation:** Security Hub is designed to aggregate security findings and standards across accounts and Regions, commonly through AWS Organizations delegated administration.

### Q2. Organization-wide API audit trail

An enterprise must retain management API activity from every AWS account and Region for audit investigations. The setup should require minimal per-account configuration. What is the best solution?

A. Create one CloudTrail trail manually in every member account  
B. Create an organization trail that applies to all Regions  
C. Enable VPC Flow Logs for every VPC  
D. Use AWS X-Ray on all applications  

**Answer: B**

**Explanation:** A CloudTrail organization trail captures account activity across member accounts and can be configured for all Regions from a central account.

### Q3. DNS tunneling investigation

A SOC analyst suspects DNS tunneling from EC2 instances in private subnets. Which two log sources are most useful? Choose two.

A. Route 53 Resolver query logs  
B. VPC Flow Logs  
C. AWS Backup job reports  
D. IAM credential reports  
E. S3 inventory reports  

**Answer: A, B**

**Explanation:** Resolver query logs show DNS lookups, while VPC Flow Logs help correlate network traffic from the same resources.

### Q4. Missing Lambda logs

A Lambda function is invoked successfully, but no log streams appear in CloudWatch Logs. What should you check first?

A. The Lambda execution role permissions  
B. The function's public IP address  
C. Whether S3 Object Lock is enabled  
D. Whether AWS Shield Advanced is enabled  

**Answer: A**

**Explanation:** Lambda needs execution role permissions to write logs to CloudWatch Logs. Missing permissions or log group issues are common causes.

### Q5. Central log lake

A company wants to normalize and store security logs from multiple AWS services in a central account using an open cybersecurity schema. Which service is the best fit?

A. AWS Security Lake  
B. Amazon S3 Transfer Acceleration  
C. AWS Artifact  
D. Amazon Cognito  

**Answer: A**

**Explanation:** Security Lake centralizes security data and normalizes it using OCSF, which is relevant to updated SCS-C03 detection coverage.

### Q6. CloudWatch alert design

An application team needs an alert when failed authentication attempts exceed a threshold in application logs. Which approach is most direct?

A. Create a CloudWatch Logs metric filter and alarm  
B. Enable S3 default encryption  
C. Configure an IAM permissions boundary  
D. Create a new AWS Organizations OU  

**Answer: A**

**Explanation:** Metric filters can extract metric data from log events, and CloudWatch alarms can notify when thresholds are breached.

### Q7. GuardDuty suppression

GuardDuty repeatedly reports expected port probes from an approved vulnerability scanner. The security team wants to reduce noise without disabling the detector. What should they use?

A. Suppression rules based on finding attributes  
B. Delete the GuardDuty service-linked role  
C. Turn off CloudTrail management events  
D. Remove all security groups from scanned resources  

**Answer: A**

**Explanation:** Suppression rules can archive findings that match known, accepted patterns while keeping GuardDuty active for other findings.

### Q8. Network telemetry for rejected traffic

An engineer needs visibility into accepted and rejected IP traffic for a subnet. What should they enable?

A. VPC Flow Logs  
B. CloudTrail data events only  
C. AWS Config snapshots only  
D. Amazon Inspector SBOM export  

**Answer: A**

**Explanation:** VPC Flow Logs capture metadata about IP traffic accepted or rejected by network interfaces, subnets, or VPCs.

### Q9. Security monitoring across accounts

A company wants to automatically enable GuardDuty for new organization accounts. What is the most scalable approach?

A. Configure GuardDuty delegated administrator and auto-enable for organization accounts  
B. Ask each account owner to create detectors manually  
C. Put all workloads in a single account  
D. Use IAM Access Analyzer instead of threat detection  

**Answer: A**

**Explanation:** GuardDuty integrates with AWS Organizations and supports delegated administration with auto-enable options.

### Q10. CloudTrail data event cost control

A team needs S3 object-level audit logging only for sensitive buckets. They are concerned about cost and log volume. What should they do?

A. Enable CloudTrail data events only for the required buckets  
B. Enable all data events for every bucket in every account  
C. Disable CloudTrail management events  
D. Use VPC Flow Logs to capture S3 object names  

**Answer: A**

**Explanation:** CloudTrail data events are high-volume. Scope them to the required resources to meet audit needs without unnecessary cost.

---

## Domain 2: Incident Response

### Q11. EC2 containment runbook

A team wants a repeatable way to isolate a suspicious EC2 instance by changing security groups and collecting metadata. The workflow should be auditable and runnable by responders. What should they use?

A. AWS Systems Manager Automation  
B. Amazon Route 53 health checks  
C. S3 Lifecycle rules  
D. AWS Billing alerts  

**Answer: A**

**Explanation:** Systems Manager Automation supports repeatable operational runbooks for incident response actions.

### Q12. Suspected access key compromise

GuardDuty reports that an IAM access key is being used from an unusual location. What is the best first containment step?

A. Deactivate or rotate the access key  
B. Delete all CloudTrail logs  
C. Increase the user's permissions  
D. Turn off GuardDuty findings  

**Answer: A**

**Explanation:** For suspected credential compromise, revoke or rotate the affected credentials quickly to limit further unauthorized use.

### Q13. Evidence preservation

Before terminating a compromised EC2 instance, which two actions help preserve evidence? Choose two.

A. Snapshot attached EBS volumes  
B. Preserve relevant CloudTrail, VPC Flow Logs, and application logs  
C. Delete the instance profile  
D. Disable all logging to reduce noise  
E. Remove the account from AWS Organizations  

**Answer: A, B**

**Explanation:** Disk snapshots and logs are key forensic artifacts. Terminating resources before preserving evidence can make root cause analysis harder.

### Q14. Root cause analysis

An investigator needs to analyze relationships among IAM roles, IP addresses, API calls, and GuardDuty findings. Which service is most relevant?

A. Amazon Detective  
B. AWS Certificate Manager  
C. Amazon Route 53 Resolver  
D. AWS Service Catalog  

**Answer: A**

**Explanation:** Detective helps investigate security findings by visualizing relationships and activity across AWS telemetry sources.

### Q15. Incident simulation

A company wants to validate response playbooks by injecting controlled failures into workloads. Which service is purpose-built for this?

A. AWS Fault Injection Service  
B. AWS Artifact  
C. Amazon Macie  
D. AWS CloudHSM  

**Answer: A**

**Explanation:** AWS Fault Injection Service helps teams run controlled experiments to validate operational and resilience procedures.

### Q16. Forensic log storage

During an incident, responders need to store forensic artifacts where they cannot be overwritten or deleted during the retention period. Which S3 feature helps meet this need?

A. S3 Object Lock  
B. S3 Select  
C. S3 static website hosting  
D. S3 Transfer Acceleration  

**Answer: A**

**Explanation:** S3 Object Lock supports write-once-read-many retention and legal holds for evidence preservation.

### Q17. Automated remediation

Security Hub receives a finding that a public S3 bucket policy was created. The company wants automatic remediation after approval. Which combination is appropriate?

A. EventBridge rule, approval workflow, and Systems Manager Automation or Lambda  
B. Route 53 weighted routing and AWS Backup  
C. AWS Artifact and Cost Explorer  
D. Amazon Cognito and CloudFront signed URLs  

**Answer: A**

**Explanation:** Findings can trigger EventBridge rules, which can start remediation workflows through Lambda, Step Functions, or Systems Manager.

### Q18. Blast radius reduction

An incident response plan calls for minimizing blast radius before incidents happen. Which design helps most?

A. Separate workloads into multiple accounts with least-privilege roles  
B. Share one administrator role across all workloads  
C. Disable service control policies  
D. Store production and development secrets in one plaintext file  

**Answer: A**

**Explanation:** Account isolation and least privilege reduce lateral movement and help contain incidents.

### Q19. Compromised instance role

An EC2 instance role appears to be abused. Which action best limits further use while preserving the instance for investigation?

A. Remove or restrict the role permissions and isolate the instance network path  
B. Delete all EBS volumes immediately  
C. Add AdministratorAccess to the role  
D. Disable CloudTrail in the Region  

**Answer: A**

**Explanation:** Restricting credentials and isolating network access helps contain the event while preserving evidence.

### Q20. Validating findings

A GuardDuty finding reports cryptocurrency mining behavior on an EC2 instance. What should the responder do before broad remediation?

A. Validate scope and impact using logs, instance metadata, and related findings  
B. Delete every instance in the account  
C. Disable GuardDuty to prevent duplicate findings  
D. Ignore the alert because GuardDuty findings are always false positives  

**Answer: A**

**Explanation:** SCS-C03 emphasizes validating findings from AWS security services to understand scope and impact before response.

---

## Domain 3: Infrastructure Security

### Q21. Web exploit protection

An internet-facing application receives SQL injection attempts and request floods. What should be placed at the edge?

A. AWS WAF managed rules and rate-based rules on CloudFront or an ALB  
B. IAM Identity Center permission sets  
C. S3 Glacier Vault Lock only  
D. AWS DataSync task logging  

**Answer: A**

**Explanation:** AWS WAF can block common web exploits and rate-limit abusive clients before traffic reaches the application.

### Q22. DDoS response support

A critical public application needs enhanced DDoS protection, cost protection, and access to the AWS DDoS Response Team. What should be enabled?

A. AWS Shield Advanced  
B. Amazon Macie  
C. AWS Audit Manager  
D. AWS CloudHSM  

**Answer: A**

**Explanation:** Shield Advanced provides enhanced DDoS protections and support features for protected resources.

### Q23. Container image scanning

A CI/CD pipeline needs vulnerability scanning for container images before deployment. Which AWS service is most relevant?

A. Amazon Inspector  
B. AWS Backup  
C. Amazon Route 53 Resolver  
D. AWS Organizations  

**Answer: A**

**Explanation:** Amazon Inspector scans supported workloads and container images for software vulnerabilities.

### Q24. Secure administrative access

Administrators need shell access to private EC2 instances without opening inbound SSH from the internet. Which option is preferred?

A. AWS Systems Manager Session Manager  
B. Public SSH from 0.0.0.0/0  
C. Sharing the EC2 key pair in email  
D. Disabling host logging  

**Answer: A**

**Explanation:** Session Manager provides audited access without requiring inbound SSH exposure or public IP addresses.

### Q25. Central network filtering

A security team wants managed stateful and stateless filtering for VPC traffic at scale. Which service should they evaluate?

A. AWS Network Firewall  
B. Amazon Cognito  
C. AWS Secrets Manager  
D. AWS Artifact  

**Answer: A**

**Explanation:** AWS Network Firewall provides managed network traffic filtering and inspection for VPC architectures.

### Q26. Private application access

A company wants users to access private web applications without a traditional VPN, based on identity and device posture. Which service is most relevant?

A. AWS Verified Access  
B. Amazon S3 Object Lambda  
C. AWS Backup Vault Lock  
D. Amazon EFS Lifecycle Management  

**Answer: A**

**Explanation:** Verified Access provides identity-aware access to private applications without requiring a VPN.

### Q27. Unnecessary network access

Which tool can help identify unintended network paths to resources in a VPC?

A. VPC Network Access Analyzer  
B. AWS Cost Explorer  
C. Amazon Textract  
D. AWS Artifact agreements  

**Answer: A**

**Explanation:** Network Access Analyzer can evaluate network access paths against intended access requirements.

### Q28. Hardened images

A platform team wants repeatable hardened AMIs that include security agents and baseline configuration. Which service can help automate this?

A. EC2 Image Builder  
B. AWS DataSync  
C. Amazon Connect  
D. AWS Billing Conductor  

**Answer: A**

**Explanation:** EC2 Image Builder automates creation, testing, and distribution of AMIs and container images.

### Q29. GenAI workload protection

A new internal LLM application must reduce prompt injection and unsafe output risks. Which security focus aligns with SCS-C03 updates?

A. LLM guardrails and GenAI OWASP-style protections  
B. S3 static website hosting configuration  
C. Memorizing packet-level TCP flags  
D. Disabling all content filtering for speed  

**Answer: A**

**Explanation:** SCS-C03 adds explicit coverage for protections and guardrails for generative AI applications.

### Q30. Hybrid network encryption

A company requires encrypted connectivity between its data center and AWS over Direct Connect. Which feature should be evaluated where supported?

A. MACsec  
B. S3 Object Lock  
C. IAM Access Analyzer  
D. AWS Audit Manager  

**Answer: A**

**Explanation:** MACsec can provide Layer 2 encryption for supported Direct Connect connections and devices.

---

## Domain 4: Identity and Access Management

### Q31. Workforce SSO

Employees need single sign-on to multiple AWS accounts using an external identity provider. Which service should be used?

A. AWS IAM Identity Center  
B. Amazon GuardDuty  
C. AWS Network Firewall  
D. Amazon S3 Inventory  

**Answer: A**

**Explanation:** IAM Identity Center supports workforce federation and permission sets across AWS accounts and applications.

### Q32. Temporary credentials

An application running outside AWS needs temporary AWS credentials without storing long-lived access keys. What should it use?

A. AWS STS AssumeRole  
B. A root user access key  
C. A shared administrator password  
D. Public-read S3 bucket policies  

**Answer: A**

**Explanation:** AWS STS issues temporary credentials for role assumption and federation patterns.

### Q33. Least privilege delegation

A platform team allows developers to create roles but must prevent them from granting permissions beyond an approved maximum. What should be used?

A. Permissions boundaries  
B. CloudFront signed cookies  
C. S3 replication rules  
D. Route 53 failover routing  

**Answer: A**

**Explanation:** Permissions boundaries define the maximum effective permissions for IAM principals.

### Q34. Cross-account access

Account A needs to allow a role in Account B to read one S3 bucket. Which policy combination is commonly required?

A. A bucket policy trusting the external role and an identity policy permitting the action  
B. A security group rule on the S3 bucket  
C. A VPC route table entry to the external account  
D. A CloudWatch alarm on the bucket  

**Answer: A**

**Explanation:** Cross-account access often requires permission from both the resource policy and the caller's identity policy.

### Q35. ABAC design

A company wants access decisions based on tags such as department, project, and environment. Which model fits best?

A. Attribute-based access control  
B. Single shared administrator role  
C. Manual approval for every API call  
D. Static password rotation only  

**Answer: A**

**Explanation:** ABAC uses attributes or tags to scale access control decisions.

### Q36. Authorization troubleshooting

A user is denied access even though an identity policy allows the action. Which two items could still cause the denial? Choose two.

A. Service control policy  
B. Explicit deny in a resource policy  
C. Enabled S3 versioning  
D. CloudWatch dashboard color  
E. EC2 instance type  

**Answer: A, B**

**Explanation:** Explicit denies and higher-level guardrails such as SCPs can override allows in identity policies.

### Q37. External workloads

An on-premises server needs to access AWS APIs with short-lived credentials using X.509 certificates. Which feature is designed for this?

A. IAM Roles Anywhere  
B. S3 Transfer Acceleration  
C. AWS Shield Advanced  
D. Amazon Macie sensitive data discovery  

**Answer: A**

**Explanation:** IAM Roles Anywhere lets workloads outside AWS obtain temporary credentials using certificates.

### Q38. Unintended public access

Which service can help identify resource policies that grant unintended external access?

A. IAM Access Analyzer  
B. Amazon Polly  
C. AWS Cost Categories  
D. Amazon Kendra  

**Answer: A**

**Explanation:** IAM Access Analyzer analyzes policies to identify external or unintended access.

### Q39. Application authorization

A SaaS application needs fine-grained authorization decisions managed outside application code. Which AWS service is relevant?

A. Amazon Verified Permissions  
B. AWS Backup  
C. Amazon Route 53 Resolver DNS Firewall  
D. AWS CloudHSM cluster backups  

**Answer: A**

**Explanation:** Verified Permissions supports fine-grained application authorization using policy-based decisions.

### Q40. Authentication investigation

Users cannot access AWS accounts through IAM Identity Center after an IdP change. Which logs or tools should be checked first?

A. IAM Identity Center configuration, IdP settings, and CloudTrail events  
B. S3 server access logs for unrelated buckets  
C. AWS Backup vault lock reports  
D. EC2 CPU metrics only  

**Answer: A**

**Explanation:** Authentication failures should be investigated through the federation configuration and related audit events.

---

## Domain 5: Data Protection

### Q41. Private service access

Workloads in private subnets must access supported AWS services without traversing the public internet. Which solution should be used?

A. VPC endpoints or AWS PrivateLink  
B. Public IP addresses on every instance  
C. Internet gateway routes from private subnets  
D. Public S3 static website endpoints  

**Answer: A**

**Explanation:** VPC endpoints and PrivateLink keep traffic to supported services on private AWS network paths.

### Q42. Encryption at rest

A database must use customer-managed keys with key policy control and auditability. Which service is usually used for key management?

A. AWS KMS  
B. Amazon Route 53  
C. AWS WAF  
D. AWS Service Catalog AppRegistry  

**Answer: A**

**Explanation:** AWS KMS manages cryptographic keys and integrates with many AWS services for encryption at rest.

### Q43. Dedicated HSM requirements

A workload requires single-tenant hardware security modules where the customer manages keys directly. Which service best fits?

A. AWS CloudHSM  
B. AWS KMS AWS-managed keys  
C. Amazon Cognito  
D. Amazon Detective  

**Answer: A**

**Explanation:** CloudHSM provides dedicated HSMs for use cases requiring direct customer control over key material and cryptographic operations.

### Q44. Secrets rotation

A database password must be stored securely, retrieved by applications, and rotated automatically. Which service should be used?

A. AWS Secrets Manager  
B. AWS Artifact  
C. Amazon Macie only  
D. AWS Control Tower  

**Answer: A**

**Explanation:** Secrets Manager supports secure secret storage, retrieval, and rotation workflows.

### Q45. WORM retention

Regulatory policy requires selected S3 objects to be retained in write-once-read-many mode for seven years. Which feature is appropriate?

A. S3 Object Lock in compliance or governance mode  
B. S3 Select  
C. S3 Transfer Acceleration  
D. S3 multipart upload  

**Answer: A**

**Explanation:** S3 Object Lock provides WORM controls and retention modes for protected objects.

### Q46. Sensitive log masking

Application logs can contain credit card-like strings. The team wants to reduce exposure in CloudWatch Logs. Which feature area is relevant?

A. CloudWatch Logs data protection policies  
B. Route 53 latency records  
C. EC2 placement groups  
D. AWS Backup lifecycle transitions  

**Answer: A**

**Explanation:** CloudWatch Logs data protection can detect and mask sensitive data patterns in logs.

### Q47. Imported key material

A company wants to bring its own key material into AWS KMS and control when that material expires. What should they understand?

A. Imported key material differs from AWS-generated key material and has additional lifecycle responsibilities  
B. Imported key material makes CloudTrail unnecessary  
C. Imported key material can only be used with public S3 buckets  
D. Imported key material disables all encryption context support  

**Answer: A**

**Explanation:** SCS-C03 explicitly calls out differences between imported and AWS-generated key material.

### Q48. Multi-Region keys

An application performs client-side encryption in multiple Regions and needs related KMS keys with the same key ID and material. What should be considered?

A. AWS KMS multi-Region keys  
B. Security groups  
C. VPC Flow Logs  
D. AWS Artifact reports  

**Answer: A**

**Explanation:** KMS multi-Region keys support related keys in multiple Regions for certain cryptographic portability patterns.

### Q49. Backup ransomware resilience

A company wants centrally managed backups with protection against accidental or malicious deletion. Which feature should they evaluate?

A. AWS Backup Vault Lock  
B. CloudFront geolocation headers  
C. Amazon Cognito user pools  
D. AWS IAM credential reports  

**Answer: A**

**Explanation:** Backup Vault Lock can enforce retention settings for backup vaults to improve resilience against deletion or tampering.

### Q50. TLS enforcement

A public application uses an Application Load Balancer and must reject outdated TLS versions. What should be configured?

A. An appropriate ELB security policy  
B. S3 Lifecycle expiration  
C. IAM Access Analyzer unused access findings  
D. A Route 53 private hosted zone only  

**Answer: A**

**Explanation:** ELB security policies define supported TLS protocols and ciphers for load balancers.

---

## Domain 6: Security Foundations and Governance

### Q51. Multi-account landing zone

A company wants to create and govern a multi-account AWS environment with preventive and detective controls. Which service helps establish this landing zone?

A. AWS Control Tower  
B. Amazon SQS  
C. Amazon Rekognition  
D. AWS DataSync  

**Answer: A**

**Explanation:** Control Tower helps set up and govern a multi-account AWS environment using AWS Organizations and controls.

### Q52. Preventive guardrails

A security team must prevent member accounts from disabling CloudTrail. Which control is most appropriate?

A. Service control policy  
B. CloudWatch dashboard  
C. Amazon SNS topic display name  
D. EC2 key pair name  

**Answer: A**

**Explanation:** SCPs set permission guardrails across AWS Organizations accounts and can prevent restricted actions.

### Q53. Root user governance

A company wants to reduce risk from member account root users. Which practice aligns with SCS-C03 governance coverage?

A. Centralize root access management and define break-glass procedures  
B. Share root credentials in a team password file  
C. Disable MFA for root users  
D. Use root users for daily automation  

**Answer: A**

**Explanation:** SCS-C03 includes centrally managing root access, MFA, and break-glass procedures for member accounts.

### Q54. IaC policy validation

CloudFormation templates must be checked against security rules before deployment. Which tool is most relevant?

A. CloudFormation Guard  
B. Amazon Macie classification jobs  
C. AWS Shield response team  
D. S3 Inventory  

**Answer: A**

**Explanation:** CloudFormation Guard validates infrastructure-as-code templates against policy rules.

### Q55. Central firewall policy

A company wants to centrally deploy and enforce AWS WAF and security group policies across accounts. Which service is designed for this?

A. AWS Firewall Manager  
B. Amazon Transcribe  
C. AWS Backup Audit Manager only  
D. Amazon Connect  

**Answer: A**

**Explanation:** Firewall Manager centrally manages firewall and network security policies across AWS Organizations accounts.

### Q56. Audit evidence

Auditors need organized evidence mapped to compliance controls. Which service helps collect and manage AWS audit evidence?

A. AWS Audit Manager  
B. Amazon Route 53 Resolver  
C. AWS CodeDeploy blue/green deployments  
D. Amazon EFS file system policies only  

**Answer: A**

**Explanation:** Audit Manager automates evidence collection and supports assessment workflows.

### Q57. Compliance drift detection

A team wants to detect and remediate noncompliant resources, such as unencrypted volumes. Which service is most relevant?

A. AWS Config rules and remediation  
B. Amazon CloudFront Functions  
C. AWS STS session tags only  
D. Amazon S3 Select  

**Answer: A**

**Explanation:** AWS Config evaluates resource configurations and can trigger remediation actions.

### Q58. Resource sharing

Multiple accounts need access to centrally managed subnets and shared resources. Which service supports secure resource sharing across accounts?

A. AWS Resource Access Manager  
B. Amazon Inspector SBOM export  
C. AWS Artifact  
D. AWS Shield health-based detection  

**Answer: A**

**Explanation:** AWS RAM enables controlled sharing of supported resources across accounts or within an organization.

### Q59. Tag governance

A company needs consistent tagging for cost center, data classification, and environment across accounts. Which approach is best?

A. Tag policies and automated detection/remediation for missing tags  
B. Ask every team to remember tags without validation  
C. Store tags in local spreadsheets only  
D. Disable resource tags to simplify governance  

**Answer: A**

**Explanation:** Tag policies and automated checks support consistent resource organization and governance.

### Q60. AI service opt-out

A company has governance requirements around how AI services use content. Which AWS Organizations policy type may be relevant?

A. AI services opt-out policy  
B. Route table policy  
C. VPC endpoint policy only  
D. S3 lifecycle transition policy  

**Answer: A**

**Explanation:** SCS-C03 governance coverage includes organization policies such as AI services opt-out policies.

