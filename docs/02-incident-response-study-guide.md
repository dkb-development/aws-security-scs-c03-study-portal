# AWS Security Specialty SCS-C03 Incident Response Study Guide

Beginner links for this topic:

- [GuardDuty](00-aws-security-foundations-for-beginners.md#guardduty), [EventBridge](00-aws-security-foundations-for-beginners.md#eventbridge), [Lambda](00-aws-security-foundations-for-beginners.md#lambda), [Step Functions](00-aws-security-foundations-for-beginners.md#step-functions)
- [Systems Manager Automation](00-aws-security-foundations-for-beginners.md#systems-manager-automation), [Session Manager](00-aws-security-foundations-for-beginners.md#session-manager)
- [CloudTrail](00-aws-security-foundations-for-beginners.md#cloudtrail), [VPC Flow Logs](00-aws-security-foundations-for-beginners.md#vpc-flow-logs), [Detective](00-aws-security-foundations-for-beginners.md#detective)
- [Access Keys](00-aws-security-foundations-for-beginners.md#access-keys), [STS](00-aws-security-foundations-for-beginners.md#sts), [EC2 Quarantine](00-aws-security-foundations-for-beginners.md#ec2-quarantine), [EBS Snapshot and AMI](00-aws-security-foundations-for-beginners.md#ebs-snapshot-and-ami), [S3 Object Lock](00-aws-security-foundations-for-beginners.md#s3-object-lock)
- [AWS Security Incident Response](00-aws-security-foundations-for-beginners.md#aws-security-incident-response), [OpsCenter and Incident Manager](00-aws-security-foundations-for-beginners.md#opscenter-and-incident-manager), [AWS Fault Injection Service, Resilience Hub, and ARC](00-aws-security-foundations-for-beginners.md#aws-fault-injection-service-resilience-hub-and-arc), [EventBridge, SNS, SQS, and Lambda Together](00-aws-security-foundations-for-beginners.md#eventbridge-sns-sqs-and-lambda-together)

Generated: 2026-10-06

This guide is exam-focused. It is based on the question bank and topic signals collected in this workspace, official AWS documentation, and original synthesis. It does not contain copied real exam questions, paid course content, or dumps.

Use it as a reverse-engineered study path: learn the incident response patterns that appear repeatedly, then practice the related questions in the portal.

---

## Guided Learning Path

Reviewed: 2026-10-09. Read these lessons first, then use the component reference and additional scenarios below. The official objectives require planning, testing, evidence handling, containment, recovery, and root-cause analysis, not just naming response services.

**Pass 1: Prepare and decide**

- [A. Prepare before an incident](#a-prepare-before-an-incident)
- [B. Triage and choose containment](#b-triage-and-choose-containment)

**Pass 2: Preserve and investigate**

- [C. Collect evidence without destroying it](#c-collect-evidence-without-destroying-it)
- [D. Respond to identity and data incidents](#d-respond-to-identity-and-data-incidents)

**Pass 3: Automate and recover**

- [E. Build a reliable response workflow](#e-build-a-reliable-response-workflow)
- [F. Recover and test readiness](#f-recover-and-test-readiness)
- [G. Scenario workshop](#g-scenario-workshop)

## A. Prepare Before An Incident

### A Plan Is A Decision System

A response plan identifies who leads, who can approve interruption, how teams communicate, and when to escalate. A runbook is the concrete procedure for a particular event. A good runbook says what to check before an action and how to verify it afterward.

For a payments service, the incident commander may authorize taking one worker out of service, while a wider payment shutdown needs a business owner. Decide this before the outage; a Lambda function cannot invent the organization's risk tolerance.

```text
Plan: authority + communication + escalation
                         |
                         v
Runbook: conditions -> steps -> evidence -> verification
                         |
                         v
Exercise: prove the people AND permissions can execute it
```

Pre-provision a tightly controlled [responder role](00-aws-security-foundations-for-beginners.md#response-access-and-evidence-basics), approved forensic tools, a restricted evidence location, and access to necessary encryption keys. Test these across the accounts and Regions in scope. An unused role that cannot decrypt snapshots is not forensic readiness.

Use monitored emergency access with a documented approval route. Make it usable when the normal identity provider or affected workload is unavailable. Keep credentials controlled and time-bound where possible; an emergency is not a reason to share an untracked administrator account.

### Know What Support Tools Actually Provide

Systems Manager OpsCenter organizes operational work items. Automation runs procedures; Step Functions coordinates steps and branches. AWS Security Incident Response adds managed security response support under its configured permissions and engagement model. It does not remove your responsibility for workload decisions or evidence retention.

**Current availability:** Systems Manager Incident Manager stopped accepting new customers on November 7, 2025. Existing enabled accounts can continue using it. Treat references below as existing-customer scenarios, not a universal recommendation for a new deployment. [AWS notice](https://docs.aws.amazon.com/incident-manager/latest/userguide/incident-manager-availability-change.html).

## B. Triage And Choose Containment

### Validate The Finding And Establish Scope

Start with the account, Region, resource, time, finding type, and observed behavior. Compare approved changes and workload ownership. Severity is a prioritization signal; it does not establish business impact by itself.

Correlate the suspicious role session with CloudTrail, application request identifiers, and network evidence. Expand scope to other sessions, resources, Regions, and actions. A single affected instance can be the entry point for an account-level compromise.

```text
Suspicious finding
     |
     +-- Expected activity? --> Document evidence and tune narrowly
     |
     +-- Credible threat? --> Identify affected identities/resources
                                  |
                                  v
                           Limit ongoing damage
```

### Network Isolation Has Limits

A [quarantine security group](00-aws-security-foundations-for-beginners.md#ec2-quarantine) restricts network access. Replace all relevant group attachments; adding a restrictive group alongside an existing permissive one does not subtract that group's allows. Preserve only the explicitly required investigation path.

Existing tracked connections may survive security-group changes. If the requirement is immediate interruption of an established connection, consider an appropriately scoped stateless network control and its effect on the whole subnet. Verify actual traffic cessation rather than treating a successful configuration API call as proof.

[Connection tracking](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/security-group-connection-tracking.html) explains why the common "attach quarantine group and you are done" shortcut is incomplete.

Network isolation also does not invalidate credentials already copied elsewhere. Containment often needs two parallel actions:

```text
Compromised workload
       |
       +-- Network path --> Limit communications
       |
       +-- Identity path --> Block stolen permissions / renewal
```

Check Auto Scaling, load balancers, and orchestration before acting. Automatic replacement might destroy evidence or launch the same vulnerable image. Coordinate capacity and service continuity while preserving the affected resource according to the runbook.

### Containment And Evidence Are A Tradeoff

There is no universal order that says memory must always be collected before containment, or the reverse. Active destruction may require immediate containment. A controlled investigation may preserve volatile evidence while maintaining a narrowly approved collection path.

State the tradeoff, authorize it, and record the decision. Never interpret an illustrative lifecycle as permission to leave active exfiltration running merely to complete a checklist. [AWS containment guidance](https://docs.aws.amazon.com/security-ir/latest/userguide/contain.html).

## C. Collect Evidence Without Destroying It

### Disk And Memory Answer Different Questions

An [EBS snapshot](00-aws-security-foundations-for-beginners.md#ebs-snapshot-and-ami) preserves volume data, not RAM, live connections, or all instance-store contents. Rebooting or stopping can destroy volatile evidence. A running snapshot can also require application-consistency considerations when several files or volumes form one logical dataset.

| Evidence | Useful for | Limitation |
| --- | --- | --- |
| Memory acquisition | Running processes, in-memory artifacts | Collection changes the live system; tools must be prepared |
| EBS snapshots | Disk investigation | Not a memory image |
| CloudTrail | Supported API actions and identities | Only collected, retained categories are available |
| Application logs | User/request context | May be altered on a compromised host |
| Network/DNS evidence | Communication patterns | Not proof of payload contents |

### Preserve Originals And Analyze Copies

Record who collected the artifact, its source, collection time, method, destination, and access history. Hash exported artifacts to detect later changes. Hashing is tamper evidence, not a substitute for proving the collection method or preserving provenance.

```text
Source --> Acquisition --> Restricted original evidence
                                  |
                                  +--> Verified analysis copy
                                                |
                                                v
                                      Isolated forensic tools
```

Use a separate forensic environment with restricted outbound access. Do not attach an untrusted disk to an ordinary administrator workstation or boot it with production credentials. Analysis tools can themselves encounter malicious content.

For cross-account encrypted snapshots, verify both snapshot-sharing/copy permissions and the customer-managed KMS key path. Some encryption configurations cannot be shared as-is. Test acquisition, copying, and decryption before relying on the design during an incident.

S3 Object Lock can protect artifact versions for a retention period. Also preserve decryption capability and restrict evidence readers. An immutable ciphertext object with a deleted key is not usable evidence.

### Orchestrators And Notebooks

Automated Forensics Orchestrator is deployable AWS guidance that coordinates acquisition and analysis; it is not enabled automatically by GuardDuty. Validate its supported workloads, tool prerequisites, roles, collection endpoints, and failure handling. [AWS guidance](https://docs.aws.amazon.com/solutions/automated-forensics-orchestrator-for-amazon-ec2/).

A SageMaker AI notebook can provide a repeatable analysis environment for approved code and evidence queries. Its execution role and network access are security boundaries. Keep raw evidence immutable, record analysis steps, and avoid treating arbitrary notebook output as a verified forensic conclusion.

## D. Respond To Identity And Data Incidents

### Match Containment To Credential Type

| Credential or access path | Immediate consideration | Follow-up |
| --- | --- | --- |
| Exposed IAM user access key | Deactivate the compromised key | Investigate use and credentials/sessions derived from it |
| Stolen temporary role session | Deny permissions for affected older sessions | Stop the attacker obtaining fresh sessions |
| Compromised workforce identity | Contain at the identity provider and AWS session layers | Verify application/account sessions separately |
| Public S3 access | Remove the exposure through the relevant policy/access controls | Investigate object access and downstream copies |

[Role-session revocation](00-aws-security-foundations-for-beginners.md#session-tags-and-revoking-role-sessions) uses an explicit deny with an issue-time cutoff. It affects legitimate older sessions for that role too. Changing a trust policy prevents future assumptions through that trust path; it does not by itself cancel already-issued credentials.

```text
Old credentials ----> Deny before cutoff

Attacker's renewal path ----> Close the source of new credentials

Legitimate application ----> Obtain fresh credentials safely
```

The existing JSON example later in this guide demonstrates the cutoff. It must be attached to the correct identity and evaluated with the applicable policies. Keep the deny long enough to cover relevant sessions; deleting it prematurely can reopen access before credentials expire.

Identity Center sessions and service-linked roles have special handling; do not assume arbitrary IAM role editing works for both. [IAM revocation behavior](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_revoke-sessions.html).

### Investigate Persistence, Not Just The First Key

Search for new users, access keys, role trusts, policies, unusual resources, and changed logging. An attacker may have created a second route. After blocking the original credential, test that unauthorized access has actually stopped and investigate what data may already have left.

For S3 exposure, blocking public access is containment, not retroactive confidentiality. Preserve relevant object-access records and investigate scope. For a malicious uploaded object, quarantine access while preserving evidence; deleting every upload without review can destroy both business data and investigation context.

## E. Build A Reliable Response Workflow

[Step Functions and Automation](00-aws-security-foundations-for-beginners.md#response-automation-and-safe-recovery) separate orchestration from individual actions. Lambda is useful for a small enrichment step; a state machine makes branching, waiting, retries, and failure paths explicit.

```text
Finding -> Validate account/resource -> Read current state
                                           |
                        +------------------+----------------+
                        |                                   |
                  Approval needed?                    Preapproved action
                        |                                   |
                        +--------------+--------------------+
                                       v
                              Contain -> Verify effect
                                       |
                          Failure? ----+---- Success?
                             |                  |
                        Escalate           Record outcome
```

Use least-privilege execution roles, permitted account/resource scope, idempotency, and an explicit timeout for human approval. Do not let an untrusted resource tag alone authorize destructive action: the attacker might be able to alter that tag.

A retry should not overwrite the original security-group configuration needed for rollback. Capture pre-action state once, associate it with the incident, and distinguish a duplicate event from an updated finding needing new work.

An API returning success is not sufficient verification. Recheck containment, responder connectivity, evidence delivery, and remaining attack paths. If evidence collection fails, the state machine should surface that failure rather than marking the incident complete.

### Session Manager Is Not Universal Session Recording

Standard Session Manager access can avoid inbound SSH when managed-node prerequisites are satisfied. Its own networking, IAM, and log-destination permissions still need to work after containment.

Session content logging is not available for Session Manager SSH or port-forwarding sessions. CloudTrail control events are not a transcript of commands sent inside an encrypted tunnel. [Session logging limitations](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-logging.html).

## F. Recover And Test Readiness

### Recovery Has A Security Exit Condition

Restore from a known-good source after correcting the entry point, rotating affected secrets, and removing unauthorized access. Test the restored application's behavior and monitoring before reconnecting it to production. Restoring a recent backup can restore the attacker's persistence too.

```text
Contain --> Understand entry point --> Remove persistence
                                         |
                                         v
                              Rebuild / restore cleanly
                                         |
                                         v
                              Validate security + function
                                         |
                                         v
                               Controlled return to service
```

An RPO states acceptable data loss; an RTO states acceptable recovery time. They influence backup frequency, restore architecture, and testing. Neither establishes that the backup is clean. See [recovery basics](00-aws-security-foundations-for-beginners.md#response-automation-and-safe-recovery).

### Test People, Permissions, And Technical Controls

A tabletop exercise tests decisions and communication. A controlled technical exercise tests whether roles, acquisition tools, containment, and restoration actually work. FIS runs supported fault experiments; it is not a substitute for every security attack simulation. Resilience Hub assesses resilience against objectives.

ARC can shift traffic or coordinate supported recovery patterns. It does not remove stolen credentials or malware. During an availability incident, verify that the destination has capacity, dependencies, and acceptable replicated state before shifting traffic.

Record detection, acknowledgment, containment, and recovery times. Review failed permissions and unclear ownership, then retest the corrected runbook. Root-cause analysis should explain both the entry point and why preventive/detective controls did not stop or identify it earlier.

## G. Scenario Workshop

### Workshop 1: The Connection Is Still Active

**Situation:** Responders replace an instance's security groups with a restrictive group. The instance is still transmitting through an established connection. The subnet also contains healthy payment workers.

**Decision:** Which response addresses both the technical behavior and the blast radius?

A. Add another restrictive security group and assume its denies override other rules.

B. Recognize connection tracking, select a scoped control that interrupts the flow, assess subnet impact, and verify traffic cessation.

C. Delete the CloudTrail trail to reduce attacker visibility.

**Answer: B.**

- A assumes security groups have deny rules and ignores tracked connections.
- B addresses the observed behavior without overlooking shared-subnet impact.
- C removes evidence and does not stop the network path.

### Workshop 2: Revoked Sessions Return

**Situation:** A role's older sessions are denied using an issue-time cutoff. Minutes later, the attacker uses a new session because the compromised workload still obtains credentials.

**Decision:** What was incomplete?

A. The timestamp condition needed to be replaced by an IAM user password change.

B. Session revocation should have been accompanied by containment of the credential source and future assumption path.

C. CloudTrail Insights should have been disabled before revocation.

**Answer: B.**

- The cutoff addresses older sessions; it is not a permanent barrier to legitimate or malicious renewal.
- A addresses a different credential type. C changes detection, not authorization.
- Verify both old-session denial and inability to obtain unauthorized new sessions.

### Workshop 3: Snapshot Taken, Memory Lost

**Situation:** An investigator takes EBS snapshots and then reboots an instance. The investigation later needs in-memory malware evidence that was not collected elsewhere.

**Decision:** Can the snapshots restore that evidence?

A. Yes, an EBS snapshot includes all instance RAM.

B. No. Preserve available disk evidence, document the memory loss, and update the runbook to assess volatile acquisition before disruptive actions.

C. Yes, provided the snapshot is copied to another account.

**Answer: B.**

- A confuses disk and memory. C changes storage location, not what was acquired.
- The appropriate order depends on active threat and acquisition risk; the lesson is deliberate evidence planning, not always delaying containment.

### Workshop 4: A Successful Invocation, Failed Containment

**Situation:** EventBridge invokes a response Lambda. Lambda logs show `AccessDenied` when changing a network interface. The ticket was marked contained as soon as the invocation was accepted.

**Decision:** What must change?

A. Mark containment complete only after action and effect verification; fix the scoped permission and failure path.

B. Give the event source administrator access and leave the workflow unchanged.

C. Treat delivery success as containment because Lambda was reached.

**Answer: A.**

- The execution role, action scope, and verification are the relevant boundaries.
- B grants excessive access to the wrong layer. C repeats the original mistake.

### Workshop 5: Recovery Ordering

**Situation:** A compromised service has been contained. A recent backup is available, but its infection status is unknown.

**Decision:** Put the following activities in a defensible recovery sequence.

1. Determine a clean restore point and correct the entry point.
2. Restore in an isolated environment and rotate affected secrets.
3. Validate application behavior, access controls, and monitoring.
4. Reintroduce traffic gradually and monitor for recurrence.

**Answer: 1 -> 2 -> 3 -> 4.** Availability alone is not the exit condition. Returning a vulnerable or infected restore directly to production can repeat the incident.

### Workshop 6: Choosing The Right Test

**Situation:** A team wants to validate who approves production isolation and separately prove that encrypted evidence can be analyzed in its forensic account.

**Decision:** Match each requirement to a test.

| Requirement | Test and observable result |
| --- | --- |
| Approval and escalation | Tabletop exercise; named decision maker responds within the agreed window |
| Evidence access | Controlled acquisition/copy/decrypt exercise using the actual responder roles |
| Recovery objective | Timed restore test with integrity and application checks |

**Reasoning:** A meeting alone does not exercise KMS permissions. A successful restore alone does not test incident communications. Test each requirement at its own boundary.

## Official Objective Coverage

| Skill | Teaching and application |
| --- | --- |
| 2.1.1 | A and E: plans, runbooks, analysis environments and workflows |
| 2.1.2 | A, B and C: access, tools, isolation and evidence readiness |
| 2.1.3 | F and Workshop 6: exercises with measurable outcomes |
| 2.1.4 | E and F: automation, verification and recovery coordination |
| 2.2.1 | C and Workshop 3: acquisition, provenance and storage |
| 2.2.2 | B and D: identity, API and application correlation |
| 2.2.3 | B: validation, business impact and scope |
| 2.2.4 | B, D, F and Workshops 1-5: containment through recovery |
| 2.2.5 | F: entry point, persistence and control failure analysis |

[Official Domain 2 objectives](https://docs.aws.amazon.com/aws-certification/latest/security-specialty-03/security-specialty-03-domain2.html). The reference and earlier practice below remain useful, but apply the containment, credential, logging, and availability qualifications taught above.

## 0. AWS Component Primer: What Each Service Does First

This section explains the AWS components in simple words before going into exam decision rules.

Official references used for service meaning:

- SCS-C03 Incident Response domain: https://docs.aws.amazon.com/aws-certification/latest/security-specialty-03/security-specialty-03-domain2.html
- AWS Security Incident Response: https://docs.aws.amazon.com/security-ir/latest/userguide/
- AWS Security Incident Response integrations: https://docs.aws.amazon.com/security-ir/latest/userguide/integrate-existing-tools.html
- GuardDuty findings with EventBridge: https://docs.aws.amazon.com/guardduty/latest/ug/guardduty_findings_eventbridge.html
- Systems Manager Automation runbooks: https://docs.aws.amazon.com/systems-manager/latest/userguide/automation-documents.html
- Incident Manager runbooks: https://docs.aws.amazon.com/incident-manager/latest/userguide/runbooks.html
- Systems Manager Session Manager: https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html
- IAM role session revocation: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_revoke-sessions.html
- EBS snapshots: https://docs.aws.amazon.com/ebs/latest/userguide/ebs-creating-snapshot.html
- S3 Object Lock: https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html
- AWS Fault Injection Service: https://docs.aws.amazon.com/fis/latest/userguide/what-is.html

I am using text diagrams instead of screenshots because AWS console screens change often. Text diagrams are searchable, easy to revise, and work offline.

---

### 0.1 Incident Response In AWS: What It Means

Incident response means handling a security event in a controlled way.

Plain English:

> Incident response is the process of noticing something suspicious, understanding what happened, stopping the damage, preserving evidence, fixing the root cause, and safely returning to normal.

Real-world example:

GuardDuty reports that an EC2 instance is communicating with a known command-and-control domain. Your job is not simply to delete the instance. Your job is to:

- reduce immediate risk
- preserve evidence
- identify the entry point
- recover cleanly
- prevent the same issue from happening again

Simple flow:

```text
Alert
  |
  v
Triage
  |
  v
Contain
  |
  v
Preserve evidence
  |
  v
Investigate root cause
  |
  v
Eradicate and recover
  |
  v
Improve runbook
```

Exam angle:

The exam usually tests order and judgement:

- Do not destroy evidence too early.
- Do not keep compromised credentials active.
- Do not use manual ad hoc fixes when the requirement asks for repeatable automation.
- Do not open inbound SSH just because there is an emergency.

---

### 0.2 AWS Security Incident Response: Managed Help For AWS Security Events

AWS Security Incident Response is a managed AWS service for monitoring, triage, case management, and response support.

Plain English:

> It is AWS help for security incidents. It can triage findings, create cases, integrate with tools, and help responders coordinate.

Real-world example:

A company has many AWS accounts and wants a central security team to manage incident cases. They want GuardDuty and Security Hub findings to become cases and to route activity into existing tools such as Slack, Jira, ServiceNow, or a SIEM.

Simple flow:

```text
GuardDuty / Security Hub / other finding
        |
        v
AWS Security Incident Response
        |
        +--> case
        +--> triage
        +--> responders
        +--> EventBridge integration
```

Exam angle:

Choose AWS Security Incident Response when the question is about:

- managed incident triage
- case management
- response coordination
- integrating AWS incident cases with downstream workflows

Do not confuse it with GuardDuty. GuardDuty detects suspicious activity. AWS Security Incident Response helps manage and respond to incidents.

---

### 0.3 GuardDuty: The Alert Source For Many Incident Questions

GuardDuty is managed threat detection.

Plain English:

> GuardDuty watches supported AWS telemetry and creates findings when it sees suspicious behavior.

Real-world example:

GuardDuty reports:

- EC2 instance communicating with a known malicious IP
- IAM access key used from an unusual location
- EC2 instance performing cryptocurrency mining behavior
- S3 bucket activity that looks suspicious

Incident response flow:

```text
CloudTrail / VPC Flow Logs / DNS logs / service telemetry
        |
        v
GuardDuty analyzes behavior
        |
        v
GuardDuty finding
        |
        v
EventBridge rule
        |
        +--> SNS notification
        +--> Lambda enrichment
        +--> Step Functions workflow
        +--> SSM Automation runbook
```

Example EventBridge pattern:

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

If the question starts with "GuardDuty generated a high-severity finding," the next step is often:

- validate the finding
- notify responders
- trigger EventBridge
- start an automated workflow
- contain the affected resource

Important trap:

GuardDuty is not the same as a firewall. GuardDuty detects. Blocking or remediation usually needs another service, such as security groups, NACLs, WAF, Network Firewall, IAM, Lambda, Step Functions, or Systems Manager Automation.

---

### 0.4 EventBridge: The Routing Layer

EventBridge routes events from AWS services to targets.

Plain English:

> EventBridge is the "when this happens, start that" service.

Real-world example:

When GuardDuty creates a high-severity finding, EventBridge starts a Step Functions workflow that:

1. Tags the EC2 instance as `Quarantine`.
2. Changes the security group.
3. Creates EBS snapshots.
4. Notifies the security team.
5. Opens an OpsItem or incident.

Simple flow:

```text
Finding or API event
        |
        v
EventBridge rule
        |
        +--> SNS
        +--> Lambda
        +--> Step Functions
        +--> SSM Automation
```

Exam angle:

Choose EventBridge when the question says:

- event-driven response
- react to GuardDuty findings
- react to CloudTrail API calls
- start Lambda, Step Functions, SNS, or SSM Automation from a security event

Trap:

EventBridge routes. It does not by itself decide the full incident workflow. Use Step Functions or Systems Manager Automation for multi-step workflows.

---

### 0.5 Step Functions: Multi-Step Response Workflow

Step Functions orchestrates workflows.

Plain English:

> Step Functions is a flowchart that AWS can execute.

Real-world example:

For compromised EC2, you want an approval step before quarantine because the instance runs a production payment workload.

Simple flow:

```text
GuardDuty finding
      |
      v
Step Functions
      |
      +--> enrich with instance/account tags
      +--> ask for approval if production
      +--> change security group
      +--> create snapshot
      +--> create ticket
      +--> notify
```

Exam angle:

Choose Step Functions when the response has:

- multiple steps
- branching
- wait/retry
- approvals
- integrations across services
- need to visualize workflow state

Trap:

For one simple action, Lambda may be enough. For a repeatable operational runbook, Systems Manager Automation may be more direct.

---

### 0.6 Lambda: Small Response Function

Lambda runs code in response to events.

Plain English:

> Lambda is for short bits of response logic, enrichment, and glue code.

Real-world example:

GuardDuty finding arrives. Lambda reads the finding, extracts the instance ID, tags the instance, and sends a message to Slack or SNS.

Simple flow:

```text
EventBridge
   |
   v
Lambda
   |
   +--> call EC2 API
   +--> call IAM API
   +--> write to DynamoDB
   +--> notify SNS
```

Exam angle:

Choose Lambda when:

- response logic is custom
- one or a few API calls are needed
- transformation/enrichment is needed

Trap:

If the question says "run an approved operational runbook" or "repeatable remediation document," think Systems Manager Automation.

---

### 0.7 Systems Manager Automation: Repeatable Runbooks

Systems Manager Automation runs predefined or custom runbooks.

Plain English:

> Automation is a safe checklist that AWS can execute for you.

Real-world example:

A company has an approved containment runbook:

1. Add a `Quarantine=true` tag.
2. Record metadata.
3. Replace the instance security group with a quarantine security group.
4. Create EBS snapshots.
5. Notify the incident channel.

Simple flow:

```text
EventBridge / Incident Manager / manual start
        |
        v
SSM Automation runbook
        |
        +--> Step 1: describe instance
        +--> Step 2: tag instance
        +--> Step 3: change security group
        +--> Step 4: create snapshot
        +--> Step 5: publish result
```

Example runbook shape:

```yaml
description: Quarantine an EC2 instance and preserve evidence
parameters:
  InstanceId:
    type: String
mainSteps:
  - name: TagInstance
    action: aws:executeAwsApi
  - name: CreateSnapshots
    action: aws:executeAwsApi
  - name: Notify
    action: aws:executeAwsApi
```

Exam angle:

Choose Systems Manager Automation when the question says:

- runbook
- repeatable remediation
- operational workflow
- approved steps
- automate EC2 or AWS resource actions

Trap:

Automation runbooks need permissions. In cross-account designs, the automation role and target account permissions matter.

---

### 0.8 Systems Manager Session Manager: Emergency Access Without Inbound SSH

Session Manager provides interactive access to managed nodes.

Plain English:

> Session Manager lets you connect to an EC2 instance without opening SSH or RDP inbound ports.

Real-world example:

During an incident, an engineer needs to inspect a private EC2 instance. The company does not allow bastion hosts or inbound SSH. The instance has SSM Agent, an instance profile, and network path to Systems Manager endpoints.

Simple flow:

```text
Engineer IAM identity
      |
      v
Session Manager
      |
      v
SSM Agent on instance
      |
      v
Shell access
```

Exam angle:

Choose Session Manager when the question says:

- no inbound SSH/RDP
- audited administrative access
- private instance access
- centralized session logging
- eliminate bastion host

Trap:

Session Manager needs the instance to be a managed node. That usually means:

- SSM Agent installed and running
- instance profile permissions
- network access to Systems Manager endpoints or internet/NAT

---

### 0.9 Systems Manager OpsCenter And Incident Manager

OpsCenter helps track operational issues. Incident Manager helps manage incident response plans, incidents, contacts, escalations, and runbooks.

Plain English:

> OpsCenter is for operational work items. Incident Manager is for incident coordination and response plans.

Real-world example:

A CloudWatch alarm indicates suspicious traffic from a critical workload. Incident Manager creates an incident, starts a response plan, notifies the on-call team, and can start a Systems Manager Automation runbook.

Simple flow:

```text
CloudWatch alarm / EventBridge event
        |
        v
Incident Manager response plan
        |
        +--> contacts and escalation
        +--> timeline
        +--> runbook
        +--> incident details
```

Exam angle:

Choose Incident Manager when the question says:

- response plan
- contacts/escalation
- incident timeline
- runbook attached to incident
- coordinated response

Trap:

Incident Manager coordinates response. It is not the same thing as GuardDuty detection or CloudTrail audit logging.

---

### 0.10 CloudTrail And CloudTrail Lake: Evidence For API Activity

CloudTrail Lake examples assume an existing eligible customer; it closed to new customers on May 31, 2026. Query retained S3 evidence with Athena where appropriate. SQL examples below use illustrative table names, not deployable universal schemas. [Availability](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-lake-service-availability-change.html).

CloudTrail records AWS API activity. CloudTrail Lake lets you query CloudTrail events with SQL.

Plain English:

> CloudTrail tells you who did what in AWS. CloudTrail Lake helps query that activity.

Real-world example:

An access key was leaked. You need to know what API calls the key made, from which IP addresses, and which resources were touched.

Simple flow:

```text
Compromised IAM key
        |
        v
API calls
        |
        v
CloudTrail records events
        |
        v
CloudTrail Lake / S3 + Athena / SIEM
```

Example fields:

```json
{
  "eventTime": "2026-10-06T08:15:00Z",
  "eventSource": "iam.amazonaws.com",
  "eventName": "CreateUser",
  "sourceIPAddress": "203.0.113.10",
  "userIdentity": {
    "accessKeyId": "AKIA..."
  }
}
```

Exam angle:

Choose CloudTrail when:

- who changed this?
- what API calls were made?
- what did the access key do?
- which role session made the request?

Choose CloudTrail Lake when:

- managed SQL query over CloudTrail events is needed
- the question does not require broad OCSF-normalized security lake design

Trap:

S3 object-level actions need CloudTrail data events. A management-event trail alone might not show object reads and writes.

---

### 0.11 VPC Flow Logs And DNS Logs: Network Evidence

VPC Flow Logs record network metadata. Route 53 Resolver query logs record DNS queries made through the VPC resolver.

Plain English:

> Flow Logs show which network conversations happened. DNS logs show which names were looked up.

Real-world example:

An EC2 instance is suspected of malware activity. You want to know whether it contacted a malicious IP or queried suspicious domains.

Simple flow:

```text
EC2 instance
   |
   +--> network connection metadata -> VPC Flow Logs
   |
   +--> DNS query through resolver -> Route 53 Resolver query logs
```

Exam angle:

Choose VPC Flow Logs when the question asks:

- source/destination IP
- port
- accepted/rejected traffic
- ENI-level network metadata

Choose Resolver query logs when the question asks:

- which domain names were queried
- DNS-based investigation

Trap:

VPC Flow Logs do not contain packet payloads. If the question asks for packet content, think traffic mirroring or external packet inspection.

---

### 0.12 Amazon Detective: Root Cause And Entity Relationships

Detective helps investigate relationships around findings.

Plain English:

> Detective helps connect the dots after a finding.

Real-world example:

Security Hub shows a GuardDuty finding involving an IAM role, an EC2 instance, and an IP address. The analyst needs to understand related API calls, network behavior, and affected entities.

Simple flow:

```text
GuardDuty / Security Hub finding
        |
        v
Detective behavior graph
        |
        +--> IAM principal
        +--> IP address
        +--> EC2 instance
        +--> API activity
        +--> related findings
```

Exam angle:

Choose Detective when the question says:

- investigate root cause
- visualize related entities
- analyze behavior graph
- understand scope and relationships

Trap:

Detective is not primarily an alerting or remediation service. It is for investigation.

---

### 0.13 IAM, STS, And Access Keys: Credential Incident Core

IAM identities and STS sessions are central to credential compromise questions.

Plain English:

> If credentials are compromised, stop the credentials first, then investigate what they did.

Real-world examples:

- Long-term IAM user access key leaked in GitHub.
- Temporary role credentials stolen from an EC2 instance.
- A user session was created before the incident was discovered.

Response patterns:

```text
Long-term access key compromised
        |
        +--> deactivate key
        +--> create replacement if needed
        +--> rotate application secret
        +--> inspect CloudTrail
        +--> remove unauthorized resources

Role session compromised
        |
        +--> revoke sessions issued before a timestamp
        +--> reduce permissions if needed
        +--> inspect CloudTrail
        +--> fix source of credential theft
```

Example session-revocation idea:

```json
{
  "Effect": "Deny",
  "Action": "*",
  "Resource": "*",
  "Condition": {
    "DateLessThan": {
      "aws:TokenIssueTime": "2026-10-06T10:00:00Z"
    }
  }
}
```

Exam angle:

For leaked long-term access keys:

- deactivate or delete the compromised key
- rotate applications to a new key or, better, a role-based design
- investigate CloudTrail

For compromised temporary credentials:

- use session revocation or a deny with `aws:TokenIssueTime`
- remember that existing sessions can remain valid until expiration unless blocked

Trap:

Deleting an IAM user immediately may break investigation and production access. A better answer often deactivates the compromised key first, preserves evidence, and rotates cleanly.

---

### 0.14 EBS Snapshots And AMIs: Preserve Instance Evidence

EBS snapshots are point-in-time backups of EBS volumes. AMIs can capture instance configuration and attached volumes.

Plain English:

> Snapshot first when you need disk evidence.

Real-world example:

An EC2 instance is suspected of compromise. You need to preserve disk contents before making major changes.

Simple flow:

```text
Compromised EC2 instance
        |
        +--> isolate network
        +--> snapshot EBS volumes
        +--> copy snapshots to forensic account if required
        +--> analyze copy, not production original
```

Exam angle:

Choose EBS snapshots when:

- preserve disk evidence
- forensic copy
- point-in-time volume state
- analyze without modifying original

Trap:

Terminating an instance too early can destroy evidence. Rebooting may also change volatile state or logs.

Important nuance:

Snapshots preserve disk state, not memory. If the question emphasizes memory capture, disk snapshots alone are not enough.

---

### 0.15 S3 Object Lock: Immutable Evidence Storage

S3 Object Lock can prevent object versions from being deleted or overwritten for a retention period or legal hold.

Plain English:

> Object Lock helps make evidence tamper-resistant.

Real-world example:

Security logs and forensic artifacts must be stored so that even administrators cannot casually delete them during the retention period.

Simple flow:

```text
Forensic artifact / log export
        |
        v
S3 bucket with Versioning + Object Lock
        |
        +--> retention period
        +--> legal hold
        +--> WORM-style protection
```

Exam angle:

Choose S3 Object Lock when:

- immutable evidence
- WORM storage
- prevent deletion or overwrite
- legal hold
- compliance retention

Trap:

Object Lock works with versioned objects. Also know the difference:

| Mode | Meaning |
|---|---|
| Governance | privileged users can bypass with specific permission |
| Compliance | cannot be shortened or removed during retention, even by root |

---

### 0.16 AWS Backup: Recovery After Containment

AWS Backup centralizes backup policies and recovery across supported AWS services.

Plain English:

> Backup helps restore clean resources after an incident.

Real-world example:

Ransomware encrypts application data. After containment, the team restores from a known-good recovery point.

Simple flow:

```text
Incident
  |
  v
Contain affected workload
  |
  v
Identify clean recovery point
  |
  v
Restore with AWS Backup
  |
  v
Validate and resume service
```

Exam angle:

Choose backup/restore patterns when:

- recover from corrupted or encrypted data
- restore clean state
- meet recovery objectives

Trap:

Restoring before containment can reintroduce the compromise. Contain first, then recover cleanly.

---

### 0.17 AWS Fault Injection Service And Resilience Hub: Test Readiness

AWS Fault Injection Service runs controlled experiments. AWS Resilience Hub assesses resilience posture.

Plain English:

> FIS helps you test how systems behave under failure. Resilience Hub helps assess and improve resilience.

Real-world example:

A security team wants to validate that incident runbooks work when a dependency fails or an Availability Zone impairment occurs. They run controlled experiments in pre-production with stop conditions.

Simple flow:

```text
Hypothesis
  |
  v
FIS experiment template
  |
  +--> target resources
  +--> disruptive action
  +--> stop condition
  |
  v
Observed result
  |
  v
Improve response plan
```

Exam angle:

Choose FIS when:

- test incident response or resilience
- controlled failure experiment
- chaos engineering
- validate assumptions

Choose Resilience Hub when:

- assess app resilience
- track resilience posture
- recommend improvements

Trap:

FIS performs real actions on real resources. Production experiments need careful planning, guardrails, and stop conditions.

---

### 0.18 Quick Component Map

| Need | Best-fit service or feature |
|---|---|
| Detect suspicious AWS behavior | GuardDuty |
| Route findings to automation | EventBridge |
| Multi-step response workflow | Step Functions |
| Repeatable remediation runbook | Systems Manager Automation |
| Incident coordination and response plan | Incident Manager |
| Managed incident triage/case help | AWS Security Incident Response |
| Emergency access without SSH | Session Manager |
| Who made AWS API calls | CloudTrail |
| SQL over CloudTrail events | CloudTrail Lake |
| Network connection metadata | VPC Flow Logs |
| DNS query investigation | Route 53 Resolver query logs |
| Relationship/root-cause investigation | Detective |
| Preserve EBS disk evidence | EBS snapshots |
| Immutable evidence storage | S3 Object Lock |
| Revoke old role sessions | IAM policy with `aws:TokenIssueTime` |
| Test response plan under failure | AWS FIS |

---

## 1. What This Domain Means In The Exam

Incident Response is 14% of scored SCS-C03 content.

The official SCS-C03 Incident Response domain has two task groups:

| Official task | Meaning in simple words |
|---|---|
| Task 2.1: Design and test an incident response plan | Prepare before the incident. Build runbooks, prepare access, reduce blast radius, test plans. |
| Task 2.2: Respond to security events | Act during and after the incident. Capture logs, validate findings, contain, eradicate, recover, and analyze root cause. |

Local question-bank signal:

| Incident Response cluster | Local question count |
|---|---:|
| Containment and forensics | 82 |
| Security event response | 28 |
| Automation | 29 |
| Total | 139 |

What this tells us:

- Containment and evidence preservation are the highest-return part of this topic.
- Credential compromise is a common scenario.
- EC2 compromise appears frequently.
- Automation appears repeatedly, especially GuardDuty to EventBridge to Step Functions, Lambda, or Systems Manager.
- Testing response plans is smaller but important because it is explicitly in SCS-C03.

---

## 2. The Core Mental Model

Use this sequence for almost every incident question:

```text
Prepare
  |
  v
Detect
  |
  v
Triage and validate
  |
  v
Contain
  |
  v
Preserve evidence
  |
  v
Eradicate
  |
  v
Recover
  |
  v
Review and improve
```

Short version:

```text
Plan -> Alert -> Confirm -> Limit damage -> Keep evidence -> Fix -> Restore -> Learn
```

Exam trick:

The exam often gives you four answers where all are "security actions," but only one has the right order.

Bad order:

```text
Terminate instance -> then investigate
```

Better order:

```text
Isolate instance -> preserve evidence -> investigate copy -> eradicate/recover
```

---

## 3. High-Return Topics From The Question Signals

| Priority | Topic | Why it matters | Exam action |
|---|---|---|---|
| Very high | Compromised EC2 instance | Most common containment/forensics scenario | Isolate, preserve EBS evidence, analyze copy, recover cleanly |
| Very high | Leaked IAM access key | Common credential incident | Deactivate/rotate key, inspect CloudTrail, remove unauthorized changes |
| Very high | Compromised role session | Tricky because temporary credentials can remain valid | Revoke sessions issued before a timestamp with `aws:TokenIssueTime` deny |
| High | GuardDuty finding response | Common alert source | EventBridge to SNS/Lambda/Step Functions/SSM Automation |
| High | Evidence storage | Forensic artifacts must be protected | S3 Object Lock, restricted access, separate forensic account |
| High | Session Manager | Emergency access without opening inbound ports | Use SSM Agent, IAM, logs, private endpoints |
| High | Runbook automation | SCS-C03 explicitly mentions automated remediation | Systems Manager Automation, Step Functions, Lambda |
| Medium-high | Root cause analysis | Often follows detection | Detective, CloudTrail, VPC Flow Logs, DNS logs |
| Medium-high | Incident readiness testing | Explicit SCS-C03 topic | FIS, tabletop exercises, Resilience Hub |
| Medium | DDoS/edge incident response | Often overlaps Infrastructure Security | Shield Advanced, WAF, Route 53, CloudFront |
| Medium | Backup and recovery | Needed after containment | Restore known-good backups, validate before production |

---

## 4. Scenario 1: Compromised EC2 Instance

This is probably the most important Incident Response scenario.

### What The Component Does

EC2 is virtual compute. An EC2 incident usually means the operating system, application, credentials, or network behavior of an instance may be compromised.

### Real-World Example

GuardDuty reports:

```text
EC2 instance i-0123456789abcdef0 is communicating with a known command-and-control server.
```

You need to stop lateral movement, keep evidence, and recover safely.

### Best Response Pattern

```text
1. Confirm the instance and account.
2. Isolate network access.
3. Preserve evidence.
4. Analyze evidence in a separate environment.
5. Eradicate the root cause.
6. Recover from a clean source.
7. Update controls and runbooks.
```

### Simple Diagram

```text
Compromised EC2
      |
      +--> Change to quarantine security group
      |
      +--> Snapshot EBS volumes
      |
      +--> Copy snapshot to forensic account
      |
      +--> Analyze copy in isolated subnet
      |
      +--> Rebuild from clean AMI / restore backup
```

### Quarantine Security Group Example

```text
Inbound:
  No inbound access

Outbound:
  Only to forensic/logging endpoints if required
  Or no outbound access for strict isolation
```

### What Not To Do

| Bad action | Why it is risky |
|---|---|
| Terminate immediately | Destroys evidence |
| Reboot first | Can change volatile state and logs |
| Open SSH to investigate | Increases attack surface |
| Analyze original disk directly | Can alter evidence |
| Ignore Auto Scaling | A replacement instance might launch with same weakness |

### Exam Answer Pattern

If the question says:

```text
Compromised EC2, preserve evidence, prevent spread
```

Think:

```text
Quarantine security group + EBS snapshots + analyze copies
```

---

## 5. Scenario 2: Leaked IAM Access Key

### What The Component Does

An IAM access key is a long-term credential for an IAM user.

Long-term credentials are risky because they remain usable until rotated, deactivated, or deleted.

### Real-World Example

A developer accidentally commits an access key to a public repository.

### Best Response Pattern

```text
1. Deactivate the exposed access key.
2. Create or activate a replacement only if the workload still needs it.
3. Prefer moving the workload to IAM roles.
4. Use CloudTrail to see what the key did.
5. Remove unauthorized resources or changes.
6. Rotate any related secrets.
7. Add prevention controls.
```

### Simple Flow

```text
Access key exposed
      |
      v
Deactivate key
      |
      v
CloudTrail investigation
      |
      +--> API calls
      +--> source IPs
      +--> affected resources
      |
      v
Remediate changes
      |
      v
Replace with IAM role if possible
```

### CloudTrail Query Idea

```sql
SELECT eventTime, eventSource, eventName, sourceIPAddress, awsRegion
FROM cloudtrail_lake
WHERE userIdentity.accessKeyId = 'AKIA...'
ORDER BY eventTime ASC;
```

### Exam Answer Pattern

If the question says:

```text
IAM access key leaked publicly
```

Think:

```text
Deactivate/rotate the key immediately, then investigate CloudTrail.
```

Trap:

Do not choose "delete all IAM users" or "disable CloudTrail." The response should be targeted and evidence-driven.

---

## 6. Scenario 3: Compromised Temporary Role Credentials

### What The Component Does

STS issues temporary credentials for roles and federation.

Temporary credentials expire automatically, but during their lifetime they can still be used unless you block them.

### Real-World Example

An attacker steals temporary credentials from an EC2 instance metadata service or from a compromised application.

### Best Response Pattern

```text
1. Identify the affected role.
2. Add a deny condition that blocks sessions issued before a safe timestamp.
3. Force applications to obtain fresh credentials.
4. Investigate CloudTrail for the affected role session.
5. Fix the credential theft path.
```

### Policy Pattern

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Action": "*",
      "Resource": "*",
      "Condition": {
        "DateLessThan": {
          "aws:TokenIssueTime": "2026-10-06T10:00:00Z"
        }
      }
    }
  ]
}
```

### Simple Flow

```text
Role session stolen
      |
      v
Attach revoke-session deny
      |
      v
Old sessions fail
      |
      v
Legitimate workloads refresh credentials
      |
      v
CloudTrail investigation
```

### Exam Answer Pattern

If the question says:

```text
Temporary role credentials may be compromised, least disruption
```

Think:

```text
Revoke old sessions with aws:TokenIssueTime instead of deleting the role.
```

Trap:

Rotating an IAM user's access key does not revoke already-issued role sessions. Different credential type, different response.

---

## 7. Scenario 4: GuardDuty Finding To Automated Response

### What The Components Do

- GuardDuty detects suspicious behavior.
- EventBridge receives the finding event.
- Step Functions, Lambda, or Systems Manager performs the response.
- SNS notifies humans.

### Real-World Example

GuardDuty reports cryptocurrency mining on an EC2 instance. The company wants automatic containment but only after checking tags because some accounts are production.

### Good Architecture

```text
GuardDuty finding
      |
      v
EventBridge rule
      |
      v
Step Functions
      |
      +--> Check severity
      +--> Check account/workload tag
      +--> Notify owner
      +--> Require approval for production
      +--> Start SSM Automation quarantine runbook
      +--> Store result
```

### Exam Answer Pattern

If the question says:

```text
automatic multi-step response to findings
```

Think:

```text
GuardDuty -> EventBridge -> Step Functions or SSM Automation
```

If the question says:

```text
simple notification only
```

Think:

```text
GuardDuty -> EventBridge -> SNS
```

Trap:

GuardDuty itself does not usually perform the whole containment workflow.

---

## 8. Scenario 5: Preserve Forensic Logs And Artifacts

### What The Components Do

Forensics needs durable evidence. Common evidence sources:

- CloudTrail events
- VPC Flow Logs
- DNS query logs
- CloudWatch Logs
- EBS snapshots
- memory captures when available
- application logs
- load balancer logs
- S3 access logs

### Real-World Example

An investigation requires logs and disk snapshots to be stored where an attacker or administrator cannot alter them.

### Good Pattern

```text
Security account / forensic account
      |
      +--> S3 bucket with Object Lock
      +--> restricted bucket policy
      +--> KMS encryption
      +--> CloudTrail logging
      +--> limited break-glass access
```

### Evidence Storage Diagram

```text
CloudTrail / Flow Logs / app logs / snapshots
        |
        v
Central evidence S3 bucket
        |
        +--> Versioning
        +--> Object Lock
        +--> SSE-KMS
        +--> restricted access
```

### Exam Answer Pattern

If the question says:

```text
forensic artifacts cannot be deleted or overwritten
```

Think:

```text
S3 Object Lock with retention or legal hold.
```

Trap:

S3 encryption protects confidentiality. Object Lock protects against deletion/overwrite. They solve different problems.

---

## 9. Scenario 6: Emergency Access To Private EC2

### What The Components Do

Session Manager provides shell access through Systems Manager, avoiding inbound SSH/RDP.

### Real-World Example

A production instance is private. During an incident, responders must run commands. Security policy forbids opening port 22.

### Good Pattern

```text
Private EC2
  |
  +-- SSM Agent installed
  +-- IAM instance profile
  +-- VPC endpoints for Systems Manager
  +-- Session logging to CloudWatch Logs/S3
```

### Exam Answer Pattern

If the question says:

```text
access private instances without bastion or inbound SSH, with audit logs
```

Think:

```text
Systems Manager Session Manager with session logging.
```

Trap:

Do not choose a bastion host if the requirement is to eliminate inbound administrative ports.

---

## 10. Scenario 7: Testing The Response Plan

### What The Components Do

- Tabletop exercises test people and process.
- AWS FIS tests technical resilience under controlled failure.
- Resilience Hub assesses app resilience.
- Incident Manager response plans test contact and escalation workflows.

### Real-World Example

A team wants to validate that a workload fails over and that responders receive the right notifications.

### Good Pattern

```text
Define hypothesis
      |
      v
Create safe experiment or simulation
      |
      v
Set stop condition
      |
      v
Run in pre-production first
      |
      v
Review gaps
      |
      v
Update runbook
```

### Exam Answer Pattern

If the question says:

```text
validate incident response plan effectiveness
```

Think:

```text
tabletop exercises, simulations, AWS FIS, Resilience Hub, runbook tests.
```

Trap:

Testing in production without stop conditions is not the safest answer.

---

## 11. Incident Response Decision Trees

### 11.1 Which Service Should I Choose?

```text
Need to detect suspicious activity?
    -> GuardDuty

Need to route a finding to an action?
    -> EventBridge

Need a simple custom action?
    -> Lambda

Need a multi-step workflow?
    -> Step Functions

Need an approved operational runbook?
    -> Systems Manager Automation

Need coordinated incident plan, contacts, and timeline?
    -> Incident Manager

Need managed incident triage/case support?
    -> AWS Security Incident Response

Need to investigate related entities and root cause?
    -> Detective

Need to know API activity?
    -> CloudTrail / CloudTrail Lake

Need to preserve disk evidence?
    -> EBS snapshots

Need immutable evidence storage?
    -> S3 Object Lock

Need private emergency shell access?
    -> Session Manager
```

### 11.2 What Should I Do First?

```text
Is it a credential compromise?
    -> Disable/revoke the credential first, then investigate CloudTrail.

Is it a compromised EC2 instance?
    -> Isolate network first, then snapshot/preserve evidence.

Is it suspicious API activity?
    -> Use CloudTrail to identify actor, action, source IP, and affected resources.

Is it a GuardDuty finding?
    -> Validate scope and trigger EventBridge workflow.

Is evidence at risk of tampering?
    -> Store in restricted S3 bucket with Object Lock.

Is the answer asking for repeatability?
    -> Use runbooks and automation, not manual console clicks.
```

### 11.3 Contain Or Preserve First?

The safe exam answer usually combines both:

```text
1. Contain enough to stop active damage.
2. Preserve evidence before destructive remediation.
3. Eradicate after evidence is safe.
```

For EC2:

```text
Change security group -> snapshot volumes -> analyze copies -> rebuild/restore
```

For credentials:

```text
Deactivate/revoke -> query CloudTrail -> remediate changes -> rotate/rebuild
```

---

## 12. Common Exam Traps

| Trap | Better thinking |
|---|---|
| Terminate compromised EC2 immediately | Isolate and preserve evidence first |
| Reboot compromised instance first | Reboot can alter evidence |
| Open SSH during emergency | Use Session Manager when available |
| GuardDuty will block the attack directly | GuardDuty detects; EventBridge plus automation responds |
| Rotate IAM user key to fix role-session compromise | Role sessions need session revocation or deny by token issue time |
| Store evidence in normal S3 bucket only | Use Object Lock when immutability is required |
| Use Lambda for every workflow | Use Step Functions or SSM Automation for multi-step/runbook workflows |
| Use Detective for alerting | Detective is for investigation/root cause |
| Restore backup before containment | Contain first, then restore cleanly |
| Skip testing runbooks | SCS-C03 explicitly tests response plan validation |

---

## 13. Memory Tables

### 13.1 Incident Type To First Response

| Incident | First response |
|---|---|
| Exposed IAM user access key | Deactivate key and investigate CloudTrail |
| Stolen role session | Revoke sessions issued before timestamp |
| Compromised EC2 | Quarantine security group and preserve EBS evidence |
| Malicious outbound traffic | Isolate network path and investigate Flow Logs/DNS logs |
| Suspicious API calls | CloudTrail/CloudTrail Lake |
| Sensitive logs at risk | S3 Object Lock and restricted access |
| Need human notification | SNS or Incident Manager contacts |
| Need full workflow | Step Functions |
| Need approved remediation steps | SSM Automation runbook |

### 13.2 Automation Service Comparison

| Service | Best for | Not best for |
|---|---|---|
| EventBridge | Routing events | Full incident workflow by itself |
| Lambda | Small custom action | Long, stateful response process |
| Step Functions | Multi-step workflow | Simple one-step notification |
| SSM Automation | Repeatable operational runbook | Entity relationship investigation |
| Incident Manager | Response plans and escalation | Detecting suspicious activity |

### 13.3 Evidence Source Comparison

| Evidence need | Source |
|---|---|
| AWS API calls | CloudTrail |
| SQL over API events | CloudTrail Lake |
| Network metadata | VPC Flow Logs |
| DNS lookups | Route 53 Resolver query logs |
| Application logs | CloudWatch Logs or app log pipeline |
| Disk state | EBS snapshots |
| Relationship context | Detective |
| Immutable artifact storage | S3 Object Lock |

---

## 14. Worked Examples

### Example 1: EC2 Cryptocurrency Mining Finding

Scenario:

GuardDuty reports cryptocurrency mining behavior on an EC2 instance.

Good response:

```text
1. Confirm finding details.
2. Put the instance in a quarantine security group.
3. Snapshot attached EBS volumes.
4. Preserve CloudTrail, Flow Logs, DNS logs, and application logs.
5. Analyze copied snapshots in an isolated forensic account.
6. Rebuild from a clean AMI or restore a clean backup.
7. Patch the vulnerable entry point.
```

Why:

This limits damage while preserving evidence.

Bad response:

```text
Terminate the instance immediately.
```

Why bad:

It may destroy evidence needed for root cause analysis.

---

### Example 2: Access Key Found In Public Git Repo

Scenario:

A long-term IAM access key appears in a public Git repository.

Good response:

```text
1. Deactivate the key.
2. Rotate application credentials.
3. Query CloudTrail by access key ID.
4. Identify unauthorized resources or policy changes.
5. Remove unauthorized changes.
6. Replace long-term key usage with role-based access if possible.
```

Why:

It immediately stops further use and then investigates blast radius.

Bad response:

```text
Wait until the end of the day to rotate the key during a maintenance window.
```

Why bad:

The key is already exposed.

---

### Example 3: Need To Automate Quarantine

Scenario:

The security team wants a repeatable way to quarantine EC2 instances when GuardDuty produces a high-severity finding.

Good architecture:

```text
GuardDuty -> EventBridge -> SSM Automation runbook
```

For complex flow:

```text
GuardDuty -> EventBridge -> Step Functions -> SSM Automation + SNS
```

Why:

EventBridge captures the event. Step Functions handles multi-step orchestration. Systems Manager Automation runs approved AWS resource actions.

---

### Example 4: Need To Investigate Related Entities

Scenario:

Security Hub shows findings involving a role, an IP address, and two EC2 instances.

Good response:

```text
Use Detective to investigate relationships and behavior.
```

Why:

Detective is designed for relationship and root-cause investigation.

Bad response:

```text
Use S3 Object Lock.
```

Why bad:

Object Lock stores evidence immutably. It does not investigate relationships.

---

## 15. Original Mini Practice Set

These questions are original and are designed around the repeated topic signals.

### Q1. Compromised EC2 Ordering

GuardDuty reports that an EC2 instance is communicating with a known command-and-control endpoint. The company must preserve evidence. Which order is best?

A. Terminate the instance, delete the volume, then check CloudTrail  
B. Isolate the instance, snapshot the volumes, analyze copies, then rebuild or restore cleanly  
C. Reboot the instance, open SSH, then delete suspicious files  
D. Disable GuardDuty, patch the instance, then re-enable GuardDuty

**Answer:** B

**Explanation:** Isolate to reduce damage, preserve evidence with snapshots, investigate copies, then recover safely.

---

### Q2. Leaked Long-Term Access Key

An IAM user's access key was accidentally published. What should the security engineer do first?

A. Disable CloudTrail to reduce log volume  
B. Deactivate the access key and investigate CloudTrail activity for that key  
C. Delete the entire AWS account  
D. Wait for the next scheduled rotation

**Answer:** B

**Explanation:** Stop further use first, then inspect what the key did.

---

### Q3. Temporary Role Credentials

An EC2 instance role session may have been stolen. Existing temporary credentials are still valid. Which control can invalidate older role sessions with the least disruption?

A. Delete every IAM policy in the account  
B. Add a deny condition based on `aws:TokenIssueTime` for sessions issued before a safe timestamp  
C. Rotate an IAM user's access key  
D. Turn off CloudTrail

**Answer:** B

**Explanation:** A deny using `aws:TokenIssueTime` can block older temporary credentials while allowing new sessions after refresh.

---

### Q4. Automated Response

GuardDuty creates a high-severity finding. The security team wants to trigger a multi-step workflow that enriches the finding, requests approval for production workloads, and starts remediation. Which design fits best?

A. GuardDuty directly changes the security group  
B. GuardDuty -> EventBridge -> Step Functions -> SSM Automation  
C. S3 Object Lock -> Lambda -> CloudTrail  
D. Detective -> WAF -> IAM user

**Answer:** B

**Explanation:** EventBridge routes the finding, Step Functions coordinates the workflow, and SSM Automation can run approved remediation steps.

---

### Q5. Immutable Evidence

Forensic artifacts must not be deleted or overwritten during a legal investigation. Which S3 feature is most relevant?

A. S3 Transfer Acceleration  
B. S3 Object Lock  
C. S3 Select  
D. S3 event notifications

**Answer:** B

**Explanation:** Object Lock provides retention and legal hold protection for object versions.

---

### Q6. Private Emergency Access

Responders need shell access to private EC2 instances without opening inbound SSH or using a bastion host. The sessions must be auditable. What should they use?

A. Systems Manager Session Manager  
B. Public IP address with SSH  
C. Disable security groups temporarily  
D. S3 static website hosting

**Answer:** A

**Explanation:** Session Manager supports audited access without inbound SSH/RDP when prerequisites are met.

---

### Q7. Root Cause Investigation

An analyst needs to investigate relationships among IAM roles, IP addresses, EC2 instances, and GuardDuty findings. Which service best fits?

A. Amazon Detective  
B. AWS Artifact  
C. AWS Backup  
D. S3 Object Lock

**Answer:** A

**Explanation:** Detective helps investigate related entities and root cause around findings.

---

### Q8. Response Plan Testing

A company wants to validate whether its response plan works during simulated infrastructure failure. It wants controlled experiments with stop conditions. Which service is most relevant?

A. AWS Fault Injection Service  
B. IAM Access Analyzer  
C. Amazon Macie  
D. AWS CloudHSM

**Answer:** A

**Explanation:** AWS FIS runs controlled experiments against AWS resources and supports stop conditions.

---

### Q9. Matching

Match the need to the best service or feature.

| Need | Answer |
|---|---|
| A. Route GuardDuty finding to response workflow | EventBridge |
| B. Preserve disk state | EBS snapshot |
| C. Investigate who made API calls | CloudTrail |
| D. Store evidence immutably | S3 Object Lock |
| E. Run repeatable remediation steps | Systems Manager Automation |

---

### Q10. Ordering

Place these actions in the best order for a suspected EC2 compromise.

```text
1. Apply network quarantine.
2. Snapshot attached EBS volumes.
3. Analyze copies in an isolated environment.
4. Rebuild or restore from clean source.
5. Update controls and runbooks.
```

Why:

The order first limits spread, then preserves evidence, then investigates safely, then recovers and improves.

---

## 16. Final Audit Addendum: Application Recovery Controller

This section was added after rechecking the full question bank and important-topic matrix.

Amazon Application Recovery Controller, or ARC, helps recover applications by shifting traffic away from impaired Availability Zones or Regions.

Plain English:

> ARC is about controlled traffic recovery, not forensic investigation.

### 16.1 ARC Capabilities To Recognize

| Capability | Simple meaning | Exam clue |
|---|---|---|
| Zonal shift | Manually move traffic away from one impaired Availability Zone | "Move traffic away from an AZ now" |
| Zonal autoshift | AWS automatically shifts traffic away from an impaired AZ for supported resources | "Automatic AZ impairment response" |
| Routing control | Highly available on/off switches for multi-Region failover | "Route traffic between Regions safely" |
| Region switch | Coordinate Regional failover/failback plans | "Orchestrated Region recovery" |
| Readiness check | Check whether recovery resources are ready | "Recovery readiness" |

### 16.2 Incident-Response Angle

ARC can appear in incident response when the event is an availability or resilience incident.

Example:

```text
Application problem in one AZ
      |
      v
Start ARC zonal shift
      |
      v
Traffic avoids impaired AZ
      |
      v
Investigate and recover workload
```

For a multi-Region design:

```text
Primary Region impaired
      |
      v
ARC routing control or Region switch
      |
      v
Traffic moves to secondary Region
```

### 16.3 Common Trap

Do not choose ARC for malware investigation, IAM compromise, or evidence preservation.

```text
Compromised EC2 investigation -> Detective, CloudTrail, snapshots, forensics
Availability failover -> ARC
Controlled failure experiment -> FIS
Resilience assessment -> Resilience Hub
```

---

## 17. Last-Day Revision Checklist

Before the exam, make sure you can answer these quickly:

- What is the first action for a leaked IAM access key?
- How do you revoke older role sessions?
- What is the safest pattern for compromised EC2?
- When do you use EventBridge vs Step Functions vs SSM Automation?
- What does Session Manager replace in an emergency access design?
- Which logs help with API activity, network metadata, and DNS queries?
- What protects forensic artifacts from deletion or overwrite?
- What service helps investigate related entities and root cause?
- How do you test an incident response plan?
- Why is termination of a compromised instance often not the first answer?
- When is ARC relevant to incident response?
- What is the difference between FIS, Resilience Hub, and ARC?

Final mental model:

```text
Prepare:
  runbooks, roles, logging, isolation patterns, Object Lock, response plans

Detect:
  GuardDuty, Security Hub, CloudTrail, CloudWatch

Respond:
  EventBridge, Step Functions, Lambda, SSM Automation, Session Manager

Preserve:
  EBS snapshots, logs, S3 Object Lock, forensic account

Recover:
  clean AMI, known-good backup, patched workload

Improve:
  root cause, Detective, CloudTrail review, runbook update, FIS/tabletop test

Availability recovery:
  ARC zonal shift, zonal autoshift, routing control, Region switch
```
