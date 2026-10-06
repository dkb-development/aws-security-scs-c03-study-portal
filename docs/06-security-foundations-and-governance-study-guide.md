# AWS Security Specialty SCS-C03 Security Foundations and Governance Study Guide

Generated: 2026-10-06

This guide is exam-focused. It is based on the question bank and topic signals collected in this workspace, official AWS documentation, and original synthesis. It does not contain copied real exam questions, paid course content, or dumps.

Use it as a reverse-engineered study path: learn the governance patterns that appear repeatedly, then practice the related questions in the portal.

---

## 0. AWS Component Primer: What Each Service Does First

This section explains the AWS components in simple words before going into exam decision rules.

Official references used for service meaning:

- SCS-C03 Domain 6: https://docs.aws.amazon.com/aws-certification/latest/security-specialty-03/security-specialty-03-domain6.html
- AWS Organizations policies: https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies.html
- Service control policies: https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html
- Resource control policies: https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_rcps.html
- Centralized root access: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_root-enable-root-access.html
- AWS Control Tower controls: https://docs.aws.amazon.com/controltower/latest/userguide/how-controls-work.html
- Control Tower control behavior: https://docs.aws.amazon.com/controltower/latest/controlreference/control-behavior.html
- AWS Config conformance packs: https://docs.aws.amazon.com/config/latest/developerguide/conformance-packs.html
- CloudFormation StackSets: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacksets-concepts.html
- CloudFormation Guard: https://docs.aws.amazon.com/cfn-guard/latest/ug/what-is-guard.html
- AWS Firewall Manager policies: https://docs.aws.amazon.com/waf/latest/developerguide/working-with-policies.html
- AWS Resource Access Manager: https://docs.aws.amazon.com/ram/latest/userguide/what-is.html
- AWS Service Catalog: https://docs.aws.amazon.com/servicecatalog/
- AWS Audit Manager: https://docs.aws.amazon.com/audit-manager/latest/userguide/what-is.html
- Audit Manager evidence: https://docs.aws.amazon.com/audit-manager/latest/userguide/concepts.html

I am using text diagrams instead of screenshots because AWS console screens change often. Text diagrams are searchable, easy to revise, and work offline.

---

### 0.1 What This Domain Really Means

Security Foundations and Governance is about controlling security at scale.

Plain English:

> Governance is how you make good security the default across many accounts, teams, Regions, and workloads.

Real-world example:

A company has 200 AWS accounts. Different teams deploy applications, but the security team wants:

- every account created from the same baseline
- CloudTrail and Config enabled everywhere
- GuardDuty and Security Hub centrally managed
- production accounts blocked from disabling encryption
- public S3 buckets detected and remediated
- WAF rules deployed consistently
- auditors to get evidence without weeks of manual screenshots

That is governance.

Simple flow:

```text
Accounts
   |
   +--> Organize with Organizations and OUs
   |
   +--> Baseline with Control Tower
   |
   +--> Restrict with SCPs, RCPs, and declarative policies
   |
   +--> Deploy consistently with StackSets, Service Catalog, Guard
   |
   +--> Enforce security policies with Firewall Manager
   |
   +--> Detect drift with Config and Security Hub
   |
   +--> Collect audit evidence with Audit Manager
   |
   +--> Download AWS compliance reports from Artifact
```

Exam angle:

Governance questions often contain words like:

- organization-wide
- centrally managed
- across accounts
- new accounts automatically
- least operational overhead
- compliance evidence
- auditor
- guardrail
- policy at the OU level
- approved products
- prevent drift
- detect and remediate noncompliance

When you see those words, think about Organizations, Control Tower, Config, Firewall Manager, Service Catalog, StackSets, Audit Manager, and Artifact.

---

### 0.2 AWS Organizations

AWS Organizations is the service for grouping and centrally managing many AWS accounts.

Plain English:

> Organizations is the account tree and policy engine for multi-account AWS.

It gives you:

- management account
- member accounts
- organizational units, or OUs
- policy types such as SCPs, RCPs, tag policies, backup policies, AI service opt-out policies, and declarative policies
- delegated administration for supported services

Real-world example:

You place production accounts in a `Prod` OU, sandbox accounts in a `Sandbox` OU, and suspended accounts in a `Suspended` OU. You attach stricter policies to `Prod` than `Sandbox`.

Text diagram:

```text
Organization root
   |
   +-- Security OU
   |      +-- Audit account
   |      +-- Log archive account
   |
   +-- Infrastructure OU
   |      +-- Shared networking account
   |
   +-- Workloads OU
   |      +-- Prod account
   |      +-- Non-prod account
   |
   +-- Sandbox OU
          +-- Developer playground account
```

Exam angle:

If the question says "centrally govern accounts," "OU," "member account," or "delegated administrator," Organizations is usually involved.

Common trap:

Organizations is not the same as IAM Identity Center.

```text
Organizations = account governance
IAM Identity Center = workforce sign-in and permission sets
```

---

### 0.3 Management Account

The management account is the top account of the AWS Organization.

Plain English:

> The management account should manage the organization, not run production workloads.

Good use:

- create and manage the organization
- manage policy types
- enable trusted access
- register delegated administrator accounts
- handle billing and organization-level administration

Bad use:

- host production applications
- run daily security operations
- store application data
- use as the central logging or audit account

Exam angle:

If the answer says "run workloads in the management account," be suspicious.

Better pattern:

```text
Management account
   |
   +-- Delegates GuardDuty to Security account
   +-- Delegates Security Hub to Security account
   +-- Delegates Config administration if supported
   +-- Keeps daily operations out of the management account
```

Common trap:

Delegated admin does not mean "bypass all controls." It means a member account can administer a supported service for the organization.

---

### 0.4 Delegated Administrator

A delegated administrator is a member account allowed to manage a service across the organization.

Plain English:

> Use delegated admin so the management account is not used for daily service operations.

Real-world example:

The security team has a `Security Tooling` account. The management account registers it as the delegated administrator for GuardDuty, Security Hub, Macie, Firewall Manager, or another supported service.

Flow:

```text
Management account
      |
      v
Registers delegated admin
      |
      v
Security tooling account
      |
      +--> Manages service across member accounts
```

Exam angle:

If the scenario says "least operational overhead" and "central security account," look for native delegated admin or organization integration.

Common trap:

Do not choose custom cross-account Lambda automation when the service has a native Organizations integration that does the same thing.

---

### 0.5 AWS Control Tower

AWS Control Tower helps set up and govern a multi-account landing zone.

Plain English:

> Control Tower gives you a governed AWS account factory and baseline controls.

It builds on:

- AWS Organizations
- AWS IAM Identity Center
- AWS Config
- CloudTrail
- CloudFormation
- Organizations policies

Core pieces:

- landing zone
- Account Factory
- controls, also called guardrails in older language
- log archive account
- audit account
- governed OUs

Real-world example:

Instead of each team manually creating AWS accounts, the platform team uses Control Tower Account Factory. Each new account lands in the correct OU with baseline logging, audit, and security controls.

Flow:

```text
New account request
      |
      v
Control Tower Account Factory
      |
      +--> Creates account
      +--> Enrolls account
      +--> Applies OU controls
      +--> Sends logs to log archive
      +--> Enables governance visibility
```

Exam angle:

Control Tower is usually the answer when the scenario asks for:

- landing zone
- governed multi-account setup
- account vending
- baseline controls for new and existing accounts
- least overhead account governance

Common trap:

Control Tower is not just an SCP service. Its controls can be preventive, detective, or proactive.

---

### 0.6 Control Tower Control Types

Control Tower controls have behavior types.

| Control behavior | How it works | What it means |
|---|---|---|
| Preventive | SCPs, RCPs, declarative policies | Blocks bad actions or enforces organization-level constraints |
| Detective | AWS Config rules | Detects noncompliant resources after evaluation |
| Proactive | CloudFormation Hooks | Checks resources before CloudFormation provisions them |

Simple diagram:

```text
User/API action
   |
   +--> Preventive control blocks the action before it succeeds

Existing resource
   |
   +--> Detective control evaluates and reports noncompliance

CloudFormation template
   |
   +--> Proactive control checks before provisioning
```

Exam angle:

If the question says:

- "must prevent the API call" -> preventive
- "must detect noncompliant resources" -> detective
- "must stop bad CloudFormation resources before creation" -> proactive

Common trap:

Config is normally detective. If you need hard prevention of direct API calls, Config alone is not enough.

---

### 0.7 Service Control Policies, Or SCPs

SCPs are organization policies that set maximum permissions for IAM principals in member accounts.

Plain English:

> SCPs say what identities in accounts are allowed to ever do at most.

SCPs:

- do not grant permissions
- can allow or deny, but permission still needs IAM or resource policy
- apply to member accounts, including delegated admin accounts
- do not affect users or roles in the management account
- are good coarse guardrails
- are not good for fine-grained application authorization

Simple evaluation:

```text
IAM identity policy says: Allow ec2:RunInstances
SCP says: Deny ec2:RunInstances in this OU

Result: Deny
```

Example SCP idea:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Action": "cloudtrail:StopLogging",
      "Resource": "*"
    }
  ]
}
```

Exam angle:

Choose SCP when the question says:

- prevent principals in member accounts from doing something
- block actions even if account admins attach IAM permissions
- restrict root user in member accounts
- enforce coarse permissions by OU

Common traps:

```text
Wrong: SCP grants access.
Right: SCP only sets maximum permissions.

Wrong: SCP affects the management account.
Right: SCP affects member accounts, not management account users or roles.

Wrong: SCP is for resources accessed from outside the org.
Right: That is usually RCP territory.
```

---

### 0.8 Resource Control Policies, Or RCPs

RCPs are organization policies that set maximum permissions for resources in member accounts.

Plain English:

> SCPs protect what your principals can do. RCPs protect what can be done to your resources.

Use RCPs when you need resource-side control.

Example:

Your S3 bucket policy accidentally allows an external account. You want organization-level protection so external principals cannot access organization-owned resources unless they match allowed conditions.

RCP mental model:

```text
External or internal principal
      |
      v
Tries to access resource in member account
      |
      v
Resource policy + IAM + SCP + RCP evaluation
      |
      v
RCP can deny access to the resource
```

Exam angle:

Choose RCP when the question says:

- protect resources in your organization
- restrict external principals accessing your resources
- enforce resource-side data perimeter
- complement SCPs
- resource policy might be accidentally too broad

Common traps:

```text
Outbound action by your identity to external resource?
    -> SCP/IAM, not RCP on your resources

Inbound access to your resource?
    -> RCP can help

RCP attached to org root without testing?
    -> risky, test first

Service-linked role calls?
    -> know that service-linked roles have special exemption behavior
```

Tiny comparison:

| Requirement | Better fit |
|---|---|
| Stop users in member accounts from leaving approved Regions | SCP |
| Stop external principals from accessing your S3 buckets | RCP |
| Let developers launch only approved stacks | Service Catalog |
| Detect unencrypted resources | Config |
| Block bad CloudFormation before creation | CloudFormation Hooks or proactive controls |

---

### 0.9 Declarative Policies

Declarative policies let you centrally declare desired service configurations across an organization.

Plain English:

> Declarative policies say, "this setting must be this way," across supported services.

This is different from SCPs and RCPs.

```text
SCP/RCP:
  authorization guardrails
  controls who can call what

Declarative policy:
  service configuration governance
  controls desired service settings
```

Real-world example:

A company wants EC2 settings to be standardized across accounts, such as enforcing a service-level configuration rather than trying to block every possible API path with SCPs.

Exam angle:

If the question says:

- desired state
- service configuration at scale
- centrally configure service settings
- not just block API calls

Think declarative policies.

Common trap:

Do not treat declarative policies as normal IAM policies. They are not identity policies.

---

### 0.10 Tag Policies

Tag policies standardize tag keys and values across an organization.

Plain English:

> Tag policies help keep tags consistent, such as `CostCenter`, `Environment`, and `Owner`.

Real-world example:

The company wants all teams to use `Environment = Prod | NonProd | Sandbox`, not random values like `production`, `prod`, `prd`, and `live`.

Example:

```json
{
  "tags": {
    "Environment": {
      "tag_key": {
        "@@assign": "Environment"
      },
      "tag_value": {
        "@@assign": ["Prod", "NonProd", "Sandbox"]
      }
    }
  }
}
```

Exam angle:

Choose tag policies for consistent tagging vocabulary.

Common trap:

Tag policies are not a complete preventive security control by themselves. They help standardization and compliance visibility, but do not replace SCPs, Config, or IAM conditions.

---

### 0.11 AI Services Opt-Out Policies

AI services opt-out policies centrally control whether supported AWS AI services may store and use content for service improvement.

Plain English:

> This is an organization-wide data-use preference for supported AI services.

Exam angle:

This is a C03-style governance topic. If the question says "centrally control AWS AI service content use for service improvement," choose Organizations AI services opt-out policies.

Common trap:

Do not confuse this with Bedrock Guardrails.

```text
AI services opt-out policy:
  organization policy for AWS AI service data-use preference

Bedrock Guardrails:
  application/model safety control for generative AI inputs and outputs
```

---

### 0.12 Centralized Root Access

AWS Organizations and IAM can help centrally secure root credentials for member accounts.

Plain English:

> Instead of managing root credentials in every member account, centralize and reduce root credential exposure.

The key idea:

- root credentials are powerful
- member account root credentials should not be used daily
- new organization-created accounts can avoid root credentials by default
- centralized root access can allow limited privileged tasks when needed

Real-world example:

The security team removes root user credentials from member accounts and defines a break-glass process. If a rare root-only task is required, it is performed through a controlled centralized process.

Flow:

```text
Organization
   |
   +--> Enable trusted access for IAM
   |
   +--> Enable root credentials management
   |
   +--> Optionally register delegated administrator
   |
   +--> Remove member account root credentials
   |
   +--> Use documented privileged-task workflow when needed
```

Exam angle:

If the question says:

- manage root credentials for member accounts at scale
- prevent root password recovery
- perform privileged root-only tasks centrally
- break-glass procedure

Think centralized root access and strong management-account security.

Common trap:

Do not choose "share root credentials in a password manager" as the primary governance pattern for a large organization.

---

### 0.13 AWS Config

AWS Config records resource configuration and evaluates resources against rules.

Plain English:

> Config answers: "What configuration did this resource have, and is it compliant?"

It can:

- record supported resource configuration
- keep configuration history
- evaluate Config managed rules or custom rules
- aggregate data across accounts and Regions
- deploy conformance packs
- trigger remediation actions

Real-world example:

You need to know whether any security group allows `0.0.0.0/0` to port 22. A Config rule evaluates security groups and marks them compliant or noncompliant.

Flow:

```text
AWS resource changes
      |
      v
AWS Config recorder
      |
      +--> Configuration history
      +--> Rule evaluation
      +--> Compliance status
      +--> Optional remediation
```

Exam angle:

Choose Config when the scenario says:

- resource configuration history
- compliance status
- config rule
- conformance pack
- aggregator
- detect and remediate drift

Common trap:

Config is not a log search engine. For API activity, use CloudTrail. For resource configuration state and compliance, use Config.

---

### 0.14 Config Aggregator

A Config aggregator collects Config data from multiple accounts and Regions.

Plain English:

> Aggregator gives central visibility into Config compliance across accounts and Regions.

Real-world example:

The central security account needs one place to query all accounts for unencrypted EBS volumes.

Flow:

```text
Account A Config
Account B Config
Account C Config
      |
      v
Config aggregator in central account
      |
      v
Central compliance view and advanced queries
```

Exam angle:

If the question says "central Config visibility across accounts and Regions," choose Config aggregator.

Common trap:

A Config aggregator does not itself prevent resources from being created. It centralizes visibility.

---

### 0.15 Config Conformance Packs

A conformance pack is a collection of Config rules and remediation actions deployed as one unit.

Plain English:

> Conformance packs are bundles of compliance checks.

Real-world example:

You deploy a CIS benchmark conformance pack across all production accounts. It evaluates many controls as a grouped compliance package.

Flow:

```text
Conformance pack YAML
      |
      +--> Config rule 1
      +--> Config rule 2
      +--> Config rule 3
      +--> Remediation action
      |
      v
Deploy to account/Region or organization
```

Exam angle:

Choose conformance packs when the question says:

- deploy a set of compliance rules together
- benchmark-style governance
- organization-level rule bundle
- packaged Config rules and remediation

Common trap:

Conformance packs are not the same as Security Hub standards, though both can show compliance posture.

---

### 0.16 Config Remediation

Config remediation can correct noncompliant resources, often using Systems Manager Automation documents.

Plain English:

> Config finds drift. Remediation fixes drift.

Real-world example:

A Config rule detects a public S3 bucket. A remediation action triggers an SSM Automation runbook to block public access.

Flow:

```text
Resource becomes noncompliant
      |
      v
Config rule evaluation
      |
      v
Noncompliant
      |
      v
Remediation action
      |
      v
SSM Automation document fixes resource
```

Exam angle:

If the question says "Config rule detects X and the team wants automatic correction," look for Config remediation with SSM Automation.

Common trap:

For immediate event-driven response to API calls, EventBridge may be faster. Config remediation is for compliance evaluation and drift correction.

---

### 0.17 AWS Security Hub

Security Hub is a cloud security posture management and findings aggregation service.

Plain English:

> Security Hub collects and scores security findings and standards.

It can:

- aggregate findings from AWS security services
- evaluate security standards and controls
- show compliance status
- integrate with Organizations
- send findings to EventBridge

Real-world example:

Security Hub receives findings from GuardDuty, Inspector, Macie, and AWS Config based controls. The central security team sees findings across accounts.

Flow:

```text
GuardDuty findings
Inspector findings
Macie findings
Security Hub controls
      |
      v
Security Hub
      |
      +--> Central dashboard
      +--> Standards score
      +--> EventBridge automation
```

Exam angle:

Choose Security Hub when the question says:

- central security findings
- security standards
- posture management
- aggregate findings across accounts

Common trap:

Security Hub does not replace Config for full resource configuration history.

---

### 0.18 AWS Firewall Manager

Firewall Manager centrally manages supported security policies across accounts in an AWS Organization.

Plain English:

> Firewall Manager pushes and enforces network and edge security policies at scale.

It can manage policies for:

- AWS WAF
- Shield Advanced
- security groups
- Network Firewall
- Route 53 Resolver DNS Firewall
- network ACLs in supported contexts

Real-world example:

The security team wants the same WAF managed rule groups on all internet-facing ALBs and CloudFront distributions across production accounts. Firewall Manager applies the policy centrally.

Flow:

```text
Firewall Manager admin account
      |
      v
Firewall Manager policy
      |
      +--> WAF policy
      +--> Shield Advanced policy
      +--> Security group policy
      +--> Network Firewall policy
      +--> DNS Firewall policy
      |
      v
Member accounts and resources
```

Exam angle:

Choose Firewall Manager when the question says:

- centrally deploy WAF rules
- organization-wide Shield Advanced protection
- enforce security group baseline
- centrally manage Network Firewall or DNS Firewall policies
- apply policies to new accounts/resources automatically

Common trap:

RAM shares resources. Firewall Manager enforces security policies. Do not swap them.

---

### 0.19 AWS Resource Access Manager, Or RAM

AWS RAM shares supported AWS resources across accounts.

Plain English:

> RAM lets one account own a resource and share it with other accounts.

Common share examples:

- subnets in a shared VPC
- Transit Gateway
- Route 53 Resolver rules
- license configurations
- IPAM pools
- resource groups for supported services

Real-world example:

A networking account owns shared VPC subnets. Application accounts launch resources into those shared subnets using AWS RAM.

Flow:

```text
Networking account owns subnet
      |
      v
Creates RAM resource share
      |
      v
Application account receives shared subnet
      |
      v
App team launches resources into shared subnet
```

Exam angle:

Choose RAM when the question says:

- share supported resources across accounts
- shared VPC
- centralized networking account shares subnets
- resource owner remains one account

Common trap:

RAM is not a policy enforcement engine. It is resource sharing.

---

### 0.20 AWS Service Catalog

Service Catalog lets administrators create portfolios of approved products that users can launch.

Plain English:

> Service Catalog gives teams self-service deployment, but only from approved products.

Real-world example:

Developers need to launch RDS databases, but security wants encryption, backups, subnet placement, and tags standardized. The platform team publishes an approved RDS product in Service Catalog.

Flow:

```text
Admin creates portfolio
      |
      +--> Product: approved RDS database
      +--> Product: approved EC2 application stack
      +--> Product: approved S3 static website
      |
      v
Users launch approved products
```

Exam angle:

Choose Service Catalog when the question says:

- governed self-service
- approved infrastructure products
- developers can launch resources without free-form admin access
- manage product versions
- portfolios

Common trap:

Service Catalog is not the same as CloudFormation StackSets.

```text
Service Catalog:
  user-facing catalog of approved products

StackSets:
  central deployment of the same stack across accounts/Regions
```

---

### 0.21 CloudFormation StackSets

StackSets deploy the same CloudFormation template across multiple accounts and Regions.

Plain English:

> StackSets are for repeatable multi-account, multi-Region deployments.

Real-world example:

The security team must deploy the same IAM role, Config recorder, EventBridge rule, or security baseline stack to every account and Region.

Flow:

```text
CloudFormation template
      |
      v
StackSet
      |
      +--> Account A / us-east-1 stack
      +--> Account A / us-west-2 stack
      +--> Account B / us-east-1 stack
      +--> Account B / us-west-2 stack
```

Exam angle:

Choose StackSets when the question says:

- deploy same resources across accounts and Regions
- consistent baseline stack
- multi-account CloudFormation deployment

Common trap:

StackSets deploy resources. They do not define organization authorization limits like SCPs or RCPs.

---

### 0.22 CloudFormation Guard

CloudFormation Guard is a policy-as-code tool for checking templates and other structured data.

Plain English:

> Guard checks whether templates follow your rules.

Example rule idea:

```text
rule s3_buckets_must_be_encrypted {
  Resources.*[ Type == 'AWS::S3::Bucket' ] {
    Properties.BucketEncryption exists
  }
}
```

Real-world example:

Before a CloudFormation template enters production, CI/CD runs Guard to reject templates that create unencrypted S3 buckets.

Flow:

```text
CloudFormation template
      |
      v
cfn-guard validate
      |
      +--> PASS: continue deployment
      +--> FAIL: block pipeline
```

Exam angle:

Choose Guard when the question says:

- policy-as-code
- validate templates in CI/CD
- shift-left security
- check JSON/YAML templates against rules

Common trap:

Guard alone is not server-side enforcement. For server-side enforcement during CloudFormation operations, think CloudFormation Hooks or Control Tower proactive controls.

---

### 0.23 cfn-lint

cfn-lint checks CloudFormation templates for syntax and resource specification issues.

Plain English:

> cfn-lint checks whether your template is structurally valid and follows CloudFormation resource rules.

Comparison:

| Tool | Main purpose |
|---|---|
| cfn-lint | Template correctness and resource specification checks |
| CloudFormation Guard | Custom policy-as-code checks |
| CloudFormation Hooks | Server-side checks during create/update/delete |

Exam angle:

If the question says "template syntax and resource specification validation," cfn-lint is relevant.

If it says "organizational security policy rules," Guard is more likely.

---

### 0.24 CloudFormation Hooks

CloudFormation Hooks can inspect resources before CloudFormation creates, updates, or deletes them.

Plain English:

> Hooks are server-side CloudFormation checkpoints.

Real-world example:

A hook blocks any CloudFormation stack that tries to create an S3 bucket without encryption.

Flow:

```text
CloudFormation create stack
      |
      v
Hook evaluates resource
      |
      +--> PASS: resource can proceed
      +--> FAIL: operation blocked or warned
```

Exam angle:

Choose Hooks when the question says:

- server-side enforcement during CloudFormation operations
- block noncompliant resources before provisioning
- proactive controls

Common trap:

Hooks apply to CloudFormation and Cloud Control API paths. They do not block every direct service API call unless the call goes through that path. For direct API prevention, look at SCPs, RCPs, declarative policies, IAM, or service-specific controls.

---

### 0.25 AWS Audit Manager

Audit Manager collects, organizes, and maps audit evidence to compliance controls.

Plain English:

> Audit Manager helps prove that your workloads meet control requirements.

Evidence can come from:

- CloudTrail user activity
- AWS Config compliance checks
- Security Hub CSPM checks
- AWS API configuration snapshots
- manual uploads

Real-world example:

Your company needs evidence for a PCI assessment. Audit Manager maps evidence from AWS services into a framework so the compliance team can review it and generate reports.

Flow:

```text
Compliance framework
      |
      v
Audit Manager assessment
      |
      +--> CloudTrail evidence
      +--> Config evidence
      +--> Security Hub evidence
      +--> API snapshot evidence
      +--> Manual evidence
      |
      v
Assessment report
```

Exam angle:

Choose Audit Manager when the question says:

- collect evidence
- map evidence to a framework
- produce assessment report
- prove your workload controls

Common trap:

Audit Manager is not where you download AWS SOC reports. That is Artifact.

---

### 0.26 AWS Artifact

AWS Artifact provides on-demand access to AWS compliance reports and agreements.

Plain English:

> Artifact gives you AWS's own compliance documents.

Examples:

- SOC reports
- ISO reports
- PCI reports
- Business Associate Addendum, where applicable
- other AWS compliance documentation and agreements

Real-world example:

An auditor asks whether AWS infrastructure has a SOC 2 report. You download the AWS report from Artifact.

Exam angle:

Choose Artifact when the question says:

- download AWS compliance reports
- AWS's compliance evidence
- agreements such as BAA
- auditor asks for AWS provider reports

Common trap:

```text
AWS Artifact:
  AWS's compliance reports and agreements

AWS Audit Manager:
  Evidence for your workload and controls
```

---

### 0.27 AWS Well-Architected Tool

The Well-Architected Tool helps review workloads against AWS best practices.

Plain English:

> It is a structured checklist and improvement tool for architecture risk.

It covers pillars such as:

- Operational Excellence
- Security
- Reliability
- Performance Efficiency
- Cost Optimization
- Sustainability

Real-world example:

A team reviews a production workload and finds high-risk security issues such as missing encryption, weak incident response preparation, or incomplete access review processes.

Exam angle:

Choose Well-Architected Tool when the question says:

- review workload architecture
- identify high-risk issues
- evaluate against AWS best practices
- security pillar review

Common trap:

Well-Architected Tool is not an enforcement mechanism. It recommends and tracks improvements.

---

### 0.28 Quick Component Map

| Requirement | Best starting point |
|---|---|
| Multi-account governance | AWS Organizations |
| Landing zone and account factory | AWS Control Tower |
| Restrict principals in member accounts | SCP |
| Restrict access to organization resources | RCP |
| Standardize service settings | Declarative policies |
| Standardize tag keys and values | Tag policies |
| Centralize root credential management | IAM centralized root access with Organizations |
| Central security service administration | Delegated administrator |
| Detect resource compliance drift | AWS Config |
| Bundle Config rules and remediation | Conformance packs |
| Central Config visibility | Config aggregator |
| Aggregate security findings and standards | Security Hub |
| Centrally deploy WAF/Shield/SG/Network Firewall/DNS Firewall policies | Firewall Manager |
| Share supported resources | RAM |
| Governed self-service products | Service Catalog |
| Same stack across accounts and Regions | StackSets |
| Template policy-as-code | CloudFormation Guard |
| Template syntax/spec validation | cfn-lint |
| Server-side CloudFormation pre-provision checks | CloudFormation Hooks |
| Collect audit evidence for your workload | Audit Manager |
| Download AWS compliance reports | Artifact |
| Review workload best practices | Well-Architected Tool |

---

## 1. Local Signal Summary

From the embedded practice bank:

```text
Governance mapped questions: 248

Task counts:
  Account strategy: 116
  Compliance evaluation: 102
  Secure deployment: 30
```

Repeated keyword signals:

| Keyword | Approximate count in governance questions |
|---|---:|
| AWS Config | 309 |
| RAM | 112 |
| Organizations | 72 |
| Firewall Manager | 58 |
| Remediation | 50 |
| Audit Manager | 44 |
| Artifact | 39 |
| Declarative policies | 37 |
| Well-Architected | 37 |
| Service Catalog | 37 |
| SCP | 34 |
| Security Hub | 33 |
| RCP | 25 |
| cfn-lint | 22 |
| AFT | 22 |
| AWS Backup | 22 |
| Control Tower | 16 |
| CloudFormation Guard | 15 |
| Config aggregator | 12 |
| Resource Access Manager | 11 |
| StackSets | 8 |
| Delegated administrator | 8 |
| Conformance pack | 7 |
| CloudFormation Hooks | 7 |

What this means:

1. Config and compliance evaluation dominate this domain.
2. Organizations policy types are very important, especially SCP vs RCP.
3. Firewall Manager, RAM, Service Catalog, StackSets, and Guard are frequent service-choice traps.
4. Audit Manager vs Artifact is a high-yield distinction.
5. New C03 wording includes declarative policies, RCPs, AI service opt-out policies, and centralized root access.

---

## 2. Domain Mental Model

Use this simple mental model:

```text
Design the organization
      |
      v
Create governed accounts
      |
      v
Set guardrails
      |
      v
Deploy consistently
      |
      v
Detect drift
      |
      v
Remediate drift
      |
      v
Collect evidence
      |
      v
Review and improve
```

Another useful view:

```text
Prevent:
  SCP, RCP, declarative policies, IAM, Control Tower preventive controls

Pre-check:
  CloudFormation Guard, CloudFormation Hooks, Control Tower proactive controls

Detect:
  Config, Security Hub, Control Tower detective controls

Remediate:
  Config remediation, SSM Automation, Firewall Manager policy enforcement

Prove:
  Audit Manager, Artifact

Review:
  Well-Architected Tool
```

This domain is mostly about choosing the correct layer.

---

## 3. High-Return Exam Topics

| Priority | Topic | Why it matters | Exam action | Common trap |
|---|---|---|---|---|
| Very high | Config rules, aggregators, conformance packs, remediation | Most repeated local signal | Know detect vs aggregate vs package vs remediate | Treating Config as immediate prevention |
| Very high | SCP vs RCP | C03 update and repeated IAM/governance overlap | SCP for principals, RCP for resources | Thinking SCP grants access |
| Very high | Audit Manager vs Artifact | Frequent compliance trap | Audit Manager for your evidence, Artifact for AWS reports | Downloading AWS SOC reports from Audit Manager |
| Very high | Firewall Manager vs RAM | Similar "central account" wording | Firewall Manager enforces policies, RAM shares resources | Using RAM to enforce WAF |
| High | Control Tower controls | Landing zone and guardrail wording | Preventive, detective, proactive | Thinking all controls are SCPs |
| High | Service Catalog vs StackSets | Deployment governance trap | Service Catalog for approved self-service, StackSets for multi-account rollout | Using StackSets as a user catalog |
| High | CloudFormation Guard vs Hooks vs cfn-lint | Secure deployment questions | Guard policy-as-code, Hooks server-side, cfn-lint syntax/spec | Thinking Guard alone blocks all deployments |
| High | Delegated administrator | Least operational overhead clue | Use service-native org admin where supported | Daily operations in management account |
| Medium-high | Centralized root access | C03 topic | Secure member-account root credentials centrally | Sharing root passwords manually |
| Medium-high | Declarative policies | Newer governance topic | Desired configuration at service level | Confusing with IAM policies |
| Medium | Tag policies and AI opt-out | Policy type recognition | Know what each policy type is for | Expecting tag policies to block all bad actions |
| Medium | Well-Architected Tool | Compliance/best-practice review | Use for architecture review | Treating it as an enforcement service |

---

## 4. Core Decision Trees

### 4.1 Account Governance

```text
Need to manage multiple AWS accounts?
    -> AWS Organizations

Need a governed landing zone and account vending?
    -> AWS Control Tower

Need daily admin of a security service from a security account?
    -> Delegated administrator

Need to avoid managing root credentials in every member account?
    -> Centralized root access
```

### 4.2 Policy Type

```text
Need to restrict what identities in member accounts can do?
    -> SCP

Need to restrict access to resources in member accounts?
    -> RCP

Need to standardize service settings at organization scale?
    -> Declarative policy

Need consistent tag values?
    -> Tag policy

Need to control supported AI service data-use preference?
    -> AI services opt-out policy

Need backup plans at organization scale?
    -> Backup policy
```

### 4.3 Compliance Visibility

```text
Need resource configuration history?
    -> AWS Config

Need compliance rule evaluation?
    -> AWS Config rules

Need central Config data across accounts and Regions?
    -> Config aggregator

Need a packaged set of Config rules?
    -> Conformance pack

Need findings and security standards dashboard?
    -> Security Hub
```

### 4.4 Remediation

```text
Resource violates a Config rule and should be fixed?
    -> Config remediation, often SSM Automation

New resource should be blocked before CloudFormation creates it?
    -> CloudFormation Hooks or Control Tower proactive control

Direct API call must be impossible?
    -> SCP/RCP/IAM/service-level control

WAF or firewall policy must be enforced across accounts?
    -> Firewall Manager
```

### 4.5 Audit And Evidence

```text
Auditor asks for AWS SOC/ISO/PCI report?
    -> AWS Artifact

Auditor asks for evidence about your workload controls?
    -> AWS Audit Manager

Team wants a best-practice architecture review?
    -> AWS Well-Architected Tool
```

### 4.6 Deployment Governance

```text
Developers need approved self-service resources?
    -> Service Catalog

Central team must deploy same template everywhere?
    -> CloudFormation StackSets

Pipeline must validate templates against custom policy rules?
    -> CloudFormation Guard

Template syntax/spec validation?
    -> cfn-lint

Server-side CloudFormation guard before provisioning?
    -> CloudFormation Hooks
```

---

## 5. SCP vs RCP: The Exam-Favorite Difference

This is one of the most important C03 governance concepts.

### 5.1 SCP

SCP controls the maximum permissions of principals in member accounts.

Example:

```text
Principal in Account A wants to call:
  ec2:RunInstances

SCP attached to Account A denies:
  ec2:RunInstances

Result:
  Denied
```

Use SCP when the sentence is about:

- users
- roles
- root user in member accounts
- administrators in an OU
- principals doing API actions

### 5.2 RCP

RCP controls the maximum permissions available on resources in member accounts.

Example:

```text
External Account B principal wants to read:
  S3 bucket in Account A

Bucket policy accidentally allows Account B.
RCP attached to Account A denies access from outside org.

Result:
  Denied
```

Use RCP when the sentence is about:

- resources in your organization
- external principals
- resource-based policies
- resource-side data perimeter
- "even if the bucket policy is opened"

### 5.3 Easy Memory Hook

```text
SCP = Subject side
RCP = Resource side
```

This is not AWS terminology, but it helps memory:

- subject side means "what your identities can do"
- resource side means "who can touch your resources"

### 5.4 Common Scenario

Question:

A company wants to prevent external principals from accessing organization-owned S3 buckets, even if a bucket policy is accidentally made public or cross-account.

Best answer:

Use RCPs.

Why:

The problem is resource-side access to organization-owned resources.

What not to choose:

- SCP only, because SCPs control member-account principals, not external principals accessing your resource
- IAM permissions boundary, because it affects a specific principal, not resource-side access
- Config only, because Config detects, not prevents

---

## 6. Control Tower: Controls Are Not All The Same

Control Tower is a wrapper around a lot of governance behavior.

### 6.1 Landing Zone

A landing zone is a managed multi-account foundation.

It typically includes:

- management account
- log archive account
- audit/security account
- OUs
- logging
- baseline controls
- account provisioning workflow

Text diagram:

```text
Control Tower landing zone
   |
   +-- Management account
   +-- Log Archive account
   +-- Audit account
   +-- Governed OUs
   +-- Controls
   +-- Account Factory
```

### 6.2 Account Factory

Account Factory provisions new accounts with baseline governance.

Exam clue:

```text
new account creation
standard baseline
least operational overhead
account vending
```

Think Control Tower Account Factory.

### 6.3 Account Factory For Terraform, Or AFT

AFT integrates Terraform-based account requests and customizations with Control Tower.

Plain English:

> AFT lets Terraform-driven platform teams create and customize Control Tower accounts.

Exam clue:

If the question explicitly says Terraform and Control Tower account provisioning, AFT may be the best answer.

### 6.4 Preventive, Detective, Proactive

| Question wording | Control type | Implementation idea |
|---|---|---|
| Prevent users from doing action | Preventive | SCP/RCP/declarative policy |
| Detect unencrypted resource | Detective | Config rule |
| Stop bad CloudFormation before creation | Proactive | CloudFormation Hook |

### 6.5 Mandatory, Strongly Recommended, Elective

Control Tower controls also have guidance categories:

- mandatory
- strongly recommended
- elective

Exam angle:

Mandatory controls are part of the managed baseline. Optional or elective controls can be enabled depending on your governance needs.

Common trap:

Do not assume every desired custom control is built into Control Tower. Sometimes the answer is custom Config rule, CloudFormation Hook, SCP, or StackSet.

---

## 7. AWS Config: The Compliance Workhorse

Config appears everywhere in Domain 6.

### 7.1 What Config Records

Config records supported resource configuration.

Example:

```text
Security group changed
      |
      v
Config records new configuration item
      |
      v
History shows who/what changed over time when paired with CloudTrail
```

Config is good for questions like:

- "was this S3 bucket public last week?"
- "which resources are noncompliant?"
- "what changed in this resource configuration?"
- "are EBS volumes encrypted?"

### 7.2 Config Rules

Config rules evaluate resources.

Examples:

- S3 bucket public read prohibited
- EBS volumes encrypted
- IAM password policy check
- restricted SSH

Flow:

```text
Resource
   |
   v
Config rule
   |
   +--> COMPLIANT
   +--> NON_COMPLIANT
```

### 7.3 Managed vs Custom Rules

```text
AWS managed rule:
  AWS writes and maintains the rule logic

Custom rule:
  You define custom logic, often with Lambda or Guard-based checks depending on use case
```

Exam angle:

If AWS already has a managed rule, choose it for lower overhead.

### 7.4 Aggregators

Aggregator is central visibility.

```text
Account 1 / Region A
Account 2 / Region B
Account 3 / Region C
      |
      v
Config aggregator
      |
      v
Central query and compliance view
```

### 7.5 Conformance Packs

Conformance pack is a bundled compliance pack.

```text
CIS conformance pack
   |
   +--> Rule: root MFA enabled
   +--> Rule: CloudTrail enabled
   +--> Rule: S3 public access blocked
   +--> Rule: EBS encryption enabled
   +--> Remediation actions where defined
```

### 7.6 Remediation

Config remediation is often connected to SSM Automation.

Example:

```text
Config rule:
  security-group-ssh-restricted

Noncompliant:
  sg-123 allows 0.0.0.0/0 to port 22

Remediation:
  SSM Automation removes the rule or applies approved baseline
```

### 7.7 Config vs CloudTrail

| Need | Service |
|---|---|
| Who called StopLogging? | CloudTrail |
| Which resources violate rules? | Config |
| What was the bucket configuration yesterday? | Config |
| Search API events with SQL-like queries | CloudTrail Lake |
| Aggregate configuration across accounts | Config aggregator |

Common trap:

CloudTrail tells you activity. Config tells you configuration state and compliance.

---

## 8. Firewall Manager vs RAM vs Service Catalog

These three get confused because all involve central teams and multiple accounts.

### 8.1 Firewall Manager

Use for central security policy enforcement.

Example:

```text
Apply WAF baseline to all CloudFront distributions in Prod OU
```

Best service:

```text
AWS Firewall Manager
```

### 8.2 RAM

Use for sharing resources.

Example:

```text
Networking account shares subnets with application accounts
```

Best service:

```text
AWS Resource Access Manager
```

### 8.3 Service Catalog

Use for governed self-service products.

Example:

```text
Developers launch only approved RDS templates
```

Best service:

```text
AWS Service Catalog
```

### 8.4 Memory Table

| Wording | Service |
|---|---|
| "enforce WAF across accounts" | Firewall Manager |
| "share subnets with accounts" | RAM |
| "approved products for developers" | Service Catalog |
| "same baseline stack everywhere" | StackSets |

---

## 9. Secure Deployment Strategy

Domain 6 includes secure and consistent deployment.

### 9.1 The Deployment Layers

```text
Developer writes template
      |
      v
cfn-lint checks syntax and specification
      |
      v
CloudFormation Guard checks custom policy rules
      |
      v
CI/CD approval
      |
      v
CloudFormation Hooks can enforce server-side rules
      |
      v
Stack or StackSet deploys
      |
      v
Config detects runtime drift
```

### 9.2 When To Use What

| Need | Tool |
|---|---|
| Validate syntax/spec of CloudFormation template | cfn-lint |
| Validate custom security policy in JSON/YAML | CloudFormation Guard |
| Enforce before CloudFormation creates resources | CloudFormation Hooks |
| Deploy same stack to many accounts/Regions | StackSets |
| Give users approved self-service products | Service Catalog |
| Detect drift after deployment | Config |
| Block direct API action | SCP/RCP/IAM/service control |

### 9.3 Example: Public S3 Bucket Prevention

Scenario:

Platform team wants to stop CloudFormation templates from creating public S3 buckets. Developers deploy via CI/CD.

Good answer:

Use CloudFormation Guard in CI/CD, and consider CloudFormation Hooks or Control Tower proactive controls for server-side enforcement.

Why:

Guard validates templates against rules before deployment.

What not to do:

Do not rely only on a monthly audit report. That is too late.

### 9.4 Example: Direct API Bypass

Scenario:

Developers can bypass CloudFormation by using the AWS CLI directly. The company must prevent public S3 bucket policies regardless of deployment path.

Better answer:

Use preventive controls such as SCP/RCP/IAM/service-level public access block, and use Config to detect drift.

Why:

CloudFormation-only controls do not cover direct service API calls.

---

## 10. Audit Manager vs Artifact vs Well-Architected

This is one of the cleanest service-choice areas.

### 10.1 Artifact

Question says:

- "AWS compliance reports"
- "SOC 2 report"
- "PCI report"
- "ISO certificate"
- "agreement"
- "BAA"

Answer:

```text
AWS Artifact
```

### 10.2 Audit Manager

Question says:

- "collect evidence"
- "map controls to a compliance framework"
- "assessment"
- "evidence for our workload"
- "automated evidence collection"

Answer:

```text
AWS Audit Manager
```

### 10.3 Well-Architected Tool

Question says:

- "review workload"
- "best practices"
- "Security pillar"
- "high risk issues"
- "architecture improvement plan"

Answer:

```text
AWS Well-Architected Tool
```

### 10.4 Three-Way Diagram

```text
Need AWS provider report?
      -> Artifact

Need evidence that your workload meets controls?
      -> Audit Manager

Need architecture best-practice review?
      -> Well-Architected Tool
```

---

## 11. Security Hub vs Config In Governance

Both can show compliance, but they are not the same.

### 11.1 Config

Config is resource state and rules.

Examples:

- Is this security group open to the world?
- Was this bucket encrypted?
- Which resources changed configuration?
- Can I remediate noncompliance?

### 11.2 Security Hub

Security Hub is findings aggregation and security standards.

Examples:

- AWS Foundational Security Best Practices control status
- CIS standard control status
- GuardDuty finding aggregation
- Inspector vulnerability findings
- central security posture dashboard

### 11.3 Exam Split

| Wording | Better fit |
|---|---|
| Configuration item history | Config |
| Compliance rule and remediation | Config |
| Aggregate findings from multiple AWS security services | Security Hub |
| Security standards score | Security Hub |
| Multi-account Config query | Config aggregator |

---

## 12. Root User Governance

Root user questions are easy to overthink.

### 12.1 What Root Is For

Root is for rare tasks that require root privileges. It should not be used for daily administration.

Better pattern:

```text
Human workforce access
      -> IAM Identity Center

Admin work
      -> IAM roles and permission sets

Rare root-only task
      -> documented break-glass or centralized root privileged task
```

### 12.2 Member Account Root

For member accounts in Organizations:

- centralize root access where appropriate
- remove root credentials where possible
- define break-glass
- protect management account heavily

### 12.3 Management Account Root

The management account remains extremely sensitive.

Best practices:

- hardware MFA
- strong break-glass controls
- minimal use
- no workloads
- tightly controlled access

Exam trap:

An SCP can restrict root in member accounts, but SCPs do not affect the management account.

---

## 13. Governance Policy Examples

These are simplified examples for understanding, not ready-to-deploy production policies.

### 13.1 SCP: Deny CloudTrail StopLogging

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyStoppingCloudTrail",
      "Effect": "Deny",
      "Action": [
        "cloudtrail:StopLogging",
        "cloudtrail:DeleteTrail"
      ],
      "Resource": "*"
    }
  ]
}
```

Meaning:

Principals in affected member accounts cannot stop or delete CloudTrail trails, even if IAM allows it.

Exam caveat:

This does not grant CloudTrail access. It only denies certain actions.

### 13.2 SCP: Restrict Regions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyOutsideApprovedRegions",
      "Effect": "Deny",
      "NotAction": [
        "iam:*",
        "organizations:*",
        "route53:*",
        "cloudfront:*",
        "support:*"
      ],
      "Resource": "*",
      "Condition": {
        "StringNotEquals": {
          "aws:RequestedRegion": [
            "us-east-1",
            "us-west-2"
          ]
        }
      }
    }
  ]
}
```

Meaning:

Deny actions outside approved Regions, with exceptions for global services.

Exam caveat:

Region restriction SCPs need careful global-service exceptions.

### 13.3 RCP Concept: Keep Resources Inside Org Boundary

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyAccessFromOutsideOrg",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": "*",
      "Condition": {
        "StringNotEquals": {
          "aws:PrincipalOrgID": "o-exampleorgid"
        }
      }
    }
  ]
}
```

Meaning:

Resource-side protection against access from principals outside the organization.

Exam caveat:

Real RCP design must handle AWS service principals, service-linked role behavior, and tested exceptions.

### 13.4 Config Remediation Idea

```text
Config rule:
  s3-bucket-public-read-prohibited

Remediation:
  SSM Automation document:
    AWS-DisableS3BucketPublicReadWrite
```

Meaning:

If a bucket becomes public, Config marks it noncompliant and remediation can disable public access.

Exam caveat:

For strict prevention, combine with public access block, SCP/RCP/IAM conditions, or pre-deployment controls.

---

## 14. Worked Scenario 1: New Account Baseline

Scenario:

A company is creating many AWS accounts for application teams. Each new account must have logging, audit access, and baseline controls without manual setup.

Best answer:

Use AWS Control Tower with Account Factory.

Why:

Control Tower is built for governed landing zones and repeatable account creation.

What not to choose:

- Manually create accounts with IAM users
- Run workloads in the management account
- Depend only on spreadsheets and manual checklists

Exam phrase:

```text
"new accounts automatically receive baseline guardrails"
```

Answer pattern:

```text
Control Tower Account Factory
```

---

## 15. Worked Scenario 2: Prevent Admins From Disabling CloudTrail

Scenario:

Application account administrators have broad IAM permissions. The security team must prevent them from disabling CloudTrail.

Best answer:

Attach an SCP to the relevant OU denying CloudTrail stop/delete actions.

Why:

SCPs set maximum permissions for principals in member accounts.

What not to choose:

- IAM policy alone, because admins might change it
- Config alone, because it detects after the fact
- Artifact, because it is for compliance reports

---

## 16. Worked Scenario 3: External Principal Access To S3

Scenario:

The company worries that teams might accidentally write S3 bucket policies allowing external accounts. The security team wants a central organization-level guardrail to prevent outside principals from accessing organization-owned buckets.

Best answer:

Use RCPs.

Why:

The control is resource-side and protects resources in member accounts.

What not to choose:

- SCP only, because external principals are not principals in your member accounts
- Config only, because it detects rather than prevents

---

## 17. Worked Scenario 4: Compliance Evidence For PCI

Scenario:

The compliance team must collect evidence that company workloads satisfy PCI controls. Evidence should map to a framework and include automated data from AWS services where possible.

Best answer:

Use AWS Audit Manager.

Why:

Audit Manager collects and organizes evidence for assessments.

What not to choose:

- Artifact, unless the requirement is AWS's own PCI report
- Well-Architected Tool, unless the requirement is architecture best-practice review

---

## 18. Worked Scenario 5: Auditor Asks For AWS SOC Report

Scenario:

An external auditor asks for AWS's SOC 2 Type II report.

Best answer:

Use AWS Artifact.

Why:

Artifact provides AWS compliance reports and agreements.

What not to choose:

- Audit Manager, because that is for your workload evidence
- Config, because that is resource compliance and configuration

---

## 19. Worked Scenario 6: Central WAF Rollout

Scenario:

A company must apply a standard WAF rule set to all CloudFront distributions and ALBs in accounts under the Production OU, including future accounts.

Best answer:

Use AWS Firewall Manager.

Why:

Firewall Manager centrally manages WAF policies across an organization.

What not to choose:

- RAM, because sharing is not policy enforcement
- Service Catalog, because existing resources also need policy governance
- Manual WAF in each account, because it is high overhead

---

## 20. Worked Scenario 7: Shared Networking

Scenario:

A networking account owns subnets. Application accounts need to launch resources into those subnets without duplicating VPCs.

Best answer:

Use AWS RAM to share subnets.

Why:

RAM shares supported resources across accounts.

What not to choose:

- Firewall Manager, because it does not share subnets
- Artifact, because it is compliance documents

---

## 21. Worked Scenario 8: Approved Developer Products

Scenario:

Developers need self-service deployment of databases, but the platform team must restrict them to approved encrypted and tagged patterns.

Best answer:

Use AWS Service Catalog.

Why:

Service Catalog provides governed portfolios of approved products.

What not to choose:

- StackSets if the developers are choosing products interactively
- RAM if the issue is provisioning governance rather than resource sharing

---

## 22. Worked Scenario 9: Same Baseline Everywhere

Scenario:

The security team must deploy the same IAM role and EventBridge rule to every account and Region.

Best answer:

Use CloudFormation StackSets.

Why:

StackSets deploy the same template to multiple accounts and Regions.

What not to choose:

- Service Catalog, because users are not launching optional products
- Config, because Config detects resources after deployment

---

## 23. Worked Scenario 10: Template Shift-Left Security

Scenario:

A CI/CD pipeline must reject CloudFormation templates that create unencrypted S3 buckets before the template is deployed.

Best answer:

Use CloudFormation Guard in the pipeline.

Why:

Guard is policy-as-code for validating structured templates.

Add-on:

Use CloudFormation Hooks or Control Tower proactive controls if you need server-side enforcement during CloudFormation operations.

What not to choose:

- Audit Manager, because it is evidence collection
- Artifact, because it is AWS compliance reports

---

## 24. Worked Scenario 11: Runtime Drift

Scenario:

An S3 bucket was compliant during deployment. Later someone changed its policy to allow public access. The company must detect and automatically fix this.

Best answer:

Use AWS Config rule with remediation, often through SSM Automation.

Why:

Config detects runtime configuration drift. Remediation fixes noncompliance.

What not to choose:

- cfn-lint, because the resource already exists
- Guard alone, because it checked only the template path

---

## 25. Worked Scenario 12: Architecture Review

Scenario:

A workload owner wants a structured review against AWS best practices and a list of high-risk security issues.

Best answer:

Use AWS Well-Architected Tool.

Why:

The tool reviews workloads against framework pillars including Security.

What not to choose:

- Audit Manager, unless the goal is compliance evidence
- Config aggregator, unless the goal is resource compliance visibility

---

## 26. Common Traps

### Trap 1: "SCP allow grants access"

Wrong.

SCPs do not grant access. IAM or resource policies still need to allow.

```text
SCP allows s3:ListBucket
IAM policy has no s3:ListBucket allow
Result: not allowed
```

### Trap 2: "SCP affects management account"

Wrong.

SCPs do not affect users or roles in the management account.

### Trap 3: "RCP controls outbound identity behavior"

Not quite.

RCPs protect resources in your organization. Use SCP/IAM for what your principals can do.

### Trap 4: "Config prevents every bad action"

Wrong.

Config detects and can remediate. It is not a universal preventive gate.

### Trap 5: "Artifact collects your workload evidence"

Wrong.

Artifact gives AWS provider reports. Audit Manager collects your workload evidence.

### Trap 6: "Firewall Manager shares resources"

Wrong.

Firewall Manager enforces security policies. RAM shares resources.

### Trap 7: "Service Catalog deploys the same baseline everywhere"

Usually wrong.

Service Catalog gives approved self-service products. StackSets deploy the same template across accounts and Regions.

### Trap 8: "CloudFormation Guard blocks direct API calls"

Wrong.

Guard validates structured data, commonly in pipelines. Direct API calls need IAM/SCP/RCP/service controls.

### Trap 9: "Well-Architected enforces security"

Wrong.

Well-Architected reviews and recommends. It does not enforce.

### Trap 10: "Delegated admin should be the management account"

Usually wrong.

Use a member security account as delegated admin where supported, keeping the management account for organization administration.

---

## 27. Service Boundary Table

| Service or feature | Primary verb | Main question it answers |
|---|---|---|
| Organizations | Organize and govern | How do we manage accounts centrally? |
| Control Tower | Baseline | How do we create governed accounts? |
| SCP | Restrict principals | What can identities in member accounts do at most? |
| RCP | Restrict resources | Who can access resources in member accounts at most? |
| Declarative policy | Standardize service settings | What service configuration must be true? |
| Tag policy | Standardize tags | What tag keys/values should be used? |
| Delegated admin | Administer centrally | Which member account manages the service? |
| Config | Evaluate resource state | Is this resource compliant? |
| Config aggregator | Centralize Config | What is compliance across accounts and Regions? |
| Conformance pack | Bundle rules | How do we deploy a control pack? |
| Security Hub | Aggregate findings | What is the security posture? |
| Firewall Manager | Enforce firewall policy | Are WAF/firewall policies applied everywhere? |
| RAM | Share resources | How do accounts use centrally owned resources? |
| Service Catalog | Govern self-service | How do users launch only approved products? |
| StackSets | Deploy broadly | How do we deploy the same stack everywhere? |
| Guard | Validate policy-as-code | Does this template satisfy our rules? |
| cfn-lint | Validate syntax/spec | Is this template valid CloudFormation? |
| Hooks | Pre-provision enforcement | Can this CloudFormation operation proceed? |
| Audit Manager | Collect evidence | Can we prove our controls work? |
| Artifact | Get AWS reports | Can we download AWS compliance documents? |
| Well-Architected | Review design | What architecture risks should we improve? |

---

## 28. Mini Practice Set

These are original questions for study. They are not copied real exam questions.

### Q1. SCP Basics

A member account admin has an IAM policy that allows `cloudtrail:StopLogging`. An SCP attached to the account denies `cloudtrail:StopLogging`. What happens?

A. Allowed because IAM overrides SCP  
B. Allowed because SCPs grant only additional permissions  
C. Denied because applicable explicit deny wins  
D. Allowed if the user has administrator access

**Answer:** C

**Explanation:** SCPs set maximum permissions for member-account principals. An explicit deny blocks the action.

---

### Q2. RCP Use Case

A company wants to prevent external principals from accessing organization-owned S3 buckets, even if a bucket policy is accidentally opened. Which policy type is most relevant?

A. Service control policy  
B. Resource control policy  
C. IAM permissions boundary  
D. Session policy

**Answer:** B

**Explanation:** RCPs are resource-side organization policies.

---

### Q3. Config Aggregator

A central security account needs compliance visibility across accounts and Regions from AWS Config. What should be used?

A. Config aggregator  
B. AWS Artifact  
C. CloudFormation Guard  
D. IAM Access Analyzer policy validation

**Answer:** A

**Explanation:** A Config aggregator centralizes Config data across accounts and Regions.

---

### Q4. Artifact vs Audit Manager

An auditor asks for AWS's SOC 2 report. Which service should you use?

A. AWS Audit Manager  
B. AWS Artifact  
C. AWS Config  
D. AWS Well-Architected Tool

**Answer:** B

**Explanation:** Artifact provides AWS compliance reports and agreements.

---

### Q5. Audit Evidence

A compliance team wants to collect evidence that company workloads meet PCI controls. Which service is best aligned?

A. AWS Audit Manager  
B. AWS Artifact  
C. AWS RAM  
D. AWS Firewall Manager

**Answer:** A

**Explanation:** Audit Manager collects and organizes evidence for assessments.

---

### Q6. WAF Across Accounts

A security team wants to centrally apply a WAF policy to ALBs across all accounts in an OU. Which service is best?

A. AWS Firewall Manager  
B. AWS Resource Access Manager  
C. AWS Service Catalog  
D. CloudFormation Guard

**Answer:** A

**Explanation:** Firewall Manager centrally manages WAF and other security policies across Organizations.

---

### Q7. Shared Subnets

A networking account owns VPC subnets that application accounts need to use. Which service supports this resource-sharing pattern?

A. AWS RAM  
B. AWS Firewall Manager  
C. AWS Artifact  
D. AWS Audit Manager

**Answer:** A

**Explanation:** RAM shares supported resources across accounts.

---

### Q8. Approved Products

Developers need self-service deployment, but only from approved infrastructure templates. Which service is best?

A. AWS Service Catalog  
B. AWS Config aggregator  
C. AWS Artifact  
D. AWS Shield Advanced

**Answer:** A

**Explanation:** Service Catalog provides governed portfolios of approved products.

---

### Q9. Multi-Account Deployment

A central team must deploy the same CloudFormation template to many accounts and Regions. Which feature should they use?

A. CloudFormation StackSets  
B. IAM Access Analyzer  
C. AWS Artifact  
D. Amazon Macie

**Answer:** A

**Explanation:** StackSets deploy CloudFormation stacks across accounts and Regions.

---

### Q10. Policy-As-Code

A pipeline must reject CloudFormation templates that do not meet custom security rules. Which tool is most relevant?

A. CloudFormation Guard  
B. AWS Artifact  
C. AWS RAM  
D. CloudTrail Lake

**Answer:** A

**Explanation:** Guard validates structured data against policy-as-code rules.

---

### Q11. Server-Side CloudFormation Check

A company wants CloudFormation to evaluate a resource before create or update and block the operation if the resource violates policy. Which feature fits?

A. CloudFormation Hooks  
B. AWS Artifact  
C. AWS Organizations tag policy only  
D. S3 Storage Lens

**Answer:** A

**Explanation:** Hooks perform server-side checks during CloudFormation operations.

---

### Q12. Control Tower Proactive Control

What does a proactive Control Tower control do?

A. Checks resources before CloudFormation provisions them  
B. Downloads AWS compliance reports  
C. Shares subnets across accounts  
D. Grants IAM permissions

**Answer:** A

**Explanation:** Proactive controls use CloudFormation Hooks to check resources before provisioning.

---

### Q13. Root Access

A large AWS Organization wants to reduce member-account root credential exposure and perform rare privileged tasks through a controlled central process. Which feature area is relevant?

A. Centralized root access for member accounts  
B. CloudFront field-level encryption  
C. S3 lifecycle rules  
D. Amazon Inspector SBOM export

**Answer:** A

**Explanation:** Centralized root access helps manage member-account root credentials at scale.

---

### Q14. Declarative Policy

Which statement best describes declarative policies in AWS Organizations?

A. They centrally configure desired service settings for supported services  
B. They collect audit evidence for PCI  
C. They share subnets across accounts  
D. They replace all IAM policies

**Answer:** A

**Explanation:** Declarative policies centrally manage supported service configurations.

---

### Q15. Matching

Match the requirement to the best service or feature.

| Requirement | Answer |
|---|---|
| AWS compliance reports | Artifact |
| Evidence for your workload audit | Audit Manager |
| WAF policies across accounts | Firewall Manager |
| Share supported resources | RAM |
| Approved self-service products | Service Catalog |
| Same stack across accounts/Regions | StackSets |
| Resource-side organization guardrail | RCP |
| Principal-side organization guardrail | SCP |
| Resource compliance drift | Config |
| Architecture best-practice review | Well-Architected Tool |

---

## 29. Final Audit Addendum: RCP Conditions And Supply-Chain Governance

This section was added after rechecking the full question bank and important-topic matrix.

### 29.1 RCPs, AWS Services, And Service-Linked Roles

RCPs are powerful, but organization-wide resource-side denies must be designed carefully because AWS services often access resources on your behalf.

Plain English:

> Data perimeter policies must avoid accidentally blocking trusted AWS service calls that your workloads need.

Important exam points:

- RCPs affect resources in member accounts.
- RCPs do not grant permissions.
- RCPs are evaluated with IAM, resource policies, and SCPs.
- RCPs can affect root users trying to access member-account resources.
- RCPs do not apply to calls made by service-linked roles.
- Policies often need careful exceptions for AWS service principals.

Condition keys to recognize:

| Condition key | Why it matters |
|---|---|
| `aws:PrincipalOrgID` | Checks whether the principal belongs to your organization |
| `aws:PrincipalOrgPaths` | Checks whether the principal is in a specific org path/OU |
| `aws:PrincipalIsAWSService` | Helps distinguish AWS service principals from normal principals |
| `aws:ViaAWSService` | Helps reason about requests made through AWS services |

Example idea:

```json
{
  "Effect": "Deny",
  "Principal": "*",
  "Action": "s3:*",
  "Resource": "*",
  "Condition": {
    "StringNotEquals": {
      "aws:PrincipalOrgID": "o-exampleorgid"
    },
    "BoolIfExists": {
      "aws:PrincipalIsAWSService": "false"
    }
  }
}
```

What this means:

The policy idea denies access from outside the organization while being careful about AWS service principals. Real policies must be tested in a sandbox before broad rollout.

Common trap:

Do not attach broad RCP denies at the organization root without testing. RCP mistakes can break legitimate service integrations.

### 29.2 Inspector SBOM And Supply-Chain Evidence

Amazon Inspector can export SBOMs for supported resources that it monitors.

Plain English:

> SBOM export is about software component inventory for deployed resources.

Use it when the question says:

- software bill of materials
- CycloneDX or SPDX
- export component inventory to S3
- supply-chain visibility for EC2, ECR, or Lambda resources monitored by Inspector
- delegated administrator exporting SBOMs across an organization

Do not confuse it with:

```text
Source code scan before deploy
    -> Amazon Q Developer code review / SAST-style scanning

Runtime package/container/Lambda vulnerability or SBOM
    -> Amazon Inspector
```

### 29.3 Amazon Q Developer Code Review

Amazon Q Developer can review code for security vulnerabilities and code quality issues during development.

Plain English:

> Q Developer is a pre-deployment code review signal. Inspector is a deployed workload signal.

Exam angle:

Choose Amazon Q Developer or code scanning when the question says:

- review source code
- SAST
- find vulnerabilities before deployment
- developer workflow
- code quality and security review

Common trap:

Do not choose Audit Manager for code vulnerabilities. Audit Manager collects compliance evidence; it does not scan source code.

---

## 30. Last-Day Revision Checklist

Before the exam, make sure you can answer these quickly:

- What does AWS Organizations do?
- Why should production workloads not run in the management account?
- What is a delegated administrator?
- When do you choose Control Tower?
- What does Account Factory do?
- What are preventive, detective, and proactive controls?
- What does an SCP control?
- Why does an SCP not grant permissions?
- Does an SCP affect the management account?
- What does an RCP control?
- When is RCP better than SCP?
- Why do RCP designs need AWS service-principal exceptions?
- What do `aws:PrincipalOrgID` and `aws:PrincipalIsAWSService` help with?
- What are declarative policies?
- What are tag policies?
- What are AI services opt-out policies?
- What is centralized root access?
- What does AWS Config record?
- What is a Config aggregator?
- What is a conformance pack?
- How does Config remediation work?
- When do you choose Security Hub instead of Config?
- What does Firewall Manager centrally manage?
- What does RAM share?
- When do you choose Service Catalog?
- When do you choose StackSets?
- What is CloudFormation Guard?
- How is Guard different from cfn-lint?
- How are CloudFormation Hooks different from Guard?
- What is Audit Manager for?
- What is Artifact for?
- What is the Well-Architected Tool for?
- When do Inspector SBOM exports matter?
- When is Amazon Q Developer code review the better answer?

Final mental model:

```text
Organizations:
  accounts, OUs, policies, delegated admin, root access

Control Tower:
  landing zone, Account Factory, preventive/detective/proactive controls

Policies:
  SCP = principal-side maximum permissions
  RCP = resource-side maximum permissions, with careful AWS service exceptions
  Declarative = desired service settings
  Tag = tag consistency

Compliance:
  Config = resource compliance
  Security Hub = findings and standards
  Audit Manager = your evidence
  Artifact = AWS reports
  Well-Architected = architecture review

Deployment:
  StackSets = deploy everywhere
  Service Catalog = approved self-service
  Guard = policy-as-code
  cfn-lint = template correctness
  Hooks = CloudFormation server-side enforcement

Security rollout:
  Firewall Manager = WAF/Shield/SG/Network Firewall/DNS Firewall policies
  RAM = share supported resources

Supply chain:
  Amazon Q Developer = source code security review
  Inspector SBOM = deployed resource component inventory
```
