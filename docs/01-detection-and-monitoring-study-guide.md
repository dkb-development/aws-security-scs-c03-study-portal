# AWS Security Specialty SCS-C03 Detection Study Guide

Generated: 2026-10-06

This guide is exam-focused. It is based on the question bank and topic signals collected in this workspace, not on copied real exam questions or dumps.

Use it as a reverse-engineered study path: first learn the patterns that appear repeatedly, then practice questions from the portal.

---

## 0. AWS Component Primer: What Each Service Does First

This section explains the AWS components in simple words before going into exam decision rules.

Official references used for service meaning:

- GuardDuty: https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html
- CloudTrail: https://docs.aws.amazon.com/cloudtrail/
- Security Hub: https://aws.amazon.com/documentation-overview/security-hub/
- Detective: https://docs.aws.amazon.com/detective/
- Security Lake and OCSF: https://docs.aws.amazon.com/security-lake/latest/userguide/open-cybersecurity-schema-framework.html
- Macie: https://docs.aws.amazon.com/macie/latest/user/getting-started.html
- Inspector: https://docs.aws.amazon.com/inspector/latest/user/what-is-inspector.html
- EventBridge: https://docs.aws.amazon.com/eventbridge/

I am using text diagrams instead of screenshots because AWS console screens change often. Text diagrams are easier to revise, searchable in Markdown, and work offline.

---

### 0.1 CloudTrail: Who Did What In AWS?

CloudTrail records AWS API activity.

Plain English:

> CloudTrail is like an audit camera for AWS API calls. It tells you who did something, what they did, when they did it, and from where.

Real-world example:

Your company notices that an S3 bucket policy became public. You want to know:

- Who changed the bucket policy?
- When did it happen?
- Was it done from the console, CLI, SDK, or an assumed role?
- Which IP address made the call?

CloudTrail is the service you check.

Simple flow:

```text
Admin / role / AWS service makes API call
        |
        v
AWS service receives the API call
        |
        v
CloudTrail records the event
        |
        v
S3 bucket / CloudTrail Lake / CloudWatch Logs / EventBridge
```

Example event:

```json
{
  "eventSource": "s3.amazonaws.com",
  "eventName": "PutBucketPolicy",
  "userIdentity": {
    "type": "AssumedRole",
    "arn": "arn:aws:sts::111122223333:assumed-role/AdminRole/session"
  },
  "sourceIPAddress": "203.0.113.25",
  "eventTime": "2026-10-06T09:15:00Z"
}
```

Exam angle:

| If the question says... | Think... |
|---|---|
| Who called this AWS API? | CloudTrail |
| Someone changed IAM/S3/EC2 configuration | CloudTrail management event |
| Someone read or wrote S3 objects | CloudTrail data event |
| Need SQL over CloudTrail events | CloudTrail Lake |
| Need immediate reaction to an API call | EventBridge rule for CloudTrail API event |

Important trap:

```text
Bucket-level action like PutBucketPolicy -> management event
Object-level action like GetObject       -> data event
```

---

### 0.2 CloudTrail Lake: SQL Search Over CloudTrail

CloudTrail Lake lets you query CloudTrail events with SQL.

Plain English:

> CloudTrail Lake is CloudTrail plus a built-in query store.

Real-world example:

A security analyst asks:

> Show me all API calls made by this role in the last 30 days from outside India.

Instead of exporting CloudTrail logs and building your own query pipeline, you can query CloudTrail Lake.

Simple flow:

```text
CloudTrail events
        |
        v
CloudTrail Lake event data store
        |
        v
SQL query
        |
        v
Investigation result
```

Example query idea:

```sql
SELECT eventTime, eventSource, eventName, sourceIPAddress, userIdentity.arn
FROM cloudtrail_lake
WHERE userIdentity.arn LIKE '%AdminRole%'
ORDER BY eventTime DESC;
```

Exam angle:

Choose CloudTrail Lake when the question says:

- SQL queries over CloudTrail events
- managed event data store
- investigate API activity without building an S3/Athena pipeline

Do not choose CloudTrail Lake when the question asks for many log types in a normalized schema. That is **Security Lake**.

---

### 0.3 CloudWatch: Metrics, Logs, Alarms, And Quick Log Search

CloudWatch is a monitoring service.

Plain English:

> CloudWatch is where AWS metrics, logs, dashboards, alarms, and quick log queries commonly live.

Real-world examples:

- CPU on an EC2 instance crosses 90%.
- A Lambda function logs errors.
- An application writes JSON logs to CloudWatch Logs.
- You want an alarm to send an email when `5xx` errors spike.

Simple flow:

```text
Application / AWS service
        |
        +-- Metrics -> CloudWatch alarm -> SNS
        |
        +-- Logs    -> CloudWatch Logs -> Logs Insights query
```

Example Logs Insights query:

```sql
fields @timestamp, requestId, sourceIp, @message
| filter @message like /AccessDenied/
| sort @timestamp desc
| limit 20
```

Exam angle:

| Need | CloudWatch feature |
|---|---|
| Query logs already in CloudWatch Logs | Logs Insights |
| Alert when a metric crosses a threshold | CloudWatch alarm |
| Notify someone from an alarm | CloudWatch alarm -> SNS |
| Convert log text into a metric | Metric filter |
| Mask sensitive data in logs | CloudWatch Logs data protection |

---

### 0.4 VPC Flow Logs: Network Conversation Metadata

VPC Flow Logs capture network traffic metadata.

Plain English:

> VPC Flow Logs tell you which IP talked to which IP, over which port, and whether traffic was accepted or rejected.

They do **not** capture packet payloads.

Real-world example:

An EC2 instance is suspected of talking to a suspicious IP address. You want to know:

- Did the instance connect to that IP?
- Which port was used?
- Was the traffic accepted or rejected?
- How many bytes were transferred?

Use VPC Flow Logs.

Example record:

```text
srcaddr      dstaddr        srcport dstport protocol action bytes
10.0.1.10    198.51.100.5   44321   443     6        ACCEPT 8400
```

Simple flow:

```text
ENI / subnet / VPC traffic
        |
        v
VPC Flow Logs
        |
        +-- CloudWatch Logs
        +-- S3
        +-- Kinesis Data Firehose
```

Exam angle:

Choose VPC Flow Logs for:

- accepted/rejected network traffic metadata
- source/destination IP and port
- ENI-level network visibility

Do not choose VPC Flow Logs for:

- DNS query names
- HTTP request body
- packet payload
- AWS API calls

---

### 0.5 Route 53 Resolver Query Logs: DNS Lookup Visibility

Route 53 Resolver query logs record DNS queries from resources that use the VPC resolver.

Plain English:

> Resolver query logs tell you which domain names your workloads are trying to resolve.

Real-world example:

GuardDuty reports communication with a suspicious domain. You want to know:

- Which EC2 instance looked up that domain?
- When did the lookup happen?
- What other domains did that workload query?

Use Route 53 Resolver query logs.

Simple flow:

```text
EC2 instance asks for bad-domain.example.com
        |
        v
VPC Route 53 Resolver
        |
        v
Resolver query log
        |
        +-- CloudWatch Logs
        +-- S3
        +-- Kinesis Data Firehose
```

Exam angle:

| Need | Choose |
|---|---|
| Network IP/port metadata | VPC Flow Logs |
| DNS query names | Route 53 Resolver query logs |
| AWS API activity | CloudTrail |

Important trap:

If an instance uses a custom DNS server instead of the VPC resolver, DNS visibility can be different. This is a common GuardDuty/DNS blind-spot style question.

---

### 0.6 GuardDuty: Managed Threat Detection

GuardDuty is AWS managed threat detection.

Plain English:

> GuardDuty watches AWS activity and looks for suspicious behavior.

It can use signals such as CloudTrail activity, VPC Flow Logs, DNS activity, and optional protection plans.

Real-world examples:

- IAM credentials are used from an unusual country.
- An EC2 instance talks to a known command-and-control server.
- An instance starts scanning ports.
- A workload communicates with a Tor exit node.
- Suspicious activity appears in EKS audit logs.

Simple flow:

```text
CloudTrail / VPC Flow Logs / DNS activity / protection-plan telemetry
        |
        v
GuardDuty analyzes behavior
        |
        v
GuardDuty finding
        |
        +-- Security Hub
        +-- EventBridge
        +-- Detective
```

Example finding idea:

```json
{
  "service": "GuardDuty",
  "type": "UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration",
  "severity": 8,
  "resource": "AccessKey",
  "action": "AWS_API_CALL"
}
```

Exam angle:

Choose GuardDuty when the question says:

- threat detection
- suspicious API activity
- credential exfiltration
- malicious IP/domain
- crypto mining
- Tor communication
- port probing
- EKS suspicious activity

Important trap:

GuardDuty **detects**. It does not automatically fix everything. For response, use:

```text
GuardDuty finding -> EventBridge -> SNS/Lambda/Step Functions/SSM Automation
```

---

### 0.7 Security Hub: Central Findings And Security Posture

Security Hub centralizes security findings and posture checks.

Plain English:

> Security Hub is the dashboard where many AWS security findings come together.

Real-world example:

Your organization has 80 AWS accounts. Findings come from:

- GuardDuty
- Inspector
- Macie
- IAM Access Analyzer
- AWS Config / security standards
- third-party security tools

Instead of checking every service in every account, the security team uses Security Hub in a delegated security account.

Simple flow:

```text
GuardDuty findings
Inspector findings
Macie findings
Access Analyzer findings
Partner findings
Security standards checks
        |
        v
Security Hub
        |
        +-- Central view
        +-- Prioritization
        +-- Standards checks
        +-- EventBridge actions
```

Exam angle:

Choose Security Hub when the question says:

- aggregate findings
- central security dashboard
- security standards
- compliance posture
- multi-account findings
- one place for GuardDuty, Macie, Inspector, and partner findings

Important trap:

Security Hub is not the investigation graph tool. For relationship investigation, use **Detective**.

---

### 0.8 Detective: Security Investigation Graphs

Detective helps investigate suspicious activity and findings.

Plain English:

> Detective connects the dots between users, roles, IP addresses, EC2 instances, and findings.

Real-world example:

Security Hub shows a GuardDuty finding for a role. The analyst needs to know:

- What API calls happened before and after?
- What IP addresses were involved?
- Which EC2 instance or IAM role is related?
- Is this part of a bigger pattern?

Use Detective.

Simple flow:

```text
GuardDuty / Security Hub finding
        |
        v
Detective
        |
        v
Behavior graph
        |
        +-- Users
        +-- Roles
        +-- IPs
        +-- Instances
        +-- API activity
```

Exam angle:

Choose Detective when the question says:

- investigate finding
- behavior graph
- relationship graph
- root cause of suspicious activity
- connected users, IPs, resources, and findings

Do not choose Detective for:

- collecting findings from many services: Security Hub
- SQL query over CloudTrail: CloudTrail Lake
- S3 sensitive data discovery: Macie

---

### 0.9 Security Lake: Security Data Lake With OCSF

Security Lake centralizes security logs in S3 and normalizes them into OCSF.

Plain English:

> Security Lake is a central lake of security logs, stored in a common format so tools can analyze them more easily.

OCSF means Open Cybersecurity Schema Framework.

Simple meaning:

> OCSF makes different security logs look more consistent.

Real-world example:

A SOC wants one data lake for:

- CloudTrail
- VPC Flow Logs
- Route 53 Resolver logs
- WAF logs
- Security Hub findings
- partner security logs

They want to connect a SIEM or analytics tool and not manually normalize every log source.

Use Security Lake.

Simple flow:

```text
AWS security logs + partner logs
        |
        v
Security Lake
        |
        v
OCSF-normalized data in S3
        |
        v
SIEM / analytics / investigation tools
```

Exam angle:

Choose Security Lake when the question says:

- many security log sources
- common schema
- OCSF
- security data lake
- store security data in S3
- integrate with SIEM

Do not confuse:

```text
CloudTrail Lake = SQL over CloudTrail events
Security Lake   = many security sources in OCSF format
```

---

### 0.10 Macie: Sensitive Data Discovery In S3

Macie discovers sensitive data in S3.

Plain English:

> Macie scans S3 objects and tells you if they contain sensitive data.

Real-world examples:

- A bucket contains customer passport numbers.
- A data lake accidentally stores credit card numbers.
- A company has a custom customer ID pattern like `CUST-1234567890`.
- A security team wants to know which S3 buckets contain PII.

Use Macie.

Simple flow:

```text
S3 buckets and objects
        |
        v
Macie sensitive data discovery
        |
        v
Macie finding
        |
        +-- Security Hub
        +-- EventBridge
        +-- S3 discovery results repository
```

Custom identifier example:

```json
{
  "name": "CustomerIdPattern",
  "regex": "CUST-[0-9]{10}",
  "keywords": ["customer", "client", "cust_id"]
}
```

Exam angle:

Choose Macie when the question says:

- sensitive data in S3
- PII discovery
- credit card numbers
- national ID numbers
- custom data identifiers
- classify S3 object content

Do not choose Macie for vulnerability scanning. That is Inspector.

---

### 0.11 Inspector: Vulnerability Management

Inspector finds vulnerabilities in AWS workloads.

Plain English:

> Inspector scans workloads and tells you which packages, container images, or Lambda functions have vulnerabilities.

Real-world examples:

- EC2 instance has an outdated OpenSSL package.
- ECR container image has a critical CVE.
- Lambda function has a vulnerable dependency.
- Security team needs vulnerability findings across accounts.

Use Inspector.

Simple flow:

```text
EC2 / ECR / Lambda
        |
        v
Inspector scan
        |
        v
Vulnerability finding
        |
        +-- Security Hub
        +-- EventBridge
        +-- Reports / SBOM export
```

Exam angle:

Choose Inspector when the question says:

- EC2 vulnerability scanning
- ECR image scanning
- Lambda vulnerability scanning
- software package CVEs
- unintended network exposure
- SBOM export

Do not confuse:

```text
Inspector = vulnerability management
GuardDuty = threat detection
Macie     = sensitive data in S3
```

---

### 0.12 EventBridge: Event Routing And Automation Trigger

EventBridge routes events to targets.

Plain English:

> EventBridge is the switchboard. When something happens, it sends the event to the right place.

Real-world examples:

- GuardDuty creates a high-severity finding.
- Someone calls `StopLogging` on CloudTrail.
- Security Hub custom action is triggered.
- A scheduled rule runs every hour.

EventBridge can route events to:

- SNS
- Lambda
- Step Functions
- SQS
- Systems Manager Automation or Run Command
- another event bus

Simple flow:

```text
Event source
GuardDuty / CloudTrail API event / Security Hub / custom app
        |
        v
EventBridge rule
        |
        v
Target
SNS / Lambda / Step Functions / SSM / SQS
```

Example event pattern:

```json
{
  "source": ["aws.guardduty"],
  "detail-type": ["GuardDuty Finding"],
  "detail": {
    "severity": [7, 8, 9]
  }
}
```

Exam angle:

Choose EventBridge when the question says:

- when a finding appears, trigger something
- when an API call happens, respond quickly
- event-driven workflow
- route findings to SNS/Lambda/Step Functions

---

### 0.13 SNS: Notification Fanout

SNS is a notification and pub/sub service.

Plain English:

> SNS sends a message to subscribers.

Real-world examples:

- CloudWatch alarm sends email to operations.
- EventBridge sends GuardDuty finding notification to SNS.
- SNS fans out one alert to email, Lambda, HTTPS endpoint, and SQS.

Simple flow:

```text
CloudWatch alarm or EventBridge rule
        |
        v
SNS topic
        |
        +-- Email
        +-- Lambda
        +-- SQS
        +-- HTTPS endpoint
```

Exam angle:

Choose SNS when the question says:

- notify team
- send alert
- fan out message
- alarm notification

SNS is usually not the detector. It is the notification channel.

---

### 0.14 Athena: SQL Queries Over Logs In S3

Athena queries data in S3 using SQL.

Plain English:

> Athena lets you run SQL directly on files in S3.

Real-world examples:

- CloudTrail logs are delivered to S3.
- VPC Flow Logs are delivered to S3.
- ALB logs are delivered to S3.
- You want to query them without loading them into a database.

Use Athena.

Simple flow:

```text
Logs in S3
        |
        v
Glue table / schema
        |
        v
Athena SQL query
        |
        v
Investigation result
```

Example query idea:

```sql
SELECT sourceipaddress, eventname, count(*) AS calls
FROM cloudtrail_logs
WHERE eventtime > current_timestamp - interval '1' day
GROUP BY sourceipaddress, eventname
ORDER BY calls DESC;
```

Exam angle:

Choose Athena when:

- logs are already in S3
- need SQL analysis
- central S3 log bucket is mentioned

Do not choose Athena just because SQL is mentioned if the question specifically says **CloudTrail Lake event data store**.

---

### 0.15 IAM Access Analyzer: Access And Policy Analysis

IAM Access Analyzer analyzes access paths and policies.

Plain English:

> Access Analyzer helps find who can access what, especially unintended external access or unused permissions.

Real-world examples:

- An S3 bucket policy accidentally allows another AWS account.
- A KMS key is shared outside the organization.
- A role has permissions it has not used in months.
- A developer wants to validate whether an IAM policy is too broad.

Simple flow:

```text
IAM/resource policy
        |
        v
Access Analyzer
        |
        +-- External access finding
        +-- Unused access finding
        +-- Policy validation warning
        +-- Least-privilege policy generation
```

Exam angle:

Choose Access Analyzer when the question says:

- external access
- zone of trust
- unused access
- policy validation
- generate least-privilege policy from CloudTrail activity

Do not confuse:

```text
Access Analyzer = who can access what
GuardDuty       = suspicious activity
Security Hub    = finding aggregation
Detective       = investigation graph
```

---

### 0.16 Quick Component Map

Use this as your first-glance map:

| Component | What it does | Real-world use | Exam memory hook |
|---|---|---|---|
| CloudTrail | Records AWS API calls | Who changed the bucket policy? | API audit trail |
| CloudTrail Lake | SQL over CloudTrail events | Query API calls by role/IP/time | CloudTrail query store |
| CloudWatch | Metrics, logs, alarms | Alert on error spike | Ops monitoring |
| VPC Flow Logs | Network metadata | Which IP talked to which IP? | IP/port/allow-deny |
| Resolver query logs | DNS queries | Which domains did EC2 query? | DNS names |
| GuardDuty | Threat detection | Credential exfiltration finding | Suspicious behavior |
| Security Hub | Findings aggregation | One dashboard across services/accounts | Central findings |
| Detective | Investigation graph | What is related to this finding? | Relationship graph |
| Security Lake | Security data lake | Normalize many logs for SIEM | OCSF in S3 |
| Macie | Sensitive data in S3 | Find PII in buckets | S3 data discovery |
| Inspector | Vulnerability scanning | CVEs in EC2/ECR/Lambda | Package vulnerabilities |
| EventBridge | Event routing | Finding triggers workflow | If event, then target |
| SNS | Notifications | Email/security alert | Send message |
| Athena | SQL over S3 data | Query CloudTrail logs in S3 | S3 SQL |
| Access Analyzer | Access analysis | External bucket/key access | Who can access what |

---

## 1. What Detection Means In The Exam

Detection is about answering this question:

> Something happened in AWS. How do I notice it, collect evidence, route the alert, investigate it, and query the right logs?

In the current question bank, Detection has **389 cards**. The repeated patterns are:

| Area | Question-bank signal | What it means for study |
|---|---:|---|
| Logging design | 236 cards | Highest priority. Know which logs answer which question. |
| Security service selection | 132 cards | Very high priority. Know GuardDuty vs Security Hub vs Detective vs Macie vs Inspector. |
| Monitoring and alerting | 21 cards | Lower count, but still important for EventBridge, CloudWatch alarms, SNS, and automation. |

The services that appeared most often in Detection-related material:

| Service / concept | Approx. signal count | Priority |
|---|---:|---|
| CloudWatch / CloudWatch Logs / alarms | 117 | Very high |
| CloudTrail / CloudTrail Lake | 111 | Very high |
| GuardDuty | 84 | Very high |
| Security Hub | 62 | Very high |
| VPC Flow Logs | 40 | High |
| Detective | 36 | High |
| SNS | 34 | High |
| Athena | 32 | High |
| EventBridge | 31 | High |
| Security Lake | 30 | High |
| Macie | 27 | Medium-high |
| Inspector | 27 | Medium-high |
| Access Analyzer | 18 | Medium-high |
| OCSF | 13 | Medium-high, newer SCS-C03 signal |
| Route 53 Resolver query logs | 10 | Medium, but commonly tested as a log-source trap |

Do not try to memorize every service page. For the exam, focus on choosing the **right evidence source** and the **right next service**.

---

## 2. The Detection Mental Model

Think of Detection as a pipeline:

```text
AWS activity or workload event
        |
        v
Collect telemetry
CloudTrail / VPC Flow Logs / DNS logs / app logs / service findings
        |
        v
Detect or classify
GuardDuty / Macie / Inspector / Access Analyzer / CloudWatch alarms
        |
        v
Aggregate and normalize
Security Hub / Security Lake / centralized S3 bucket
        |
        v
Investigate
Detective / CloudTrail Lake / Athena / CloudWatch Logs Insights
        |
        v
Route or respond
EventBridge -> SNS / Lambda / Step Functions / SSM Automation
```

Most exam questions are asking: **where in this pipeline are we?**

Examples:

- Need threat detection from CloudTrail, VPC Flow Logs, and DNS activity? Use **GuardDuty**.
- Need one dashboard for findings from GuardDuty, Macie, Inspector, and partner tools? Use **Security Hub**.
- Need behavior graphs and relationship investigation after a finding? Use **Detective**.
- Need SQL queries over CloudTrail events? Use **CloudTrail Lake**.
- Need a broad security data lake in S3 using a common schema? Use **Security Lake with OCSF**.
- Need immediate workflow after an API call or finding? Use **EventBridge**.

---

## 3. Highest-Return Topics For Detection

### 3.1 CloudTrail Is The Main API Activity Log

CloudTrail records AWS API activity.

Simple definition:

> CloudTrail tells you who called what AWS API, from where, and when.

High-yield exam points:

- CloudTrail **management events** record control-plane actions like `CreateUser`, `PutBucketPolicy`, `RunInstances`, or `StopLogging`.
- CloudTrail **data events** record high-volume resource actions like S3 object-level `GetObject` and `PutObject`.
- S3 object access is **not automatically included** just because CloudTrail is enabled.
- For all accounts, use an **organization trail**.
- For SQL-style queries over CloudTrail events with less setup, use **CloudTrail Lake**.
- For API-call based immediate detection, use **EventBridge** when the event is available there.

#### CloudTrail Decision Diagram

```text
Question asks about AWS API activity?
        |
        +-- Account/service configuration action?
        |       Example: StopLogging, CreateUser, PutBucketPolicy
        |       -> CloudTrail management event
        |
        +-- S3 object or Lambda function invocation level action?
        |       Example: GetObject, PutObject
        |       -> CloudTrail data event
        |
        +-- Need SQL queries over CloudTrail events?
        |       -> CloudTrail Lake
        |
        +-- Need central long-term log bucket and external query engine?
                -> CloudTrail to S3 + Athena
```

#### Example: CloudTrail Management Event

```json
{
  "eventSource": "cloudtrail.amazonaws.com",
  "eventName": "StopLogging",
  "userIdentity": {
    "type": "AssumedRole",
    "arn": "arn:aws:sts::111122223333:assumed-role/Admin/session"
  },
  "sourceIPAddress": "203.0.113.10",
  "eventTime": "2026-10-06T10:30:00Z"
}
```

What the exam may ask:

- "How do you detect someone stopping CloudTrail?"
- Strong answer: **Create an EventBridge rule for the CloudTrail API event and trigger SNS/Lambda/Step Functions.**

#### Example: S3 Object Access Trap

If the question says:

> We can see `PutBucketPolicy`, but we cannot see `GetObject`.

The answer is usually:

> Enable **CloudTrail S3 data events** for that bucket.

Because:

```text
PutBucketPolicy = management event
GetObject       = data event
```

---

### 3.2 GuardDuty Is Threat Detection

GuardDuty is a managed threat detection service.

Simple definition:

> GuardDuty looks for suspicious activity using AWS logs and threat intelligence.

It can use signals such as:

- CloudTrail management events
- VPC Flow Logs
- DNS logs from supported DNS telemetry
- EKS audit logs, if enabled
- Malware Protection features, where configured
- RDS/EBS/EKS/S3 protection plans, depending on setup and Region

Exam pattern:

```text
Suspicious behavior, credential misuse, crypto mining, Tor, port probing,
malicious IP/domain, unusual API calls
        -> GuardDuty
```

#### GuardDuty Finding Flow

```text
CloudTrail / VPC Flow Logs / DNS activity
        |
        v
GuardDuty detects suspicious behavior
        |
        v
Finding created
        |
        +-- Send to Security Hub for aggregation
        |
        +-- Send to EventBridge for workflow
                |
                +-- SNS notification
                +-- Lambda enrichment
                +-- Step Functions containment workflow
```

#### Example: GuardDuty To EventBridge

```json
{
  "source": ["aws.guardduty"],
  "detail-type": ["GuardDuty Finding"],
  "detail": {
    "severity": [7, 8, 9]
  }
}
```

What this does:

- Matches high-severity GuardDuty findings.
- Routes them to a target such as SNS, Lambda, or Step Functions.

Common exam answer:

> GuardDuty finding -> EventBridge rule -> SNS/Lambda/Step Functions.

#### GuardDuty Traps

| Trap | Correct idea |
|---|---|
| "GuardDuty should block the attack directly" | GuardDuty detects; it does not usually enforce blocking by itself. Use EventBridge plus remediation. |
| "GuardDuty DNS finding is missing for custom DNS" | DNS findings depend on supported DNS telemetry. Custom DNS can reduce visibility. |
| "Internal scanner creates noisy findings" | Consider trusted IP lists or suppression rules, depending on the goal. |
| "Need full packet payload" | GuardDuty does not give packet payloads. VPC Flow Logs give metadata only; Traffic Mirroring is for packet copies. |

---

### 3.3 Security Hub Aggregates Findings

Security Hub is a finding and posture aggregation service.

Simple definition:

> Security Hub is the central place to collect and view security findings and compliance checks.

It can aggregate findings from:

- GuardDuty
- Inspector
- Macie
- IAM Access Analyzer
- AWS Config / standards checks
- Partner security tools

High-yield exam points:

- Use Security Hub when the question says **central dashboard**, **aggregate findings**, **security standards**, or **multi-account findings**.
- Use an **AWS Organizations delegated administrator** for central management.
- Security Hub findings use a common AWS finding format called **ASFF**.
- Security Hub is not the same as Detective. Security Hub aggregates; Detective investigates relationships.

#### Security Hub In One Picture

```text
GuardDuty findings
Inspector vulnerability findings
Macie sensitive-data findings
Access Analyzer findings
Partner tool findings
        |
        v
Security Hub
        |
        +-- Dashboard and standards
        +-- Central security account
        +-- EventBridge custom action / finding routing
```

#### Example: Simplified Security Hub Finding

```json
{
  "AwsAccountId": "111122223333",
  "ProductName": "GuardDuty",
  "Title": "UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration",
  "Severity": {
    "Label": "HIGH"
  },
  "Resources": [
    {
      "Type": "AwsIamAccessKey",
      "Id": "AKIA..."
    }
  ]
}
```

Exam reading tip:

If the question asks:

> Where should we collect findings from many security services?

Answer:

> Security Hub.

If the question asks:

> How do we understand relationships between the principal, instance, IP address, and finding?

Answer:

> Detective.

---

### 3.4 Detective Is For Investigation Graphs

Detective helps investigate security findings.

Simple definition:

> Detective builds behavior graphs so you can understand what happened around a finding.

Use Detective when the question says:

- behavior graph
- relationship graph
- investigate related IPs, users, instances, and findings
- analyze activity around a GuardDuty or Security Hub finding

Do not choose Detective when:

- You only need to run a SQL query over logs.
- You need to classify sensitive data in S3.
- You need vulnerability scanning.
- You need to aggregate compliance findings.

#### Detective vs Security Hub

```text
Security Hub = collect and prioritize findings
Detective    = investigate relationships behind findings
```

Example:

```text
Security Hub shows a GuardDuty finding for an IAM role.
You need to know:
- Which IPs were involved?
- Which API calls happened before and after?
- Which EC2 instance or role is connected?

Use Detective.
```

---

### 3.5 Security Lake And OCSF Are Newer High-Yield Topics

Security Lake centralizes security data in an S3-backed data lake.

Simple definition:

> Security Lake collects security logs and stores them in a common schema for analysis.

OCSF means **Open Cybersecurity Schema Framework**.

Simple definition:

> OCSF is a common format so logs from different sources look more consistent.

Use Security Lake when the question says:

- collect CloudTrail, VPC Flow Logs, Route 53 Resolver logs, WAF logs, and partner logs
- normalize security data
- common schema
- OCSF
- security data lake in S3
- integrate with SIEM or analytics tools

Do not confuse it with CloudTrail Lake.

#### Security Lake vs CloudTrail Lake

| Need | Choose |
|---|---|
| Query CloudTrail events with SQL and less setup | CloudTrail Lake |
| Centralize many security log types in S3 | Security Lake |
| Normalize logs into OCSF | Security Lake |
| Investigate CloudTrail API activity only | CloudTrail Lake |
| Query existing S3 logs manually | Athena |

#### Simple Diagram

```text
CloudTrail
VPC Flow Logs
Route 53 Resolver logs
WAF logs
Partner logs
        |
        v
Security Lake
        |
        v
OCSF-normalized data in S3
        |
        v
SIEM / analytics / investigation tools
```

#### Example: Simplified OCSF-Like Record

```json
{
  "class_name": "API Activity",
  "cloud": {
    "provider": "AWS",
    "account_uid": "111122223333"
  },
  "actor": {
    "user": {
      "name": "AdminRole"
    }
  },
  "api": {
    "service": "s3",
    "operation": "PutBucketPolicy"
  },
  "severity": "Informational"
}
```

You do not need to memorize OCSF fields. Know the **purpose**:

> Security Lake normalizes security logs into OCSF for broad analysis.

---

### 3.6 CloudWatch Is For Logs, Metrics, Alarms, And Quick Queries

CloudWatch appears repeatedly because it sits close to operations.

Use these mental shortcuts:

| Need | Service / feature |
|---|---|
| Query logs already in CloudWatch Logs | CloudWatch Logs Insights |
| Create an alarm from a metric threshold | CloudWatch alarm |
| Notify someone from an alarm | CloudWatch alarm -> SNS |
| Detect specific log text pattern | CloudWatch metric filter |
| Mask sensitive values in log events | CloudWatch Logs data protection policy |

#### CloudWatch Logs Insights Example

Question:

> Application logs already land in CloudWatch Logs. The team needs ad hoc filtering by request ID and source IP without moving logs.

Answer:

> CloudWatch Logs Insights.

Example query:

```sql
fields @timestamp, sourceIp, requestId, @message
| filter requestId = "req-123"
| sort @timestamp desc
| limit 20
```

#### CloudWatch Alarm Flow

```text
Metric crosses threshold
        |
        v
CloudWatch alarm
        |
        v
SNS topic
        |
        +-- Email
        +-- Lambda
        +-- Incident tool integration
```

---

### 3.7 VPC Flow Logs Are Network Metadata, Not Packet Payloads

VPC Flow Logs capture network flow metadata.

Simple definition:

> VPC Flow Logs show who talked to whom over the network, but not the actual packet contents.

They can show:

- source IP
- destination IP
- port
- protocol
- bytes
- accept/reject
- interface ID

They do not show:

- HTTP headers
- request body
- full packet payload
- DNS query names

#### Example VPC Flow Log Record

```text
version account-id interface-id srcaddr dstaddr srcport dstport protocol packets bytes start end action log-status
2 111122223333 eni-abc123 10.0.1.10 198.51.100.20 44321 443 6 10 8400 1760000000 1760000060 ACCEPT OK
```

Exam traps:

| Question clue | Correct choice |
|---|---|
| Accepted/rejected traffic metadata | VPC Flow Logs |
| Full packet inspection / copy packets to IDS | VPC Traffic Mirroring, usually Infrastructure topic |
| DNS query names from VPC resolver | Route 53 Resolver query logs |
| API calls | CloudTrail |

---

### 3.8 Route 53 Resolver Query Logs Are For DNS Questions

Route 53 Resolver query logs capture DNS queries made by resources using the VPC resolver.

Use them when the question says:

- DNS queries
- domain lookups from EC2
- suspicious domain
- DNS tunneling investigation
- which domains workloads are resolving

Simple flow:

```text
EC2 instance asks: malicious.example.com?
        |
        v
VPC Route 53 Resolver
        |
        v
Resolver query log
        |
        v
CloudWatch Logs / S3 / Kinesis Data Firehose
```

Important trap:

> If workloads use a custom DNS server instead of the VPC resolver, GuardDuty DNS visibility and Resolver query logging may not behave the way the question expects.

---

### 3.9 Macie Is For Sensitive Data In S3

Macie discovers sensitive data in S3.

Simple definition:

> Macie scans S3 objects to find sensitive data such as PII, credentials, and custom patterns.

Use Macie when the question says:

- sensitive data discovery
- PII in S3
- credit card numbers in S3
- national ID numbers in S3
- custom data identifier
- data classification

Do not choose Macie for:

- EC2 vulnerability scanning
- threat detection from API calls
- centralized finding aggregation
- graph investigation

#### Macie Custom Identifier Example

Suppose your company has customer IDs like:

```text
CUST-1234567890
```

Macie custom data identifier could use a pattern like:

```json
{
  "name": "CompanyCustomerId",
  "regex": "CUST-[0-9]{10}",
  "keywords": ["customer", "cust_id", "client"]
}
```

Exam clue:

> Proprietary sensitive pattern in S3.

Answer:

> Macie custom data identifier.

---

### 3.10 Inspector Is Vulnerability Management

Inspector finds software/package vulnerabilities and exposure risks.

Simple definition:

> Inspector scans workloads for vulnerabilities.

Use Inspector for:

- EC2 vulnerability findings
- ECR container image vulnerabilities
- Lambda function vulnerabilities
- package/CVE scanning
- SBOM export

Do not confuse:

| Need | Choose |
|---|---|
| Threat detection from logs | GuardDuty |
| Vulnerability/package scanning | Inspector |
| Sensitive data in S3 | Macie |
| Finding aggregation | Security Hub |
| Relationship investigation | Detective |

Exam pattern:

> "Which service detects package/software vulnerabilities for EC2, ECR, and Lambda?"

Answer:

> Inspector.

---

### 3.11 EventBridge Is The Router For Events

EventBridge routes events to targets.

Simple definition:

> EventBridge watches for events and starts the next action.

Use EventBridge when the question says:

- trigger remediation within seconds
- react to an API call
- route GuardDuty findings
- send finding to SNS/Lambda/Step Functions
- event-driven automation

#### EventBridge API Detection Flow

```text
User calls cloudtrail:StopLogging
        |
        v
CloudTrail event appears
        |
        v
EventBridge rule matches StopLogging
        |
        +-- SNS alert to security team
        +-- Lambda to re-enable logging
        +-- Step Functions response workflow
```

#### EventBridge Rule Example

```json
{
  "source": ["aws.cloudtrail"],
  "detail-type": ["AWS API Call via CloudTrail"],
  "detail": {
    "eventSource": ["cloudtrail.amazonaws.com"],
    "eventName": ["StopLogging", "DeleteTrail"]
  }
}
```

Exam clue:

> Need immediate detection and workflow after a specific API call.

Answer:

> EventBridge rule for the API event.

---

## 4. The Most Important Service Comparisons

### 4.1 GuardDuty vs Security Hub vs Detective

```text
GuardDuty   = detects suspicious activity
Security Hub = collects and prioritizes findings
Detective   = investigates relationships around findings
```

Example:

```text
Question: Suspicious credential use from unusual country?
Answer: GuardDuty

Question: Central dashboard for GuardDuty, Inspector, Macie, partner findings?
Answer: Security Hub

Question: Graph of related IPs, users, roles, and instances after a finding?
Answer: Detective
```

### 4.2 CloudTrail Lake vs Security Lake vs Athena

```text
CloudTrail Lake = SQL over CloudTrail events
Security Lake   = many security logs normalized into OCSF in S3
Athena          = SQL over data already stored in S3
```

Decision shortcut:

```text
Only CloudTrail events and managed SQL store?
        -> CloudTrail Lake

Many security sources + OCSF + S3 data lake?
        -> Security Lake

Logs already in S3 and need SQL queries?
        -> Athena
```

### 4.3 CloudWatch Logs Insights vs Athena

```text
Logs are in CloudWatch Logs
        -> CloudWatch Logs Insights

Logs are in S3
        -> Athena
```

### 4.4 Macie vs Inspector

```text
Macie    = sensitive data in S3
Inspector = vulnerabilities in workloads/packages
```

### 4.5 VPC Flow Logs vs Route 53 Resolver Logs

```text
VPC Flow Logs              = network metadata: IP, port, allow/deny
Route 53 Resolver logs     = DNS query names
```

### 4.6 Access Analyzer In Detection Questions

IAM Access Analyzer sometimes appears in Detection because it finds unintended access.

Use Access Analyzer for:

- external access findings
- unused access analysis
- policy validation
- policy generation from CloudTrail activity

But remember:

```text
Access Analyzer = access/policy analysis
GuardDuty       = threat detection
Security Hub    = finding aggregation
Detective       = investigation graph
```

---

## 5. Exam-Style Decision Tree

Use this when reading a Detection question:

```text
What is the question asking for?

1. Suspicious activity or threat?
   -> GuardDuty

2. One place to collect security findings?
   -> Security Hub

3. Relationship graph / investigation after finding?
   -> Detective

4. API activity?
   -> CloudTrail

5. SQL over CloudTrail events?
   -> CloudTrail Lake

6. S3 object-level API activity?
   -> CloudTrail data events

7. Logs already in CloudWatch?
   -> CloudWatch Logs Insights

8. Logs already in S3?
   -> Athena

9. Broad security data lake with normalized schema?
   -> Security Lake + OCSF

10. Sensitive data in S3?
    -> Macie

11. Software/package vulnerabilities?
    -> Inspector

12. Network metadata?
    -> VPC Flow Logs

13. DNS query names?
    -> Route 53 Resolver query logs

14. Immediate event-driven response?
    -> EventBridge -> SNS/Lambda/Step Functions
```

---

## 6. Organization-Wide Detection Setup

Many SCS-C03 questions are multi-account.

The repeated answer pattern:

> Use AWS Organizations delegated administrator and auto-enable features where supported.

### Organization Detection Architecture

```text
AWS Organizations
        |
        +-- Management account
        |
        +-- Security tooling account
        |       |
        |       +-- GuardDuty delegated admin
        |       +-- Security Hub delegated admin
        |       +-- Macie delegated admin
        |       +-- Inspector delegated admin
        |
        +-- Member account A
        +-- Member account B
        +-- Member account C
```

Key exam points:

- Avoid daily security operations from the management account.
- Use a delegated security account.
- Enable services across accounts and Regions where required.
- Configure auto-enable for new accounts when supported.
- Use centralized CloudTrail organization trails for API logging.

### Centralized CloudTrail Pattern

```text
Member accounts
        |
        v
Organization CloudTrail
        |
        v
Central S3 log bucket
        |
        +-- Athena queries
        +-- Security Lake ingestion
        +-- Long-term archive
```

---

## 7. High-Yield Traps

| Trap | Correct thinking |
|---|---|
| "CloudTrail is enabled, but S3 GetObject is missing." | Enable S3 data events. |
| "Need DNS query names." | Route 53 Resolver query logs, not VPC Flow Logs. |
| "Need network packet payload." | VPC Flow Logs are not enough; they only show metadata. |
| "Need to investigate relationships around a finding." | Detective, not Security Hub. |
| "Need to aggregate findings." | Security Hub, not Detective. |
| "Need broad normalized data lake." | Security Lake with OCSF, not CloudTrail Lake. |
| "Need SQL over CloudTrail events." | CloudTrail Lake. |
| "Need SQL over logs in S3." | Athena. |
| "Need PII discovery in S3." | Macie. |
| "Need EC2/ECR/Lambda vulnerability scanning." | Inspector. |
| "Need immediate action from GuardDuty finding." | EventBridge routing. |
| "GuardDuty DNS finding missing with custom DNS." | GuardDuty may not see DNS the same way if VPC resolver telemetry is bypassed. |
| "Need all accounts covered." | Delegated admin plus organization setup or auto-enable. |
| "Need to know if a bucket/role is shared externally." | IAM Access Analyzer. |
| "Need alarm from metric threshold." | CloudWatch alarm, usually with SNS. |

---

## 8. Fast Memory Tables

### 8.1 Logs And Evidence Sources

| Evidence needed | Use |
|---|---|
| AWS API calls | CloudTrail |
| S3 object-level access | CloudTrail data events |
| SQL over CloudTrail | CloudTrail Lake |
| Logs already in CloudWatch | CloudWatch Logs Insights |
| Logs in S3 | Athena |
| Network allow/deny metadata | VPC Flow Logs |
| DNS query names | Route 53 Resolver query logs |
| Security data lake / OCSF | Security Lake |
| Findings dashboard | Security Hub |

### 8.2 Detection Services

| Service | One-line exam meaning |
|---|---|
| GuardDuty | Suspicious activity and threat detection |
| Security Hub | Central findings and standards dashboard |
| Detective | Investigation graph after findings |
| Macie | Sensitive data discovery in S3 |
| Inspector | Vulnerability scanning for workloads |
| Access Analyzer | External/unused access and policy analysis |
| CloudTrail | AWS API audit history |
| CloudWatch | Metrics, logs, alarms, quick log queries |
| EventBridge | Event routing to response targets |

---

## 9. Worked Examples

### Example 1: Someone Stopped CloudTrail

Question:

> The security team must know within seconds when someone calls `StopLogging` on an organization trail.

Think:

```text
Specific AWS API call
Need near-real-time response
```

Answer:

```text
EventBridge rule matching CloudTrail API event
Target: SNS/Lambda/Step Functions
```

Why not CloudTrail Lake?

CloudTrail Lake is good for investigation and SQL queries, but the question says **within seconds**.

---

### Example 2: S3 Object Delete Is Missing

Question:

> A bucket object was deleted, but CloudTrail only shows bucket-level actions.

Think:

```text
Object-level S3 activity = CloudTrail data event
```

Answer:

```text
Enable S3 data events for the bucket.
```

---

### Example 3: Finding Aggregation vs Investigation

Question:

> Security Hub shows a GuardDuty finding. The analyst needs a graph of related users, IPs, and resources.

Think:

```text
Security Hub already has finding.
Need relationship graph.
```

Answer:

```text
Amazon Detective
```

---

### Example 4: Broad Security Data Lake

Question:

> The SOC wants CloudTrail, VPC Flow Logs, Route 53 Resolver logs, WAF logs, and partner logs in a common schema.

Think:

```text
Many sources + common schema = Security Lake + OCSF
```

Answer:

```text
Amazon Security Lake
```

---

### Example 5: Suspicious Domain Lookup

Question:

> GuardDuty reports communication with a malicious domain. Which log helps investigate domain lookups from VPC workloads?

Think:

```text
Domain lookup = DNS query
```

Answer:

```text
Route 53 Resolver query logs
```

---

## 10. What To Practice In The Portal

For Detection, practice in this order:

1. **CloudTrail and CloudTrail data events**
   - management vs data events
   - organization trails
   - CloudTrail Lake
   - StopLogging / DeleteTrail detection

2. **GuardDuty**
   - finding flow
   - EventBridge integration
   - organization auto-enable
   - DNS visibility traps
   - trusted IP vs suppression

3. **Security Hub vs Detective**
   - aggregate vs investigate
   - delegated admin
   - findings and standards

4. **Security Lake / OCSF**
   - broad security data lake
   - normalized schema
   - difference from CloudTrail Lake

5. **Log source selection**
   - VPC Flow Logs
   - Route 53 Resolver query logs
   - CloudWatch Logs Insights
   - Athena

6. **Macie / Inspector / Access Analyzer**
   - sensitive data vs vulnerabilities vs access analysis

7. **Event routing**
   - EventBridge to SNS/Lambda/Step Functions
   - CloudWatch alarms to SNS

---

## 11. Quick Last-Day Revision

Read this aloud:

```text
CloudTrail records API calls.
CloudTrail data events are needed for S3 object access.
CloudTrail Lake queries CloudTrail events.
Security Lake stores many security logs in OCSF format.
GuardDuty detects threats.
Security Hub aggregates findings.
Detective investigates relationships.
Macie finds sensitive data in S3.
Inspector finds vulnerabilities.
VPC Flow Logs show network metadata, not packet payloads.
Route 53 Resolver logs show DNS queries.
CloudWatch Logs Insights queries CloudWatch logs.
Athena queries logs in S3.
EventBridge routes findings and API events to response workflows.
For multi-account detection, use delegated admin and organization setup.
```

---

## 12. Mini Practice Set

### Q1

You need SQL queries over CloudTrail events with minimal pipeline setup. What do you use?

**Answer:** CloudTrail Lake.

### Q2

You need CloudTrail, VPC Flow Logs, Route 53 Resolver logs, and partner logs in a common schema. What do you use?

**Answer:** Security Lake with OCSF.

### Q3

GuardDuty finds credential exfiltration and you need an automatic response workflow. What is the pattern?

**Answer:** GuardDuty finding -> EventBridge -> Lambda/Step Functions/SNS.

### Q4

Security Hub shows a finding, and you need a graph of related entities. What do you use?

**Answer:** Detective.

### Q5

S3 `GetObject` activity is missing from CloudTrail. What should you enable?

**Answer:** S3 data events.

### Q6

You need to know which domains an EC2 instance queried through the VPC resolver. What log source do you use?

**Answer:** Route 53 Resolver query logs.

### Q7

You need accepted/rejected traffic metadata for ENIs. What do you use?

**Answer:** VPC Flow Logs.

### Q8

You need to find proprietary customer IDs inside S3 objects. What do you use?

**Answer:** Macie custom data identifiers.

### Q9

You need vulnerability findings for EC2, ECR images, and Lambda functions. What do you use?

**Answer:** Inspector.

### Q10

You need one place to collect GuardDuty, Inspector, Macie, and partner findings across accounts. What do you use?

**Answer:** Security Hub with delegated administration.

---

## 13. When You Are Confused, Ask These Three Questions

1. **Is this about raw evidence, detection, aggregation, or investigation?**

```text
Evidence      -> CloudTrail / VPC Flow Logs / Resolver logs / CloudWatch logs
Detection     -> GuardDuty / Macie / Inspector / Access Analyzer
Aggregation   -> Security Hub / Security Lake
Investigation -> Detective / CloudTrail Lake / Athena / Logs Insights
```

2. **Where are the logs stored?**

```text
CloudWatch Logs -> Logs Insights
S3              -> Athena
CloudTrail Lake -> CloudTrail Lake query
Security Lake   -> OCSF/S3-backed analytics
```

3. **Does the question ask for immediate action?**

```text
Yes -> EventBridge / CloudWatch alarm / SNS / Lambda / Step Functions
No  -> Query or investigate with the right analysis service
```

---

## 14. Detection Master Diagram

```text
                          +----------------------+
                          | AWS activity happens |
                          +----------+-----------+
                                     |
                 +-------------------+-------------------+
                 |                   |                   |
                 v                   v                   v
          API activity          Network traffic       DNS queries
          CloudTrail            VPC Flow Logs         Resolver logs
                 |                   |                   |
                 +-------------------+-------------------+
                                     |
                                     v
                           +-------------------+
                           | GuardDuty         |
                           | threat detection  |
                           +---------+---------+
                                     |
                                     v
                           +-------------------+
                           | Security Hub      |
                           | findings + checks |
                           +---------+---------+
                                     |
                 +-------------------+-------------------+
                 |                                       |
                 v                                       v
          Detective graphs                       EventBridge routing
          investigation                          SNS/Lambda/Step Functions


Other parallel paths:

S3 object content  -> Macie
Workload packages  -> Inspector
External access    -> Access Analyzer
Many security logs -> Security Lake + OCSF
CloudTrail SQL     -> CloudTrail Lake
S3 log SQL         -> Athena
CloudWatch log SQL -> Logs Insights
```

---

## 15. Final Audit Addendum: Thin Detection Topics

This section was added after rechecking the full question bank and important-topic matrix.

### 15.1 CloudTrail Insights

CloudTrail Insights detects unusual API call rate or unusual API error rate activity by analyzing CloudTrail management events.

Plain English:

> CloudTrail shows API activity. CloudTrail Insights highlights API activity that suddenly looks abnormal for that account.

Real-world example:

An account normally has almost no `DeleteBucket` calls. Suddenly it has many `DeleteBucket` calls in a short time. CloudTrail Insights can create an Insights event showing the start and end of the unusual activity.

Simple flow:

```text
CloudTrail management events
      |
      v
CloudTrail Insights analysis
      |
      +--> normal API pattern: no Insights event
      +--> unusual API call/error rate: Insights event
```

Exam angle:

Choose CloudTrail Insights when the question says:

- unusual API call volume
- unusual API error rate
- baseline compared to normal account API behavior
- CloudTrail-native anomaly around management events

Common trap:

CloudTrail Insights is not GuardDuty. GuardDuty is broader threat detection using multiple data sources. CloudTrail Insights is specifically about unusual CloudTrail API activity patterns.

### 15.2 OpenSearch Security Analytics

OpenSearch Security Analytics detects security threats from log data inside OpenSearch.

Plain English:

> OpenSearch Security Analytics is a SIEM-style feature for logs already indexed in OpenSearch.

Real-world example:

A company sends authentication logs and firewall logs into OpenSearch. Security Analytics uses detectors and rules, including Sigma-style rules, to generate findings and alerts for brute-force login attempts or suspicious access patterns.

Simple flow:

```text
Security logs in OpenSearch indexes
      |
      v
Security Analytics detector
      |
      v
Rules match suspicious patterns
      |
      +--> Finding
      +--> Alert/notification
```

Exam angle:

Choose OpenSearch Security Analytics when the question says:

- existing logs are in OpenSearch
- detect threats from indexed logs
- Sigma rules
- OpenSearch findings and alerts

Common trap:

Do not choose OpenSearch Security Analytics just because the word "analytics" appears. If the question is about AWS-native findings aggregation, Security Hub is usually better. If it is about OCSF-normalized security data lake design, Security Lake is better.

---

## 16. Final Detection Checklist

Before moving to the next domain, you should be able to answer these without looking:

- What is the difference between CloudTrail management events and data events?
- What does CloudTrail Insights detect?
- When do you use CloudTrail Lake instead of Athena?
- When do you use Security Lake instead of CloudTrail Lake?
- What does OCSF mean at a practical level?
- What does GuardDuty detect?
- How do GuardDuty findings trigger automation?
- What is Security Hub used for?
- When should you choose Detective?
- What is Macie for?
- What is Inspector for?
- What do VPC Flow Logs contain and not contain?
- When do you need Route 53 Resolver query logs?
- How do CloudWatch alarms notify people?
- What does EventBridge do in a detection workflow?
- How do you enable detection across all AWS accounts?
- When would OpenSearch Security Analytics be the better answer?

If these are clear, you are ready to drill Detection questions in the portal.
