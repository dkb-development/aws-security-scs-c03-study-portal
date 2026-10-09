# AWS Security Specialty SCS-C03 Identity And Access Management Study Guide

Beginner links for this topic:

- [IAM](00-aws-security-foundations-for-beginners.md#iam), [Principal Action Resource Condition](00-aws-security-foundations-for-beginners.md#principal-action-resource-condition), [Default Deny Explicit Allow Explicit Deny](00-aws-security-foundations-for-beginners.md#default-deny-explicit-allow-explicit-deny)
- [Identity-Based Policy](00-aws-security-foundations-for-beginners.md#identity-based-policy), [Resource-Based Policy](00-aws-security-foundations-for-beginners.md#resource-based-policy), [IAM Role](00-aws-security-foundations-for-beginners.md#iam-role), [Trust Policy](00-aws-security-foundations-for-beginners.md#trust-policy), [STS](00-aws-security-foundations-for-beginners.md#sts)
- [Permissions Boundary](00-aws-security-foundations-for-beginners.md#permissions-boundary), [Session Policy](00-aws-security-foundations-for-beginners.md#session-policy), [SCP](00-aws-security-foundations-for-beginners.md#scp), [RCP](00-aws-security-foundations-for-beginners.md#rcp)
- [IAM Identity Center](00-aws-security-foundations-for-beginners.md#iam-identity-center), [Amazon Cognito](00-aws-security-foundations-for-beginners.md#amazon-cognito), [Amazon Verified Permissions](00-aws-security-foundations-for-beginners.md#amazon-verified-permissions), [ABAC](00-aws-security-foundations-for-beginners.md#abac), [External ID](00-aws-security-foundations-for-beginners.md#external-id), [IAM Access Analyzer](00-aws-security-foundations-for-beginners.md#iam-access-analyzer)
- [IAM Roles Anywhere](00-aws-security-foundations-for-beginners.md#iam-roles-anywhere), [Session Tags and Revoking Role Sessions](00-aws-security-foundations-for-beginners.md#session-tags-and-revoking-role-sessions), [S3 Presigned URLs](00-aws-security-foundations-for-beginners.md#s3-presigned-urls), [Directory Service, AD Connector, and AWS Managed Microsoft AD](00-aws-security-foundations-for-beginners.md#directory-service-ad-connector-and-aws-managed-microsoft-ad)

Generated: 2026-10-06

This guide is exam-focused. It is based on the question bank and topic signals collected in this workspace, official AWS documentation, and original synthesis. It does not contain copied real exam questions, paid course content, or dumps.

Use it as a reverse-engineered study path: learn the IAM patterns that appear repeatedly, then practice the related questions in the portal.

---

## Guided Learning Path

Reviewed: 2026-10-09. Read these connected lessons first; the component reference and revision questions below remain available for lookup. Priorities reflect study needs, not a prediction of live exam questions.

| Reading pass | What you will be able to explain |
| --- | --- |
| [A: Identity to request](#a-follow-one-request-from-sign-in-to-s3) | Authentication, credentials, authorization, and audit identity |
| [B: Policy reasoning](#b-reason-about-permissions-without-a-false-universal-formula) | Grants, restrictions, resource-policy exceptions, and cross-account access |
| [C: Temporary trust](#c-build-trust-without-creating-an-escalation-path) | Role assumption, third parties, service access, and delegation |
| [D: Federation and applications](#d-choose-the-right-identity-system) | Workforce sign-in, customer tokens, and application authorization |
| [E: Attributes and diagnosis](#e-use-attributes-and-evidence-to-control-access) | Tag authority, least privilege, and AccessDenied investigations |
| [F: Scenario workshop](#f-iam-scenario-workshop) | Apply the rules to competing requirements |

## A. Follow One Request From Sign-In To S3

### Three Questions, Not One

A developer signing in successfully has proved an identity. That does not establish permission to read every object. [IAM](00-aws-security-foundations-for-beginners.md#iam) evaluates individual operations, not whether the person deserves a general label such as "trusted employee."

```text
Company login              Prove who the person is
      |
Account + role selection   Obtain temporary credentials
      |
Signed GetObject request   Identify this request's principal
      |
Policy evaluation         Decide whether this action is allowed
      |
S3 / KMS operations       Other relevant permissions may apply
```

**Credentials** are the evidence used to authenticate a request. Temporary AWS credentials contain an access key ID, a secret access key, and a session token. SDKs normally obtain and refresh them through their credential providers; applications should not embed a developer's permanent key.

**Authorization** checks the action, resource, caller, and conditions. A role can list a bucket but fail to read an object because `s3:ListBucket` uses the bucket ARN while `s3:GetObject` uses an object ARN. SSE-KMS adds a separate key-use requirement; S3 permission is not a substitute for KMS permission.

**Audit identity** helps you trace what happened. A role is the reusable definition; a role session is one temporary use of it. See [roles, sessions, and requests](00-aws-security-foundations-for-beginners.md#roles-sessions-and-policy-requests) before interpreting these two names:

```text
Role:    arn:aws:iam::111122223333:role/ReportReader
Session: arn:aws:sts::111122223333:assumed-role/ReportReader/job42
```

A useful investigation captures the actual principal, API operation, object/key ARN, account, Region, timestamp, and request ID. Looking only at the policy attached to the human who started the workflow can miss the role that actually called S3.

### Verification Before Changing Permissions

Use `sts:GetCallerIdentity` to check the credentials the tool is using. Check the service error and the relevant CloudTrail events where recorded. Object-level S3 operations require appropriate data-event logging; absence from management-event history is not proof no request happened.

Then reproduce the smallest failing operation. A console page may call several APIs, so "the console is broken" is a less useful symptom than "GetObject fails for this object using this session."

## B. Reason About Permissions Without A False Universal Formula

### Separate Grants From Restrictions

An identity policy can give a role permission. A resource policy can give a specified principal permission to a resource. A [permissions boundary](00-aws-security-foundations-for-beginners.md#permissions-boundary) limits grants made through identity policies; it does not itself give access.

A session policy narrows a temporary session's identity-derived permissions. An SCP limits covered member-account principals. An RCP limits access to covered resources. A trust policy answers who may assume a role, not what the resulting role may do to S3.

```text
First identify the request and its grant path
        |
        +-- Identity-policy permission?
        +-- Resource-policy permission?
        +-- Cross-account relationship?
        |
Then apply the restrictions relevant to that path
        |
Any applicable explicit deny -> request denied
```

This is a reasoning model, not an implementation-order diagram. Service-specific rules still matter. KMS key-policy authorization, for example, must be understood explicitly rather than treating it as an ordinary S3 bucket policy.

### The Common Identity-Policy Case

Suppose a deployment role's identity policy allows `s3:GetObject` and `ec2:TerminateInstances`. Its boundary permits only S3 operations. Through that identity-policy path, the S3 read can succeed and termination cannot. Adding another identity-policy allow for termination changes nothing until the limiting boundary permits it.

If an SCP explicitly denies the S3 read for that principal, neither a broader identity policy nor the account's administrator policy overrides the deny. First determine whether the organizational policy actually applies to the principal/resource in the question.

### The Resource-Policy Exception You Must Recognize

Within the same account, **what the resource policy names** can change which implicit restrictions apply:

| Direct recipient of a resource-policy grant | Important implicit-deny behavior |
| --- | --- |
| IAM user ARN | Missing identity/boundary allows do not limit this grant |
| IAM role ARN | Boundary and session-policy limits still matter |
| Assumed-role session ARN | Missing identity, boundary, or session allows do not limit this direct session grant |

An explicit deny still wins. Applicable organization controls and service rules do not disappear. This is not a recommendation to bypass boundaries with session grants; it explains why a boundary is not a universal substitute for careful resource policies. [AWS boundary evaluation details](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html).

Avoid a resource-policy `Deny` with `NotPrincipal` when principals have boundaries: it can reject them unexpectedly. AWS documents using an appropriate `aws:PrincipalArn` condition instead. Review the exact condition semantics, not just the policy's apparent English meaning.

### Two Different Cross-Account Designs

```text
Design 1: assume a role in account B
Caller in A -> STS permission + B role trust
           -> temporary B role -> B resource permissions

Design 2: access B resource directly as an A principal
A identity authorization + B resource authorization
           -> resource request remains from A principal
```

In Design 1, assumption success does not imply the resulting role can read the bucket. In Design 2, adding only a bucket-side allow is insufficient for the usual cross-account identity/resource authorization model. Apply relevant restrictions on both sides and additional KMS permissions for encrypted content. [AWS policy evaluation](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html).

## C. Build Trust Without Creating An Escalation Path

### Vendor Access And The Confused Deputy

A monitoring vendor serves many customers from its AWS account. Without customer-specific trust conditions, one customer might persuade the vendor to use another customer's role. An [external ID](00-aws-security-foundations-for-beginners.md#external-id) distinguishes the intended customer relationship.

The customer trusts the appropriate vendor principal and requires the unique external ID assigned for that customer. It is not a password or MFA factor. The vendor must not let a customer choose another customer's identifier. Inspect the caller permission, trust policy, and external-ID value when assumption fails.

Service-to-service access is a different case. A resource policy for an AWS service may use supported `aws:SourceArn` and `aws:SourceAccount` conditions to restrict which source resource can trigger access. Do not substitute an external ID for every service confused-deputy control. [AWS confused-deputy guidance](https://docs.aws.amazon.com/IAM/latest/UserGuide/confused-deputy.html).

### Passing A Role Is Powerful

`iam:PassRole` lets a caller assign an IAM role to an AWS service in supported workflows. It is not the same as calling `sts:AssumeRole` personally. A developer allowed to launch Lambda with a highly privileged execution role may gain those capabilities through function code.

```text
Developer can create function + pass AdminRole
       |
Function executes as AdminRole
       |
Developer-controlled code uses AdminRole permissions
```

Scope PassRole to approved roles and, where supported, `iam:PassedToService`. Restrict edits to approved roles, boundaries, and deployment paths. Requiring a boundary at creation is incomplete if the developer can later remove it, replace it, or pass an unbounded role. [PassRole documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_passrole.html).

IAM paths such as `/application/` organize names. They become useful permission scopes only when policies deliberately reference the relevant ARNs; the path alone does not create isolation.

### Presigned URLs Are Delegated Requests

A [presigned URL](00-aws-security-foundations-for-beginners.md#s3-presigned-urls) lets another person perform the signed operation using the signer's authorization. Treat possession of it as sensitive: it is not automatically single-use, and it is not a separate public bucket permission.

Its useful lifetime is limited by both its configured expiration and the credentials that signed it. A URL signed with a temporary role session can stop working when that session expires, even when the requested URL duration was longer. Policies and object availability can also deny the request. [S3 presigned URL behavior](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html).

## D. Choose The Right Identity System

### Employees Entering AWS Accounts

[IAM Identity Center](00-aws-security-foundations-for-beginners.md#iam-identity-center) combines a workforce identity source with account assignments and permission sets. A permission set describes AWS permissions; provisioning makes the associated roles available in assigned accounts.

```text
Identity provider -> user/group in Identity Center
                  -> account + permission-set assignment
                  -> provisioned role -> temporary session
```

Troubleshoot each stage separately. A successful company login with no account tile suggests assignment or group synchronization issues. An account tile followed by AccessDenied suggests the provisioned permissions, current session, or other policy layers. Changing group membership does not magically rewrite every already issued credential.

Directory Service answers a different integration need. AD Connector forwards directory requests to existing Active Directory; AWS Managed Microsoft AD provides a managed directory. Neither is simply another name for an Identity Center permission set. [Identity Center permission sets](https://docs.aws.amazon.com/singlesignon/latest/userguide/permissionsetsconcept.html).

### Customers Entering Your Application

A Cognito user pool authenticates application users and issues tokens. A token is a signed set of claims, such as who the user is and when authentication expires. It is not an AWS secret access key.

A Cognito identity pool can exchange supported identity-provider evidence for temporary AWS credentials. An application can instead keep AWS access on its backend and never give customers AWS credentials at all.

```text
Customer -> user pool -> token -> API backend
                                  |
                                  +-- validate token
                                  +-- authorize tenant/action
                                  +-- access AWS as backend role

Alternative: identity pool -> scoped temporary AWS credentials
```

Validate token signature, issuer, expiration, expected client/audience as appropriate to token type, and intended use. Decoding a JWT without validating it is not authentication. Do not trust a client-supplied tenant ID merely because the client has a valid token. [Cognito token verification](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html).

[Verified Permissions](00-aws-security-foundations-for-beginners.md#amazon-verified-permissions) evaluates application authorization policies, such as whether an employee may approve a particular expense. Your application must supply trustworthy identity/resource context and enforce the answer. It does not replace the Lambda execution role's AWS API permissions.

### Workloads Outside AWS

[IAM Roles Anywhere](00-aws-security-foundations-for-beginners.md#iam-roles-anywhere) lets an external workload use an X.509 certificate to obtain temporary role credentials. A trust anchor identifies a trusted certificate authority; a profile limits available roles/session settings; the role trust and permissions still apply.

Keep the certificate's private key protected. Short-lived AWS credentials do not solve theft of the long-lived credential used to renew them. Design certificate revocation and trust changes as well as session expiration. [Roles Anywhere trust model](https://docs.aws.amazon.com/rolesanywhere/latest/userguide/trust-model.html).

## E. Use Attributes And Evidence To Control Access

### ABAC Needs Trustworthy Tags

Role-based access control assigns permissions by role, such as Auditor. [ABAC](00-aws-security-foundations-for-beginners.md#abac) uses attributes, such as Project=Billing. It scales when new resources can follow a tagging convention instead of requiring a new policy for every resource.

Here is an **illustrative statement**, not a complete authorization design, for reading existing tagged S3 objects:

```json
{
  "Effect": "Allow",
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::example-project-records/*",
  "Condition": {
    "StringEquals": {
      "s3:ExistingObjectTag/Project": "${aws:PrincipalTag/Project}"
    }
  }
}
```

Read it as: this GetObject allow applies when the stored object's Project tag matches the authenticated principal's Project tag. It does not grant ListBucket, upload, or deletion. S3 action-specific tag keys are not interchangeable with a generic resource-tag key. [S3 object-tag conditions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/tagging-and-policies.html).

**The attack to prevent:** a Billing user changes their session tag to Payroll or retags the target object. Control who sets identity-provider attributes, `sts:TagSession`, allowed tag keys/values, and object-tag modifications. Missing or mismatched tags need negative tests, not just a successful Billing-to-Billing test.

### A Repeatable AccessDenied Investigation

1. Capture the exact caller/session and failing API/resource.
2. Determine whether role assumption failed or a later resource request failed.
3. Identify identity/resource grants and the account relationship.
4. Check applicable explicit denies, boundaries, session limits, organization controls, and endpoint policies.
5. Check action-specific conditions, resource ARN forms, encryption permissions, and service state.
6. Test the narrow fix and an intentional denial; inspect resulting evidence.

IAM policy simulation helps evaluate candidate policies but is not a universal reproduction of every live service request or cross-account context. Missing context values and unsupported cases can change the result. Do not respond to a simulator allow by automatically deleting production guardrails. [Simulator limitations](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_testing-policies.html).

Access Analyzer has distinct jobs: analyze external access, identify unused access where configured, validate policies, and generate a policy based on supported recorded activity. A generated policy reflects observed use, not every legitimate monthly or disaster-recovery action. Test the reduced policy against the application's full lifecycle before deployment. [Access Analyzer capabilities](https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html).

## F. IAM Scenario Workshop

### Workshop 1: A Role Assumes Successfully But Cannot Read

**Situation:** An auditor in account A assumes AuditRead in B. The STS call succeeds. GetObject in B fails. The bucket uses SSE-KMS, and the role already has an effective S3 read permission with no S3 deny.

**Decision:** Which investigation is most useful next?

- A. Add the auditor's user ARN to the role trust policy again.
- B. Inspect key policy, role KMS permissions, and key state for the object's key.
- C. Give the auditor an IAM access key instead of STS credentials.

**Answer: B.** Successful assumption already demonstrates that the trust path worked for this session. S3 authorization does not guarantee decryption authorization. A repeats a completed step; C changes credential type without fixing key access. Verify the actual encryption key, not just the bucket's current default.

### Workshop 2: Delegation Escapes A Boundary

**Situation:** Developers create roles only when a designated boundary is present. They can also remove that boundary and pass any role to Lambda. Management believes the creation condition prevents privilege escalation.

**Decision:** Choose two controls to add.

- A. Prevent unauthorized boundary removal/replacement and edits to the boundary policy.
- B. Restrict PassRole to approved roles and intended services.
- C. Rename all roles under `/safe/` without changing permissions.

**Answer: A and B.** A protects the limit after creation. B closes the route through privileged service execution. C is naming only; policy enforcement must actually refer to the allowed resources. Test creation, later modification, and role assignment as separate operations.

### Workshop 3: Temporary Link Fails Early

**Situation:** A backend assumes a one-hour role session and signs an S3 download URL requesting a longer duration. The recipient downloads successfully immediately but receives an error later. No object or bucket policy changed.

**Decision:** What should be checked first?

- A. The expiration of the credentials that signed the URL.
- B. Whether the recipient created an IAM user.
- C. Whether the bucket should be made public.

**Answer: A.** The URL cannot extend the underlying credential lifetime. B is unnecessary for the delegated request; C discards the private-access requirement. Renew links through the authorized backend rather than distributing permanent signing keys.

### Workshop 4: Valid Token, Wrong Customer's Data

**Situation:** A SaaS API validates Cognito token signatures but reads the tenant ID from a request parameter. A customer changes that parameter and reads another tenant's invoice. The backend role legitimately reads the shared table.

**Decision:** Which change addresses the defect?

- A. Add tenant/resource authorization using trusted identity context on every protected operation.
- B. Increase the backend role's session duration.
- C. Move from user-pool tokens to an unrestricted identity-pool role.

**Answer: A.** Authentication succeeded; application authorization failed. Verified Permissions can centralize the decision if the application supplies trusted context and enforces the result. B is unrelated. C moves broad credentials to the client and does not establish tenant isolation.

### Workshop 5: Matching Tags Do Not Prove Isolation

**Situation:** A company authorizes object reads by Project tag. A developer may freely set session tags and modify object tags. All positive tests pass: Billing-tagged users can read Billing objects.

**Decision:** What missing test exposes the main risk?

- A. Attempt to set another project's identity tag or change a target object's tag, then read it.
- B. Increase object size and repeat the same authorized read.
- C. Add another Allow for the same matching tags.

**Answer: A.** Authorization depends on attributes; control of those attributes can become control of permission. B tests data size, not isolation. C cannot repair an untrusted attribute source. Also test missing tags and unsupported action/condition combinations.

### Workshop 6: Diagnose In The Right Order

**Situation:** A deployment started failing after a pipeline identity change. The team proposes attaching AdministratorAccess everywhere. CloudTrail shows the failure at AssumeRole rather than during deployment.

**Decision:** Put the investigation in a useful order.

```text
Identify actual caller -> inspect caller STS permission
 -> inspect target trust and conditions -> test assumption
 -> inspect resulting role permissions for deployment
```

**Reasoning:** The new identity must first qualify to assume the role. Changing the role's downstream S3/CloudFormation permissions cannot repair failed assumption. After assumption works, separately test deployment operations and guardrails. Do not confuse fixing authentication/trust with authorizing every later action.

## G. IAM Readiness And Objective Map

| Official skill | Teaching and demonstration |
| --- | --- |
| 4.1.1 Authentication methods | A/D; distinguish workforce, customers, workloads and MFA/IdP controls in the reference |
| 4.1.2 Temporary credentials | A/C/D; workshop 3 and STS/session reference |
| 4.1.3 Authentication troubleshooting | A/D/F6; identify failure before or after session issuance |
| 4.2.1 Authorization controls | B/C/D; cross-account, trust, paths, Roles Anywhere and app policy |
| 4.2.2 ABAC and RBAC | E/F5; test attribute ownership, not just equality |
| 4.2.3 Least privilege and limits | B/C/E/F2; distinguish grants and constraints |
| 4.2.4 Authorization troubleshooting | E/F1/F6; live evidence and simulation limits |
| 4.2.5 Unintended permissions | B/C/E/F4; correct resource grants, escalation and tenant access |

Use the [official Domain 4 objectives](https://docs.aws.amazon.com/aws-certification/latest/security-specialty-03/security-specialty-03-domain4.html) as the coverage baseline. You are ready when you can identify the actual principal, draw its trust and permission paths, explain a denied request, and test both intended and unintended access without granting administrator permissions as a shortcut.

---

## 0. AWS Component Primer: What Each Service Does First

This section explains the AWS components in simple words before going into exam decision rules.

Official references used for service meaning:

- SCS-C03 Identity and Access Management domain: https://docs.aws.amazon.com/aws-certification/latest/security-specialty-03/security-specialty-03-domain4.html
- IAM permissions boundaries: https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html
- AWS Organizations SCPs: https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html
- AWS Organizations RCPs: https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_rcps.html
- IAM roles: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html
- External ID for third-party role access: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_common-scenarios_third-party.html
- Temporary security credentials and STS: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp.html
- Revoke IAM role sessions: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_revoke-sessions.html
- IAM session tags: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_session-tags.html
- IAM Identity Center: https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html
- Amazon Cognito: https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html
- Amazon Verified Permissions: https://docs.aws.amazon.com/verifiedpermissions/latest/userguide/what-is-avp.html
- IAM Roles Anywhere: https://docs.aws.amazon.com/rolesanywhere/latest/userguide/introduction.html
- IAM Access Analyzer: https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html
- S3 presigned URLs: https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html

I am using text diagrams instead of screenshots because AWS console screens change often. Text diagrams are searchable, easy to revise, and work offline.

---

### 0.1 IAM In AWS: What It Means

IAM is the AWS system for authentication and authorization.

Plain English:

> IAM answers two questions: who are you, and what are you allowed to do?

Real-world example:

A developer signs in through the company identity provider. They choose an AWS account and a permission set. AWS gives them temporary role credentials. Those credentials can deploy to a dev account, but cannot delete production KMS keys because an SCP blocks that action.

Simple flow:

```text
Human / application / workload
      |
      v
Authentication: prove identity
      |
      v
Temporary or long-term credentials
      |
      v
Authorization: evaluate policies
      |
      v
Allow or deny AWS API call
```

Exam angle:

IAM questions usually test:

- policy evaluation order
- explicit deny
- SCP vs RCP
- permission boundary vs session policy
- trust policy vs permissions policy
- workforce identity vs customer identity
- temporary credentials vs long-term access keys
- app-level authorization vs AWS API authorization

---

### 0.2 IAM Policy Evaluation: The Core Exam Engine

Policy evaluation is how AWS decides whether a request is allowed.

Plain English:

> A request is allowed only when every required layer permits it and no applicable layer explicitly denies it.

The most important rule:

```text
Explicit Deny wins.
```

Simple flow:

```text
Request
  |
  v
Is there an applicable explicit deny?
  |
  +-- yes -> Deny
  |
  +-- no
       |
       v
Do the required policy layers allow it?
       |
       +-- yes -> Allow
       +-- no  -> Deny
```

Exam angle:

If the question says:

```text
Identity policy allows, but SCP denies
```

Answer:

```text
Deny.
```

If the question says:

```text
SCP allows, but no applicable identity or resource policy grants access
```

Answer:

```text
Deny.
```

Why:

SCPs do not grant permissions. They only set maximum permissions.

---

### 0.3 Identity-Based Policies

Identity-based policies attach to IAM users, groups, or roles.

Plain English:

> An identity policy says what this user or role can do.

Example:

```json
{
  "Effect": "Allow",
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::example-bucket/*"
}
```

Real-world example:

An application role needs read-only access to one S3 bucket. Attach an identity policy to the role allowing `s3:GetObject` on that bucket.

Exam angle:

Identity policies are common but rarely sufficient alone. The final decision may also depend on:

- SCP
- RCP
- permission boundary
- session policy
- resource policy
- KMS key policy
- VPC endpoint policy
- explicit deny

---

### 0.4 Resource-Based Policies

Resource-based policies attach to resources.

Plain English:

> A resource policy says who can access this resource.

Examples:

- S3 bucket policy
- KMS key policy
- SNS topic policy
- SQS queue policy
- Lambda function resource policy
- IAM role trust policy

S3 bucket policy example:

```json
{
  "Effect": "Allow",
  "Principal": {
    "AWS": "arn:aws:iam::111122223333:role/AppRole"
  },
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::example-bucket/*"
}
```

Exam angle:

Choose resource policy when:

- access is granted from the resource side
- cross-account resource access is needed
- S3/SQS/SNS/Lambda/KMS resource access is being controlled

Trap:

For KMS customer managed keys, the key policy is a required layer. IAM permission alone is not enough unless the key policy enables that path.

---

### 0.5 IAM Role Trust Policy

A trust policy controls who can assume a role.

Plain English:

> A trust policy answers: who is allowed to become this role?

Example:

```json
{
  "Effect": "Allow",
  "Principal": {
    "AWS": "arn:aws:iam::111122223333:root"
  },
  "Action": "sts:AssumeRole"
}
```

Real-world example:

A CI/CD account assumes a deployment role in a workload account. The workload account role trust policy must trust the CI/CD principal.

Simple flow:

```text
Principal wants to assume role
      |
      v
Role trust policy allows principal?
      |
      +-- no -> AssumeRole denied
      |
      +-- yes
             |
             v
Does principal have permission to call sts:AssumeRole?
             |
             +-- yes -> temporary role session
```

Exam angle:

For cross-account AssumeRole, both sides matter:

- target role trust policy allows the source principal
- source principal has permission to call `sts:AssumeRole`

Trap:

An identity policy granting S3 permissions does not let you assume a role. AssumeRole requires trust plus `sts:AssumeRole` permission.

---

### 0.6 AWS STS: Temporary Credentials

AWS Security Token Service issues temporary security credentials.

Plain English:

> STS gives short-lived credentials instead of long-lived access keys.

Common STS patterns:

- `AssumeRole`
- `AssumeRoleWithSAML`
- `AssumeRoleWithWebIdentity`
- `GetSessionToken`
- federated access
- cross-account access

Simple flow:

```text
User / app / IdP token
      |
      v
STS
      |
      v
Temporary access key + secret + session token
      |
      v
AWS API calls until expiration
```

Exam angle:

Choose STS when:

- temporary credentials
- cross-account role assumption
- federation
- avoid long-term keys
- workload outside AWS needs short-lived access

Trap:

Temporary credentials can remain usable until expiration unless you revoke sessions or block old sessions with a deny condition.

---

### 0.7 Revoking Role Sessions

Role sessions can be revoked by denying sessions issued before a timestamp.

Plain English:

> If a role session is compromised, block old sessions and force users/apps to get fresh credentials.

Example deny pattern:

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

Real-world example:

An attacker stole temporary credentials from a role session. You fixed the role policy, but old credentials are still valid. Add the revoke-session deny policy so old sessions fail.

Exam angle:

If the question says:

```text
Temporary role credentials compromised
```

Think:

```text
Revoke sessions / deny older sessions with aws:TokenIssueTime.
```

Trap:

Rotating an IAM user's access key does not revoke an already-issued role session.

---

### 0.8 Permission Boundaries

A permission boundary sets the maximum permissions for an IAM user or role.

Plain English:

> A boundary is a ceiling. It does not grant permission by itself.

Example:

```text
Identity policy: allows *
Boundary: allows only s3:*
Effective result: only s3:* can be allowed
```

Simple diagram:

```text
Identity policy allows
        |
        v
Permission boundary allows?
        |
        +-- yes -> maybe allowed
        +-- no  -> denied
```

Real-world example:

A platform team lets developers create IAM roles, but every role must have a boundary that prevents access outside approved services.

Exam angle:

Choose permission boundaries when:

- delegated IAM administration
- developers can create roles/users
- created roles must never exceed a maximum
- limit what identity policies can grant

Trap:

The boundary alone does not grant access. The identity still needs an identity policy that allows the action.

---

### 0.9 Session Policies

Session policies limit permissions for a specific temporary session.

Plain English:

> A session policy is a temporary permissions filter applied when creating a role or federated session.

Example:

```text
Role allows: s3:GetObject, s3:PutObject
Session policy allows: s3:GetObject only
Effective session: s3:GetObject only
```

Exam angle:

Choose session policies when:

- broker creates short-lived sessions
- reduce permissions for one session
- temporary task should get narrower permissions than the role normally has

Trap:

Session policies cannot add permissions. They only reduce permissions.

---

### 0.10 AWS Organizations SCPs

SCPs set maximum permissions for IAM principals in member accounts.

Plain English:

> SCPs control what identities in member accounts are allowed to do at most.

Real-world example:

No one in any production account should disable CloudTrail or delete KMS keys. Attach an SCP deny to the production OU.

Simple flow:

```text
IAM principal in member account
      |
      v
SCP allows this action?
      |
      +-- no -> Deny
      +-- yes
             |
             v
IAM/resource policies still must allow
```

Exam angle:

SCPs:

- do not grant permissions
- apply to member accounts, including member-account root users
- do not affect the management account
- do not affect service-linked roles
- are often used as preventive guardrails

Trap:

If an SCP denies an action, `AdministratorAccess` in the account does not override it.

---

### 0.11 AWS Organizations RCPs

RCPs set maximum permissions for resources in member accounts.

Plain English:

> SCPs guard what your principals can do. RCPs guard who can access your resources.

Real-world example:

Your organization wants S3 buckets in member accounts to be inaccessible to principals outside the organization, even if a bucket policy accidentally allows them.

Simple flow:

```text
External principal requests your resource
      |
      v
RCP allows access to this resource?
      |
      +-- no -> Deny
      +-- yes
             |
             v
Resource/IAM policies still must allow
```

Exam angle:

Choose RCP when:

- resource-side data perimeter
- restrict external principals accessing resources in your organization
- protect resources even if resource policy is broad

Choose SCP when:

- restrict principals in your accounts from taking actions
- prevent outbound behavior from your accounts

Trap:

RCPs do not control outbound access by your principal to someone else's resource. Use SCP/IAM for that.

---

### 0.12 IAM Identity Center: Workforce Access

IAM Identity Center manages workforce access to AWS accounts and applications.

Plain English:

> Identity Center is for employees and workforce users accessing AWS accounts and AWS applications.

Real-world example:

Your company uses Okta or Azure AD as the identity provider. Employees should access many AWS accounts with centrally assigned permission sets.

Simple flow:

```text
External IdP / Identity Center directory
      |
      v
IAM Identity Center
      |
      v
Permission sets
      |
      v
AWS account assignments
      |
      v
Temporary role credentials
```

Exam angle:

Choose IAM Identity Center when:

- workforce/employee access
- multi-account AWS access
- permission sets
- external SAML/OIDC identity provider
- centralized user/group assignments
- AWS access portal

Trap:

Identity Center is not usually the right answer for customer sign-up/sign-in in a mobile app. That is Cognito.

---

### 0.13 Amazon Cognito: App User Identity

Cognito is identity for web and mobile apps.

Plain English:

> Cognito is for application users, such as customers signing in to your app.

Two main pieces:

| Cognito component | What it does |
|---|---|
| User pool | Authenticates app users and issues JWTs |
| Identity pool | Gives app users temporary AWS credentials through STS |

Simple flow:

```text
User signs in
      |
      v
Cognito user pool
      |
      v
JWT tokens
      |
      +--> app/API authorization
      |
      v
Cognito identity pool, if AWS credentials are needed
      |
      v
STS temporary credentials
```

Exam angle:

Choose Cognito when:

- customer-facing app
- mobile/web sign-up and sign-in
- JWT tokens
- social login
- user pools
- identity pools
- app users need temporary AWS credentials

Trap:

User pools issue JWTs. Identity pools issue temporary AWS credentials.

---

### 0.14 Amazon Verified Permissions: App-Level Authorization

Verified Permissions is for fine-grained application authorization using Cedar policies.

Plain English:

> Verified Permissions answers questions inside your app, such as "Can this user approve this invoice?"

Real-world example:

A retail app needs rules like:

```text
Store managers can approve refunds only for their own store.
Regional managers can approve refunds for stores in their region.
```

Simple flow:

```text
Application
  |
  v
Authorization question:
Can principal do action on resource?
  |
  v
Verified Permissions policy store
  |
  v
Allow or deny
```

Exam angle:

Choose Verified Permissions when:

- app-level authorization
- fine-grained business permissions
- Cedar policies
- authorization is inside the application, not AWS API access

Trap:

Verified Permissions does not replace IAM for AWS API authorization. IAM controls access to AWS services.

---

### 0.15 ABAC: Attribute-Based Access Control

ABAC uses attributes, usually tags, to make access decisions.

Plain English:

> ABAC lets matching attributes decide access, such as project tag equals project tag.

Real-world example:

Developers tagged with `Project=Alpha` can access only resources tagged `Project=Alpha`.

Example policy idea:

```json
{
  "Effect": "Allow",
  "Action": "s3:*",
  "Resource": "*",
  "Condition": {
    "StringEquals": {
      "s3:ExistingObjectTag/Project": "${aws:PrincipalTag/Project}"
    }
  }
}
```

Exam angle:

Choose ABAC when:

- access based on tags or attributes
- many projects/teams
- avoid creating one role per project
- use `aws:PrincipalTag`, `aws:ResourceTag`, session tags, or IdP attributes

Trap:

ABAC needs tag governance. If users can freely change tags, they may escalate access.

---

### 0.16 Session Tags

Session tags attach attributes to temporary sessions.

Plain English:

> Session tags carry identity attributes into AWS permissions decisions.

Real-world example:

Your IdP sends `Department=Finance` when a user federates. STS puts it into the session as a principal tag. IAM policies use that tag to allow access only to Finance resources.

Simple flow:

```text
Identity provider attribute
      |
      v
STS session tag
      |
      v
aws:PrincipalTag condition
      |
      v
ABAC decision
```

Exam angle:

Choose session tags when:

- federated attributes must drive IAM permissions
- ABAC with temporary sessions
- identity provider attributes map into AWS

Trap:

The trust policy must allow tagging where required, and tag keys/values should be controlled.

---

### 0.17 External ID: Confused Deputy Protection

External ID helps protect cross-account role access for third-party SaaS providers.

Plain English:

> External ID is a secret-ish customer-specific value that prevents one customer from tricking a SaaS provider into using another customer's role.

Real-world example:

A monitoring SaaS assumes a role in many customer accounts. The role trust policy requires the SaaS provider to include your unique external ID.

Trust policy shape:

```json
{
  "Effect": "Allow",
  "Principal": {
    "AWS": "arn:aws:iam::999988887777:role/SaaSProviderRole"
  },
  "Action": "sts:AssumeRole",
  "Condition": {
    "StringEquals": {
      "sts:ExternalId": "customer-unique-value"
    }
  }
}
```

Exam angle:

Choose External ID when:

- third-party SaaS assumes a role in your account
- confused deputy risk
- cross-account vendor access

Trap:

MFA is good for human access, but External ID is the classic confused-deputy control for third-party role assumption.

---

### 0.18 IAM Roles Anywhere

IAM Roles Anywhere lets workloads outside AWS use X.509 certificates to get temporary AWS credentials.

Plain English:

> Roles Anywhere is for servers outside AWS that need temporary AWS credentials without storing access keys.

Real-world example:

An on-premises application has a certificate from your private CA. It exchanges certificate-based identity for temporary AWS credentials to access S3.

Simple flow:

```text
On-prem workload with X.509 certificate
      |
      v
IAM Roles Anywhere
      |
      v
STS temporary credentials
      |
      v
AWS API calls
```

Exam angle:

Choose IAM Roles Anywhere when:

- workload runs outside AWS
- X.509 certificates
- avoid long-term access keys
- temporary credentials for servers/on-premises workloads

Trap:

For workforce users, think IAM Identity Center. For app customers, think Cognito. For non-AWS workloads with certificates, think IAM Roles Anywhere.

---

### 0.19 IAM Access Analyzer

IAM Access Analyzer helps find unintended access and improve policies.

Plain English:

> Access Analyzer is like a policy reasoning tool. It finds external access, unused access, and policy problems.

What it can help with:

- external access findings
- internal access analysis
- unused access findings
- policy validation
- custom policy checks
- policy generation from CloudTrail activity

Real-world example:

A bucket policy allows an external account. Access Analyzer generates a finding because the external account is outside your zone of trust.

Simple flow:

```text
Resource policy / IAM policy / access activity
      |
      v
IAM Access Analyzer
      |
      +--> external access finding
      +--> unused access finding
      +--> policy validation warning
      +--> generated least-privilege policy
```

Exam angle:

Choose Access Analyzer when:

- find public or cross-account resource access
- identify unused access
- validate IAM policies
- generate policies from CloudTrail activity
- troubleshoot unintended permissions

Trap:

Access Analyzer can flag risky-looking policies. Runtime controls such as RCPs or SCPs may still block access, but the finding can remain useful because the resource policy is broad.

---

### 0.20 S3 Presigned URLs

An S3 presigned URL grants temporary access to an object using the permissions of the signer.

Plain English:

> A presigned URL is a temporary link to an S3 object.

Real-world example:

A support portal lets a customer download one file for 15 minutes without making the bucket public.

Simple flow:

```text
Authorized signer
      |
      v
Creates presigned URL
      |
      v
User downloads object until URL expires
```

Exam angle:

Choose presigned URLs when:

- temporary S3 object access
- no AWS credentials for recipient
- time-limited download or upload

Trap:

The URL is only as powerful as the signer. If the signer cannot access the object, the presigned URL will not work.

---

### 0.21 Quick Component Map

| Need | Best-fit feature/service |
|---|---|
| Workforce access to many AWS accounts | IAM Identity Center |
| Customer app sign-up/sign-in | Cognito user pool |
| App user temporary AWS credentials | Cognito identity pool |
| Temporary AWS credentials | STS |
| Cross-account role access | IAM role + trust policy |
| Third-party SaaS confused deputy protection | External ID |
| Non-AWS workload with certificates | IAM Roles Anywhere |
| App-level business authorization | Verified Permissions |
| Tag/attribute-based AWS authorization | ABAC |
| Federated attributes in IAM decisions | Session tags |
| Maximum permissions for delegated IAM roles | Permission boundary |
| Reduce permissions for one role session | Session policy |
| Organization principal-side guardrail | SCP |
| Organization resource-side guardrail | RCP |
| Find external/unused access | IAM Access Analyzer |
| Temporary S3 object link | S3 presigned URL |
| Revoke old role sessions | `aws:TokenIssueTime` deny |

---

## 1. What This Domain Means In The Exam

Identity and Access Management is 20% of scored SCS-C03 content. It is the highest-weighted domain.

Official SCS-C03 task groups:

| Official task | Meaning in simple words |
|---|---|
| Task 4.1: Authentication strategies | How humans, applications, systems, and external identities prove who they are. |
| Task 4.2: Authorization strategies | How permissions are designed, evaluated, troubleshot, and corrected. |

Local question-bank signal:

| IAM cluster | Local question count |
|---|---:|
| Policy evaluation | 159 |
| Federation and temporary credentials | 127 |
| Total | 286 |

What this tells us:

- Policy evaluation is the heart of IAM for this exam.
- Federation and temporary credentials are almost equally important.
- SCP/RCP/boundary/session-policy questions are high-value.
- Identity Center vs Cognito vs Verified Permissions is a common service-selection pattern.
- Access Analyzer, External ID, ABAC, STS, and role-session revocation are repeated traps.

---

## 2. The Core Mental Model

Use this model:

```text
Authentication:
  Who are you?
  Identity Center, Cognito, STS, SAML/OIDC, MFA, Roles Anywhere

Authorization:
  What can you do?
  IAM policies, resource policies, trust policies, SCPs, RCPs,
  permission boundaries, session policies, ABAC, Verified Permissions

Troubleshooting:
  Why was it allowed or denied?
  Explicit deny, missing allow, wrong trust, boundary, SCP/RCP,
  KMS key policy, endpoint policy, Access Analyzer, CloudTrail
```

Short version:

```text
Prove identity -> get credentials -> evaluate all policy layers -> allow or deny
```

---

## 3. High-Return Topics From The Question Signals

| Priority | Topic | Why it matters | Exam action |
|---|---|---|---|
| Very high | Explicit deny and policy intersection | Most repeated IAM concept | Deny wins; allow must survive every required layer |
| Very high | SCPs | Common org-wide guardrail | SCP limits principals in member accounts; never grants |
| Very high | RCPs | Newer data perimeter control | RCP limits access to resources in member accounts |
| Very high | Permission boundaries | Delegated IAM admin pattern | Boundary is max permission, not a grant |
| High | Session policies | Temporary least-privilege session | Reduces permissions for one session |
| High | Trust policies | Cross-account and service role assumptions | Trust controls who can assume the role |
| High | STS temporary credentials | Federation/cross-account/workload access | Prefer temporary credentials over long-term keys |
| High | Identity Center | Workforce multi-account access | Permission sets and account assignments |
| High | Cognito | App user identity | User pools for JWTs, identity pools for AWS credentials |
| High | Verified Permissions | Fine-grained app authorization | Cedar app permissions, not AWS API permissions |
| High | ABAC/session tags | Scalable attribute-based access | Principal/resource tags and IdP attributes |
| High | Access Analyzer | Find external/unused access and policy issues | Use for findings, validation, generated policies |
| Medium-high | External ID | Third-party SaaS access | Confused deputy protection |
| Medium-high | Role-session revocation | Credential compromise response | Deny older sessions by `aws:TokenIssueTime` |
| Medium | Roles Anywhere | On-prem workload credentials | X.509 certificate-based temporary credentials |
| Medium | S3 presigned URLs | Temporary object access | Time-limited access using signer permissions |

---

## 4. Scenario 1: Policy Evaluation

This is the most important IAM exam scenario.

### Good Mental Model

```text
Identify principal + action + resource + account relationship
  -> find the applicable permission-grant path
  -> apply restrictions relevant to that path
  -> any applicable explicit deny wins
  -> evaluate service-specific requirements
```

For ordinary identity-derived permissions, boundaries and session policies intersect with identity permissions. Do not apply that formula universally to direct resource-policy grants: [Section B](#b-reason-about-permissions-without-a-false-universal-formula) explains same-account user, role, and role-session distinctions. Role trust matters at assumption time, not as a new grant for every subsequent S3 call.

### Simple Table

| Layer | Grants permissions? | Limits permissions? | Common exam phrase |
|---|---|---|---|
| Identity policy | Yes | Yes, with deny | Role/user has policy allowing action |
| Resource policy | Yes | Yes, with deny | Bucket/key/topic policy allows principal |
| Trust policy | Allows role assumption | Yes | Who can assume this role |
| Permission boundary | No | Yes | Maximum permissions for IAM entity |
| Session policy | No | Yes | Reduce temporary session permissions |
| SCP | No | Yes | Maximum permissions for member-account principals |
| RCP | No | Yes | Maximum permissions for organization resources |
| KMS key policy | Yes/required layer | Yes | IAM alone not enough for customer key |
| Endpoint policy | No, mostly filter | Yes | Private endpoint access is restricted |

### Example

```text
Role identity policy: allows s3:PutObject
Permission boundary: allows s3:*
SCP: denies s3:PutObject
Result: Deny
```

Why:

The SCP explicit deny wins.

---

## 5. Scenario 2: SCP vs RCP

### Simple Difference

```text
SCP = controls principals in your organization
RCP = controls resources in your organization
```

### Decision Table

| Requirement | Choose |
|---|---|
| Prevent member accounts from disabling GuardDuty | SCP |
| Prevent member-account root user from leaving approved Regions | SCP |
| Prevent organization S3 buckets from being accessed by external principals | RCP |
| Stop your principal from writing to an external account's bucket | SCP/IAM, not RCP |
| Protect your resources even if resource policy is too broad | RCP |

### Exam Trap

Question:

```text
An account in your organization calls PutObject to a bucket in an external account.
Can your organization's RCP block this outbound write?
```

Answer:

```text
No. RCPs protect your resources. Use SCP/IAM to control your principals' outbound actions.
```

---

## 6. Scenario 3: Permission Boundary vs Session Policy

### Permission Boundary

Use when you want a standing maximum for an IAM user or role.

```text
Developer-created roles must never exceed approved services.
```

Best answer:

```text
Require a permissions boundary on created roles.
```

### Session Policy

Use when you want a temporary session to be narrower.

```text
A broker assumes a role for one job and should allow only s3:GetObject for that session.
```

Best answer:

```text
Pass a session policy during AssumeRole.
```

### Comparison

| Feature | Permission boundary | Session policy |
|---|---|---|
| Attached to | IAM user/role | Temporary session |
| Duration | Persistent | Session lifetime |
| Grants access | No | No |
| Reduces access | Yes | Yes |
| Best for | Delegated administration | Per-session least privilege |

---

## 7. Scenario 4: Cross-Account Role Access

### Required Pieces

```text
Source principal:
  needs permission to call sts:AssumeRole

Target role:
  trust policy must trust source principal

Target role permissions:
  identity policy on role must allow actions after assumption
```

### Simple Diagram

```text
Account A principal
      |
      | sts:AssumeRole allowed?
      v
Account B role trust policy
      |
      | trusts Account A principal?
      v
Temporary credentials for Account B role
      |
      v
Role permissions decide what can be done
```

### Vendor Access

For third-party SaaS:

```text
Trust policy principal = vendor account/role
Condition = sts:ExternalId
```

### Exam Trap

Do not create IAM users with long-term keys for third-party SaaS if role assumption with External ID is available.

---

## 8. Scenario 5: Identity Center vs Cognito

### Easy Rule

```text
Employees accessing AWS accounts -> IAM Identity Center
Customers signing into your app  -> Amazon Cognito
```

### Comparison Table

| Requirement | Choose |
|---|---|
| Workforce access to AWS accounts | IAM Identity Center |
| Permission sets across many accounts | IAM Identity Center |
| External corporate IdP for employees | IAM Identity Center |
| Customer sign-up/sign-in for mobile app | Cognito user pool |
| App users need JWT tokens | Cognito user pool |
| App users need temporary AWS credentials | Cognito identity pool |
| Social login for app users | Cognito |

### Identity Center Flow

```text
Corporate IdP
   |
   v
IAM Identity Center
   |
   v
Permission set
   |
   v
AWS account assignment
   |
   v
Temporary role session
```

### Cognito Flow

```text
App user
   |
   v
Cognito user pool
   |
   v
JWT tokens
   |
   +--> API access
   |
   v
Cognito identity pool, if needed
   |
   v
STS temporary AWS credentials
```

---

## 9. Scenario 6: Verified Permissions vs IAM

### Easy Rule

```text
AWS API access -> IAM
Application business authorization -> Verified Permissions
```

### Example

Requirement:

```text
User can approve invoices only for their own department.
```

Best answer:

```text
Amazon Verified Permissions with Cedar policies.
```

Requirement:

```text
Role can call s3:GetObject only on a bucket prefix.
```

Best answer:

```text
IAM policy.
```

### Trap

Do not use SCPs for application business rules. SCPs affect AWS API permissions in member accounts, not your app's internal "manager can approve invoice" logic.

---

## 10. Scenario 7: ABAC And Session Tags

### What The Question Usually Says

```text
Many teams/projects.
Avoid creating many roles.
Access should follow project/department attributes.
Federated attributes should control AWS access.
```

### Best Pattern

```text
IdP attribute
   |
   v
Session tag / principal tag
   |
   v
IAM condition compares principal tag to resource tag
```

### Example

```json
{
  "Effect": "Allow",
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::company-data/*",
  "Condition": {
    "StringEquals": {
      "s3:ExistingObjectTag/Project": "${aws:PrincipalTag/Project}"
    }
  }
}
```

### Trap

ABAC is only as strong as tag control. Protect who can set or change tags.

---

## 11. Scenario 8: Access Analyzer

### What The Question Usually Says

```text
Find resources shared outside the organization.
Generate least-privilege policies from access activity.
Find unused access.
Validate policy grammar and best practices.
```

### Best Answer

```text
IAM Access Analyzer
```

### Simple Flow

```text
Policies + CloudTrail activity
      |
      v
Access Analyzer
      |
      +--> external access finding
      +--> unused access finding
      +--> validation result
      +--> generated policy
```

### Trap

Access Analyzer is not the same as IAM Policy Simulator:

| Tool | Use |
|---|---|
| Access Analyzer | Find external/unused access, validate/generate policies |
| Policy Simulator | Simulate whether a principal/action/resource request is allowed |

---

## 12. Scenario 9: Credential Incidents

### Long-Term IAM Access Key Leaked

Best response:

```text
1. Deactivate the access key.
2. Rotate the workload to a safe credential path.
3. Query CloudTrail for key activity.
4. Remove unauthorized resources or changes.
5. Replace long-term keys with roles where possible.
```

### Temporary Role Session Compromised

Best response:

```text
1. Revoke old sessions or add aws:TokenIssueTime deny.
2. Force fresh session acquisition.
3. Query CloudTrail for role activity.
4. Fix the source of credential theft.
```

### Exam Trap

Access key rotation and role-session revocation are not the same thing.

---

## 13. Scenario 10: S3 Presigned URL

### What The Question Usually Says

```text
Give a user temporary access to one S3 object.
User should not need AWS credentials.
Bucket should stay private.
```

### Best Answer

```text
S3 presigned URL
```

### Simple Flow

```text
App role with S3 permission
      |
      v
Generates presigned URL for object
      |
      v
Recipient uses URL until expiration
```

### Trap

If the signer does not have permission to the object, the presigned URL will not magically grant access.

---

## 14. Decision Trees

### 14.1 Authentication

```text
Employees need AWS account access?
    -> IAM Identity Center

Customers need app sign-up/sign-in?
    -> Cognito user pool

App users need AWS credentials?
    -> Cognito identity pool

External workload needs temporary AWS credentials using certificates?
    -> IAM Roles Anywhere

Cross-account access needed?
    -> IAM role + STS AssumeRole

Temporary object access needed?
    -> S3 presigned URL
```

### 14.2 Authorization

```text
Need AWS API permissions?
    -> IAM policies/resource policies

Need app business authorization?
    -> Verified Permissions

Need resource-side external access guardrail?
    -> RCP

Need principal-side organization guardrail?
    -> SCP

Need delegated IAM admin ceiling?
    -> Permission boundary

Need one session to be narrower?
    -> Session policy

Need tag/attribute-driven access?
    -> ABAC/session tags
```

### 14.3 Troubleshooting Denied Access

```text
Was there an explicit deny?
    -> Deny wins

Is there an allow in the identity or resource policy?
    -> Missing allow means deny

Is there a permissions boundary?
    -> Boundary must allow

Is there a session policy?
    -> Session policy must allow

Is there an SCP?
    -> SCP must allow

Is there an RCP?
    -> RCP must allow resource access

Is KMS involved?
    -> Key policy must allow the access path

Is a VPC endpoint involved?
    -> Endpoint policy may filter access

Is role assumption involved?
    -> Trust policy and sts:AssumeRole permission both matter
```

---

## 15. Common Exam Traps

| Trap | Better thinking |
|---|---|
| SCP grants permissions | SCPs never grant; they only limit |
| Permission boundary grants access | Boundary is a ceiling, not a grant |
| Session policy adds permissions | Session policy only reduces session permissions |
| IAM policy alone allows KMS decrypt | KMS key policy is a required layer |
| Trust policy gives permissions after assumption | Trust only controls who can assume; role policies control actions |
| Identity Center for customer mobile app users | Use Cognito for app/customer identities |
| Cognito user pool gives AWS credentials | User pool gives JWTs; identity pool gives AWS credentials |
| Verified Permissions replaces IAM | Verified Permissions is app authorization, IAM is AWS API authorization |
| RCP blocks outbound access to external resources | RCP protects your resources; use SCP/IAM for outbound principal control |
| Rotating an access key revokes role sessions | Use role-session revocation for temporary sessions |
| External ID is for all human MFA scenarios | External ID is for third-party confused deputy protection |
| Access Analyzer guarantees runtime deny | It analyzes policies/access; runtime controls still evaluate separately |

---

## 16. Memory Tables

### 16.1 Policy Type Memory Table

| Policy/control | Best mental model |
|---|---|
| Identity policy | What this identity can do |
| Resource policy | Who can access this resource |
| Trust policy | Who can assume this role |
| Permission boundary | Maximum for this IAM entity |
| Session policy | Maximum for this temporary session |
| SCP | Maximum for principals in member accounts |
| RCP | Maximum for resources in member accounts |
| KMS key policy | Required authorization layer for customer keys |
| Endpoint policy | Filter for endpoint use |

### 16.2 Identity Service Memory Table

| Service | Best for |
|---|---|
| IAM Identity Center | Workforce access to AWS accounts/apps |
| Cognito user pool | App user authentication and JWTs |
| Cognito identity pool | App user temporary AWS credentials |
| STS | Temporary credentials |
| Roles Anywhere | Certificate-based temporary credentials for external workloads |
| Verified Permissions | App-level authorization |
| Access Analyzer | External/unused access and policy analysis |

---

## 17. Worked Examples

### Example 1: SCP Deny Beats Admin

Scenario:

An IAM user has `AdministratorAccess`. The account has an SCP that denies `ec2:RunInstances`.

Result:

```text
ec2:RunInstances is denied.
```

Why:

Explicit deny in an SCP wins, and SCPs limit member-account principals.

---

### Example 2: Boundary With Admin Policy

Scenario:

A role has `AdministratorAccess`. A permission boundary allows only `s3:*`.

Result:

```text
The role can only perform S3 actions that its identity policy allows.
```

Why:

The boundary is the maximum permission. It does not grant beyond the identity policy, and it blocks actions outside the boundary.

---

### Example 3: Cognito User Pool vs Identity Pool

Scenario:

A mobile app user signs in and needs an ID token for the app backend.

Answer:

```text
Cognito user pool.
```

Scenario:

The same user needs temporary AWS credentials to upload to a specific S3 prefix.

Answer:

```text
Cognito identity pool.
```

---

### Example 4: SaaS Monitoring Vendor

Scenario:

A third-party monitoring vendor needs read-only access to your AWS account.

Good design:

```text
Create a role in your account.
Trust the vendor principal.
Require sts:ExternalId.
Attach least-privilege read-only policy.
```

Why:

This avoids long-term IAM user keys and reduces confused-deputy risk.

---

### Example 5: Application Authorization

Scenario:

A claims-processing app needs this rule:

```text
Adjusters can view claims in their assigned region.
Managers can approve claims only under $10,000 unless they have an elevated approval attribute.
```

Good answer:

```text
Amazon Verified Permissions.
```

Why:

This is fine-grained application authorization, not AWS API authorization.

---

## 18. Original Mini Practice Set

These questions are original and are designed around the repeated topic signals.

### Q1. Explicit Deny

A role has an identity policy allowing `s3:PutObject`. An SCP attached to the account denies `s3:PutObject`. What is the result?

A. Allowed because identity policies override SCPs  
B. Denied because explicit deny wins  
C. Allowed because S3 is a global service  
D. Allowed if MFA is present

**Answer:** B

**Explanation:** Any applicable explicit deny wins. SCPs limit principals in member accounts.

---

### Q2. Permission Boundary

A developer can create IAM roles but must never create a role with permissions beyond a defined maximum. What should be required?

A. Permission boundary on created roles  
B. S3 presigned URL  
C. CloudTrail Lake query  
D. Cognito user pool

**Answer:** A

**Explanation:** Permission boundaries set maximum permissions for IAM users or roles.

---

### Q3. Session Policy

A broker assumes a role and passes a session policy that allows only `s3:GetObject`. The role normally allows `s3:GetObject` and `s3:PutObject`. What can the session do?

A. Both GetObject and PutObject  
B. Only GetObject  
C. Only PutObject  
D. All S3 actions

**Answer:** B

**Explanation:** Session policies reduce the permissions available to a temporary session.

---

### Q4. Third-Party SaaS

A third-party SaaS provider assumes a role in your AWS account. Which trust policy condition reduces confused-deputy risk?

A. `sts:ExternalId`  
B. `aws:SourceIp` only  
C. `s3:prefix`  
D. `kms:ViaService`

**Answer:** A

**Explanation:** External ID is the standard confused-deputy control for third-party cross-account role access.

---

### Q5. Identity Center

A company uses an external IdP and wants workforce users to access multiple AWS accounts with centrally managed permission sets. Which service fits best?

A. IAM Identity Center  
B. Amazon Cognito identity pools  
C. S3 presigned URLs  
D. Amazon Verified Permissions

**Answer:** A

**Explanation:** IAM Identity Center is designed for workforce access to AWS accounts and applications.

---

### Q6. Cognito

A customer-facing mobile app needs user sign-up, sign-in, and JWT tokens. Which service is usually the best fit?

A. Amazon Cognito user pools  
B. IAM Identity Center  
C. AWS Organizations SCPs  
D. IAM Access Analyzer

**Answer:** A

**Explanation:** Cognito user pools authenticate app users and issue JWTs.

---

### Q7. Verified Permissions

A SaaS application needs rules such as "store managers can approve refunds only for their store." Which service is intended for this authorization model?

A. Amazon Verified Permissions  
B. AWS Organizations SCPs  
C. IAM Roles Anywhere  
D. CloudTrail Lake

**Answer:** A

**Explanation:** Verified Permissions is for application-level authorization using Cedar policies.

---

### Q8. RCP Scope

An account in your organization writes to a bucket in an external account. Can your organization's RCP on your resources block that outbound write?

A. No, RCPs protect your resources; use SCP/IAM for outbound principal control  
B. Yes, RCPs block all outbound writes  
C. Yes, but only if CloudTrail is enabled  
D. No, because RCPs grant permissions

**Answer:** A

**Explanation:** RCPs are resource-side guardrails for resources in your organization.

---

### Q9. Access Analyzer

A security engineer wants to identify S3 buckets and IAM roles shared with principals outside the organization. Which service capability is most relevant?

A. IAM Access Analyzer external access analyzer  
B. Systems Manager Patch Manager  
C. Amazon Inspector SBOM export  
D. AWS Backup Vault Lock

**Answer:** A

**Explanation:** Access Analyzer identifies supported resources shared with external entities outside the zone of trust.

---

### Q10. Ordering

Put the high-level IAM Identity Center workforce setup in a sensible order.

```text
1. Connect or choose identity source.
2. Synchronize/map users and groups.
3. Create permission sets.
4. Assign users/groups to AWS accounts or applications.
5. Test sign-in through the access portal.
```

Why:

Identity source and users come first; permission sets and assignments come next; testing confirms the flow.

---

### Q11. Matching

Match the requirement to the best control.

| Requirement | Answer |
|---|---|
| A. Temporary credentials | STS |
| B. Third-party confused deputy control | External ID |
| C. Customer app sign-in | Cognito user pool |
| D. App-level authorization | Verified Permissions |
| E. Maximum permissions for role | Permission boundary |
| F. Find external resource access | IAM Access Analyzer |

---

## 19. Final Audit Addendum: Directory Service And Hybrid Identity

This section was added after rechecking the full question bank and important-topic matrix.

AWS Directory Service can appear in IAM and federation questions, especially when the scenario mentions Microsoft Active Directory.

### 19.1 AD Connector

AD Connector is a directory gateway to an existing on-premises Microsoft Active Directory.

Plain English:

> AD Connector lets AWS use your existing AD without storing or replicating directory data in AWS.

Real-world example:

A company already has on-premises AD and only needs AWS applications or console federation to authenticate against those existing users. AD Connector redirects requests to the on-premises domain controllers.

Simple flow:

```text
AWS application or AWS console sign-in
      |
      v
AD Connector in VPC
      |
      v
On-premises Active Directory
```

Exam angle:

Choose AD Connector when the question says:

- use existing on-premises AD
- do not store directory data in AWS
- proxy or redirect authentication to on-prem AD
- no need to run AD-aware workloads in AWS

Common trap:

AD Connector is not a managed AD domain hosted in AWS. It depends on network connectivity to the existing directory.

### 19.2 AWS Managed Microsoft AD

AWS Managed Microsoft AD is a managed Microsoft Active Directory hosted in AWS.

Plain English:

> Managed Microsoft AD is for running AD-aware workloads in AWS without self-managing domain controllers.

Choose Managed Microsoft AD when the question says:

- AD-aware workloads in AWS
- Windows authentication for workloads in AWS
- trust relationship with on-premises AD
- managed domain controllers in AWS

### 19.3 IAM Identity Center With AD

IAM Identity Center can use external identity sources and can integrate with Active Directory patterns.

Decision rule:

```text
Workforce access to AWS accounts/apps
    -> IAM Identity Center

Existing on-prem AD authentication proxy
    -> AD Connector

Managed AD domain for AWS workloads
    -> AWS Managed Microsoft AD

Customer app users
    -> Cognito

Application authorization rules
    -> Verified Permissions
```

---

## 20. Last-Day Revision Checklist

Before the exam, make sure you can answer these quickly:

- What always wins in IAM policy evaluation?
- What does an SCP do, and what does it not do?
- What does an RCP protect?
- Does a permission boundary grant permissions?
- Does a session policy add permissions?
- What two things are required for cross-account `AssumeRole`?
- What is a trust policy?
- When do you use External ID?
- When do you choose Identity Center over Cognito?
- When do you choose AD Connector over AWS Managed Microsoft AD?
- What is the difference between Cognito user pools and identity pools?
- When do you choose Verified Permissions instead of IAM?
- How does ABAC use principal/resource tags?
- What are session tags used for?
- How do you revoke older role sessions?
- What does IAM Access Analyzer find?
- When do you use IAM Roles Anywhere?
- What does a presigned URL depend on?
- Why is KMS key policy often a required layer?

Final mental model:

```text
Authentication:
  Identity Center / Cognito / STS / Roles Anywhere / Directory Service / MFA

Authorization:
  IAM policies / resource policies / trust policies / Verified Permissions

Guardrails:
  SCP / RCP / permission boundary / session policy

Attributes:
  ABAC / tags / session tags

Troubleshooting:
  explicit deny / missing allow / wrong trust / Access Analyzer / CloudTrail
```
