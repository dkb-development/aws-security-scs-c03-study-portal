# AWS Security Specialty SCS-C03 Study Guide Generation Strategy

Generated: 2026-10-06

This is the repeatable strategy used to build the Topic 1 Detection study guide. Use this same checklist for every remaining topic so the guides stay consistent, exam-focused, and easy to read.

The goal is not to create a textbook. The goal is to create a high-yield study guide from the concepts that repeatedly appear in legitimate prep sources, official exam objectives, and the local practice-question bank.

---

## 1. Ground Rules

- Use official AWS documentation for service behavior, feature names, and current exam objectives.
- Use GitHub, Reddit, blogs, and community reports only as topic signals.
- Do not copy paid course content, Udemy question banks, dump sites, or recalled live exam questions.
- Write original explanations, original examples, and original practice questions.
- Treat all weightage as a study-priority signal, not a guarantee about the real exam.
- Keep each guide focused on one domain at a time.

---

## 2. Inputs To Check Before Writing

For each topic, check these local files:

1. `outputs/aws-security-scs-c03-important-concepts-and-questions.md`
   - Use this for repeated concepts, source signals, and high-priority patterns.

2. `outputs/aws-security-scs-c03-topic-derived-original-questions.md`
   - Use this for original topic-derived questions and explanations.

3. `outputs/aws-security-scs-c03-github-practice-bank.md`
   - Use this for open/permissive question-bank patterns.
   - Do not blindly copy. Extract concepts and create clean explanations.

4. `aws-security-study-site/lib/question-bank.ts`
   - Use this to see how many questions are currently mapped to the domain.
   - Use keyword frequency to see which services and concepts repeat.

5. Official AWS SCS-C03 exam guide
   - Confirm the exact domain tasks and skills.

---

## 3. Signal Extraction Method

For the selected domain:

1. Count questions by topic/task.
2. Search for repeated service names.
3. Search for repeated action words.
4. Pull 10-20 representative question themes.
5. Convert repeated patterns into a priority table.

Useful searches:

```bash
rg -n "Domain Name|keyword1|keyword2|keyword3" outputs aws-security-study-site/lib/question-bank.ts
```

For Incident Response, useful keywords are:

```text
incident, response, contain, isolate, forensic, snapshot, evidence,
compromise, credential, access key, revoke, STS, runbook, automation,
GuardDuty, EventBridge, Step Functions, Systems Manager, Session Manager
```

For other domains, choose keywords based on the domain:

```text
Infrastructure Security:
VPC, endpoint, PrivateLink, WAF, Shield, Network Firewall, NACL, security group,
CloudFront, API Gateway, mTLS, OAC, DNS Firewall

IAM:
SCP, RCP, permission boundary, session policy, trust policy, resource policy,
Identity Center, Cognito, STS, ABAC, session tags, external ID

Data Protection:
KMS, key policy, grants, ViaService, S3, Object Lock, Macie, Secrets Manager,
encryption, rotation, CloudHSM, multi-Region key

Governance:
Organizations, Control Tower, Config, conformance pack, Audit Manager,
Artifact, CloudFormation Guard, StackSets, Service Catalog, Firewall Manager
```

---

## 4. Official Documentation Pass

Before writing, open current official AWS docs for the services that dominate the topic.

The purpose is to confirm:

- What the service actually does.
- What integrations are current.
- Which limitations and traps matter.
- Whether the SCS-C03 guide mentions the service directly in that domain.

For each guide, include an "Official references used" list near the top.

Do not overload the guide with citations after every sentence. The Markdown file should be readable offline. Use official links as reference anchors.

---

## 5. Required Guide Structure

Use this structure for each domain.

### 5.1 Title And Intent

Start with:

- Guide name
- Generated date
- A short note that it is exam-focused
- A note that it is based on local question/topic signals and official docs

Example:

```text
This guide is exam-focused. It is based on the question bank and topic signals collected in this workspace, not on copied real exam questions or dumps.
```

### 5.2 Component Primer First

Always explain the AWS components before exam tricks.

For each important component, include:

- Plain English meaning
- What the service does
- Real-world example
- Simple text diagram
- JSON, policy, CLI, event, or config example when useful
- Exam angle
- Common trap

This was the most useful improvement made during Detection: instead of jumping directly into "choose GuardDuty vs Security Hub," the guide first explained what GuardDuty, CloudTrail, Security Hub, Detective, Security Lake, Macie, Inspector, EventBridge, SNS, Athena, and Access Analyzer do.

### 5.3 Domain Mental Model

Create one simple mental model that ties the topic together.

Examples:

```text
Detection:
Logs -> Findings -> Aggregation -> Investigation -> Automated response trigger

Incident Response:
Prepare -> Detect -> Triage -> Contain -> Preserve -> Eradicate -> Recover -> Review
```

### 5.4 High-Return Topics

Build a table sorted by source/question signal.

Columns:

- Topic
- Why it matters
- Exam action
- Common trap

### 5.5 Decision Trees

Add "If the question says..." decision trees.

These reduce cognitive load. They help with exam wording.

Example:

```text
Need to know who made an API call?
    -> CloudTrail

Need to automatically react to that API call?
    -> EventBridge rule

Need to investigate related entities after a finding?
    -> Detective
```

### 5.6 Worked Examples

Use realistic examples:

- Compromised EC2
- Leaked access key
- Suspicious GuardDuty finding
- Public S3 bucket
- Cross-account KMS failure
- WAF rule problem
- Organization-wide control drift

Each example should include:

- Scenario
- Good answer
- Why
- What not to do

### 5.7 Text Diagrams

Use searchable diagrams:

```text
GuardDuty finding
      |
      v
EventBridge rule
      |
      +--> SNS notification
      +--> Step Functions workflow
      +--> SSM Automation runbook
```

Text diagrams are preferred over console screenshots because screenshots change, cannot be searched, and become stale quickly.

### 5.8 JSON And Policy Examples

Include snippets only when they make a concept easier.

Good candidates:

- EventBridge event pattern
- IAM deny policy
- S3 Object Lock example
- KMS key policy fragment
- CloudTrail event
- GuardDuty finding fields

Keep snippets short and exam-oriented.

### 5.9 Practice Set

End with original mini questions.

Use:

- Multiple choice
- Multiple response
- Ordering
- Matching

SCS-C03 includes ordering and matching questions, so every domain guide should train those formats.

### 5.10 Final Checklist

End with a last-day revision checklist.

The checklist should be short, direct, and exam-focused.

---

## 6. Writing Style Rules

- Use simple words first.
- Define every service before using exam shorthand.
- Avoid unexplained jargon.
- Prefer "what it does" before "when to choose it."
- Explain traps gently and directly.
- Use tables only when they make comparison easier.
- Use examples whenever a concept feels abstract.
- Avoid giant paragraphs.
- Use headings so the user can skim.
- Do not claim "this will appear in the exam."
- Say "high-signal," "repeated pattern," or "probable style" instead.

---

## 7. Quality Checklist Before Finishing A Guide

Run these checks:

```bash
wc -l outputs/<guide-file>.md
rg -n "TODO|TBD|undefined|FIXME" outputs/<guide-file>.md
sed -n '1,120p' outputs/<guide-file>.md
tail -80 outputs/<guide-file>.md
```

Manual review checklist:

- Does the guide start with service/component explanation?
- Are official AWS references listed?
- Does it map to the official SCS-C03 domain tasks?
- Does it include high-yield repeated concepts?
- Does it include real-world examples?
- Does it include diagrams?
- Does it include JSON/policy/event examples where helpful?
- Does it include traps and decision trees?
- Does it include a mini practice set?
- Is it readable without opening the website?

---

## 8. Reusable Guide Skeleton

```markdown
# AWS Security Specialty SCS-C03 <Topic> Study Guide

Generated: YYYY-MM-DD

This guide is exam-focused...

## 0. AWS Component Primer: What Each Service Does First

Official references used:

- ...

### 0.1 Service Name

Plain English:

Real-world example:

Simple flow:

Exam angle:

Trap:

## 1. What This Domain Means In The Exam

## 2. High-Return Topics From The Question Signals

## 3. The Core Mental Model

## 4. Service Selection Decision Trees

## 5. Common Exam Scenarios

## 6. Automation And Organization-Wide Patterns

## 7. Common Traps

## 8. Memory Tables

## 9. Worked Examples

## 10. Mini Practice Set

## 11. Final Checklist
```

---

## 9. Topic-Specific Reminder From Detection

For Detection, the strongest improvement came from adding the component primer:

- CloudTrail before CloudTrail Lake
- CloudWatch before Logs Insights
- VPC Flow Logs before GuardDuty network findings
- GuardDuty before EventBridge automation
- Security Hub before Detective
- Security Lake before OCSF decision questions
- Macie and Inspector as specialized detection services

For every future topic, repeat this pattern:

```text
Service meaning first
Real-world usage second
Exam selection rule third
Trap fourth
```

That order keeps the guide readable and prevents the material from becoming a memorization-only list.

