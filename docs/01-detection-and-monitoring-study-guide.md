# 01. Detection: From Evidence To A Working Security Alert

Reviewed against AWS documentation: 2026-10-09. Exam: SCS-C03.

This chapter assumes you know what an EC2 instance, an S3 bucket, and a Lambda function are. It teaches the monitoring decisions around them, including why a seemingly correct design can fail. Read it in order the first time; use the contents when revising.

Detection is 16% of scored SCS-C03 content. The official objectives cover monitoring, logging, and troubleshooting. This is a coverage target, not a prediction of individual questions. The scenarios below are original learning exercises. [AWS exam domains](https://docs.aws.amazon.com/aws-certification/latest/security-specialty-03/security-specialty-03-appendix-b.html).

## Learning Path

**Pass 1: Collect trustworthy evidence**

1. [Understand evidence and the detection pipeline](#1-start-with-a-question-not-a-service).
2. [Collect API evidence with CloudTrail](#2-cloudtrail-understand-what-was-done).
3. [Protect evidence across accounts](#3-build-a-trustworthy-central-log-archive).
**Pass 2: Understand application and network signals**

4. [Collect application logs and build alarms](#4-cloudwatch-from-a-log-line-to-an-alert).
5. [Read network and DNS evidence](#5-network-evidence-follow-the-actual-path).
**Pass 3: Detect, investigate, and deliver alerts**

6. [Detect threats with GuardDuty](#6-guardduty-detect-suspicious-behavior).
7. [Check posture and prioritize findings](#7-findings-posture-and-regular-assessments).
8. [Query and correlate evidence](#8-investigate-and-correlate).
9. [Deliver alerts reliably](#9-eventbridge-deliver-the-alert-reliably).
**Pass 4: Diagnose and practice**

10. [Troubleshoot application and service logging](#10-troubleshoot-service-logging).
11. [Work through a complete design](#11-worked-design-a-payments-company).
12. [Practice scenario reasoning](#12-original-scenario-practice).
13. [Check readiness and objective coverage](#13-readiness-and-objective-coverage).

For unfamiliar words, start with [how a detection pipeline works](00-aws-security-foundations-for-beginners.md#detection-pipeline-from-first-principles). Concept links throughout this chapter open the relevant foundations section in Markdown readers.

## 1. Start With A Question, Not A Service

**The situation**

Imagine a support application stores customer files in S3 and runs on EC2. An employee reports that a private file appeared on the internet. There are several separate questions:

| Question | Evidence to collect | What it cannot prove alone |
| --- | --- | --- |
| Who changed the bucket's permissions? | CloudTrail management events | Whether someone downloaded a particular object |
| Which identity requested the file? | CloudTrail S3 data events | The human behind stolen credentials |
| Which customer used the application download route? | Application access/audit logs | All direct S3 access outside the application |
| Did the server connect to an unfamiliar IP? | VPC Flow Logs | The file contents sent over that connection |
| Which domain did it resolve? | Resolver query logs | That a subsequent connection succeeded |
| Was the activity suspicious? | GuardDuty findings | A complete archive of every raw event |
| Was sensitive information stored there? | Macie discovery | That the information was actually stolen |

A **log** records an observation. A **finding** is a security conclusion drawn from observations or configuration. An **alert** gets a finding or condition to someone who can act. These are different outputs, so storing logs does not automatically create an alert.

```text
An action happens
      |
      v
Evidence is captured --> Stored with appropriate retention
      |                              |
      v                              v
Detection evaluates it          Investigation searches it
      |
      v
Finding or threshold breach
      |
      v
Alert reaches a person or workflow
      |
      v
Response, followed by verification
```

**Before choosing a service, fill in the requirement**

Before choosing services, write down the assets, threats, accounts, Regions, required evidence, retention period, and acceptable delay. Also ask who needs to read the evidence and who must be unable to destroy it.

For example, a payment application might need API audit logs for a year, login failures searchable for 30 days, and a notification shortly after someone disables auditing. Those are three requirements, not one checkbox named "enable monitoring."

**Reasoning checkpoint:** A team has a dashboard showing CPU use, but no record of object downloads. Is its detection complete? No. Resource health does not answer a data-access investigation. Monitoring must follow the threat being investigated.

## 2. CloudTrail: Understand What Was Done

[CloudTrail](00-aws-security-foundations-for-beginners.md#cloudtrail) records supported AWS activity. An API request is an instruction such as "change this bucket policy" or "read this object." The console also makes API requests behind its buttons.

### 2.1 Event Categories And Collection Choices

| Category | What it describes | Example | Collection implication |
| --- | --- | --- | --- |
| Management | Resource administration | `PutBucketPolicy`, `CreateRole`, `DescribeInstances` | Trails normally include management activity |
| Data | Actions on the data/resources themselves | S3 `GetObject`, Lambda `Invoke` | Select the required supported resource types and scope |
| Network activity | Supported AWS API activity through VPC endpoints | An endpoint policy denies a request | Configure network activity selectors; it is not packet capture |
| Insights | An unusual API call/error rate compared with a baseline | A sudden abnormal burst of administrative calls | Enable Insights and the appropriate underlying management events |

"Read" does not mean "data event." `DescribeInstances` reads configuration and is a management event; S3 `GetObject` reads an object and is a data event. Classify the operation by what it does, not just its verb. [Management events](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/logging-management-events-with-cloudtrail.html), [data events](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/logging-data-events-with-cloudtrail.html).

**Event history** provides the last 90 days of management events for the account and Region being viewed.

It is not your organization's long-term log archive and does not show S3 data events. A **trail** delivers selected events to S3 and can also deliver to CloudWatch Logs. Creating a trail today cannot reconstruct data events that were never captured yesterday.

[Organization trail and Event history behavior](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/creating-trail-organization.html).

### 2.2 Read An Event Without Jumping To Conclusions

```text
Read the record in five passes

WHEN? --> WHAT ACTION? --> WHO? --> WHICH OBJECT? --> RESULT?
08:40     GetObject        Role     report.csv        Denied

Attempt observed: yes
Successful download: not established
```

This is a shortened illustrative event, not a complete CloudTrail record:

```json
{
  "eventTime": "2026-10-09T08:40:00Z",
  "eventSource": "s3.amazonaws.com",
  "eventName": "GetObject",
  "awsRegion": "ap-south-1",
  "userIdentity": {
    "type": "AssumedRole",
    "arn": "arn:aws:sts::111122223333:assumed-role/SupportExport/job-42",
    "sessionContext": {
      "sessionIssuer": {
        "arn": "arn:aws:iam::111122223333:role/SupportExport"
      }
    }
  },
  "sourceIPAddress": "203.0.113.42",
  "requestParameters": {
    "bucketName": "example-support-files",
    "key": "customers/report.csv"
  },
  "errorCode": "AccessDenied"
}
```

Read it in this order: time, action, identity, target, result. The role session attempted a read and received a denial. It does not establish a successful download.

The role's permanent ARN and the temporary session ARN describe different things; follow session context when tracing the identity. A source IP can belong to a proxy or gateway, so an IP alone is not a person's identity. See [roles and temporary credentials](00-aws-security-foundations-for-beginners.md#iam-role).

### 2.3 Select The Evidence You Actually Need

Suppose compliance requires all administrative actions plus reads and writes under a sensitive S3 prefix. An illustrative advanced-selector array is:

```json
[
  {
    "Name": "Administrative activity",
    "FieldSelectors": [
      { "Field": "eventCategory", "Equals": ["Management"] }
    ]
  },
  {
    "Name": "Sensitive object activity",
    "FieldSelectors": [
      { "Field": "eventCategory", "Equals": ["Data"] },
      { "Field": "resources.type", "Equals": ["AWS::S3::Object"] },
      {
        "Field": "resources.ARN",
        "StartsWith": ["arn:aws:s3:::example-support-files/customers/"]
      }
    ]
  }
]
```

The first selector keeps management evidence; the second adds the sensitive object scope.

Omitting a `readOnly` condition includes reads and writes within that scope. A selector that captures only writes would miss a download. A prefix selector also misses objects outside that prefix, even in the same bucket.

```text
Does the event match either configured selector?
    |
    +-- Management event --------------------> Selected
    |
    +-- S3 object event
          |
          +-- Under customers/ prefix? -- yes -> Selected
          |
          +-- Outside that prefix? ---------> Not selected here

No readOnly filter: reads AND writes in the selected scope
```

**Before changing the configuration**

Changing selectors can replace an existing selector configuration: preserve required categories when editing. Data-event collection adds cost; reduce volume with justified scope, not by removing the very events needed to investigate the threat. [AWS selector examples](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/logging-data-events-with-cloudtrail.html).

### 2.4 Insights And Endpoint Denials

#### A. Is The API Rate Unusual?

CloudTrail Insights compares API rates with normal behavior. Call-rate analysis requires write management events; error-rate analysis requires read or write management events. An anomaly is a reason to investigate, not proof of compromise. A deployment can legitimately cause a burst.

GuardDuty addresses broader threat behavior, while Insights addresses this narrower rate question. [Insights collection requirements](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/logging-management-events-with-cloudtrail.html).

#### B. Did The Endpoint Policy Deny The Request?

Network activity events address another specific question: what happened when an API request passed through a supported [VPC endpoint](00-aws-security-foundations-for-beginners.md#vpc-endpoint)? A `VpceAccessDenied` event can identify endpoint-policy denial. VPC Flow Logs might show allowed network traffic while API authorization still fails.

TCP connectivity and permission to call an API are separate checks. [Network activity events](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/logging-network-events-with-cloudtrail.html).

### 2.5 CloudTrail Lake: Recognize The Current Constraint

> **Availability checkpoint:** Existing customer or new customer? That changes which designs are available.

[CloudTrail Lake](00-aws-security-foundations-for-beginners.md#cloudtrail-lake) is a managed event store with SQL queries. It can also ingest supported non-AWS events; "CloudTrail only" is too restrictive a definition. However, AWS closed it to new customers on May 31, 2026.

Existing customers can continue using it. A new implementation must consider availability, not mechanically choose Lake whenever SQL appears. Existing S3 archives can be queried with Athena; CloudWatch is another direction identified by AWS. [AWS availability notice](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-lake-service-availability-change.html).

**Worked decision:** An existing Lake customer needs to investigate its stored events. Querying that store is sensible. A new account already has years of S3 audit logs and needs occasional SQL searches. Athena fits the existing data location and avoids assuming new Lake enrollment.

## 3. Build A Trustworthy Central Log Archive

### 3.1 Separate Administrative Control From Workloads

An [AWS account](00-aws-security-foundations-for-beginners.md#aws-account) is a useful boundary. Production administrators should not automatically be log-archive administrators.

```text
Management account / authorized delegated administrator
                 |
                 +--> Organization trail, multi-Region
                              |
         +--------------------+-------------------+
         |                    |                   |
      App account A       App account B       New account C
         |                    |                   |
         +--------------------+-------------------+
                              |
                              v
                   Log archive account: S3 + KMS
                              |
                              v
                   Security analysts: limited read access
```

An organization trail brings member accounts into a common trail configuration; members cannot alter that organization trail. Multi-Region scope captures enabled Regions, subject to opt-in behavior. These settings do not automatically enable every data-event type.

Also, choosing an opt-in home Region can exclude members that have not enabled it. [Organization trail behavior](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/creating-trail-organization.html).

### 3.2 Delivery Permission And Reading Permission Are Different

The diagram shows required permission checks, not the chronological order of AWS API calls.

```text
PATH 1: SERVICE DELIVERS EVIDENCE

CloudTrail --> S3 write --> KMS encryption permission
                                   |
                                   v
                            Encrypted log object

PATH 2: ANALYST READS EVIDENCE

Analyst --> S3 read --> KMS decrypt permission
                                |
                                v
                         Readable evidence
```

Learn [how log delivery crosses permission boundaries](00-aws-security-foundations-for-beginners.md#log-delivery-permissions-step-by-step) before memorizing a policy.

CloudTrail must be permitted to write to the archive. Its bucket policy normally includes the service principal `cloudtrail.amazonaws.com`, `s3:GetBucketAcl` on the bucket, and `s3:PutObject` on the required log prefix. Organization delivery needs the organization prefix.

Restrict the service's use to the intended trail with `aws:SourceArn`; do not solve a delivery problem by making the bucket public. [CloudTrail bucket policy](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/create-s3-bucket-policy-for-cloudtrail.html).

With SSE-KMS, the [KMS key policy](00-aws-security-foundations-for-beginners.md#kms-key-policy) must permit the required CloudTrail encryption operations. Analysts separately need S3 read access and KMS decryption access. A disabled key can break a previously valid design.

"The bucket policy allows it" is not enough when the encryption layer denies it. [CloudTrail KMS permissions](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/create-kms-key-policy-for-cloudtrail.html).

### 3.3 Confidentiality, Retention, And Integrity Solve Different Problems

```text
WHO CAN READ IT?    CAN IT BE DELETED?    WAS IT CHANGED?
       |                   |                   |
       v                   v                   v
Access + encryption     Retention          Validation

One control does not answer all three questions.
```

| Requirement | Control | Why another control alone is insufficient |
| --- | --- | --- |
| Unauthorized people must not read logs | Restrictive policies and encryption | Encryption does not stop an authorized principal deleting objects |
| Preserve evidence for a required period | Appropriate retention and S3 Object Lock | A checksum does not prevent deletion |
| Detect alteration after delivery | CloudTrail log file validation | Validation does not prevent tampering |
| Reduce archive storage cost | S3 lifecycle transitions consistent with retention | Moving to an archive class can delay investigation access |
| Keep analysts from changing evidence | Separate read and administration roles | A shared administrator identity defeats separation |

CloudTrail validation uses signed digest files and hashes. Enable it before the period you need to validate, retain the digest chain, and perform validation. Merely enabling the feature does not mean someone has checked the logs.

It verifies delivered evidence, not whether you selected every necessary event category. [Log validation](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-log-file-validation-intro.html).

[Object Lock](00-aws-security-foundations-for-beginners.md#s3-object-lock) operates on object versions. Compliance retention is stronger against early deletion than governance retention with authorized bypass. Choose based on the stated requirement and keep the decryption key usable for the retention period. An undeletable encrypted object with an unusable key is not useful evidence.

**Worked failure:** New member accounts appear in the organization trail, but their log prefixes remain empty. Check trail status, bucket prefix permissions, and KMS permission. Seeing the trail listed does not prove delivery succeeded.

Do not deploy another trail in every account until you understand the existing failure.

## 4. CloudWatch: From A Log Line To An Alert

[CloudWatch](00-aws-security-foundations-for-beginners.md#cloudwatch) handles application logs, measurements, queries, and alarms. [Logs, metrics, and alarms](00-aws-security-foundations-for-beginners.md#logs-metrics-and-alarms-explained) explains how these pieces differ.

### 4.1 EC2 Does Not Automatically Upload Application Files

An EC2 instance can publish standard CPU metrics while its authentication log remains only on disk.

To collect that file with the unified CloudWatch agent, you need the agent installed and running, a collection configuration, local file-read access, an instance role, and network access to the destination service.

```text
/var/log/example-app/security.log
             |
             | Local file permission + configured path
             v
      CloudWatch agent process
             |
             | Instance role + reachable service endpoint
             v
      CloudWatch Logs log group
             |
             +--> Query, metric filter, or subscription
```

A minimal illustrative Linux agent configuration:

```json
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/example-app/security.log",
            "log_group_name": "/production/support/security",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  }
}
```

This config selects a file; it does not grant permissions or create a network route. In private subnets, provide the appropriate service endpoints or outbound path. The `logs` endpoint serves log ingestion; metrics use their own service endpoint.

Systems Manager dependencies matter if it deploys/manages the agent. [CloudWatch agent](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Install-CloudWatch-Agent.html).

### 4.2 Build A Threshold With Meaning

Suppose the application emits this original example:

```json
{
  "timestamp": "2026-10-09T09:00:00Z",
  "event": "login_failed",
  "requestId": "req-412",
  "sourceIp": "203.0.113.12",
  "reason": "invalid_credentials"
}
```

A metric filter matching `{ $.event = "login_failed" }` can publish value `1` to a custom metric such as `Security/LoginFailures`. An alarm can evaluate `Sum >= 20` in a five-minute period and notify SNS. The filter converts records into a number; the alarm evaluates that number.

Do not accidentally use `Average` when you mean total failures. Dimensions identify separate metric series: a metric with `Environment=prod` is not the same series as one with no dimension. Avoid uncontrolled dimensions such as every request ID because they create many series and cost.

A metric filter processes newly ingested matching events, not historical backfill. A query over yesterday's failures can find them, but adding a filter today does not retroactively create yesterday's metric. [Metric filters](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/MonitoringLogData.html).

### 4.3 Missing Data Is Not Automatically Good News

```text
Measured zero                   No measurement
      |                               |
      v                               v
"The count was 0"              "We do not have a value"
                                      |
                             +--------+--------+
                             |                 |
                       Expected quiet?    Collector broken?
```

Alarms have `OK`, `ALARM`, and `INSUFFICIENT_DATA` states. The missing-data setting is part of the design.

| Metric behavior | Sensible reasoning |
| --- | --- |
| A heartbeat should arrive every minute | Missing values may indicate a broken collector and should trigger investigation |
| An error metric appears only when failures occur | Missing may be normal; blindly treating every gap as a breach creates noise |
| A metric publishes a reliable zero when healthy | Zero and missing have different meanings; missing may indicate pipeline failure |

An M-out-of-N alarm requires M breaching periods among N evaluated periods. For example, 2 of 3 one-minute periods reduces sensitivity to a single short spike.

It can also delay detection, so choose it intentionally. A notification typically follows a state transition; an alarm remaining in `ALARM` is not an email timer. [Alarm evaluation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html).

Anomaly detection can adapt to a changing baseline, whereas a static threshold represents a fixed business boundary. A composite alarm combines alarm states, for example elevated failures AND production traffic present, to reduce noise. Neither fixes missing source logs.

### 4.4 Search, Count, And Stream Are Different Actions

| Requirement | Mechanism |
| --- | --- |
| Investigate existing log records interactively | Logs Insights query |
| Count new matching events for an alarm | Metric filter |
| Forward matching logs to processing or a SIEM | Subscription filter |
| Access telemetry from linked accounts in a Region | Cross-account observability |
| Replicate logs into a central account/Region | CloudWatch Logs centralization, with configured rules |

Example Logs Insights query for the JSON above:

```sql
fields @timestamp, sourceIp, requestId, reason
| filter event = "login_failed"
| stats count(*) as failures by sourceIp, bin(5m)
| sort failures desc
| limit 20
```

Subscriptions deliver to services such as Kinesis Data Streams, Data Firehose, or Lambda. Consumers must handle batched, encoded/compressed events and possible duplicates. Monitor delivery failures; a successful match does not prove the destination accepted the data. Do not confuse streaming with a historical export. [Subscriptions](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Subscriptions.html).

Cross-account visibility and central copies are different requirements. Observability links allow investigation across accounts; centralization rules replicate selected data. Neither is automatically an immutable evidence archive. [Cross-account choices](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Cross-Account-Methods.html).

### 4.5 Health Checks And Sensitive Logs

#### Test The Customer's Path

A resource health check asks whether something responds correctly. An EC2 status check can pass while the application's login route fails. Use application-level checks, such as an appropriate synthetic request, when the requirement is end-user availability.

The check's network access, credentials, timeout, and expected response must match the actual application.

CloudWatch Synthetics runs scheduled scripts that exercise endpoints or user journeys and publishes measurements. A script can check both status and expected content; a generic HTTP 200 is not proof the requested business operation worked. [Synthetic monitoring](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Synthetics_Canaries.html).

#### Protect What The Logs Contain

Avoid putting passwords and tokens into logs. [CloudWatch Logs data protection](00-aws-security-foundations-for-beginners.md#cloudwatch-logs-data-protection) can audit and mask supported sensitive data patterns, but privileged unmask access must be restricted. Masking is not a substitute for redacting secrets before logging or rotating credentials already exposed.

## 5. Network Evidence: Follow The Actual Path

### 5.1 Understand A Flow Record

[VPC Flow Logs](00-aws-security-foundations-for-beginners.md#vpc-flow-logs) summarize traffic associated with network interfaces. An **ENI** is an Elastic Network Interface: a network attachment with addresses used by an instance or service.

```text
Field: srcaddr   dstaddr       srcport dstport protocol packets bytes action status
Value: 10.0.2.7  198.51.100.9  49152   443     6        12      8200  ACCEPT OK
```

This says the recorded flow used TCP (`6`) from a temporary client port to destination port 443, with the listed traffic volume. `ACCEPT` describes network acceptance, not successful HTTPS authentication, a successful file transfer, or benign behavior.

`REJECT` helps identify blocked traffic but does not name the exact security-group or NACL rule. `NODATA` indicates no network traffic for the interval; `SKIPDATA` means records were skipped.

Neither means "the network rejected a packet." Custom formats can add fields for original packet addresses and traffic direction, which help with intermediate devices. [Flow record fields](https://docs.aws.amazon.com/vpc/latest/userguide/flow-log-records.html).

Flow Logs do not contain HTTP bodies or SQL queries. They also exclude some traffic, including queries to the Amazon-provided DNS server and instance metadata traffic. Collection is aggregated and delivered asynchronously; it is not an inline blocking system. [Flow Log limitations](https://docs.aws.amazon.com/vpc/latest/userguide/flow-logs.html).

### 5.2 DNS And Transit Gateway Evidence

[DNS](00-aws-security-foundations-for-beginners.md#dns-and-network-evidence-explained) translates a name into addresses. Resolver query logs help answer which workload queried which domain. They do not prove a TCP connection followed. Cached Resolver answers mean repeated application lookups do not necessarily create repeated query-log records.

Queries that bypass the VPC Resolver, such as a separate encrypted DNS path, need their own visibility. [Resolver logging](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resolver-query-logs.html).

In a hub network, [Transit Gateway](00-aws-security-foundations-for-beginners.md#transit-gateway) routes traffic among attached VPCs and on-premises networks. Transit gateway flow logs add visibility at that transit layer, including attachment context and supported packet-loss counters. An EC2 ENI log alone may not explain a drop in the hub.

[Transit gateway flow logs](https://docs.aws.amazon.com/vpc/latest/tgw/tgw-flow-logs.html).

```text
Application ENI --> VPC routing --> TGW attachment --> Remote network
      |                                  |
      v                                  v
VPC Flow Logs                     TGW Flow Logs

Application --> Resolver --> Domain answer
                  |
                  v
           Resolver query log
```

### 5.3 Work Through An Ambiguous Symptom

```text
Observed symptom                Evidence to inspect
----------------                -------------------
Name cannot be resolved  ---->  DNS path / Resolver evidence
Packets dropped at hub   ---->  TGW evidence / routes
TCP accepted; app fails  ---->  Return path / TLS / application
Need packet contents     ---->  Supported packet capture path
                                (encryption still matters)
```

An application times out calling a partner service. Flow Logs show `ACCEPT` to port 443.

Do not conclude that the partner application is healthy. Check return traffic, routing, TLS negotiation, and application logs. If the symptom is "name not found," investigate DNS first. If a Transit Gateway drop counter indicates no route, inspect the relevant routing configuration.

If you need actual packet contents, consider supported Traffic Mirroring with an analysis tool; encrypted payloads remain encrypted unless the inspection design can decrypt them.

The principle is to choose evidence at the layer where the symptom occurs. Adding more copies of the wrong log does not answer the question.

## 6. GuardDuty: Detect Suspicious Behavior

[GuardDuty](00-aws-security-foundations-for-beginners.md#guardduty) is managed threat detection. It uses threat intelligence and behavioral analysis, so you do not write every rule yourself.

### 6.1 Independent Detection Does Not Replace Your Archive

GuardDuty consumes independent streams of foundational CloudTrail management, VPC flow, and DNS telemetry. You do not need to create your own trail or Flow Log resource just to supply these foundational signals.

Conversely, enabling GuardDuty does not give you a searchable raw archive of all those events. Maintain your own required logs for investigation and retention. [GuardDuty data sources](https://docs.aws.amazon.com/guardduty/latest/ug/guardduty_data-sources.html).

```text
AWS activity ----> GuardDuty's independent analysis ----> Finding
      |
      +---------> Your configured logging -------------> Evidence archive
```

### 6.2 Match Protection To The Workload

Foundational detection is not every optional protection capability.

| Need | Protection to examine | Important distinction |
| --- | --- | --- |
| Suspicious object access | S3 Protection | Behavior around S3 access, not sensitive-content classification |
| Suspicious Kubernetes API activity | EKS Protection | Audit activity, not all process behavior inside a container |
| Process/runtime behavior | Runtime Monitoring | Requires supported workloads and healthy security-agent coverage |
| Suspicious supported database logins | RDS Protection | Login behavior, not a general database vulnerability scanner |
| Suspicious Lambda network activity | Lambda Protection | Network behavior, not Lambda source-code review |
| Malware in supported EC2 volumes | Malware Protection for EC2 | Different telemetry and prerequisites from runtime monitoring |
| Malware in uploaded S3 objects | Malware Protection for S3 | Malware detection, not Macie's sensitive-data discovery |

Verify each plan's Region, workload support, and coverage status. An enabled account with an unhealthy runtime agent still has a runtime visibility gap. [Protection feature model](https://docs.aws.amazon.com/guardduty/latest/ug/guardduty-features-activation-model.html).

### 6.3 Read, Prioritize, And Tune Findings

#### Read The Finding In Context

Use the finding's type, account, Region, resource, severity, first/last observed times, and recurrence information together. A repeated finding may update an existing finding rather than represent a new independent incident every time. Severity helps triage; asset importance and exposure determine business impact. [Finding behavior](https://docs.aws.amazon.com/guardduty/latest/ug/guardduty_findings.html).

#### Reduce Noise Without Hiding Unrelated Activity

```text
Finding generated
      |
      +-- Matches suppression rule?
              |
              +-- Yes --> Archived; normal forwarding stops
              |
              +-- No ---> Normal downstream forwarding

Scanner-specific exception != Suppress every EC2 finding
```

Suppose an approved scanner generates port-scanning findings. A narrow suppression rule for that known scanner and finding type may be appropriate. A rule suppressing all EC2 findings would hide unrelated incidents.

Suppressed findings are archived and are not forwarded to destinations such as EventBridge or Security Hub CSPM; they also affect downstream correlation. [Suppression behavior](https://docs.aws.amazon.com/guardduty/latest/ug/findings_suppression-rule.html).

Trusted and threat lists influence supported detections; they are not firewall rules. Their applicability varies by finding type. Do not infer that trusting an IP makes every possible activity safe or suppresses all detection types. [Entity and IP lists](https://docs.aws.amazon.com/guardduty/latest/ug/guardduty_upload-lists.html).

### 6.4 Organization Coverage Must Be Verified

**Check all four dimensions**

```text
Coverage check
    |
    +-- Accounts
    +-- Regions
    +-- Protection plans
    +-- Telemetry health

A central dashboard does not prove all four are complete.
```

Use service-native organization administration through a security account. Verify existing accounts, new-account enrollment, all required Regions, and individual protection plans. An administrator view is not proof that every member has every plan enabled.

For a test, generate a sample finding and verify delivery through the alert pipeline. That tests routing, not whether your real workload supplies healthy runtime telemetry. Both tests are necessary when the requirement includes runtime detection.

## 7. Findings, Posture, And Regular Assessments

### 7.1 Security Hub CSPM And Security Hub

#### Keep The Product And Format Together

[Security Hub](00-aws-security-foundations-for-beginners.md#security-hub) naming has evolved. Security Hub CSPM provides security posture controls and findings aggregation in AWS Security Finding Format (ASFF). Current Security Hub adds broader unified prioritization and correlation.

Identify the capability being requested rather than treating every mention of the product family as interchangeable. [Security Hub CSPM overview](https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html), [Security Hub overview](https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub-v2.html).

Current Security Hub uses OCSF findings and can show attack-path relationships for exposure analysis. Therefore, "Security Hub always means ASFF" and "only Detective has any graph" are both unsafe shortcuts. Detective's behavior investigation and Security Hub's exposure context are different capabilities.

Read the scenario's product and task carefully.

#### Follow The Assessment Lifecycle

```text
Resource recorded --> Control evaluated --> Finding / result
                                                  |
                                                  v
                                          Workflow updated
                                                  |
                                        Resource actually fixed?
                                                  |
                                                  v
                                           Re-evaluate state

Closing the workflow does not perform the resource fix.
```

For standards and control checks, understand dependencies. Many CSPM checks depend on AWS Config recording the relevant resources in the relevant Region.

Enabling a standard is not evidence that all prerequisites are correct. A finding marked resolved in a workflow is not proof the underlying resource was fixed; re-evaluation provides that evidence.

Central configuration policies manage service/standard/control settings across selected organization accounts and Regions. Finding aggregation brings results together. These are different jobs: collecting findings from a Region does not itself enable every producer there. [Central configuration](https://docs.aws.amazon.com/securityhub/latest/userguide/central-configuration-intro.html).

### 7.2 Config And State Manager: State Rather Than Attack Behavior

[AWS Config](00-aws-security-foundations-for-beginners.md#aws-config) records supported resource configurations and evaluates rules. CloudTrail might show who changed a security group; Config can show its recorded state and whether that state violates a rule. These perspectives complement each other.

A [conformance pack](00-aws-security-foundations-for-beginners.md#conformance-pack) bundles Config rules and remediation definitions. An aggregator collects configuration/compliance views; it does not turn on recording in all accounts. Check recorder scope, rule triggers, and permissions when results are absent or stale. [How Config works](https://docs.aws.amazon.com/config/latest/developerguide/how-does-config-work.html).

[State Manager](00-aws-security-foundations-for-beginners.md#regular-assessments-and-state-manager) applies a defined configuration to managed nodes through associations and schedules. For example, maintain a monitoring agent's desired configuration across a fleet. It is not a replacement for CloudTrail evidence or GuardDuty detection. [State Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-state.html).

### 7.3 Sensitive Data, Vulnerabilities, And Access Are Separate Risks

| Question | Service | What still requires another control |
| --- | --- | --- |
| Does an S3 file contain sensitive identifiers? | Macie | Blocking inappropriate access or removing exposed data |
| Does a supported workload contain a known vulnerable package? | Inspector | Patching and verifying the new state |
| Does a supported resource policy permit access outside my trust boundary? | IAM Access Analyzer | Establishing whether anyone actually used that access |
| Did activity look like an attack? | GuardDuty | Investigation and response |

#### Macie: What Is Inside The Object?

[Macie](00-aws-security-foundations-for-beginners.md#macie) uses managed identifiers or custom patterns. An original custom-pattern idea is `CASE-[0-9]{8}` near the keyword `customer`. Context words reduce false positives compared with matching any eight digits.

Discovery jobs and automated discovery have different scope/sampling choices. A clean result means little if the object was excluded, unsupported, or unreadable because of permissions or encryption. [Discovery jobs](https://docs.aws.amazon.com/macie/latest/user/discovery-jobs.html).

#### Inspector: Is The Workload Vulnerable?

[Inspector](00-aws-security-foundations-for-beginners.md#inspector) scans supported EC2, ECR, and Lambda resources using the relevant scan capabilities. Coverage and scan eligibility matter: "Inspector is enabled" does not prove that a particular image or function was scanned.

EC2 agent-based and supported agentless approaches have different requirements; do not assume the SSM agent is universally required for every scan mode. [Inspector scan types](https://docs.aws.amazon.com/inspector/latest/user/scanning-resources.html).

#### Access Analyzer: Is Access Possible?

[IAM Access Analyzer](00-aws-security-foundations-for-beginners.md#iam-access-analyzer) analyzes access, not actual packet flows. An external-access finding establishes possible exposure through supported policies, not data theft. Use CloudTrail and application evidence to investigate use. Different analyzer types and features serve external/internal access, unused access, and policy validation/generation requirements.

## 8. Investigate And Correlate

### 8.1 Query Where The Evidence Lives

[Query tools](00-aws-security-foundations-for-beginners.md#athena-cloudwatch-logs-insights-and-cloudtrail-lake) should be chosen from data location, shape, retention, and operational needs.

| Situation | Starting choice | Work you still need |
| --- | --- | --- |
| Logs already in CloudWatch | Logs Insights | Correct log groups, time range, query, permissions |
| Audit archive already in S3 | Athena | Table/schema, partitions, S3/KMS and result-location access |
| Existing CloudTrail Lake store | Lake SQL | Correct store, selection scope, retention and access |
| Logs already indexed in OpenSearch | OpenSearch queries / Security Analytics | Field mappings, detectors and notification setup |
| Need a relationship view around suspicious entities | Detective | Relevant enabled data sources and account coverage |

#### Picture The Query Path

```text
Table/schema --> Describes where and how to read files
                         |
                         v
Query -------> Read selected S3 data --> Write query results
                    |                          |
               S3 + KMS access            Result access
                    |                          |
                    +---- Check separately ----+
```

In Athena, a **table** describes how to interpret files; it does not mean the files were copied into a separate database. A **partition** groups records, often by date/account/Region, so queries can avoid scanning everything.

If the table points to the wrong prefix, a valid SQL query can return zero rows.

Illustrative SQL, assuming a table named `audit_events` with the displayed string columns:

```sql
SELECT eventtime, eventname, sourceipaddress
FROM audit_events
WHERE eventsource = 's3.amazonaws.com'
  AND eventname = 'GetObject'
  AND eventtime >= '2026-10-09T00:00:00Z'
ORDER BY eventtime DESC;
```

Real Athena CloudTrail tables may use different nested fields and partition columns. Match the schema and filter partitions. A query also needs somewhere to write its results; failure at the results bucket is different from lack of permission to read the source.

### 8.2 Security Lake Normalizes; It Does Not Automatically Investigate

[Security Lake](00-aws-security-foundations-for-beginners.md#security-lake) stores supported security sources in S3 using OCSF and Parquet. **OCSF** gives different security events a common structure. **Parquet** is a column-oriented file format useful for analytics.

Choose supported native sources explicitly, such as CloudTrail management events, VPC Flow Logs, Resolver query logs, Security Hub CSPM findings, WAF logs, and supported EKS audit sources. Native source support is specific: do not assume selecting CloudTrail management events includes every S3 data event.

Custom sources must meet the integration's schema and delivery requirements. [Native sources](https://docs.aws.amazon.com/security-lake/latest/userguide/internal-sources.html).

Subscribers consume the lake through configured data access or query access. Collection, schema normalization, access grants, and the analytics tool are separate parts. A SIEM, or security information and event management system, searches/correlates security data and helps analysts handle alerts.

#### Two Ways To Consume The Lake

```text
Security Lake
     |
     +-- Data access --> Object notification --> Read object
     |
     +-- Query access --> Lake Formation tables --> Query

Both paths: check permitted source AND Region.
```

Data-access subscribers receive notifications of new objects, through supported HTTPS or SQS mechanisms, and retrieve the permitted data. Query-access subscribers query Lake Formation tables with tools such as Athena.

Access is scoped by source and Region; a rollup Region can collect contributing Regions for a regional subscriber. This is why "the subscriber exists" does not prove it can see every source everywhere. [Subscriber access](https://docs.aws.amazon.com/security-lake/latest/userguide/subscriber-management.html).

```text
Supported AWS sources + correctly integrated custom sources
                          |
                          v
                Security Lake normalization
                          |
                          v
                S3 data organized for analysis
                          |
                          v
             Authorized subscriber / query tool
```

### 8.3 Correlation Requires Shared Context

Correlation means connecting related observations. Preserve event time, ingestion time, account, Region, resource, identity/session, and request identifiers where available. Normalize time zones before comparing records. A shared NAT IP is weaker evidence than a matching request ID or role session.

An illustrative timeline:

```text
09:00  CloudTrail: role session created
09:02  CloudTrail data event: sensitive object read by that session
09:03  App log: export job completed, same job identifier
09:05  GuardDuty: unusual access behavior involving the role
```

This sequence gives investigation leads. It does not prove the export was unauthorized; check the job owner, approved purpose, and actual result.

#### Choose An Investigation View

[Detective](00-aws-security-foundations-for-beginners.md#detective) provides entity relationships and behavior views for investigation. It does not replace preserving raw evidence. OpenSearch Security Analytics uses detectors and rules over indexed data; incorrect field mappings can prevent useful matches.

Managed Grafana visualizes data sources; it is not a substitute for collection or detection. Lambda can parse custom records, but a custom pipeline brings maintenance, permission, and failure-handling work.

Detective can also integrate with Security Lake to retrieve supported raw evidence. That is a configured integration, not automatic access to arbitrary S3 files.

In OpenSearch Security Analytics, connect the intended index, map its fields, choose relevant rules (including supported Sigma rules), and configure alerts; storing a log in an index alone does not activate a detector. [Detective integrations](https://docs.aws.amazon.com/detective/latest/userguide/what-is-detective.html), [OpenSearch Security Analytics](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/security-analytics.html).

## 9. EventBridge: Deliver The Alert Reliably

[EventBridge and notification services](00-aws-security-foundations-for-beginners.md#eventbridge-sns-sqs-and-lambda-together) connect detection with action. An **event bus** receives events, a **rule** matches selected events, and a **target** handles matched events.

### 9.1 Match The Actual Event Shape

An example rule for GuardDuty findings with severity at least 7:

```json
{
  "source": ["aws.guardduty"],
  "detail-type": ["GuardDuty Finding"],
  "detail": {
    "severity": [{ "numeric": [">=", 7] }]
  }
}
```

The numeric condition includes values such as 7.5. An exact-match list `[7, 8, 9]` misses fractional values and is not a general "7 or higher" condition. Event patterns must match the field types and nesting in the received event. [EventBridge comparisons](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-create-pattern-operators.html).

For logging-tamper detection, an illustrative pattern is:

```json
{
  "source": ["aws.cloudtrail"],
  "detail-type": ["AWS API Call via CloudTrail"],
  "detail": {
    "eventSource": ["cloudtrail.amazonaws.com"],
    "eventName": ["StopLogging", "DeleteTrail", "UpdateTrail", "PutEventSelectors"]
  }
}
```

This intentionally detects attempts too. Inspect `errorCode` before concluding the configuration actually changed. Monitor more than `StopLogging`: changing selectors can remove evidence without deleting a trail.

CloudTrail-mediated EventBridge events require an active trail with appropriate selection. Read-only management events require the rule state `ENABLED_WITH_ALL_CLOUDTRAIL_MANAGEMENT_EVENTS`; ordinary enabled rules do not generally include them. Account, Region, bus, category, and rule state all matter. [CloudTrail event delivery](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-service-event-cloudtrail.html).

### 9.2 A Matched Rule Is Only Half The Journey

```text
Finding exists
     |
     v
Correct bus/Region --> Pattern matches --> Target permission valid?
                                              |
                         +--------------------+-------------------+
                         |                                        |
                         v                                        v
                   Target accepts                          Delivery fails
                         |                                        |
                         v                                        v
                  Handler succeeds?                         Retry / DLQ
```

The required permission depends on the target. For example, Lambda needs an invocation permission for EventBridge, and SNS needs the appropriate topic policy. Encrypted targets may introduce KMS permissions. A cross-account bus additionally needs permission to receive forwarded events.

Configure retries and a supported SQS dead-letter queue (DLQ) for undelivered target events. The queue also needs permission for EventBridge to write to it. Monitor it and define how to correct and replay failures. [EventBridge DLQs](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-rule-dlq.html).

Delivery success is not the same as business success. Once Lambda accepts an asynchronous invocation, later handler failures need Lambda's own failure handling; an EventBridge delivery DLQ is not a universal catch-all for application errors.

Make actions **idempotent**: handling a duplicate must not create a second destructive action or duplicate ticket. A stable finding ID plus action state is often useful.

### 9.3 Test Each Boundary

```text
Finding exists?
    |
    v
Not suppressed? --> Correct bus? --> Rule matches?
                                         |
                                         v
                                 SNS publish permitted?
                                         |
                                         v
                                 Subscriber confirmed?
                                         |
                                         v
                                 Notification received?
```

For a finding-to-email path, verify: the finding exists, is not suppressed, reaches the right bus, matches the rule, can be published to SNS, and has a confirmed subscriber. For encrypted SNS, inspect the relevant key permissions too.

Use sample findings to test routing. Then verify actual source coverage separately. Also monitor delivery latency, failed invocations, and log-ingestion gaps. A silent pipeline is not proof of a quiet environment.

## 10. Troubleshoot Service Logging

The most useful troubleshooting method is to locate the first missing handoff. Do not broaden permissions everywhere at once.

```text
Did the action happen?
   -> Is this the right evidence source?
   -> Was collection enabled at that time and scope?
   -> Could the producer read/create the log?
   -> Could it authenticate, authorize, and reach the destination?
   -> Was data delivered but filtered, delayed, expired, or queried incorrectly?
   -> Did the detector, alarm, and target work?
```

### 10.1 Lambda Logs

Lambda logging depends on the execution role's relevant CloudWatch Logs permissions, including creating streams and putting events, plus log-group creation if required. Check the configured destination, log-level filters, invocation evidence, and delivery delay before assuming no logs means no execution.

Adding an EC2 CloudWatch agent is not the remedy for Lambda service logging. [Lambda logs](https://docs.aws.amazon.com/lambda/latest/dg/monitoring-cloudwatchlogs.html).

### 10.2 API Gateway Logs

```text
Request --> API stage --> Authorizer --> Backend Lambda
                             |
                             +-- Denied here?
                                     |
                                     v
                             No backend invocation

Inspect the layer that handled or rejected the request.
```

For REST APIs, execution logs help debug processing; access logs record selected request context. Check stage-level settings, the CloudWatch role configuration, and destination permissions. HTTP APIs have different logging capabilities; do not copy REST execution-logging assumptions blindly.

Include correlation identifiers and status in access-log formats. A request denied by an authorizer may never reach the backend, so an empty Lambda application log is not evidence that the API received no request.

Avoid unnecessary body/data tracing when it could expose credentials or personal information. [REST API logging](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html).

### 10.3 CloudFront, WAF, And Load Balancers

CloudFront viewer access logs answer questions about edge requests. They are not the same as CloudTrail distribution-configuration events. Check the selected standard-logging version and destination; legacy delivery prerequisites should not be assumed for every newer destination. Real-time logs have their own configuration and sampling. [CloudFront logging](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/AccessLogs.html).

WAF logs explain rule actions, while load-balancer access logs describe requests observed at the load balancer. A WAF-blocked request may not reach the application at all. In a layered design, compare logs from the layer that actually handled or rejected the request.

### 10.4 Troubleshooting Matrix

| Symptom | First useful checks | Misleading fix |
| --- | --- | --- |
| S3 download absent from trail | Data-event selector, bucket/prefix, time enabled | Turn on more management events |
| Trail exists but archive stops growing | Trail status, S3 prefix policy, KMS key state/permissions | Assume organization membership proves delivery |
| EC2 CPU exists but application logs do not | Agent, file path/read access, IAM, endpoints | Enable detailed EC2 metrics |
| Logs exist but metric never changes | Filter match, metric namespace/dimensions, new ingestion | Reinstall an already-working log agent |
| Alarm is stuck in insufficient data | Correct series, evaluation periods, missing-data policy | Lower threshold blindly |
| GuardDuty findings absent centrally | Member/Region/plan coverage, suppression, forwarding | Trust the central dashboard alone |
| EventBridge rule matches but email absent | Target policy, KMS, SNS confirmation, delivery metrics | Change the event pattern again |
| Athena returns zero rows | Prefix, partitions, event time, collection scope | Give administrator access |
| Athena query cannot write results | Result bucket/KMS and workgroup configuration | Change the source event selector |
| DNS behavior missing | Resolver path, VPC association, cache, destination permissions | Expect Flow Logs to contain DNS names |

## 11. Worked Design: A Payments Company

```text
APPLICATION ACCOUNTS: 30 accounts / 2 Regions
     |
     +-- API audit -----------> Restricted log archive
     +-- App / network logs --> Searchable evidence
     +-- GuardDuty / posture -> Findings
                                  |
                                  v
                           EventBridge --> Triage
                                               |
                                               v
                                       Approved response

SECURITY TEAM
     +-- Query evidence
     +-- Verify coverage and delivery
     +-- Verify fixes, not just closed tickets
```

The company has 30 accounts in two enabled Regions. It stores sensitive exports in S3, runs private EC2 workers and Lambda APIs, and needs a year of audit evidence. The security team needs central investigations and timely alerts without giving application teams permission to erase evidence.

### 11.1 Translate Requirements Into Separate Controls

#### 1. Preserve API Evidence

Start with an organization multi-Region trail to a restricted archive account. Add data events for sensitive export objects. Apply retention, encryption, access separation, and validation appropriate to the evidence requirement. Confirm that both Regions and new accounts are covered.

#### 2. Collect Workload And Network Evidence

Collect worker application/security files using configured agents. Enable the relevant Lambda and API logs, and use request IDs to join application observations. Configure VPC and Resolver logging where needed; do not use a successful API audit trail as evidence of complete network visibility.

#### 3. Detect And Route Actionable Findings

Enable GuardDuty with the plans required by the workloads and verify member coverage. Configure Security Hub CSPM for the posture baseline with the relevant Config recording. Route actionable findings through EventBridge to notification/triage.

Keep application remediation separate enough to require approval where a false positive could interrupt payments.

#### 4. Give Analysts The Right Query Path

Use Athena for archive investigations and Logs Insights for operational logs. Add Security Lake if common-schema, multi-source analytics is an actual requirement; it is not mandatory merely because the organization has many accounts.

### 11.2 Demonstrate That The Design Works

Generate a harmless administrative change and a test-object read in a sandbox. Confirm each appears in its expected log category. Write a test application log and verify collection. Generate a sample finding, verify the notification, and check the final destination rather than only the rule.

Review who can change the trail, archive policy, retention, and KMS key. Test the documented investigation role's ability to read and decrypt evidence. Test failure monitoring as well as the happy path.

**Changed requirement:** The company now needs exact HTTP request bodies for a debugging task. The design above does not suddenly provide them. Select appropriate application instrumentation with deliberate redaction and access control. Flow Logs and CloudTrail are not general-purpose request-body recordings.

## 12. Original Scenario Practice

These questions train reasoning about constraints. Cover the answer before reading it. For each scenario, explain why the nearest plausible alternative fails.

### Scenario 1: The Missing Download

**Situation**

A company has an organization multi-Region trail delivering management events to S3. During an investigation, analysts find a successful bucket-policy change but cannot find a reported download from `exports/customers/`. They searched Event history and yesterday's archived management logs.

**Decision**

Which change provides the missing evidence for future downloads with targeted collection?

**Options**

A. Increase Event history retention and enable CloudTrail Insights.

B. Add S3 data-event collection for the relevant object prefix, including reads, while retaining management collection.

C. Enable VPC Flow Logs and search for the object's key.

D. Enable Macie and use its classification findings as download records.

**Answer: B.**

**Reasoning**

- The missing category is object data activity.

- The prefix and read selection address the stated scope.

- A detects rate anomalies rather than individual object reads and does not provide the proposed Event history extension.

- C lacks object keys.

- D classifies content, not access history.

- Previously uncaptured events are not recovered by enabling collection now.

**Change one fact:** If the question were who changed the bucket policy, existing management events would be the right starting evidence.

### Scenario 2: Encrypted Archive Delivery Stops

**Situation**

An archive bucket still accepts logs from one organization trail, but a newly configured trail reports KMS access errors. Both trails use the same bucket. The key is enabled and the bucket's log-write permissions include both trails.

The key policy restricts CloudTrail use to the old trail ARN.

**Decision**

What is the narrowest relevant fix?

**Options**

A. Give every workload administrator decrypt access.

B. Disable encryption on the bucket.

C. Update the key policy's required CloudTrail permission and source restrictions to include the intended new trail.

D. Enable additional S3 data events on the old trail.

**Answer: C.**

**Reasoning**

- The error and policy condition identify the failed encryption boundary.

- A changes reader access rather than producer encryption access.

- B drops a requirement unnecessarily.

- D changes collected evidence, not delivery authorization.

- After the fix, verify new delivery and investigate any gap.

### Scenario 3: Healthy Instance, Missing Logs

**Situation**

Private EC2 workers report CPU metrics, but the security team cannot see `/var/log/payments/auth.log`. The agent is running, its local diagnostic log reports endpoint connection timeouts, and the configured path exists and is readable.

The instance has no outbound internet route and no CloudWatch Logs interface endpoint.

**Decision**

Which action best addresses the observed failure?

**Options**

A. Enable detailed EC2 monitoring.

B. Open inbound TCP 443 from the internet.

C. Replace the instance role with administrator access.

D. Provide an allowed network path to CloudWatch Logs, such as the appropriate interface endpoint with working DNS and security-group settings.

**Answer: D.**

**Reasoning**

- The failure is transport to the logging service.

- Existing CPU metrics are not proof that this agent's log-ingestion path works.

- Inbound internet access is unrelated; broader IAM does not fix a timeout.

- The problem has already ruled out the file path as the immediate cause.

### Scenario 4: Detection Without An Archive

**Situation**

GuardDuty raises an EC2 threat finding in an account with no customer-created VPC Flow Logs. A responder argues that the finding must be invalid and that enabling GuardDuty should have stored all raw flows for later SQL searches.

**Decision**

Which explanation is correct?

**Options**

A. GuardDuty uses independent foundational telemetry; configure separate flow logging for the required retained evidence.

B. GuardDuty can operate only after a customer creates Flow Logs.

C. Every GuardDuty finding contains every underlying packet.

D. Security Hub automatically restores missing raw flow history.

**Answer: A.**

**Reasoning**

- Detection and the customer's evidence archive are separate paths.

- B incorrectly introduces a prerequisite.

- C confuses a finding with packet capture.

- D confuses findings aggregation with raw-event reconstruction.

### Scenario 5: Fractional Severity And Missing Notifications

**Situation**

A GuardDuty finding has severity 7.5 and is visible in the source account. An EventBridge rule uses `"severity": [7, 8, 9]`; there are no matched events for this finding. The security requirement is notification for all severities of at least 7.

**Decision**

What should change first?

**Options**

A. Add SNS administrator permissions to the analyst.

B. Replace the exact values with a numeric comparison of `>= 7`.

C. Disable GuardDuty suppression across the organization.

D. Add a CloudWatch agent to every EC2 instance.

**Answer: B.**

**Reasoning**

- The observed failure is pattern matching.

- The rule's exact values exclude 7.5.

- A addresses a later boundary without evidence.

- C makes an unrelated broad change.

- D has no bearing on finding routing.

- After changing the pattern, verify target delivery separately.

### Scenario 6: A Dashboard With Blind Spots

**Situation**

A security team aggregates CSPM findings from several Regions. A new account runs workloads in another enabled Region but contributes no control findings. The team has not verified Config recording or central configuration policy association for that account.

**Decision**

What is the best next step?

**Options**

A. Mark the account compliant because it has no findings.

B. Add an Athena table over the existing findings.

C. Verify account/Region enrollment, configuration policy, enabled controls, and Config recording prerequisites.

D. Resolve old findings in the central dashboard.

**Answer: C.**

**Reasoning**

- Absence of results may be lack of assessment.

- Aggregation does not prove source-side enablement.

- A interprets missing evidence as success.

- B changes querying, not coverage.

- D changes workflow records, not assessment inputs.

### Scenario 7: Network Acceptance Is Not Application Success

**Situation**

A private worker cannot download an export through an S3 VPC endpoint. The available network telemetry does not show a transport block. A captured CloudTrail network activity event reports `VpceAccessDenied`.

**Decision**

Which control should be investigated first?

**Options**

A. The VPC endpoint policy and the request's action/resource/principal.

B. The application's S3 identity policy, without inspecting endpoint policy evaluation.

C. A missing inbound return-traffic rule on the instance's stateful security group.

D. Resolver query-log delivery to the archive bucket.

**Answer: A.**

**Reasoning**

- The event identifies authorization at the endpoint policy.

- Connectivity is not API permission.

- B checks a different permission layer and cannot override endpoint denial.

- C confuses stateful return handling and API authorization.

- D concerns DNS evidence delivery, not the reported denial.

### Scenario 8: Keep Evidence And Detect Changes

**Situation**

A regulated team must retain audit objects for a defined period with no early deletion, and separately detect whether delivered CloudTrail files were altered.

**Decision**

Which pair best addresses these requirements? Choose TWO.

**Options**

A. CloudTrail log file validation with retained digests and an actual validation procedure.

B. An EventBridge rule matching every EC2 state change.

C. S3 Object Lock compliance-mode retention configured for the required object versions.

D. A CloudWatch dashboard restricted to administrators.

**Answer: A and C.**

**Reasoning**

- C provides retention protection; A provides tamper evidence for delivered logs.

- They solve different problems.

- B does not protect archive objects; D is a display/access choice, not retention or validation.

- Also retain usable decryption capability.

### Scenario 9: A Silent Error Alarm

**Situation**

A security metric emits only when an error occurs. After a quiet weekend, its alarm shows `INSUFFICIENT_DATA`. Engineers propose treating all missing data as breaching for both this metric and a separate one-minute collector heartbeat.

**Decision**

Which reasoning is best?

**Options**

A. Missing data always means an attack.

B. Missing data always means everything is healthy.

C. Both metrics must have identical settings because they share a namespace.

D. Choose settings by metric semantics; a quiet error metric and a missing heartbeat mean different things, and collector health should be monitored independently.

**Answer: D.**

**Reasoning**

- A/B erase the distinction between sparse event metrics and expected continuous signals.

- C confuses naming with behavior.

- Suppressing missing-data alarms for errors should not conceal a dead collector.

### Scenario 10: The Target Accepted The Event

**Situation**

EventBridge successfully invokes a Lambda target for a finding. The function then throws an exception while creating a ticket. The team's EventBridge delivery DLQ remains empty.

**Decision**

Which conclusion is most accurate?

**Options**

A. EventBridge lost the finding before matching it.

B. The invocation was accepted; inspect Lambda execution and asynchronous failure handling, and make retries idempotent.

C. The severity threshold must be wrong.

D. Retrying must always create another ticket.

**Answer: B.**

**Reasoning**

- The successful handoff narrows the failure to processing after delivery.

- The delivery DLQ does not necessarily collect handler failures.

- A/C contradict the successful invocation.

- D risks duplicates if a request partially succeeded before an error.

### Scenario 11: Choose The Analysis Architecture

**Situation**

A new AWS customer retains CloudTrail files in S3. It needs occasional SQL investigation with minimal additional ingestion infrastructure. A proposal says to enroll in CloudTrail Lake solely because the requirement mentions SQL.

**Decision**

What is the strongest correction under current service availability?

**Options**

A. Use Detective to execute arbitrary SQL over the bucket.

B. Use Macie to replace audit queries.

C. Evaluate Athena over the existing archive with the correct schema, partitions, and S3/KMS/result permissions; Lake is closed to new customers.

D. Copy every file into application memory for manual review.

**Answer: C.**

**Reasoning**

- It matches existing storage and current availability.

- A/B solve different problems; D adds unnecessary operational work.

- For an existing Lake customer with an existing store, the decision can differ.

### Scenario 12: Order A Logging Investigation

**Situation**

A new API stage reports errors, but the backend Lambda has no application records for the failing requests. Arrange the investigation without assuming all failures reach Lambda:

1. Establish the request time, stage, request ID, and observed response.
2. Check API access/execution evidence and whether authorization rejected the request before integration.
3. If integration was attempted, correlate with Lambda invocation/execution evidence and verify its log destination/permissions.
4. Correct the identified failure and repeat a controlled request through the full path.

**Answer: 1 -> 2 -> 3 -> 4.**

**Reasoning**

- Follow the request.

- Granting Lambda more logging permission cannot reveal an invocation that never happened.

- If the API itself lacks logs, fix that collection gap before claiming it saw no traffic.

### Scenario 13: A Clean Sensitive-Data Report

**Situation**

A team enables Macie and runs a discovery job against a support bucket. The report contains no sensitive-data findings. Later, an engineer notices that the job sampled objects and several encrypted files were skipped because Macie could not read them.

Management asks whether the entire bucket can now be classified as non-sensitive.

**Decision**

What is the best answer?

**Options**

A. Yes, because bucket inventory guarantees every object's contents were scanned.

B. Yes, if the bucket is private; private objects cannot contain sensitive information.

C. No; correct the coverage and read/decrypt prerequisites, select the required scope, and interpret completed discovery results before making that claim.

D. No; enable Inspector on the bucket to scan the missing object contents.

**Answer: C.**

**Reasoning**

- The conclusion is limited by what was actually examined.

- Inventory, access posture, and content classification are different.

- D substitutes a workload vulnerability service for S3 content discovery.

- A clean sample is useful evidence about the sample, not proof about every object.

### Scenario 14: A Lake Subscriber Sees Only One Region

**Situation**

A SIEM has Security Lake data access for selected sources in Region A. The organization collects the same sources in Region B, but has not configured a rollup or a subscriber there. Analysts see no Region B data through the SIEM.

They want both Regions while keeping source access restricted.

**Decision**

Which change addresses the design?

**Options**

A. Add a wider EventBridge pattern to the existing GuardDuty notification rule.

B. Configure the intended regional subscriber/rollup design and grant only the required source access, then verify notifications and reads.

C. Grant the SIEM organization management-account administrator access.

D. Change the Athena SQL projection without changing subscriber scope.

**Answer: B.**

**Reasoning**

- Subscriber scope and regional collection must line up.

- A changes a different delivery system.

- C is overbroad and does not replace subscriber configuration.

- D cannot expose data outside the configured access path.

- Query access and data access are also different subscription modes.

### Scenario 15: Suppression Hides A Downstream Alert

**Situation**

A central team has an EventBridge-to-SNS path that previously worked for GuardDuty findings. After adding a suppression rule for a broad EC2 finding category, a new matching finding appears only in GuardDuty's archived view. SNS has no new message.

**Decision**

What should the team investigate first?

**Options**

A. The suppression scope: these findings are archived and not sent through normal downstream forwarding; narrow the exception to approved activity.

B. The SNS email subscription, even though the source finding was suppressed.

C. The raw CloudTrail archive's lifecycle transition to colder storage.

D. Missing EC2 CloudWatch agent permissions as a prerequisite for GuardDuty finding export.

**Answer: A.**

**Reasoning**

- The evidence identifies an intentional source-side forwarding change.

- B could matter for a delivered event, but first restore the desired source behavior.

- C does not explain this finding-routing change.

- D introduces an unrelated prerequisite.

- Confirm the approved exception and test a non-suppressed sample after the repair.

### Scenario 16: Healthy Infrastructure, Broken Customer Journey

**Situation**

EC2 status checks and CPU alarms are healthy, but customers receive an authorization error from a public API stage after a deployment. The on-call team wants an alert for failure of the actual customer path.

**Decision**

Which addition best addresses that requirement?

**Options**

A. A lower CPU threshold on the same instances.

B. A dashboard displaying every EC2 status check across accounts.

C. More frequent CloudTrail management-event searches for EC2 changes.

D. An application-level synthetic request with suitable test credentials, expected response checks, and an alarm, plus API logs for diagnosis.

**Answer: D.**

**Reasoning**

- The requirement is successful application behavior.

- Resource health can remain normal during an authorization/configuration failure.

- A/B still measure the wrong condition.

- C may help investigate infrastructure changes but does not test the customer's operation.

- Protect the synthetic credentials and avoid modifying real customer data during the check.

## 13. Readiness And Objective Coverage

This map uses AWS skill identifiers so a named service does not count as coverage without an explanation and an application. The descriptions are condensed learning goals, not a copy of the exam guide. [Official Domain 1 objectives](https://docs.aws.amazon.com/aws-certification/latest/security-specialty-03/security-specialty-03-domain1.html).

| Skill | Demonstrate this ability | Study location |
| --- | --- | --- |
| 1.1.1 | Turn a workload threat into evidence requirements | Sections 1 and 11 |
| 1.1.2 | Distinguish application health from infrastructure metrics | Sections 4 and 10 |
| 1.1.3 | Centralize findings without assuming source coverage | Sections 6 and 7 |
| 1.1.4 | Build and interpret detections, metrics, alarms and views | Sections 4, 6, 7 and 9 |
| 1.1.5 | Explain scheduled assessment and desired-state mechanisms | Section 7 |
| 1.2.1 | Select evidence by question and storage needs | Sections 1, 3 and 8 |
| 1.2.2 | Explain service/application logging setup | Sections 2, 3, 4 and 10 |
| 1.2.3 | Design archives and lake/subscriber integrations | Sections 3 and 8 |
| 1.2.4 | Choose and troubleshoot a query mechanism | Sections 4, 8 and 10 |
| 1.2.5 | Parse, normalize, correlate and visualize appropriately | Section 8 |
| 1.2.6 | Follow network paths to the correct log sources | Section 5 |
| 1.3.1 | Inspect configuration and permission boundaries | Sections 3, 9 and 10 |
| 1.3.2 | Diagnose missing evidence and verify the repair | Sections 4, 10 and 12 |

Before moving on, explain these aloud without using only service names:

- Why does GuardDuty work without your own Flow Logs, yet not replace your archive?
- Why can an accepted network flow coexist with an API authorization denial?
- How do you tell missing data from a healthy quiet period?
- Which permission allows log delivery, and which allows analysts to decrypt logs?
- What changes when a source account or Region is added?
- How do you prove a finding reached the responder and that a downstream action succeeded?
- Why does neither encryption nor log validation alone satisfy immutable retention?
- When does a relationship graph help more than SQL, and when does it not?

An answer is ready when it explains the mechanism, the relevant constraint, and how to verify the result. Revisit any scenario you answered from a keyword alone. Then continue to [02. Incident Response](02-incident-response-study-guide.md), which covers what to do after detection.
