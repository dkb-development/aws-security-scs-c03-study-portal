# AWS Security SCS-C03 Foundations For Beginners

Use this file when a study guide mentions an AWS service or security concept and you want the plain-English version first.

The six numbered study guides are still the exam-focused material. This file is the beginner support layer behind them.

Review status, 2026-10-09: the Detection foundations have received a deeper teaching pass. Foundations for Topics 2-6 will be expanded alongside their individual chapter reviews; this is not yet a completed review of every concept in this file.

For Topic 1, begin with [the detection pipeline](#detection-pipeline-from-first-principles), [logs versus metrics](#logs-metrics-and-alarms-explained), [delivery permissions](#log-delivery-permissions-step-by-step), and [network evidence](#dns-and-network-evidence-explained). Then use the service-specific sections below.

## How To Use This File

If you already understand a concept, skip this file and continue the main study guide.

If a sentence says something like "use an SCP guardrail" and that feels unclear, open the SCP section here, read the simple explanation, then return to the main study guide.

Simple rule:

```text
Main study guide = what the exam usually asks
This foundation guide = what the AWS thing is in the first place
```

## Foundation Map

### Detection Quick Navigation

| If this feels unclear... | Open this explanation |
| --- | --- |
| How observations become alerts | [Detection pipeline](#detection-pipeline-from-first-principles) |
| How a log line becomes a number | [Logs, metrics, and alarms](#logs-metrics-and-alarms-explained) |
| Why delivery and reading need different permissions | [Delivery permissions](#log-delivery-permissions-step-by-step) |
| Why accepted traffic can still fail | [DNS and network evidence](#dns-and-network-evidence-explained) |
| Why a delivered event can still fail | [Retries and duplicate handling](#reliable-events-and-duplicate-handling) |
| How to maintain monitoring configuration | [Regular assessments](#regular-assessments-and-state-manager) |

### All Foundation Areas

| Area | Learn these first |
| --- | --- |
| AWS structure | Accounts, Regions, ARNs, tags |
| Identity | IAM, policies, roles, STS, Identity Center, Cognito |
| Guardrails | SCPs, RCPs, permissions boundaries, session policies |
| Logging | CloudTrail, CloudWatch, VPC Flow Logs, DNS logs |
| Detection | GuardDuty, Security Hub, Detective, Security Lake, Macie, Inspector, CloudTrail Insights, OpenSearch Security Analytics |
| Query and notification | Athena, CloudWatch Logs Insights, SNS, EventBridge |
| Network security | VPC, security groups, NACLs, endpoints, WAF, Shield, Network Firewall, Traffic Mirroring, Network Access Analyzer |
| Data security | KMS, S3 encryption, Object Lock, Bucket Keys, Secrets Manager, ACM, CloudFront field-level encryption |
| Response | EventBridge, Lambda, Step Functions, Systems Manager, snapshots, Incident Manager, AWS Security Incident Response |
| Governance | Organizations, Control Tower, Config, Audit Manager, Artifact, StackSets, CloudFormation Guard, CloudFormation Hooks |

## 1. AWS Building Blocks

### AWS Account

An AWS account is a security boundary, billing boundary, and resource container.

Think of an account like a separate apartment in a building:

```text
AWS Organization
|
+-- Security account
+-- Log archive account
+-- Production app account
+-- Development app account
```

Why this matters:

- A compromised developer account should not automatically compromise production.
- A central logging account can store logs that workload teams cannot easily edit.
- SCPs and RCPs apply at the organization, OU, or account level.

Real-world example:

A company keeps CloudTrail logs in a dedicated log archive account. Production developers can create EC2 instances in the production account, but they cannot delete the central audit logs.

Exam memory:

- Use separate accounts for blast-radius reduction.
- Use AWS Organizations for central management.
- Do not run normal workloads in the management account.

### Region And Availability Zone

A Region is a geographic AWS area, such as `us-east-1`.

An Availability Zone is a separate data center zone inside a Region.

```text
Region: us-east-1
|
+-- AZ: us-east-1a
+-- AZ: us-east-1b
+-- AZ: us-east-1c
```

Why this matters:

- Some services are global, like IAM.
- Many services are Regional, like KMS keys, GuardDuty detectors, and VPCs.
- Multi-Region exam scenarios often care about disaster recovery, log aggregation, and encryption keys.

Real-world example:

If a question says "must continue during a Regional outage," one Region is not enough. You usually need a second Region, replicated data, and a tested failover plan.

### ARN

ARN means Amazon Resource Name. It is the unique name for an AWS resource.

Example:

```text
arn:aws:s3:::example-bucket
arn:aws:iam::123456789012:role/SecurityAuditRole
arn:aws:kms:us-east-1:123456789012:key/abcd-1234
```

Why this matters:

IAM policies, bucket policies, KMS key policies, EventBridge rules, and many security tools point to resources by ARN.

Simple shape:

```text
arn:partition:service:region:account-id:resource
```

Exam memory:

- S3 bucket ARNs often do not include a Region or account ID.
- IAM is global, so IAM role ARNs do not include a Region.
- KMS key ARNs include a Region because KMS keys are Regional unless they are multi-Region keys.

### Tags

Tags are key-value labels on resources.

Example:

```json
{
  "Environment": "Production",
  "DataClass": "Confidential",
  "Owner": "PaymentsTeam"
}
```

Why this matters:

Tags are used for:

- cost allocation
- automation
- access control with ABAC
- incident triage
- inventory and compliance

Real-world example:

Only users with session tag `Department=Finance` can access resources tagged `Department=Finance`.

## 2. IAM And Access Control

### IAM

IAM means Identity and Access Management. It decides who can do what in AWS.

The basic sentence is:

```text
Principal performs Action on Resource if Policies allow it.
```

Example:

```text
Alice wants to run s3:GetObject on arn:aws:s3:::reports-bucket/q1.csv
```

AWS checks:

- Who is Alice?
- What action is she trying?
- Which resource is she touching?
- What do the policies say?
- Is there any explicit deny?

Official cross-check: [AWS IAM policies and permissions](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html)

### Principal, Action, Resource, Condition

Most IAM questions are built from four words:

| Word | Meaning | Example |
| --- | --- | --- |
| Principal | Who is making the request | IAM user, IAM role, AWS service |
| Action | What they want to do | `s3:GetObject`, `kms:Decrypt` |
| Resource | What they want to touch | S3 bucket, KMS key, IAM role |
| Condition | Extra rule | only from this VPC endpoint, only with MFA |

Simple policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::example-bucket/*"
    }
  ]
}
```

This says:

```text
Allow reading objects from example-bucket.
```

### Default Deny, Explicit Allow, Explicit Deny

By default, AWS denies access.

Access is allowed only when a policy explicitly allows it and no policy explicitly denies it.

```text
Start: Denied
|
+-- Is there an explicit Deny? ---- yes --> Denied
|
+-- Is there an explicit Allow? --- yes --> Allowed
|
+-- Otherwise ----------------------------> Denied
```

Memory:

```text
Explicit deny beats everything.
Allow is required.
No allow means deny.
```

Real-world example:

A developer has `AdministratorAccess`, but an SCP denies `ec2:TerminateInstances`. The developer still cannot terminate instances.

### Identity-Based Policy

An identity-based policy is attached to a user, group, or role.

It answers:

```text
What can this identity do?
```

Example:

```text
Role: ReadOnlyAuditRole
Policy: Allow cloudtrail:LookupEvents, config:GetResourceConfigHistory
```

Use it when:

- giving a role permission to read logs
- giving a Lambda function permission to read from S3
- giving an EC2 instance role permission to call KMS

Official cross-check: [Identity-based and resource-based policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_identity-vs-resource.html)

### Resource-Based Policy

A resource-based policy is attached to the resource.

It answers:

```text
Who can access this resource?
```

Common examples:

- S3 bucket policy
- KMS key policy
- SQS queue policy
- SNS topic policy
- Lambda function resource policy

Example:

```json
{
  "Effect": "Allow",
  "Principal": { "AWS": "arn:aws:iam::222222222222:role/PartnerRole" },
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::shared-reports/*"
}
```

Real-world example:

Your account owns an S3 bucket. A partner account needs read access. A bucket policy can name the partner role as the principal.

Exam memory:

- Identity policy says what the identity can do.
- Resource policy says who can access the resource.
- Cross-account access often needs both sides to line up.

### IAM Role

An IAM role is an identity that is assumed temporarily.

It has two important parts:

```text
Trust policy      = who can assume the role
Permission policy = what the role can do after being assumed
```

Flow:

```text
User or service
   |
   | sts:AssumeRole
   v
IAM role
   |
   | temporary credentials
   v
AWS API calls
```

Real-world examples:

- EC2 instance role lets an app read from S3 without hard-coded keys.
- Lambda execution role lets a function write logs.
- Cross-account audit role lets a security account inspect member accounts.

### Trust Policy

A trust policy is the role policy that says who can assume the role.

Example:

```json
{
  "Effect": "Allow",
  "Principal": { "AWS": "arn:aws:iam::111111111111:root" },
  "Action": "sts:AssumeRole"
}
```

Simple translation:

```text
Principals from account 111111111111 may assume this role.
```

Exam trap:

Granting `sts:AssumeRole` in the caller account is not enough. The target role must also trust the caller.

### STS

AWS STS issues temporary credentials.

Temporary credentials include:

- access key ID
- secret access key
- session token
- expiration time

Why temporary credentials are safer:

- they expire automatically
- they can be scoped down with session policies
- they are commonly used for roles and federation

Real-world example:

A user signs in through Identity Center. AWS gives them temporary role credentials for the selected account and permission set.

### Access Keys

Access keys are long-term credentials for an IAM user.

They are risky because they do not expire by default.

Use access keys only when needed, and prefer:

- IAM roles for AWS workloads
- Identity Center for humans
- temporary credentials for automation

Incident response pattern:

```text
Leaked access key
|
+-- deactivate key
+-- inspect CloudTrail activity
+-- rotate affected secrets
+-- remove hard-coded credential source
```

### IAM Identity Center

IAM Identity Center is for workforce access.

Use it when employees need access to AWS accounts and business applications.

```text
Employee
   |
   v
IAM Identity Center
   |
   v
Permission set
   |
   v
Role in AWS account
```

Real-world example:

Finance users get read-only billing access. Security users get audit roles in all accounts. Developers get limited access to development accounts.

Exam memory:

- Workforce users: Identity Center.
- Application users: Cognito.

### Amazon Cognito

Cognito is for application users.

Use it when users sign in to your app, mobile app, or customer-facing web app.

Two major pieces:

| Cognito piece | What it does |
| --- | --- |
| User pool | user directory and sign-in |
| Identity pool | gives temporary AWS credentials |

Real-world example:

A mobile app uses a Cognito user pool for login. After login, the app uses an identity pool to get temporary credentials to upload a profile image to S3.

### Amazon Verified Permissions

Verified Permissions is for application-level authorization.

IAM answers:

```text
Can this AWS principal call this AWS API?
```

Verified Permissions answers:

```text
Can this app user perform this app action on this app object?
```

Example:

```text
Can user Priya approve invoice INV-1001?
```

Use it when authorization rules belong inside the application domain, not only in AWS infrastructure.

### ABAC

ABAC means Attribute-Based Access Control.

Instead of writing one policy per team, you use matching attributes.

Example:

```text
Principal tag: Department=Finance
Resource tag:  Department=Finance
Decision: allow
```

Simple IAM condition idea:

```json
{
  "Condition": {
    "StringEquals": {
      "aws:PrincipalTag/Department": "${aws:ResourceTag/Department}"
    }
  }
}
```

Real-world example:

Developers can manage only resources tagged with their project name.

### Permissions Boundary

A permissions boundary is a maximum-permission limit for an IAM user or role.

It does not grant access by itself.

```text
Identity policy says: allowed actions
Boundary says: maximum allowed actions
Effective access = intersection
```

Example:

```text
Identity policy allows: s3:*, ec2:*
Boundary allows: s3:*
Result: only s3:* can work
```

Use it when:

- developers can create roles, but you must limit what those roles can ever do
- teams self-manage IAM within guardrails

### Session Policy

A session policy limits one temporary session.

It is passed when assuming a role or federating.

```text
Role permissions: broad
Session policy: narrower for this one session
Result: narrower temporary access
```

Real-world example:

A CI/CD job assumes a deployment role but passes a session policy that only allows deploying one specific stack.

### SCP

SCP means Service Control Policy.

An SCP is an AWS Organizations guardrail that limits what IAM principals in member accounts can do.

It does not grant permissions.

```text
IAM policy allows action
SCP allows action
No explicit deny
=> action can be allowed
```

```text
IAM policy allows action
SCP denies action
=> denied
```

Real-world example:

Attach an SCP to all production accounts that denies disabling CloudTrail or leaving approved AWS Regions.

Exam memory:

- SCP controls identities in member accounts.
- SCP does not affect the management account in the same way.
- SCP is a maximum boundary, not a grant.

Official cross-check: [AWS Organizations SCPs](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html)

### RCP

RCP means Resource Control Policy.

An RCP is an AWS Organizations guardrail that limits access to resources in member accounts.

It is useful when you want to protect resources even from external principals.

Simple difference:

```text
SCP: limits what identities in my organization can do
RCP: limits who can access resources in my organization
```

Real-world example:

Your S3 buckets should not be accessed by principals outside your organization, even if a bucket policy accidentally allows it. An RCP can act as the central resource-side guardrail.

Exam memory:

- RCP does not grant permissions.
- RCP applies to resources in member accounts.
- RCP and SCP work with IAM/resource policies as an intersection.

Official cross-check: [AWS Organizations RCPs](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_rcps.html)

### External ID

External ID helps prevent the confused deputy problem.

Use it when a third-party SaaS vendor assumes a role in your AWS account.

Problem:

```text
Many customers trust the same vendor AWS account.
An attacker might trick the vendor into using the attacker's request against your role.
```

Solution:

```text
Trust policy requires a unique ExternalId.
Vendor must include that ExternalId when assuming the role.
```

Exam memory:

Third-party cross-account access almost always points to:

- IAM role
- trust policy
- external ID
- least privilege

### IAM Access Analyzer

IAM Access Analyzer helps find unintended access.

Common uses:

- identify resources shared outside your account or organization
- validate IAM policies
- generate policy suggestions from CloudTrail activity
- analyze unused access with the relevant analyzer/integration

Real-world example:

Access Analyzer reports that an S3 bucket policy allows access from outside the organization. The security team fixes the bucket policy before data is exposed.

#### Possible Access Versus Observed Access

An external-access analyzer has a zone of trust, such as an account or organization. It reasons about supported resource policies to find access beyond that boundary. This can identify a risky grant even if nobody has used it yet.

```text
Bucket policy allows a partner role
               |
               v
Analyzer compares access with the trust boundary
               |
               v
Finding: external access is possible
```

The partner access might be approved business access or an accident. Investigate purpose before changing it. CloudTrail answers a different question: whether a supported access event was observed and collected.

Policy validation looks for policy problems. Policy generation uses observed CloudTrail activity to help build a narrower policy; it is a starting point for review, not proof that future legitimate operations are unnecessary. A rarely used disaster-recovery permission might not appear during the observation window.

Unused-access and internal-access analysis address other questions and have their own scope. Choose the capability explicitly. An external resource-policy scan is not a complete report of every identity's effective permissions. [Access Analyzer capabilities](https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html).

[Return to Detection: access analysis](01-detection-and-monitoring-study-guide.md#73-sensitive-data-vulnerabilities-and-access-are-separate-risks).

### Roles Sessions And Policy Requests

**Start with an ordinary job:** a reporting program on EC2 must read private S3 files. Putting a permanent access key in its source code would make that key easy to leak and hard to rotate. Instead, assign an appropriate IAM role to the workload and let its SDK obtain temporary credentials.

The role is the reusable identity definition. A **session** is a temporary instance of using that role. Many programs or people can have different sessions of the same role, so a session name is useful investigation context, not a separate policy that automatically grants access.

```text
Role definition                   Temporary session
-----------------                 -----------------
Who may assume it?  -- issuance -> access key ID
What may it do?                    secret access key
Which limits apply?               session token + expiry
                                        |
                                        v
                              Signed AWS API request
```

The secret signs the request; it is not pasted into the resource policy. The session token accompanies requests made with temporary credentials. An SDK can handle these details, but a script using only two of the three credential fields may fail even when the role permissions are correct.

**Read a request as four questions:** Who is calling? Which operation? Which resource? Under what conditions? For example, ReportReader requests `s3:GetObject` on `arn:aws:s3:::example-reports/october.csv` over TLS. Reading the bucket's contents list is a different operation with a different resource ARN.

```text
Bucket list:   s3:ListBucket -> arn:aws:s3:::example-reports
Object read:   s3:GetObject  -> arn:aws:s3:::example-reports/*
Decrypt data:  kms:Decrypt  -> the relevant KMS key ARN
```

These are permission relationships, not a promise that every read always invokes all three operations. An application that already knows the object key might not list the bucket at all.

**Grant versus limit:** an identity policy may allow reading reports; a boundary restricts what identity policies can grant. A boundary alone never gives the program a read permission. Resource policies introduce other grant paths, so the full guide explains why implicit denies behave differently for direct user/session grants.

**How to troubleshoot:** first identify the real caller with `sts:GetCallerIdentity`. Then distinguish an unsuccessful AssumeRole call from an unsuccessful read after assumption. Changing the read policy will not fix a role's trust policy, and changing trust will not authorize decryption.

[Return to IAM request walkthrough](04-identity-and-access-management-study-guide.md#a-follow-one-request-from-sign-in-to-s3).

### Federation Tokens And Attribute Ownership

**Federation** means AWS or your application accepts identity evidence from a trusted identity provider instead of keeping a separate password for everyone. The trust must be configured: an arbitrary token from an arbitrary website is not sufficient.

For employees, Identity Center can connect workforce identities to AWS accounts and permission sets. For customers, a Cognito user pool can issue a JWT, a signed document carrying claims about the user. A JWT is not the same thing as temporary AWS access keys.

```text
Identity proof -> validate signature and intended recipient
               -> validate issuer, expiry and token purpose
               -> obtain trustworthy user/tenant attributes
               -> decide whether THIS action is authorized
```

**Example:** a token says the user belongs to Billing. The API request asks for a Payroll invoice. A valid signature proves the token came from the expected issuer; it does not make the requested invoice appropriate. The backend must check the user-to-resource relationship before reading the invoice.

An identity pool is useful when a customer application genuinely needs temporary AWS credentials. Its roles must be scoped for that customer access. An alternative is to keep all AWS credentials on the API backend and authorize customer requests there.

**Attributes require an owner.** In tag-based access, matching labels are meaningful only if callers cannot freely change those labels. A trusted identity provider might assign `Project=Billing`; the application should not simply accept `Project=Payroll` from a request body.

```text
Trusted assignment: HR/identity admin -> Project=Billing
Untrusted request:  customer input    -> Project=Payroll
                                  X
                  Do not turn this into an authority claim
```

When using session tags, check who can pass tags, which keys and values are permitted, and whether tags carry across role chaining. When using resource tags, protect the tagging operations as well as the read operation.

**Example test plan:** Billing can read Billing; Billing cannot read Payroll; a missing Project tag does not create access; Billing cannot change its own authority to Payroll. These negative tests demonstrate isolation more convincingly than one successful read.

[Return to federation](04-identity-and-access-management-study-guide.md#d-choose-the-right-identity-system) or [ABAC and diagnosis](04-identity-and-access-management-study-guide.md#e-use-attributes-and-evidence-to-control-access).

## 3. Logging And Detection

### CloudTrail

CloudTrail records AWS API activity.

Plain-English question:

```text
Who did what in AWS, from where, and when?
```

Example event fields:

```json
{
  "eventTime": "2026-10-07T10:15:00Z",
  "eventSource": "iam.amazonaws.com",
  "eventName": "CreateUser",
  "userIdentity": {
    "type": "AssumedRole",
    "arn": "arn:aws:sts::123456789012:assumed-role/Admin/Alice"
  },
  "sourceIPAddress": "203.0.113.10"
}
```

Types of CloudTrail events:

| Event type | Meaning |
| --- | --- |
| Management event | control-plane activity, like creating users or subnets |
| Data event | high-volume resource activity, like S3 object reads |
| Network activity event | VPC endpoint API activity |
| Insights event | unusual API activity pattern |

Exam memory:

- Event history gives recent management-event visibility.
- S3 object-level access needs CloudTrail data events.
- CloudTrail logs API calls, not packet payloads.

Official cross-check: [What is AWS CloudTrail?](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html)

#### Follow One Request

Suppose a worker uses a temporary role to read `customers/june.csv`. Its software signs a `GetObject` request with that role's credentials. S3 checks access. If the appropriate data-event collection is enabled, CloudTrail records the supported activity, including identity and request context.

If the result includes `AccessDenied`, the record is evidence of an attempt, not a successful download.

```text
Worker's temporary credentials
          |
          v
S3 GetObject --> S3 authorization --> Success or error
                         |
                         v
             Selected CloudTrail data event
                         |
                         v
                  Configured destination
```

There are two independent settings to understand. **Event selection** decides what to capture. **Destination configuration** decides where it goes. A working S3 destination does not help if your selector excludes reads. A correct selector does not help if the destination's policy blocks delivery.

Event history is the recent management-event view, not an unlimited archive. A trail is a delivery configuration, not the log file itself. The files can outlive the trail, depending on retention. An organization trail standardizes collection across accounts, but still needs deliberate event categories and Region coverage.

When reading an event, locate the action, time, target, identity/session, and error before deciding what happened. `AssumedRole` means temporary role credentials were involved. It does not by itself identify the human responsible; follow the session and other evidence.

[Return to Detection: CloudTrail](01-detection-and-monitoring-study-guide.md#2-cloudtrail-understand-what-was-done).

### CloudTrail Lake

**What the store does**

CloudTrail Lake is a managed event store that lets you query collected events with SQL. A store is a configured collection of records with selection and retention settings. It can include supported non-AWS events too; it is not limited to AWS API calls.

**Availability matters:** AWS closed CloudTrail Lake to new customers on May 31, 2026. Existing customers can continue using it. Do not recommend new enrollment just because a scenario asks for SQL. [AWS availability notice](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-lake-service-availability-change.html).

Simple flow:

```text
AWS activity -> CloudTrail events -> CloudTrail Lake event data store -> SQL query
```

An existing customer might use its store to find role activity from last month. The query can search only events that were ingested and retained. A SQL engine cannot recover S3 object reads that collection never included.

**Choose by customer eligibility and data location**

```text
Existing Lake customer + events in a store?
       |
       +-- Yes --> Evaluate querying that store

New customer + audit files already in S3?
       |
       +-- Yes --> Evaluate Athena over those files

Both paths: only collected, retained events can be queried.
```

For a new customer with CloudTrail files already in S3, Athena is a natural alternative to evaluate. A table describes how to read those files, and SQL selects the matching records. The choices differ in setup and data location, not in whether the word "query" appears.

[Return to Detection: Lake availability](01-detection-and-monitoring-study-guide.md#25-cloudtrail-lake-recognize-the-current-constraint).

### CloudWatch

CloudWatch is for metrics, logs, alarms, dashboards, and operational visibility.

Use it for:

- application logs
- Lambda logs
- metric alarms
- CloudWatch Logs Insights queries
- detecting a metric threshold

Real-world example:

An application writes login failures to CloudWatch Logs. A Logs Insights query finds suspicious spikes, and a metric alarm notifies the security team.

Exam memory:

- CloudWatch is operational monitoring.
- CloudTrail is API audit history.
- CloudWatch Logs is not the same as CloudTrail.

#### Follow A Login Failure

The application writes a JSON record saying a login failed. CloudWatch Logs stores that record inside a log stream, usually one producer's sequence of records. A log group collects related streams and applies settings such as retention.

A metric filter can match `login_failed` and emit the number `1`. A metric stores measurements over time. An alarm evaluates those measurements and changes state when its configured condition is met. SNS can then notify a confirmed subscriber.

```text
Application log line
       |
       v
Log stream inside a log group
       |
       +--> Logs Insights: inspect individual failures
       |
       +--> Metric filter: count failures
                    |
                    v
             Alarm: too many?
                    |
                    v
             SNS: notify subscriber
```

Each arrow needs configuration. A Logs Insights query is not automatically an alarm. A metric filter does not necessarily publish a measurement every minute. If no records arrive, that can mean no failures or a broken collector; use a separate heartbeat when the distinction matters.

For EC2 files, an agent normally reads and sends selected logs. Having built-in EC2 CPU metrics does not prove your operating-system logs were uploaded. For Lambda, investigate its service logging configuration and execution role instead of installing an EC2 agent.

See [metrics and alarm evaluation](#logs-metrics-and-alarms-explained) for a numerical example. [Return to Detection: CloudWatch](01-detection-and-monitoring-study-guide.md#4-cloudwatch-from-a-log-line-to-an-alert).

### VPC Flow Logs

#### Why Network Evidence Exists

A network connection can fail before an application receives a request. In that case, the application's logs may contain nothing. Network metadata lets you investigate the attempted communication at an earlier layer.

VPC Flow Logs record network flow metadata for VPC traffic.

They do not capture packet payloads.

Default-looking record:

```text
2 123456789010 eni-1235b8ca123456789 172.31.16.139 172.31.16.21 20641 22 6 20 4249 1418530010 1418530070 ACCEPT OK
```

What it tells you:

| Field idea | Meaning |
| --- | --- |
| source address | where traffic came from |
| destination address | where traffic went |
| source port | client-side port |
| destination port | service port, like 22 or 443 |
| protocol | TCP, UDP, ICMP as a number |
| bytes and packets | traffic volume |
| action | ACCEPT or REJECT |
| log status | OK, NODATA, SKIPDATA |

What it does not tell you:

- HTTP path
- SQL query text
- file contents
- full packet payload

Real-world example:

You see repeated rejected traffic to port 22 from the internet. That points to attempted SSH access, but it does not show what commands the attacker tried.

Official cross-check: [VPC Flow Log records](https://docs.aws.amazon.com/vpc/latest/userguide/flow-log-records.html)

#### Read It Like A Conversation Summary

In the record above, the client uses source port `20641` to reach service port `22`, typically SSH. Protocol `6` means TCP. The record summarizes packets during an interval, not every command sent over SSH. The start/end values are Unix timestamps; align them with other logs before correlating.

```text
Client                                  Server
172.31.16.139:20641  ---------------->  172.31.16.21:22
                        TCP
                  Summary: 20 packets
                  Decision: ACCEPT
                  Recording: OK
```

`ACCEPT` does not establish that SSH authentication succeeded. The server can still reject the username or key. `REJECT` indicates a network-level rejection; it is not an IAM policy decision. A flow record also does not identify the exact matching firewall rule.

`NODATA` and `SKIPDATA` describe recording conditions. The first indicates no traffic for that interval; the second indicates skipped records. Treat skipped evidence as a visibility limitation, not as proof of a blocked connection.

Flow Logs exclude some traffic, including queries to the Amazon-provided DNS server and instance metadata traffic. A missing record can therefore be a documented collection limitation. Use Resolver logs for DNS names and application logs for application outcomes. [Limitations](https://docs.aws.amazon.com/vpc/latest/userguide/flow-logs.html).

[Return to Detection: network evidence](01-detection-and-monitoring-study-guide.md#5-network-evidence-follow-the-actual-path).

### Route 53 Resolver Query Logs

Route 53 Resolver query logs record DNS queries made by resources in your VPC.

Plain-English question:

```text
Which domains are my workloads trying to resolve?
```

Real-world example:

An EC2 instance repeatedly resolves `bad-domain.example`. GuardDuty or DNS logs may help identify malware callback behavior.

Exam memory:

- DNS logs show domain lookups.
- VPC Flow Logs show IP traffic metadata.
- Neither shows full application payload.

#### Follow A Name Lookup

Before connecting to `api.partner.example`, an application typically asks DNS for an address. If it uses the VPC Resolver and query logging is configured for the VPC, you can investigate the relevant query context and response.

```text
App: "Where is api.partner.example?"
                |
                v
           VPC Resolver -----> Query logging destination
                |
                v
        Answer: an IP address
                |
                v
       App may attempt a connection
```

A lookup is not a completed connection. The application might stop after resolving, or fail at a later network/TLS/application step. Also, cached Resolver answers do not generate a fresh query-log record for every repeated application lookup.

Logs are evidence of what the logging path observed, not an exact count of every application DNS request.

If the workload uses another DNS server or an encrypted DNS service directly, examine that route's telemetry. Merely enabling VPC Resolver logging does not intercept every alternative DNS path. For missing logs, also verify VPC association, destination delivery permissions, account/Region, and time range. [Resolver query logging](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resolver-query-logs.html).

[Return to Detection: DNS and transit evidence](01-detection-and-monitoring-study-guide.md#52-dns-and-transit-gateway-evidence).

### GuardDuty

#### The Problem It Solves

Raw logs can contain millions of ordinary actions. A human cannot inspect every line. GuardDuty analyzes supported activity for suspicious patterns and produces findings that narrow the investigation. It is closer to an analyst raising a concern than a firewall blocking a request.

GuardDuty is managed threat detection.

It analyzes sources like CloudTrail management events, VPC Flow Logs, and Route 53 Resolver DNS query logs, plus extra protection-type data when enabled.

Simple flow:

```text
Logs and signals
   |
   v
GuardDuty detection logic
   |
   v
Finding
   |
   v
Security team or automated response
```

Real-world examples:

- EC2 instance communicating with a suspicious domain
- IAM user making unusual API calls
- S3 bucket accessed in suspicious ways
- EKS or malware protection findings when enabled

Exam memory:

- GuardDuty produces findings.
- It is not a SIEM where you write every detection from scratch.
- Use EventBridge to route findings to automation.

Official cross-check: [GuardDuty findings](https://docs.aws.amazon.com/guardduty/latest/ug/guardduty_findings.html)

#### Detection Coverage Versus Stored Evidence

GuardDuty obtains independent foundational telemetry. Your own CloudTrail trail and VPC Flow Log resources are not prerequisites for that foundational collection, and GuardDuty does not create your raw audit archive for you. Keep the evidence collection needed for later investigations. [Foundational sources](https://docs.aws.amazon.com/guardduty/latest/ug/guardduty_data-sources.html).

For example, a worker role starts making unusual calls from an unfamiliar location. A finding tells you which role/session and activity to investigate. You then use retained CloudTrail records, workload context, and the change calendar to decide whether credentials were stolen or a legitimate deployment changed behavior.

Optional protection plans extend visibility to particular workloads. EKS audit monitoring observes Kubernetes API activity; runtime monitoring observes supported workload behavior through its required telemetry/agent. Neither label means every container action is automatically covered. Check coverage health as well as enablement.

Suppression is a decision not to act on matching findings: matching findings are archived and are not sent through normal downstream destinations such as EventBridge. A broad suppression rule can therefore hide useful alerts. Prefer a narrow, reviewed exception for a known activity. [Suppression rules](https://docs.aws.amazon.com/guardduty/latest/ug/findings_suppression-rule.html).

[Return to Detection: GuardDuty](01-detection-and-monitoring-study-guide.md#6-guardduty-detect-suspicious-behavior).

### Security Hub

The Security Hub product family helps a security team collect and prioritize security issues. Distinguish **Security Hub CSPM**, which provides posture controls and findings aggregation, from the current broader **Security Hub** prioritization and correlation experience.

CSPM means cloud security posture management: checking whether resources are configured according to security expectations.

Simple flow:

```text
GuardDuty ----\
Inspector -----\
Macie ----------> Security Hub -> prioritized findings
Config checks --/
Partner tools -/
```

Real-world example:

A team wants one central view of failed CIS controls, GuardDuty alerts, Inspector vulnerabilities, and Macie findings. Security Hub is the aggregator.

Exam memory:

- Detective provides behavior investigation; current Security Hub also has attack-path/exposure views. Choose by the investigation being requested.
- Security Hub is not raw log storage. That is Security Lake or S3/Athena patterns.

Official cross-check: [AWS Security Hub overview](https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub-v2.html)

#### Follow A Failed Control

Imagine a standard requires S3 buckets to block public access. A relevant control evaluates a bucket using the required configuration evidence and produces a result. Analysts can see that result with vulnerability and threat findings, assign ownership, and track work.

```text
Resource configuration --> Control evaluation --> Finding
                                                   |
                                                   v
                                      Owner investigates and fixes
                                                   |
                                                   v
                                      Re-evaluation verifies state
```

Closing the ticket or marking a workflow resolved does not change the bucket's policy. The resource must actually be corrected. Also, no finding is not automatically a passing result: perhaps the control was disabled or its AWS Config recording prerequisite was missing.

CSPM uses AWS Security Finding Format (ASFF) to represent findings. This is different from Security Lake's OCSF-normalized log storage. A finding contains a conclusion and context; it is not every raw event that led to the conclusion.

The current broader Security Hub experience uses OCSF findings too. Thus OCSF does not exclusively identify Security Lake, and ASFF identifies the CSPM context rather than every Security Hub product. Read the product scope before choosing an integration format.

Central configuration controls deployment of settings; aggregation gathers results. In a 20-account organization, verify which accounts and Regions are governed by the configuration policy before trusting a consolidated view. [CSPM concepts](https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html).

[Return to Detection: findings and posture](01-detection-and-monitoring-study-guide.md#7-findings-posture-and-regular-assessments).

### Detective

Detective helps investigate root cause and relationships.

It builds a behavior graph from security data and helps answer:

```text
What else is connected to this finding?
Is this behavior unusual for this role, account, or instance?
```

Real-world example:

GuardDuty reports suspicious API calls by a role. Detective helps trace the role, IP addresses, API calls, and related resources over time.

Exam memory:

- GuardDuty detects.
- Security Hub aggregates and prioritizes.
- Detective investigates relationships and root cause.

Official cross-check: [What is Amazon Detective?](https://docs.aws.amazon.com/detective/latest/userguide/what-is-detective.html)

#### What A Behavior Graph Adds

A graph represents entities as connected items. Instead of manually querying an IP, then a role, then an instance, an analyst can move between related entities and examine their activity over time.

```text
Unfamiliar IP --> Role session --> API activity
                       |
                       +--------> Related resource / finding
```

Suppose one suspicious IP used two roles during the same hour. Looking only at the first finding might miss the second role. A relationship view helps explore that context. It does not prove both sessions were malicious: a corporate proxy can legitimately serve many users.

The graph depends on enabled data sources, member coverage, and the service's available history. It is not an arbitrary SQL engine for every file you stored in S3. Use raw logs to verify precise facts and preserve them according to your retention requirements.

[Return to Detection: correlation](01-detection-and-monitoring-study-guide.md#83-correlation-requires-shared-context).

### Security Lake

Security Lake stores security data in a centralized data lake using OCSF.

Use it when the question says:

- centralize security logs across accounts and Regions
- normalize security data
- query or share security data with analytics tools

Simple flow:

```text
AWS security logs -> Security Lake -> S3 data lake -> analytics/SIEM/query tools
```

Exam memory:

- Security Lake is for broad security data storage and normalization.
- CloudTrail Lake is a managed audit-event query store; current new-customer availability is restricted.

More precisely, CloudTrail Lake supports audit-event storage/querying, including supported external events, but is closed to new customers. Security Lake addresses common-schema security data collection across supported sources.

#### Why A Common Schema Helps

One source might call an address `sourceIPAddress`; another might use `srcaddr`. A tool searching both needs to understand those formats. Normalization maps source-specific fields into a shared structure while retaining useful source context. It is more than putting unrelated JSON files in the same bucket.

```text
API log fields ----------\
Network log fields -------+--> OCSF mapping --> Organized data in S3
Supported custom source -/                           |
                                                    v
                                          Authorized query/subscriber
```

Security Lake uses supported source integrations and Parquet storage. A custom source must conform to its integration requirements. Do not assume that every AWS log category is a native source or that enabling the lake enables every source.

For a real-world example, a security team can correlate network and API evidence through its analytics tool while using the lake as the common store. The subscriber needs appropriate access; creating a lake does not automatically grant a third-party SIEM permission or install its detection rules. [Sources](https://docs.aws.amazon.com/security-lake/latest/userguide/internal-sources.html).

[Return to Detection: Security Lake](01-detection-and-monitoring-study-guide.md#82-security-lake-normalizes-it-does-not-automatically-investigate).

### Macie

Macie discovers sensitive data in S3.

It helps find things like:

- personal data
- financial data
- credentials
- custom sensitive patterns

Real-world example:

A company stores support uploads in S3. Macie detects passport numbers and access keys in uploaded files and creates findings.

Exam memory:

- Macie is S3-focused sensitive data discovery.
- Macie findings do not expose all sensitive data content; they provide details for investigation.

Official cross-check: [Macie findings](https://docs.aws.amazon.com/macie/latest/user/findings.html)

#### Why A Clean Result Can Be Misleading

Imagine a support bucket has ten thousand uploaded files. A discovery job selects only a subset. Its result cannot establish that every other object is free of sensitive data. Check the selected buckets/objects, sampling, supported formats and storage, and the permission to read/decrypt before interpreting the result.

A managed identifier recognizes supported common sensitive-data patterns. A custom identifier lets you describe a business-specific format, such as `PATIENT-[0-9]{8}`, optionally with nearby keywords to improve confidence. An allow list can reduce known benign matches. These controls tune classification; they do not grant or revoke S3 access.

```text
Object is selected --> Readable and supported? --> Content evaluated
                               |                         |
                               no                        v
                               |                 Finding / discovery result
                               v
                       Coverage gap to inspect
```

Sensitive-content findings and bucket policy findings answer different questions. A public bucket can be risky even when no sensitive content was found; a private bucket can contain highly sensitive data. Macie also does not establish that an attacker downloaded anything. Investigate access separately.

[Return to Detection: classification](01-detection-and-monitoring-study-guide.md#73-sensitive-data-vulnerabilities-and-access-are-separate-risks).

### Inspector

Inspector is vulnerability management.

It scans supported workloads such as:

- EC2 instances
- ECR container images
- Lambda functions

It looks for:

- software vulnerabilities
- unintended network exposure
- package/CVE risk

Real-world example:

Inspector finds that an EC2 instance has a vulnerable OpenSSL package and that the instance has a reachable path from the internet.

Exam memory:

- Inspector is for vulnerabilities.
- Macie is for sensitive data.
- GuardDuty is for threat detection.

Official cross-check: [What is Amazon Inspector?](https://docs.aws.amazon.com/inspector/latest/user/what-is-inspector.html)

#### Vulnerable Is Not The Same As Exploited

A CVE is an identifier for a publicly described vulnerability. If Inspector reports a vulnerable dependency in a container image, that means the software needs risk assessment and remediation. It does not establish that an attacker executed it.

```text
Supported workload --> Scan coverage --> Vulnerability finding
                                              |
                                              v
                                Prioritize, patch/rebuild, rescan
```

For EC2, supported agent-based and agentless scanning paths have different prerequisites. For ECR, image eligibility and configured scan behavior matter. Lambda capabilities also depend on the scan type and supported resources. An empty findings list is not enough: inspect whether the resource was covered and successfully assessed.

In practice, prioritize a vulnerable internet-facing production service differently from an isolated test image, while still tracking both. After rebuilding an image, confirm that the deployed workload actually uses the new image. Removing a finding from a dashboard does not replace deployment and re-evaluation.

[Return to Detection: vulnerability assessment](01-detection-and-monitoring-study-guide.md#73-sensitive-data-vulnerabilities-and-access-are-separate-risks).

### AWS Config

AWS Config records resource configuration and evaluates compliance rules.

Plain-English question:

```text
What did this resource configuration look like, and is it compliant?
```

Example:

```text
Rule: S3 buckets must block public access
Result: bucket-a = COMPLIANT
Result: bucket-b = NON_COMPLIANT
```

Config does not usually prevent a bad action by itself. It detects and records configuration state. Some patterns add remediation.

Official cross-check: [AWS Config concepts](https://docs.aws.amazon.com/config/latest/developerguide/config-concepts.html)

#### Recorder, Rule, And Aggregator

These are three different pieces. A recorder captures supported resource configuration. A rule evaluates whether the recorded/current state meets an expectation. An aggregator presents configuration and compliance information from multiple sources.

```text
Resource changes --> Recorder --> Configuration history
                          |
                          v
                   Rule evaluation --> Compliance result
                                              |
                                              v
                                      Central aggregator
```

For example, a security group begins allowing SSH from everywhere. CloudTrail can help identify the API caller; Config can describe the changed configuration and evaluate the relevant rule. Evaluation may be triggered by changes or on a schedule, depending on the rule.

It is not equivalent to rejecting the original API request.

If no result appears, verify resource recording, Region, rule scope/trigger, and permissions. Adding an aggregator alone does not start missing recorders. Remediation is another step, often a Systems Manager Automation runbook, and needs its own role and safeguards.

[Return to Detection: assessments](01-detection-and-monitoring-study-guide.md#72-config-and-state-manager-state-rather-than-attack-behavior).

### Conformance Pack

A conformance pack is a bundle of AWS Config rules and remediation actions.

Use it when:

- many accounts need the same compliance checks
- standards should be deployed as a package
- governance needs repeatable rule sets

Real-world example:

Deploy a security baseline conformance pack across all member accounts to check S3 public access, encrypted volumes, and IAM password policy.

Official cross-check: [AWS Config conformance packs](https://docs.aws.amazon.com/config/latest/developerguide/conformance-packs.html)

## 4. Network Security

### VPC

A VPC is your private network space in AWS.

It contains:

- subnets
- route tables
- security groups
- network ACLs
- gateways
- endpoints

Simple picture:

```text
VPC 10.0.0.0/16
|
+-- Public subnet 10.0.1.0/24
|   +-- Load balancer
|
+-- Private subnet 10.0.2.0/24
    +-- Application servers
```

Real-world example:

Put web load balancers in public subnets and application/database resources in private subnets.

### Security Group

A security group is a stateful firewall attached to an ENI or resource.

Stateful means:

```text
If inbound request is allowed,
the return response is automatically allowed.
```

Security groups have allow rules only.

Example:

```text
Allow inbound TCP 443 from 0.0.0.0/0
Allow outbound all traffic
```

Exam memory:

- Security groups are stateful.
- Security groups allow only; they do not have explicit deny rules.
- They are usually the first answer for instance-level access control.

### Network ACL

A network ACL is a stateless firewall at the subnet boundary.

Stateless means return traffic must be allowed separately.

NACLs support allow and deny rules.

```text
Inbound rule allows request
Outbound rule must allow response
```

Exam memory:

- Security group = stateful, allow only, ENI/resource level.
- NACL = stateless, allow and deny, subnet level.

### Route Table

A route table tells subnet traffic where to go.

Examples:

```text
0.0.0.0/0 -> Internet Gateway
10.0.0.0/16 -> local
172.16.0.0/16 -> Transit Gateway
```

Security note:

Even if security groups allow traffic, traffic still needs a network path through route tables.

### NAT Gateway

A NAT gateway lets private subnet resources initiate outbound internet connections without accepting inbound internet connections.

Simple flow:

```text
Private EC2 -> NAT Gateway -> Internet
Internet cannot initiate -> Private EC2
```

Real-world example:

Private EC2 instances download patches from the internet, but they are not directly reachable from the internet.

### Internet Gateway

An internet gateway lets a VPC communicate with the public internet.

For an EC2 instance to be reachable from the internet, it generally needs:

- public IP or Elastic IP
- route to internet gateway
- security group allow
- NACL allow

### VPC Endpoint

A VPC endpoint lets private VPC resources reach AWS services without using the public internet.

Two common types:

| Type | Common use |
| --- | --- |
| Gateway endpoint | S3 and DynamoDB |
| Interface endpoint | PrivateLink-powered access to many services |

Real-world example:

Private EC2 instances upload logs to S3 through a gateway endpoint. Traffic stays on the AWS network path instead of going through the internet.

### PrivateLink

PrivateLink provides private connectivity to services through interface endpoints.

Use it when:

- consumers should access a service privately
- no public IP path should be needed
- cross-account or SaaS private service access is required

### Transit Gateway

Transit Gateway is a network hub for connecting VPCs and on-premises networks.

```text
VPC A ----\
VPC B ----- Transit Gateway ---- VPN/Direct Connect ---- Data center
VPC C ----/
```

Exam memory:

- Use Transit Gateway for scalable many-VPC connectivity.
- Use VPC peering for simpler direct VPC-to-VPC connectivity.

### Direct Connect And VPN

VPN is encrypted connectivity over the internet.

Direct Connect is a dedicated network connection to AWS.

Common pattern:

```text
Direct Connect = predictable private connectivity
VPN = encrypted tunnel, often backup or quick setup
```

### AWS Network Firewall

AWS Network Firewall is a managed firewall for VPC traffic inspection and filtering.

Use it when:

- traffic needs centralized inspection
- domain/IP/protocol filtering is needed
- stateful firewall rules are required
- Suricata-compatible rules are mentioned

### Route 53 Resolver DNS Firewall

DNS Firewall controls domain lookups from VPC resources.

Use it when:

- block known malicious domains
- allow only approved domains
- control DNS egress behavior

Exam memory:

- DNS Firewall controls DNS names.
- Network Firewall controls network traffic.

### AWS WAF

AWS WAF filters HTTP and HTTPS web requests.

It protects services like:

- CloudFront
- Application Load Balancer
- API Gateway
- AppSync

Common protections:

- SQL injection patterns
- cross-site scripting patterns
- IP reputation lists
- rate-based rules
- bot control

Exam memory:

- Layer 7 web request filtering = WAF.
- DDoS protection = Shield.
- VPC traffic inspection = Network Firewall.

### AWS Shield

AWS Shield protects against DDoS attacks.

Two levels:

| Service | Meaning |
| --- | --- |
| Shield Standard | automatic basic DDoS protection |
| Shield Advanced | enhanced protections, cost protections, DRT access |

Use Shield Advanced when the question mentions high-profile public applications, advanced DDoS support, or DDoS Response Team access.

### CloudFront Origin Access Control

Origin Access Control helps CloudFront access a private S3 origin.

Simple idea:

```text
Viewer -> CloudFront -> private S3 bucket
```

The S3 bucket should not be directly public. CloudFront gets permission to read from it.

### API Gateway Mutual TLS

Normal TLS proves the server identity to the client.

Mutual TLS proves both sides:

```text
Client verifies server certificate
Server verifies client certificate
```

Use mTLS when clients must present certificates before calling an API.

### Verified Access

AWS Verified Access provides application access without a traditional VPN by evaluating identity and device context.

Use it when:

- private applications need access control
- access should be based on user identity and device posture
- VPN-style network access is not preferred

### Packet Paths And Inspection Basics

**A network is a sequence of decisions.** DNS chooses an address, routing chooses a next hop, traffic controls permit packets, TLS establishes an encrypted session, and the application authorizes an operation. Success at one layer does not guarantee the next.

```text
Client temporary port 49152 --> Server service port 443
Client temporary port 49152 <-- Server service port 443
```

A security group remembers allowed connections. A NACL checks individual directions against numbered rules. At a server subnet, allowing incoming destination 443 is not enough if outgoing replies to the client's temporary port are blocked.

A route is like a direction sign, not a permission. The more-specific destination route wins. A security-group allow cannot create a missing route; an available route cannot override an API deny.

**An interface endpoint** gives a supported service private addresses inside the VPC. Private DNS makes the normal service hostname resolve to those addresses. The endpoint's group protects its interfaces, and its policy constrains supported API requests through it. IAM/resource policies still apply.

**An inspection endpoint** sees only routed traffic. A stateful firewall needs the appropriate forward and return path. Drawing a firewall beside a VPC does not make it inspect all communication. Explicitly trace each direction through its routes, including failover.

For example, two private application tiers may talk over local routing while internet egress passes through a firewall. An egress control does not automatically inspect that internal east/west traffic.

[Return to Infrastructure](03-infrastructure-security-study-guide.md#a-follow-one-connection).

### Edge Browser And Device Basics

**CORS** is a browser mechanism. A page loaded from one origin may need permission to read responses from another. A preflight asks whether the cross-origin method/headers are acceptable. S3 access permission and browser CORS acceptance are different checks.

```text
Browser script --> CORS rules allow response use?
Signed request --> S3 policies allow object operation?

Both can matter. CORS does not grant S3 permissions.
```

**Origin protection** prevents an attacker from bypassing the front door. If a WAF protects CloudFront but the origin accepts arbitrary direct requests, the unprotected route remains. Restrict the origin using supported mechanisms and verify direct requests are rejected as intended.

**Device policies** are another boundary. An IoT certificate identifies a device, but the attached policy determines what it can do. Permission to connect is not permission to subscribe to every topic or receive every message. Scope the device's topic/client resources and understand the different wildcard syntaxes.

**Model tools** have the same separation. A chatbot response proposing an action is not permission to execute it. The application must authorize the user, scope retrieved data, validate parameters, and restrict the tool's role. Guardrails help filter content; they do not supply tenant isolation by themselves.

[Return to Infrastructure](03-infrastructure-security-study-guide.md#d-protect-the-edge-and-the-origin).

## 5. Data Protection

### KMS

AWS KMS manages encryption keys and performs cryptographic operations.

Use KMS when:

- data at rest must be encrypted with managed keys
- key use must be logged in CloudTrail
- key access needs IAM and key policy control

Simple flow:

```text
Application asks KMS to encrypt/decrypt
KMS checks permissions
KMS uses key material
KMS returns result
```

### KMS Key Policy

A KMS key policy controls access to a KMS key.

KMS is special because the key policy is always important. IAM permission alone may not be enough if the key policy does not allow the account or principal to use the key.

Exam memory:

```text
For KMS access, check both:
1. key policy
2. IAM/resource policies
```

### KMS Grant

A KMS grant is a temporary or service-mediated permission to use a KMS key.

AWS services often use grants so they can encrypt or decrypt on your behalf.

Real-world example:

EBS uses KMS grants to attach and use encrypted volumes with EC2 instances.

Official cross-check: [KMS grants](https://docs.aws.amazon.com/kms/latest/developerguide/grants.html)

### Envelope Encryption

Envelope encryption means:

```text
Data is encrypted with a data key.
Data key is encrypted with a KMS key.
```

Flow:

```text
KMS key
  |
  v
encrypts data key
  |
  v
data key encrypts actual data
```

Why this exists:

KMS does not need to encrypt a huge object directly. It protects the smaller data key, and the data key protects the data.

### Multi-Region KMS Key

A multi-Region KMS key has related key material in multiple Regions.

Use it when:

- encrypted data must move across Regions
- disaster recovery needs local decrypt in another Region
- application needs the same logical key material in multiple Regions

Exam trap:

Multi-Region keys do not automatically replicate your data. You still need data replication.

### Imported Key Material

Imported key material means you bring your own key material into KMS.

Use it when:

- compliance requires external generation of key material
- you need control over key material origin

Tradeoff:

You become responsible for safely keeping a copy of the original key material if you might need to re-import it.

### CloudHSM And Custom Key Store

CloudHSM gives you dedicated HSMs that you manage more directly.

Use CloudHSM when requirements say:

- dedicated hardware security module
- customer-managed HSM cluster
- strict compliance around key custody

KMS custom key store can integrate KMS with CloudHSM-backed keys.

### S3 Encryption

Common S3 encryption options:

| Option | Meaning |
| --- | --- |
| SSE-S3 | S3-managed encryption keys |
| SSE-KMS | KMS-managed keys |
| DSSE-KMS | dual-layer server-side encryption with KMS |
| Client-side encryption | app encrypts before sending to S3 |

Exam memory:

- Need KMS audit/key control: SSE-KMS.
- Need simplest server-side encryption: SSE-S3.
- Need app-side control before upload: client-side encryption.

### S3 Bucket Policy

An S3 bucket policy is a resource-based policy attached to a bucket.

Use it for:

- cross-account access
- enforcing TLS
- enforcing encryption
- allowing CloudFront OAC
- denying public access patterns

Official cross-check: [S3 bucket policies](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucket-policies.html)

### S3 Block Public Access

S3 Block Public Access prevents public access through bucket policies, access point policies, or ACLs.

Use it as a safety net.

Real-world example:

Even if someone accidentally adds a public bucket policy, Block Public Access can reject the public access path.

Official cross-check: [S3 Block Public Access](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html)

### S3 Object Lock

S3 Object Lock makes objects write-once-read-many for a retention period or legal hold.

Modes:

| Mode | Meaning |
| --- | --- |
| Governance | privileged users can bypass with special permission |
| Compliance | no one, including root, can shorten/delete during retention |

Use it for:

- immutable logs
- legal hold
- ransomware-resistant evidence storage

### Secrets Manager

Secrets Manager stores, retrieves, and rotates secrets.

Use it for:

- database passwords
- API keys
- OAuth tokens
- application secrets

Flow:

```text
App starts
 |
 | calls Secrets Manager
 v
gets secret at runtime
 |
 v
connects to database
```

Why it exists:

Secrets should not be hard-coded in source code, AMIs, or container images.

Official cross-check: [What is AWS Secrets Manager?](https://docs.aws.amazon.com/secretsmanager/latest/userguide/)

### Parameter Store

Systems Manager Parameter Store stores configuration values and can store simple secrets.

Use it when:

- app configuration needs central storage
- secret rotation is not a major requirement
- simple secure string storage is enough

Memory:

- Secrets Manager is usually best for managed rotation.
- Parameter Store is often simpler configuration storage.

### ACM

AWS Certificate Manager manages TLS certificates.

Use it for:

- public certificates for AWS integrated services
- private certificates with AWS Private CA
- automatic renewal for supported ACM-managed certificates

Real-world example:

Use ACM to attach an HTTPS certificate to an Application Load Balancer or CloudFront distribution.

Official cross-check: [What is AWS Certificate Manager?](https://docs.aws.amazon.com/acm/latest/userguide/)

### AWS Private CA

AWS Private CA lets you run a private certificate authority.

Use it for:

- internal TLS
- private service certificates
- mutual TLS for internal applications
- enterprise PKI patterns

Memory:

- Public customer-facing website certificate: ACM public certificate.
- Internal service certificates: AWS Private CA.

### TLS And mTLS

TLS encrypts network traffic in transit.

Normal TLS:

```text
Client verifies server certificate
```

Mutual TLS:

```text
Client verifies server certificate
Server verifies client certificate
```

Use mTLS when the server must identify the calling client by certificate.

### AWS Backup

AWS Backup centrally manages backups across supported AWS services.

Use it when:

- backup plans should be centralized
- backup policies span accounts
- retention and lifecycle rules need consistency

### Backup Vault Lock

Backup Vault Lock applies WORM-style controls to backup vaults.

Use it when backups must be protected from deletion or retention reduction.

## 6. Incident Response And Automation

### EventBridge

EventBridge routes events from AWS services to targets.

Simple flow:

```text
GuardDuty finding
   |
   v
EventBridge rule
   |
   +--> Lambda
   +--> SNS
   +--> Step Functions
   +--> Systems Manager Automation
```

Use it when the question says:

- when a finding happens, trigger response
- route AWS service events
- connect detection to automation

### Lambda

Lambda runs code without managing servers.

Use it for small response actions:

- disable an access key
- tag a resource
- publish a notification
- update a security group

Exam memory:

- Lambda is good for short custom logic.
- Step Functions is better for multi-step workflows.

### Step Functions

Step Functions orchestrates multi-step workflows.

Use it when response needs:

- approval
- branching logic
- retries
- multiple AWS service actions
- clear workflow state

Simple flow:

```text
Start
 |
 v
Validate finding
 |
 v
Snapshot instance
 |
 v
Isolate instance
 |
 v
Notify responder
```

### Systems Manager Automation

Systems Manager Automation runs repeatable operational runbooks.

Use it for:

- standardized remediation
- patch operations
- incident response steps
- approved runbooks

### Session Manager

Standard session logging is different from a tunneled SSH or port-forwarding session: Session Manager does not record session content for those tunnels. [Logging limitations](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-logging.html).

Session Manager gives shell access to instances without opening inbound SSH or RDP.

Benefits:

- no public inbound port required
- access controlled by IAM
- sessions can be logged
- works well for private subnets

Exam memory:

Private EC2 emergency access without opening SSH usually points to Session Manager.

### EC2 Quarantine

Read [containment tradeoffs](02-incident-response-study-guide.md#b-triage-and-choose-containment) alongside this overview. Security-group changes may leave tracked connections active; network quarantine does not revoke stolen credentials.

A common incident response step is isolating a compromised EC2 instance.

Safer pattern:

```text
Detect issue
 |
 v
Preserve evidence if needed
 |
 v
Attach restrictive security group
 |
 v
Snapshot volumes
 |
 v
Investigate from clean forensic instance
```

Exam trap:

Do not immediately terminate the instance if forensic evidence is needed.

### EBS Snapshot And AMI

An EBS snapshot captures a point-in-time copy of an EBS volume.

An AMI can preserve an instance image.

Use them for:

- forensic preservation
- recovery
- analysis in an isolated account

Security note:

Control snapshot sharing and encrypt snapshots when needed.

### Response Access And Evidence Basics

**Why prepare access?** During an incident, the normal administrator may be unavailable or compromised. A responder needs an independently controlled way to inspect resources, collect evidence, and contain damage.

A role's trust policy determines who can assume it. Its permissions determine allowed actions. The evidence bucket and encryption key have separate access controls. Test the whole path: permission to create a snapshot is different from permission to copy or decrypt it.

```text
Approved responder --> Assume response role
                              |
                  +-----------+-----------+
                  |                       |
             Inspect/contain        Collect evidence
                                          |
                                          v
                                 Archive policy + key
```

Acquisition collects an artifact; preservation protects its original form; analysis uses a working copy. Provenance records where evidence came from. Chain of custody documents transfers and access so investigators can explain who controlled it.

Record the source instance/volume, snapshot ID, collection time, operator/runbook identity, and analysis-copy location. For exported files, record a cryptographic hash. Matching hashes support integrity checking; they do not prove the original collection was complete.

Memory is volatile: rebooting can remove it. Disk snapshots preserve volume blocks, not RAM. Plan memory acquisition while balancing the danger of leaving a system running. Suspect files may contain malware: use isolated analysis tools and avoid production credentials.

[Return to Incident Response](02-incident-response-study-guide.md#c-collect-evidence-without-destroying-it).

### Response Automation And Safe Recovery

Orchestration coordinates a sequence. Step Functions can call services, branch, wait for approval, and handle failures. Systems Manager Automation executes defined procedures; Lambda can perform an individual action.

```text
Validate --> Save original state --> Approval if needed
                                           |
                                           v
                                   Action --> Verify
                                                |
                                    Failed? --> Escalate
```

A runbook defines inputs, scope, permissions, timeout, rollback conditions, and success tests. Use incident/resource identifiers to avoid duplicate actions. A second quarantine invocation must not overwrite saved original security groups with the already-quarantined groups; rollback would then restore the wrong state.

Containment limits harm; eradication removes the entry point and persistence; recovery restores a trusted service. A restored server still accepting the stolen secret is not safely recovered.

RPO is acceptable data loss expressed as time. An RPO of 15 minutes requires sufficiently recent recoverable data; a daily backup alone cannot meet it. RTO is the target time to restore service.

Neither establishes that a backup is clean. Test decryption, integrity, application behavior, access, dependencies, and monitoring in isolation before returning traffic. Define rollback criteria for unexpected behavior.

[Return to Incident Response](02-incident-response-study-guide.md#f-recover-and-test-readiness).

## 7. Governance And Compliance

### AWS Organizations

AWS Organizations manages multiple AWS accounts centrally.

Use it for:

- account structure
- OUs
- SCPs
- RCPs
- delegated administrator setup
- organization-wide security services

Simple structure:

```text
Root
|
+-- Security OU
+-- Infrastructure OU
+-- Workloads OU
    +-- Prod
    +-- Dev
```

### Organizational Unit

An OU is a folder-like grouping of AWS accounts.

Use OUs to apply policies by environment or function.

Example:

```text
Prod OU gets stricter SCPs than Sandbox OU.
```

### Delegated Administrator

A delegated administrator account manages a service for the organization without using the management account for daily work.

Common examples:

- GuardDuty administrator
- Security Hub administrator
- Macie administrator
- Inspector administrator
- Config aggregator account

Exam memory:

Use delegated admin to keep the management account clean and reduce operational risk.

### Control Tower

AWS Control Tower helps set up and govern a multi-account landing zone.

Use it when:

- creating accounts with guardrails
- managing account baselines
- applying preventive and detective controls
- setting up a governed multi-account environment

### Firewall Manager

Firewall Manager centrally manages security policies across accounts.

Common targets:

- WAF rules
- Shield Advanced protections
- security group policies
- Network Firewall policies
- DNS Firewall policies

Use it when the question says:

```text
Apply the same firewall/security policy across many accounts.
```

### AWS Artifact

AWS Artifact provides access to AWS compliance reports and agreements.

Use it when the question asks for:

- AWS SOC reports
- PCI reports
- ISO reports
- compliance agreements

Exam memory:

Artifact gives AWS-side compliance documentation. It does not collect your workload evidence.

### AWS Audit Manager

Audit Manager helps collect and organize audit evidence from your AWS environment.

Use it when:

- mapping controls to evidence
- preparing for an audit
- continuously collecting evidence

### AWS Service Catalog

Service Catalog lets organizations provide approved products that teams can launch.

Real-world example:

Developers can launch only approved, pre-hardened EC2 templates instead of building arbitrary infrastructure.

### AWS RAM

AWS Resource Access Manager shares AWS resources across accounts.

Common examples:

- subnets
- Transit Gateway
- Route 53 Resolver rules
- license configurations

Memory:

RAM shares resources. It is not an IAM policy replacement for every service.

### CloudFormation Guard

CloudFormation Guard checks infrastructure-as-code templates against policy rules.

Use it before deployment to catch insecure templates.

Example idea:

```text
Reject templates where S3 bucket encryption is missing.
Reject templates where public access is allowed.
```

### Well-Architected Tool

The Well-Architected Tool helps review architecture against AWS best practices.

It does not enforce controls by itself.

Use it when the question is about:

- architecture review
- best-practice assessment
- identifying improvement plans

## 8. Common "Which Service?" Memory Table

| If the question says... | Think first |
| --- | --- |
| Who made this API call? | CloudTrail |
| Query historical API activity with SQL | CloudTrail Lake |
| Network traffic metadata | VPC Flow Logs |
| DNS query visibility | Route 53 Resolver query logs |
| Managed threat finding | GuardDuty |
| Central finding aggregator and standards | Security Hub |
| Root cause and relationship investigation | Detective |
| Central normalized security data lake | Security Lake |
| Sensitive data in S3 | Macie |
| Vulnerability and package/CVE scanning | Inspector |
| Resource configuration history/compliance | AWS Config |
| Web request filtering | AWS WAF |
| DDoS protection | AWS Shield |
| VPC traffic inspection | AWS Network Firewall |
| DNS domain filtering | Route 53 Resolver DNS Firewall |
| Workforce AWS access | IAM Identity Center |
| Application user login | Cognito |
| App-level authorization | Verified Permissions |
| Organization identity guardrail | SCP |
| Organization resource guardrail | RCP |
| Encrypt data with managed keys | KMS |
| TLS certificates | ACM |
| Private certificate authority | AWS Private CA |
| Secret rotation | Secrets Manager |
| Private EC2 access without SSH | Session Manager |
| Event routing | EventBridge |
| Multi-step remediation | Step Functions |
| Same firewall policy across accounts | Firewall Manager |
| AWS compliance reports | Artifact |
| Collect audit evidence | Audit Manager |

## 9. Permission Evaluation In One Picture

Use this whenever an access question feels confusing:

```text
Request:
Principal wants Action on Resource
        |
        v
Is there an explicit deny?
        |
  yes --+--> Deny
        |
        no
        v
Do identity/resource policies allow it?
        |
   no --+--> Deny
        |
        yes
        v
Do boundaries, session policies, SCPs, RCPs still allow it?
        |
   no --+--> Deny
        |
        yes
        v
Allow
```

Short version:

```text
Explicit deny wins.
Every required allow layer must line up.
Guardrails limit; they do not grant.
```

## 10. Log Selection In One Picture

```text
Need API activity?
  -> CloudTrail

Need S3 object-level reads/writes?
  -> CloudTrail data events

Need network metadata?
  -> VPC Flow Logs

Need DNS lookups?
  -> Route 53 Resolver query logs

Need application logs or metrics?
  -> CloudWatch Logs / CloudWatch Metrics

Need broad normalized security data lake?
  -> Security Lake
```

## 11. Beginner Exam Traps

### Trap 1: Thinking Guardrails Grant Access

SCPs, RCPs, permissions boundaries, and session policies do not grant permissions.

They only limit permissions that are granted somewhere else.

### Trap 2: Confusing CloudTrail And CloudWatch

CloudTrail:

```text
AWS API audit activity
```

CloudWatch:

```text
metrics, logs, alarms, dashboards
```

### Trap 3: Expecting VPC Flow Logs To Show Payloads

VPC Flow Logs show metadata, not packet contents.

They can show:

- source IP
- destination IP
- ports
- protocol
- accept/reject
- byte and packet counts

They cannot show:

- file content
- HTTP body
- command text
- password value

### Trap 4: Using Cognito For Employees

Cognito is usually for app users.

Identity Center is usually for workforce access to AWS accounts and business apps.

### Trap 5: Using WAF For All Network Problems

WAF is for Layer 7 HTTP/HTTPS web requests.

It is not the answer for every network filtering question.

### Trap 6: Forgetting KMS Key Policy

For KMS, always check the key policy.

IAM permission alone may not be enough.

### Trap 7: Deleting Evidence Too Early

In incident response, preserve evidence before destructive cleanup when investigation is required.

## 12. Quick Beginner Study Path

If you are new to AWS security, read in this order:

1. AWS building blocks: accounts, Regions, ARNs, tags.
2. IAM basics: principal, action, resource, conditions.
3. Policy evaluation: default deny, explicit allow, explicit deny.
4. Guardrails: SCP, RCP, boundaries, session policies.
5. Logging: CloudTrail, CloudWatch, VPC Flow Logs, DNS logs.
6. Detection services: GuardDuty, Security Hub, Detective, Security Lake, Macie, Inspector.
7. Network basics: VPC, security groups, NACLs, endpoints, WAF, Shield.
8. Data protection: KMS, S3, Secrets Manager, ACM.
9. Incident response automation: EventBridge, Lambda, Step Functions, Systems Manager.
10. Governance: Organizations, Control Tower, Config, Audit Manager, Artifact.

Then go back to:

```text
01 Detection and Monitoring
02 Incident Response
03 Infrastructure Security
04 Identity and Access Management
05 Data Protection
06 Security Foundations and Governance
```

## 13. Second-Round Beginner Addendum

This section fills gaps found after checking all six study guides again. These are the concepts that can slow down a beginner because they are often mentioned quickly in exam-style material.

### EventBridge, SNS, SQS, And Lambda Together

These services often appear together, but each has a different job.

```text
Something happens
   |
   v
EventBridge decides where the event should go
   |
   +--> SNS sends notifications to people/systems
   |
   +--> SQS queues work for later processing
   |
   +--> Lambda runs small custom code
   |
   +--> Step Functions starts a workflow
```

Simple meanings:

| Service | Beginner meaning | Common exam clue |
| --- | --- | --- |
| EventBridge | event router | "when this AWS event happens, trigger..." |
| SNS | notification fanout | email, SMS, HTTP endpoint, many subscribers |
| SQS | queue | decouple producer and worker |
| Lambda | run code | custom action with no server |
| Step Functions | workflow | ordered steps, retries, branching |

Real-world example:

```text
GuardDuty detects suspicious EC2 behavior
   |
   v
EventBridge rule matches the finding
   |
   +--> SNS emails the security team
   +--> Lambda tags the instance as "UnderInvestigation"
   +--> Step Functions starts a quarantine workflow
```

Tiny JSON example of an EventBridge pattern:

```json
{
  "source": ["aws.guardduty"],
  "detail-type": ["GuardDuty Finding"],
  "detail": {
    "severity": [7, 8, 9]
  }
}
```

Read it like this:

```text
If GuardDuty sends a high-severity finding, run the target.
```

Beginner trap:

SNS is usually not the security detector. It is the message delivery service after something else detects the issue.

### Athena, CloudWatch Logs Insights, And CloudTrail Lake

All three can feel like "query tools," but they query different places.

```text
CloudWatch Logs group
   |
   v
CloudWatch Logs Insights

CloudTrail event data store
   |
   v
CloudTrail Lake SQL

Files in S3
   |
   v
Athena SQL
```

Decision table:

| Need | Pick |
| --- | --- |
| Quick query over CloudWatch Logs | CloudWatch Logs Insights |
| SQL over an existing eligible CloudTrail event data store | CloudTrail Lake |
| SQL over files stored in S3 | Athena |
| Query old logs already exported to S3 | Athena |
| Investigate API calls in an existing Lake customer's store | CloudTrail Lake |

Example:

You stored CloudTrail logs in S3 for two years and now want to query them:

```text
CloudTrail logs in S3 -> Athena table -> SQL query
```

If the question says "CloudTrail Lake event data store":

```text
CloudTrail Lake event data store -> CloudTrail Lake SQL
```

Beginner trap:

Do not choose Athena just because the question says SQL. First ask where the data lives.

CloudTrail Lake is closed to new customers from May 31, 2026; the existing-store examples above are conditional on continued customer access. [Availability notice](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-lake-service-availability-change.html).

#### Understand The Setup Behind A Query

An Athena table is a description of files: their location, column names, types, and format. The files stay in S3. Partitions divide data, often by day or account, to reduce the amount a query reads.

An incorrect prefix or absent partition metadata can produce zero results even when the files exist.

The caller needs permission to read the relevant data, decrypt it when necessary, and use the query's results location. Check these independently. A query can read the source but fail while writing its output.

For Logs Insights, choose the correct log groups and time window. Fields in one application's JSON are not guaranteed to exist in another's. First inspect a representative record, then write the query against the actual structure.

If a table has columns `event_time`, `action`, and `actor`, this illustrative SQL asks a specific question:

```sql
SELECT event_time, actor
FROM example_audit_table
WHERE action = 'GetObject'
ORDER BY event_time DESC;
```

Those names are placeholders for a teaching schema, not a universal CloudTrail schema. SQL syntax cannot make an uncollected event appear.

[Return to Detection: query selection](01-detection-and-monitoring-study-guide.md#81-query-where-the-evidence-lives).

### CloudTrail Insights

CloudTrail Insights detects unusual CloudTrail API activity patterns.

CloudTrail answers:

```text
What API call happened?
```

CloudTrail Insights answers:

```text
Is this API call rate or error rate unusual compared with normal behavior?
```

Simple picture:

```text
Normal baseline:
DeleteBucket calls = 0 or 1 per hour

Sudden behavior:
DeleteBucket calls = 100 in 5 minutes

CloudTrail Insights:
Creates an Insights event for unusual API call rate
```

Example event idea:

```json
{
  "eventSource": "s3.amazonaws.com",
  "eventName": "DeleteBucket",
  "insightType": "ApiCallRateInsight",
  "state": "Start"
}
```

Use it when the question says:

- unusual API call volume
- unusual API error rate
- baseline compared with current API activity

Do not confuse it with GuardDuty:

```text
CloudTrail Insights = unusual API activity rate
GuardDuty = managed threat detection from multiple signal sources
```

### OpenSearch Security Analytics

OpenSearch Security Analytics is a SIEM-style feature for logs already indexed in OpenSearch.

Simple flow:

```text
Application / auth / firewall logs
   |
   v
OpenSearch indexes
   |
   v
Security Analytics detector
   |
   v
Rules match log events
   |
   v
Findings and alerts
```

Vocabulary:

| Word | Meaning |
| --- | --- |
| Detector | watches a log type on a schedule |
| Rule | condition that identifies suspicious activity |
| Finding | matched security event |
| Alert | notification/action from finding logic |
| Sigma rule | common open rule format for detections |

Real-world example:

A company already sends Linux authentication logs and firewall logs into OpenSearch. Security Analytics uses rules to detect repeated failed logins and suspicious source IPs.

Exam memory:

- Logs already in OpenSearch + detector/rules/findings = OpenSearch Security Analytics.
- AWS-native finding aggregation = Security Hub.
- Broad normalized security data lake = Security Lake.

### AWS Security Incident Response

AWS Security Incident Response is managed help for monitoring, triage, case management, and response support for AWS security events.

Simple picture:

```text
Security event
   |
   v
AWS Security Incident Response
   |
   +--> triage
   +--> case management
   +--> response support
   +--> integration with existing tools
```

Use it when the question says:

- managed AWS incident response support
- security case handling
- help triaging AWS security events
- response support beyond just detection

Do not confuse:

```text
GuardDuty detects suspicious activity.
AWS Security Incident Response helps manage response to incidents.
```

### OpsCenter And Incident Manager

**Availability:** Incident Manager is closed to new customers from November 7, 2025. Existing enabled accounts can continue using it. [AWS notice](https://docs.aws.amazon.com/incident-manager/latest/userguide/incident-manager-availability-change.html).

Both are in the Systems Manager family, but they solve different problems.

```text
OpsCenter = operational work item tracking
Incident Manager = coordinated incident response plan
```

Simple diagram:

```text
CloudWatch alarm or EventBridge event
   |
   +--> OpsCenter OpsItem
   |       - track issue
   |       - related resources
   |       - investigation notes
   |
   +--> Incident Manager incident
           - response plan
           - contacts
           - escalation
           - runbook
```

Real-world example:

A disk-space alarm creates an OpsItem for operations. A production security incident creates an Incident Manager incident, pages the on-call responder, and starts a runbook.

Memory table:

| Need | Choose |
| --- | --- |
| Track operational issue | OpsCenter |
| Coordinate an incident with contacts and escalation | Incident Manager |
| Run repeatable remediation steps | Systems Manager Automation |

### AWS Fault Injection Service, Resilience Hub, And ARC

These appear in incident readiness and recovery questions.

```text
Before failure:
   FIS tests failure behavior
   Resilience Hub assesses readiness

During failure:
   ARC helps shift traffic or control recovery
```

Comparison:

| Service | Simple meaning | Example |
| --- | --- | --- |
| AWS Fault Injection Service | controlled failure experiments | stop instances to test failover |
| AWS Resilience Hub | resilience assessment and recommendations | check if app meets RTO/RPO targets |
| Amazon Application Recovery Controller | faster recovery controls | shift traffic away from impaired AZ/Region |

Text picture:

```text
Healthy system
   |
   | FIS experiment
   v
Simulated failure
   |
   v
Observe alarms, runbooks, failover
   |
   v
Resilience Hub assessment improves plan

Real impairment later
   |
   v
ARC zonal shift / routing control / Region recovery
```

Beginner trap:

FIS is for testing failure. ARC is for recovery control during real impairment. Resilience Hub is for assessing and improving resilience posture.

### VPC Traffic Mirroring

VPC Traffic Mirroring copies packets from supported network interfaces to a monitoring appliance.

Compare it with VPC Flow Logs:

```text
VPC Flow Logs
   -> metadata only
   -> who talked to whom, ports, protocol, accept/reject

VPC Traffic Mirroring
   -> packet copies
   -> send traffic to IDS/packet analysis appliance
```

Diagram:

```text
EC2 instance ENI
   |
   | copied packets
   v
Traffic Mirror Target
   |
   v
IDS / packet inspection tool
```

Real-world example:

A security team wants packet-level analysis for suspicious EC2 traffic. Flow Logs are not enough because they do not show payload. Traffic Mirroring sends packet copies to an IDS.

Exam memory:

- Metadata = Flow Logs.
- Packet copies = Traffic Mirroring.

### VPC Network Access Analyzer

Network Access Analyzer checks whether network paths exist that should not exist.

Plain-English question:

```text
Can something reach something else through my VPC network configuration?
```

Example:

```text
Find any path from internet gateway to private database subnet.
```

Simple picture:

```text
Internet
   |
   v
Internet Gateway
   |
   v
Route table + NACL + Security group + ENI
   |
   v
Database

Network Access Analyzer checks if this path is possible.
```

Use it when the question says:

- unintended network reachability
- prove no public path exists
- analyze network access paths

### EC2 Image Builder, Patch Manager, And IMDSv2

These are common compute-hardening tools.

```text
Before instance launch:
   EC2 Image Builder creates hardened AMIs/images

After instance launch:
   Patch Manager patches running managed nodes

At runtime:
   IMDSv2 protects instance metadata access
```

EC2 Image Builder:

```text
Base image
   |
   v
Install packages and hardening
   |
   v
Run tests
   |
   v
Produce golden AMI/container image
```

Patch Manager:

```text
Running EC2 fleet
   |
   v
Systems Manager agent
   |
   v
Patch baseline and maintenance window
   |
   v
Patch compliance result
```

IMDSv2:

```text
Application requests token
   |
   v
Uses token to request metadata
   |
   v
Gets role credentials if allowed
```

Why IMDSv2 matters:

IMDSv2 uses session-oriented requests. It helps reduce risk from vulnerabilities that try to trick an instance into making metadata requests.

Exam trap:

Do not use Image Builder to patch already-running instances. Use Patch Manager for running fleets.

### Amazon Q Developer, Code Scanning, And Inspector SBOM

CodeGuru Security support ended November 20, 2025. Historical references explain its scanning role, not availability for new implementations. Use supported pipeline tooling and verify its coverage. [AWS notice](https://docs.aws.amazon.com/cli/latest/reference/codeguru-security/).

These show up in supply-chain and shift-left security questions.

```text
Source code stage
   |
   v
Amazon Q Developer code review / code scanning

Built or deployed workload stage
   |
   v
Amazon Inspector vulnerability scanning and SBOM export
```

What is an SBOM?

SBOM means Software Bill of Materials. It is an inventory of software components and dependencies.

Simple example:

```json
{
  "application": "payment-api",
  "components": [
    { "name": "openssl", "version": "3.0.8" },
    { "name": "spring-core", "version": "6.1.3" }
  ]
}
```

Use Amazon Q Developer/code review when:

- the question is about source code before deployment
- developer feedback is needed in the coding stage
- code quality/security review is the clue

Use Inspector/SBOM when:

- EC2, ECR, or Lambda workload is deployed or built
- vulnerability inventory is needed
- software component inventory is needed

### Amazon Bedrock Guardrails

Bedrock Guardrails help apply safety controls to generative AI applications.

Simple idea:

```text
User prompt
   |
   v
Bedrock Guardrail checks input/output
   |
   v
Model response allowed, blocked, or filtered
```

Use it when the question says:

- generative AI application
- block harmful content
- redact sensitive information in AI interaction
- enforce AI safety policy

Beginner trap:

Bedrock Guardrails are not a network firewall. They are AI application safety controls.

### IAM Roles Anywhere

IAM Roles Anywhere lets workloads outside AWS get temporary AWS credentials using X.509 certificates.

Why it exists:

An on-premises server should not store long-term IAM access keys forever.

Flow:

```text
On-prem server has X.509 certificate
   |
   v
IAM Roles Anywhere validates certificate against trust anchor
   |
   v
Server receives temporary AWS credentials
   |
   v
Server calls AWS APIs using an IAM role
```

Important pieces:

| Piece | Meaning |
| --- | --- |
| Trust anchor | certificate authority that AWS trusts |
| Profile | tells which roles/settings can be used |
| IAM role | permissions the workload receives |
| Certificate private key | proves the workload identity |

Exam memory:

- Workforce user access = IAM Identity Center.
- App customer sign-in = Cognito.
- External workload with certificates = IAM Roles Anywhere.

### Session Tags And Revoking Role Sessions

Session tags are tags attached to a temporary session.

They are often used for ABAC.

Example:

```json
{
  "PrincipalTag": {
    "Department": "Finance",
    "Project": "Payments"
  }
}
```

Simple ABAC idea:

```text
Session tag Department=Finance
Resource tag Department=Finance
   |
   v
Allow access
```

Revoking role sessions:

Temporary credentials normally work until they expire. To respond to compromise, you can revoke active role sessions by changing policy/session validity behavior so older sessions become unusable.

Incident picture:

```text
Role credentials leaked
   |
   v
Revoke active sessions
   |
   v
Fix trust/permissions issue
   |
   v
Review CloudTrail for activity
```

Beginner trap:

Deleting an IAM role does not teach you what happened. In an incident, preserve evidence and review CloudTrail.

### S3 Presigned URLs

A presigned URL gives temporary access to a specific S3 object.

Simple flow:

```text
Authorized backend creates URL
   |
   v
User receives temporary URL
   |
   v
User downloads/uploads one object until URL expires
```

Example shape:

```text
https://bucket.s3.amazonaws.com/report.pdf?X-Amz-Algorithm=...&X-Amz-Expires=900&X-Amz-Signature=...
```

Use it when:

- temporary object access is needed
- you do not want to make the bucket public
- user should not receive AWS credentials

Beginner trap:

A presigned URL is not the same as public bucket access. It is temporary access signed by someone who already has permission.

### Directory Service, AD Connector, And AWS Managed Microsoft AD

These appear when exam questions mention Microsoft Active Directory.

```text
Existing on-prem AD
   |
   +--> AD Connector
        - redirects auth to on-prem AD
        - does not store directory data in AWS

Need managed AD hosted in AWS
   |
   +--> AWS Managed Microsoft AD
        - Microsoft AD running in AWS
        - supports trusts with on-prem AD
```

Decision table:

| Need | Choose |
| --- | --- |
| Use existing on-prem AD without copying directory data | AD Connector |
| Managed Microsoft AD domain in AWS | AWS Managed Microsoft AD |
| Workforce SSO to AWS accounts from AD identities | IAM Identity Center with AD source |

Real-world example:

A company already has corporate AD in its data center and wants AWS console access with existing usernames. AD Connector can redirect sign-in requests to the existing AD.

Beginner trap:

AD Connector is a gateway. It is not a full managed AD directory hosted in AWS.

### KMS Condition Keys: kms:ViaService And kms:GrantIsForAWSResource

KMS condition keys help restrict how a KMS key can be used.

`kms:ViaService` means:

```text
Allow KMS use only when the request comes through a specific AWS service.
```

Example idea:

```json
{
  "Effect": "Allow",
  "Action": ["kms:Decrypt", "kms:GenerateDataKey"],
  "Resource": "*",
  "Condition": {
    "StringEquals": {
      "kms:ViaService": "s3.us-east-1.amazonaws.com"
    }
  }
}
```

Read it like this:

```text
This key can be used through S3 in us-east-1, not directly from random KMS calls.
```

`kms:GrantIsForAWSResource` means:

```text
Allow grant creation only when the grant is for an AWS resource.
```

This often appears when AWS services need grants to use encrypted resources.

### S3 Bucket Keys

S3 Bucket Keys reduce the number of calls from S3 to KMS for SSE-KMS encryption.

Simple picture:

```text
Without S3 Bucket Key:
Many S3 objects -> many KMS requests

With S3 Bucket Key:
Many S3 objects -> bucket-level key cache -> fewer KMS requests
```

Use it when:

- SSE-KMS is used
- KMS request cost is high
- high object volume is mentioned

Beginner trap:

S3 Bucket Keys do not replace KMS permissions. They are cost/scale optimization.

### CloudWatch Logs Data Protection

CloudWatch Logs data protection helps detect and protect sensitive data in logs.

Simple flow:

```text
Application writes log event
   |
   v
CloudWatch Logs data protection policy
   |
   +--> audit sensitive data
   +--> mask sensitive data when viewed
```

Example:

```text
Log line contains credit card number
CloudWatch Logs masks it for viewers without permission
```

Use it when the question says:

- sensitive data appears in CloudWatch Logs
- mask or audit sensitive fields in logs

### SNS Message Data Protection

SNS message data protection can audit, mask, redact, or block sensitive data in SNS messages.

Simple picture:

```text
Publisher sends SNS message
   |
   v
SNS data protection policy checks message
   |
   +--> allow
   +--> audit
   +--> de-identify
   +--> deny
```

Important current-design caution:

Some study material still mentions SNS message data protection because it appears in SCS-C03 topic signals. For new real-world design, check current AWS availability before choosing it.

Exam approach:

- If the question explicitly says CloudWatch Logs, choose CloudWatch Logs data protection.
- If the question explicitly says SNS standard topic messages and names SNS message data protection, recognize the feature.

### CloudFront Field-Level Encryption

CloudFront field-level encryption protects specific sensitive fields at the edge before the request reaches your origin.

Example:

```text
Customer submits payment form
   |
   v
CloudFront encrypts only card_number field
   |
   v
Origin receives request with card_number encrypted
   |
   v
Only private-key holder decrypts it
```

Use it when:

- only specific form fields need extra protection
- sensitive fields should stay encrypted through intermediate systems
- CloudFront is in front of the application

Beginner trap:

TLS encrypts the whole network connection in transit. Field-level encryption protects selected fields beyond normal TLS termination points.

### Data In Transit: Nitro, EMR, EKS, And SageMaker

Some AWS services have service-specific encryption-in-transit details.

Simple table:

| Area | Beginner idea |
| --- | --- |
| TLS | encrypt client/server network traffic |
| mTLS | both client and server present certificates |
| Nitro inter-instance encryption | supported instance traffic can be automatically encrypted on AWS Nitro paths |
| EMR encryption | big data jobs may need at-rest and in-transit encryption settings |
| EKS encryption | protect Kubernetes secrets and network paths depending on design |
| SageMaker encryption | protect notebooks, training volumes, model artifacts, and inter-node traffic |

SageMaker example:

```text
Training data in S3
   |
   v
Training job volume encrypted with KMS
   |
   v
Model artifact written to S3 with KMS encryption
   |
   v
Inter-node traffic encrypted if required/configured
```

Exam memory:

If a question names a specific service like SageMaker, do not answer only with generic S3 encryption if the issue is training volume or inter-node traffic.

### Amazon Data Lifecycle Manager

Amazon Data Lifecycle Manager automates EBS snapshot and EBS-backed AMI lifecycles.

Simple flow:

```text
Tagged EBS volume
   |
   v
DLM policy
   |
   +--> create snapshot every day
   +--> retain for 30 days
   +--> delete old snapshots
```

Use it when:

- scheduled EBS snapshots are needed
- AMI lifecycle automation is needed
- retention of EBS snapshots is mentioned

Do not confuse:

```text
AWS Backup = centralized backup across supported services
DLM = EBS snapshot / EBS-backed AMI lifecycle
```

### S3 Access Grants

S3 Access Grants helps provide scalable, temporary, least-privilege access to S3 data.

Use it when normal IAM and bucket policies become hard to manage for many users and many data prefixes.

Simple flow:

```text
Corporate identity
   |
   v
S3 Access Grants maps identity to S3 data location
   |
   v
Temporary credentials scoped to allowed S3 prefix
   |
   v
User/application accesses only that data
```

Real-world example:

A data lake has thousands of prefixes. Analysts from many teams need temporary access to specific folders. S3 Access Grants avoids giant bucket policies and gives scoped temporary access.

### S3 Server Access Logging Constraints

S3 server access logging records requests made to a bucket.

Beginner view:

```text
Request to source bucket
   |
   v
S3 writes access log object
   |
   v
Target logging bucket
```

What it is good for:

- basic request auditing
- understanding access patterns
- old-school S3 access logs

What to remember:

- It is different from CloudTrail data events.
- The log target bucket must be configured correctly.
- Avoid sending logs into the same bucket/prefix pattern that creates confusion or loops.

Exam memory:

For detailed API audit across AWS, CloudTrail is usually stronger. For S3 request logs specifically, S3 server access logging may be mentioned.

### S3 Glacier Vault Lock

S3 Glacier Vault Lock applies compliance controls to legacy S3 Glacier vault archives.

Compare the three "lock" ideas:

| Lock type | Use |
| --- | --- |
| S3 Object Lock | WORM for S3 objects |
| AWS Backup Vault Lock | WORM-style protection for backup vaults |
| S3 Glacier Vault Lock | compliance policy for Glacier vault archives |

Simple picture:

```text
Glacier vault
   |
   v
Vault Lock policy
   |
   v
Policy locked after lock process
```

Exam clue:

If the wording says "Glacier vault archive compliance policy," think Glacier Vault Lock.

### Management Account And Centralized Root Access

The AWS Organizations management account is powerful. Avoid using it for ordinary workloads.

```text
Management account
   |
   +-- creates/manages organization
   +-- billing and organization controls
   +-- should be tightly protected
```

Root user:

```text
Root user = account owner identity with very broad power
```

Centralized root access helps manage member-account root credentials at scale.

Beginner rules:

- Protect the management account strongly.
- Do not use root for daily work.
- Use delegated administrator accounts for security services.
- Use break-glass processes for rare root-only tasks.

### Declarative Policies, Tag Policies, And AI Services Opt-Out Policies

AWS Organizations has more than SCPs and RCPs.

| Policy type | Simple meaning |
| --- | --- |
| SCP | maximum permissions for identities |
| RCP | maximum permissions for resources |
| Declarative policy | centrally declare desired service configuration |
| Tag policy | standardize tag keys and values |
| AI services opt-out policy | control whether supported AI services may use content for improvement |

Example:

```text
Tag policy:
CostCenter must follow approved values.

Declarative policy:
Supported EC2 setting must follow organization standard.

SCP:
Nobody in member accounts can disable CloudTrail.
```

Beginner trap:

Do not call every Organizations policy an SCP. AWS Organizations has multiple policy types.

### Config Aggregator, Remediation, And Conformance Packs

AWS Config can work across accounts and Regions.

```text
Member accounts and Regions
   |
   v
Config records resource state
   |
   v
Config aggregator
   |
   v
Central compliance view
```

Config rule:

```text
Checks one condition, such as "S3 bucket public access is blocked."
```

Conformance pack:

```text
Bundle of Config rules and optional remediation actions.
```

Remediation:

```text
If NON_COMPLIANT, run an automation to fix or help fix it.
```

Example:

```text
Rule detects public S3 bucket
   |
   v
Result = NON_COMPLIANT
   |
   v
Remediation runs SSM Automation
   |
   v
Block Public Access is enabled
```

Exam trap:

Config usually detects and records. It does not automatically prevent every bad action unless paired with preventive controls or remediation.

### StackSets, CloudFormation Guard, cfn-lint, And Hooks

These are deployment governance tools.

```text
Developer writes template
   |
   +--> cfn-lint checks syntax and valid resource properties
   |
   +--> CloudFormation Guard checks policy-as-code rules
   |
   v
CloudFormation create/update request
   |
   +--> CloudFormation Hook can warn or block server-side
   |
   v
Resources created
```

StackSets:

```text
Deploy the same CloudFormation stack across accounts and Regions.
```

CloudFormation Guard:

```text
Policy-as-code check for JSON/YAML templates.
Example: S3 buckets must have encryption.
```

cfn-lint:

```text
Template correctness check.
Example: property name is invalid or resource structure is wrong.
```

CloudFormation Hooks:

```text
Server-side pre-provision check during create/update/delete.
Can warn or block.
```

Real-world example:

```text
CI/CD pipeline:
  cfn-lint catches broken CloudFormation syntax.
  Guard catches missing encryption.

AWS account:
  CloudFormation Hook blocks non-compliant stack creation even if someone bypasses CI/CD.
```

Exam memory:

- Same baseline everywhere = StackSets.
- Policy-as-code in pipeline = CloudFormation Guard.
- Syntax/structure = cfn-lint.
- Server-side block before provisioning = CloudFormation Hooks or Control Tower proactive controls.

### Control Tower Controls: Preventive, Detective, Proactive

Control Tower controls are not all the same.

```text
Preventive
   -> blocks or restricts actions, often through SCPs

Detective
   -> detects non-compliance, often through Config

Proactive
   -> checks resources before provisioning, often through hooks
```

Example:

```text
Preventive:
Do not allow users to disable CloudTrail.

Detective:
Report if an S3 bucket becomes public.

Proactive:
Reject a CloudFormation template before it creates an unencrypted bucket.
```

Beginner trap:

Detective controls report problems. They do not always stop the resource from being created.

### Firewall Manager, RAM, And Service Catalog In One Picture

These three are easy to mix up.

```text
Need same security policy everywhere?
   -> Firewall Manager

Need to share a resource across accounts?
   -> AWS RAM

Need teams to launch approved products?
   -> Service Catalog
```

Picture:

```text
Security admin
   |
   +--> Firewall Manager: WAF/security group/Network Firewall policies

Network admin
   |
   +--> RAM: share subnet or Transit Gateway

Platform team
   |
   +--> Service Catalog: approved EC2/RDS/app templates
```

Real-world examples:

- Apply the same WAF rule group to all public ALBs: Firewall Manager.
- Share a central networking subnet with application accounts: RAM.
- Let developers launch only approved RDS configurations: Service Catalog.

### A Bigger Beginner Mental Model

When you read any AWS security question, slow it down into this picture:

```text
1. Who is acting?
   IAM user / role / AWS service / external principal / app user

2. What are they touching?
   S3 / KMS / EC2 / VPC / logs / account / organization

3. Is this about prevention, detection, investigation, or response?
   prevent  -> IAM, SCP, RCP, WAF, Network Firewall, KMS policy
   detect   -> CloudTrail, GuardDuty, Config, Macie, Inspector
   investigate -> Detective, CloudTrail Lake, Athena, Logs Insights
   respond  -> EventBridge, Lambda, Step Functions, SSM, Incident Manager

4. Is this one account or many accounts?
   one account -> local service configuration
   many accounts -> Organizations, delegated admin, Firewall Manager, StackSets, Config aggregator

5. Is this before deployment, during runtime, or after incident?
   before deployment -> Guard, cfn-lint, Hooks, Service Catalog, Image Builder
   runtime -> Security groups, WAF, KMS, GuardDuty, Inspector, Patch Manager
   after incident -> snapshots, Object Lock, CloudTrail, Detective, response runbooks
```

If you can classify the question into those five lines, the answer choices become much easier.

## 14. Detection Foundations In Depth

These sections build the mechanisms used throughout Topic 1. Read them when a service summary makes sense but the steps between services still feel unclear.

### Detection Pipeline From First Principles

#### Start With An Everyday Example

Imagine a building with an entry register, a camera, and a guard. The register records entries; the camera records a different kind of evidence; the guard interprets observations. Installing a camera does not automatically notify the building owner.

Cloud monitoring has the same separation, although each source observes a specific digital activity.

#### Give Each Output A Different Job

A log is a record. A metric is a number measured over time. A finding is an interpreted security issue. An alert is a notification or trigger. A response is an action taken after assessment.

This vocabulary matters because an exam scenario can fail at any of those boundaries.

```text
Observation       Interpretation      Delivery            Action
-----------       --------------      --------            ------
Log/event  ----->  Rule or model ----> Alert routing ----> Investigate
                         |                                    |
                         v                                    v
                      Finding                             Remediate
```

Consider a file download. CloudTrail data events can record a supported S3 request. GuardDuty might identify an unusual access pattern. EventBridge can route a resulting finding. A responder then checks whether the download was legitimate. Each step supplies a different answer.

#### Place The Control In Time

```text
BEFORE / AT THE ACTION       OBSERVE IT           AFTERWARD
          |                     |                   |
          v                     v                   v
      Preventive            Detective           Corrective
      Block access          Find a problem      Fix the problem
```

There are three useful kinds of control. **Preventive** controls block disallowed actions, such as an authorization policy. **Detective** controls observe problems, such as a logging/detection rule. **Corrective** controls change the situation afterward, such as an approved remediation workflow.

Do not expect a detective service to prevent the original action just because it found it.

#### Understand What An Alert Can Get Wrong

There are also two kinds of uncertainty. A **false positive** is an alert for benign activity. A **false negative** is a missed real problem. Reducing all alerts to zero by suppressing broad categories can make false negatives worse.

Investigate noisy findings and narrow the exception to the known behavior.

To design a useful pipeline, ask what question must be answered, which source can answer it, where that source is collected, how long it is retained, and who receives the outcome. To test it, verify each handoff and the final result.

[Return to Detection: evidence selection](01-detection-and-monitoring-study-guide.md#1-start-with-a-question-not-a-service).

### Logs, Metrics, And Alarms Explained

#### From Three Records To One Measurement

A log answers "what happened in this observation?" A metric answers "how much or how often over time?" An alarm asks "does the measurement meet a condition?"

Example application records:

```text
10:00:05 login_failed request=41
10:00:18 login_failed request=42
10:00:44 login_failed request=43
```

A filter can turn each record into value `1`. Summing the one-minute values gives `3`. Taking their average gives `1`, which would answer a different question. This is why the statistic is part of the alarm logic.

```text
Records:       [failure] [failure] [failure]
Metric values:     1         1         1
Period sum:              3
Threshold:               >= 3
Result:                  Breaching period
```

A **namespace** organizes metric names. **Dimensions** identify a particular series, for example the production service versus a test service. An alarm watching the test series will not react to production values even when both metrics have the same name.

#### From Measurements To An Alarm Condition

An evaluation period is a time bucket. An M-out-of-N condition requires M breaching buckets among N evaluated buckets. For a 2-out-of-3 example:

```text
Period:       10:00    10:01    10:02
Failure sum:     8        0        9
Threshold >=5: yes       no      yes

Two breaching periods out of three -> condition satisfied
```

CloudWatch also has rules for obtaining available data and handling missing values; do not treat the example as its complete evaluation algorithm. Missing is not the same as a reported zero. A broken agent and a quiet application can look identical without a health signal.

In a real system, count failed logins for threat detection and separately monitor whether the log collector is alive. A combined dashboard helps a person inspect both, but dashboard visibility alone does not notify anyone. [CloudWatch alarm behavior](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html).

[Return to Detection: building alarms](01-detection-and-monitoring-study-guide.md#42-build-a-threshold-with-meaning).

### Log Delivery Permissions Step By Step

#### Name The Actor Before Reading The Policy

Permissions become easier when you name the actor at each step. The person configuring a log destination, the service delivering logs, and the analyst reading them are not necessarily the same identity.

For a central CloudTrail archive:

```text
Setup administrator
   | Can configure the trail and required policies
   v
CloudTrail service
   | Can write the intended S3 log prefix
   | Can use required KMS encryption operations
   v
Encrypted log objects
   |
   v
Analyst role
   | Can read selected S3 objects
   | Can decrypt with the relevant key
   v
Investigation
```

An **identity policy** is attached to the caller, such as an analyst role. A **resource policy** is attached to the destination, such as the archive bucket. A **service principal** names an AWS service that acts, such as `cloudtrail.amazonaws.com`. A **key policy** controls the encryption key's use.

These are separate documents even when one workflow needs all of them.

An abbreviated teaching statement, not a complete CloudTrail bucket policy:

```json
{
  "Effect": "Allow",
  "Principal": { "Service": "cloudtrail.amazonaws.com" },
  "Action": "s3:PutObject",
  "Resource": "arn:aws:s3:::example-audit-archive/AWSLogs/111122223333/*",
  "Condition": {
    "StringEquals": {
      "aws:SourceArn": "arn:aws:cloudtrail:ap-south-1:111122223333:trail/audit"
    }
  }
}
```

Read it as: "this service may perform this action on this prefix when the request is for this trail." Production CloudTrail policy setup includes additional required statements/conditions, and organization trails use the appropriate organization path. Use the [complete AWS policy](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/create-s3-bucket-policy-for-cloudtrail.html) when implementing.

#### Locate The Failed Boundary

Troubleshoot by locating the failing action. If a producer cannot write, giving an analyst more read permission is irrelevant. If logs arrive but an analyst cannot decrypt them, changing collection selectors is irrelevant.

If the request times out reaching the service, first investigate networking rather than assuming an IAM denial.

[Return to Detection: archive permissions](01-detection-and-monitoring-study-guide.md#32-delivery-permission-and-reading-permission-are-different).

### DNS And Network Evidence Explained

Before discussing logs, separate the steps a client takes to reach an HTTPS application:

```text
1. Resolve name      "What address serves api.example?"
          |
2. Route packets     "Is there a path to that address?"
          |
3. Network controls  "May this traffic pass?"
          |
4. TLS handshake     "Can we establish a trusted encrypted connection?"
          |
5. App authorization "May this user perform this operation?"
          |
6. App result        "Did the operation succeed?"
```

DNS logs primarily illuminate step 1. Flow metadata helps with network traffic around steps 2-3. TLS and application logs explain later outcomes. CloudTrail records supported AWS activity, which is useful when the destination is an AWS API. No single one of these is a recording of everything.

An IP address identifies a network endpoint in context. A port identifies a service or temporary client endpoint on that address. TCP is a transport protocol that establishes connections; UDP sends datagrams without the same connection model.

HTTPS normally uses TCP port 443, but the port number alone does not prove the traffic was a successful HTTPS transaction.

An ENI is the network interface attached to an instance or service. A NAT device translates addresses, so the address visible at one observation point may differ from the original workload address. Correlate time and available original-address fields rather than assuming every public IP represents one host.

Example: the worker successfully resolves a name and its traffic is accepted, but the server rejects its client certificate. More DNS logging will not explain that rejection. Inspect the TLS/application boundary. This layered reasoning makes long troubleshooting questions manageable.

[Return to Detection: network scenarios](01-detection-and-monitoring-study-guide.md#53-work-through-an-ambiguous-symptom).

### Reliable Events And Duplicate Handling

#### Delivery And Processing Are Separate Milestones

Distributed services communicate across boundaries. A sender can deliver a message successfully while the receiving application later fails to complete its work. That is why "sent" and "processed" are different states.

```text
EventBridge --> Lambda accepts invocation --> Handler creates ticket
     |                                           |
     | delivery failure                          | processing failure
     v                                           v
Delivery retry/DLQ                       Lambda failure handling
```

A **retry** repeats a failed attempt. A **dead-letter queue** stores messages that could not be delivered/processed under the configured failure policy, so someone can inspect them. A DLQ needs an owner and an alarm; unread failed events are not resolved incidents.

#### Make A Repeated Event Safe To Handle

```text
Finding F-17 arrives --> Ticket T-42 created
                              |
                              v
                     Remember F-17 -> T-42

Finding F-17 arrives again --> Reuse / update T-42
                              Do not create a second ticket
```

An action is **idempotent** when repeating it does not add an unintended extra effect. For example, store that ticket `T-42` already corresponds to finding `F-17`. If `F-17` arrives again, update or reuse the existing ticket instead of opening another.

Include version/time handling if later finding updates need new work.

Do not mark work completed before it actually succeeds. A crash between "marked complete" and "created ticket" can otherwise lose the task. Real implementations need to coordinate stored state and retries carefully, and use destination idempotency features where available.

In an exam, distinguish producer failure, delivery failure, and handler failure. Match the retry/DLQ control to the boundary described. [EventBridge undelivered events](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-rule-dlq.html).

[Return to Detection: reliable alerting](01-detection-and-monitoring-study-guide.md#92-a-matched-rule-is-only-half-the-journey).

### Regular Assessments And State Manager

Not every security check starts with an attack. Some checks ask whether a required configuration is still present today. A regular assessment can discover gradual drift, such as a monitoring agent being stopped after a maintenance change.

Systems Manager State Manager uses an **association**: a document describing the desired operation/configuration, the target managed nodes, and when to apply it. Managed nodes need the required Systems Manager setup, permissions, and connectivity.

```text
Desired configuration + Target selection + Schedule
                         |
                         v
                 State Manager association
                         |
                         v
                 Apply to managed nodes
                         |
                         v
                  Execution/compliance result
```

For example, the platform team distributes the approved monitoring configuration and checks association execution across its fleet. If a newly launched instance is not managed or does not match the target selection, it can be missed.

An association existing in the console is not proof that every server received it.

Compare the tools by their unit of work: Config evaluates supported resource configuration; a conformance pack packages Config checks and remediation definitions; State Manager applies desired state through associations; Automation runs a defined procedure. These can work together, but none replaces API audit retention.

[AWS State Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-state.html). [Return to Detection: assessments](01-detection-and-monitoring-study-guide.md#72-config-and-state-manager-state-rather-than-attack-behavior).
