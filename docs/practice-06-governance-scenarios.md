# 6. Governance: Original Scenario Practice

[Bank index and sources](aws-security-scs-c03-scenario-bank-index.md) | [Study guide](06-security-foundations-and-governance-study-guide.md)

Candidate signals: R4, R5, R6, R8. The original scenarios distinguish desired policy, actual scope, successful rollout, and evidence.

## GOV-01: The New Account Has No Baseline Stack

**Format:** Single answer. **Focus:** StackSet target coverage.

A platform team used a service-managed StackSet to deploy a monitoring baseline to the accounts in an OU. Existing stack instances are healthy. A new account is later added to that OU, but no baseline stack appears in that account's intended Region. Trusted access is configured, the account is eligible, and review confirms automatic deployment for account additions was not enabled.

The team needs the missing account covered and future accounts handled automatically. Which action is most appropriate?

- A. Re-run drift detection on only the existing stack instances and assume it creates the missing target.
- B. Create a Config aggregator and assume it installs the StackSet's resources in new accounts.
- C. Update the template parameters on the existing stack instances while leaving missing targets and automatic deployment unconfigured.
- D. Enable the intended automatic-deployment behavior, reconcile any missing account/Region targets with deployment operations as necessary, and verify successful stack instances against the OU inventory.

**Answer: D.** The requirement includes both automatic future coverage and confirmation that today's missing target is actually deployed.

**Why the other choices fail:** A inspects existing instances, not absent deployments. B provides observation aggregation, not resource installation. C updates current deployments without resolving absent target coverage or future enrollment.

**Verify:** Compare expected accounts and Regions to operation/instance results. Check removal behavior too: leaving an OU can have different resource-retention consequences depending on configuration.

[StackSet automatic deployments](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacksets-orgs-manage-auto-deployment.html).

## GOV-02: Compliant Tags On Some Resources Do Not Prove Universal Tagging

**Format:** Single answer. **Focus:** Tag policy limitations.

A company defines a tag policy specifying the spelling and permitted values of CostCenter. It enables enforcement for supported resource types. A report still identifies resources with no CostCenter tag. Management expected the policy to guarantee that every resource has the tag, including resources created through different services and APIs.

Which explanation and follow-up design is most accurate?

- A. The tag policy is an IAM grant, so administrators only need to attach it to every user.
- B. Standardizing defined tags is not a universal required-tag control; use supported creation-time controls and detection/remediation for the relevant resource/actions, and test tag-removal paths.
- C. Deploy a Config required-tags rule and treat its later compliance evaluation as synchronous prevention of every untagged creation request.
- D. Disable the policy and rely only on a manually edited inventory spreadsheet as an equivalent preventive control.

**Answer: B.** Tag policy scope must be distinguished from a requirement that tags exist everywhere. Different creation/tagging APIs support different controls.

**Why the other choices fail:** A confuses organization tagging policy with permission granting. C is useful for supported detection but is not synchronous universal prevention. D may document an inventory but does not enforce the stated requirement.

**Verify:** Test compliant tags, wrong case/value, absent tags, and later tag deletion for each covered resource type. If tags influence access or security-policy selection, protect the ability to change them.

[Tag policy evaluation scope](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_tag-policies.html).

## GOV-03: The Resource Is In An Exempt Account

**Format:** Single answer. **Focus:** RCP scope and management-account placement.

An organization attaches an RCP intended to deny external access to covered S3 resources in member accounts. Test requests against the selected member-account buckets are denied as expected. A different bucket, still owned by the organization's management account, remains accessible through its explicit external-access bucket policy. The test uses an ordinary external principal, and the bucket's account ownership is confirmed.

What best explains the difference and guides remediation?

- A. RCPs do not affect management-account resources; remove the unintended bucket grant with applicable controls and reassess why workload data is in the management account.
- B. The external principal automatically overrides every RCP because cross-account access is always exempt.
- C. Another Allow at the organization root will convert the RCP into a denial for management-account buckets.
- D. Add the management bucket's exact ARN to the RCP Resource element and assume this overrides the management-account exception.

**Answer: A.** The location of the resource is decisive. Success on a covered member resource does not prove protection of an exempt management-account resource.

**Why the other choices fail:** B contradicts the resource-side purpose of RCPs. C cannot change the policy type's account scope. D names the resource more precisely but does not override the management-account exception.

**Verify:** Confirm resource ownership and the actual request path before testing. Use least-privilege resource policies and appropriate service controls; move routine workloads out of the management account through a planned migration rather than assuming policy coverage.

[RCP scope and exceptions](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_rcps.html).

## GOV-04: Reduce Root Credentials Without Creating A Shared Superuser

**Format:** Multiple response. **Select TWO.** **Focus:** Central root management and operational access.

A company manages many member accounts in Organizations. Each currently has root credentials in a shared password vault. The security team wants to remove standing member-account root credentials where supported and centrally perform approved privileged tasks. Ordinary daily administration should stay federated, and the management account must remain strongly protected.

Which two design choices best match that requirement?

- A. Create permanent root access keys for every member and distribute them to the automation team.
- B. Use the management account's root identity for every routine configuration change.
- C. Configure the supported centralized root-credential management and privileged-root capabilities with appropriate trusted access/delegated administration and scoped permissions.
- D. Remove audit logging for privileged tasks because centralization makes misuse impossible.
- E. Maintain separate federated daily access and a tested, monitored emergency/root-task procedure, including controlled recovery for tasks that require it.

**Answer: C and E.** C provides the supported central capabilities. E establishes the operating model, emergency dependency planning, and accountability around them.

**Why the other choices fail:** A expands standing credential exposure. B increases the blast radius of routine work. D removes the evidence needed to investigate abuse. Centralization concentrates authority and therefore needs strong protection and monitoring.

**Verify:** Audit member credential state, permitted privileged operations, delegated access, and the management-account recovery plan. Not every root-only task is automatically replaced by the same scoped central operation.

[Centralized member-account root access](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_root-enable-root-access.html).

## GOV-05: Roll Out A Restriction Without Guessing Its Impact

**Format:** Ordering. **Use all four steps.** **Focus:** Controlled organization-policy rollout.

A security team has drafted an SCP to limit a set of administrative operations. It must not interrupt approved deployment or response workflows. The change policy requires an impact review, a pilot OU, evidence of both intended denial and legitimate access, and staged expansion. No emergency requires immediate organization-root attachment.

Order the rollout steps.

- A. Exercise the intended denied operations and required deployment/response paths in the pilot; inspect denials and correct unintended effects.
- B. Review the policy's principal/action scope, inheritance, exceptions, required dependencies, and rollback ownership before attachment.
- C. Expand to approved account groups in stages after pilot acceptance, monitoring results and retaining a rollback path.
- D. Attach the reviewed policy in the designated pilot scope with representative test workloads.

**Answer: B -> D -> A -> C.**

**Reasoning:** B establishes what the policy is expected to do. D applies it within the required limited scope. A checks both security effectiveness and availability of legitimate work. C broadens only after the acceptance gate.

**Closest wrong sequence:** D at the organization root -> C -> A makes production the experiment and violates the explicit rollout requirement. An SCP that successfully blocks an unwanted API can still break approved service dependencies.

[Review inheritance and rollout](06-security-foundations-and-governance-study-guide.md#b-understand-what-organization-policies-actually-control).

## GOV-06: Build The Evidence Workflow With The Right Components

**Format:** Matching. **Use each response once.** **Focus:** Collection, packaging, assessment, and AWS reports.

An audit program needs five related capabilities across its AWS environment. Match each requirement to the component that directly provides that function; none alone proves regulatory compliance.

| Requirement | Function |
| --- | --- |
| 1 | Evaluate a supported resource configuration against a compliance condition |
| 2 | Package a set of configuration rules and optional remediation definitions for repeatable deployment |
| 3 | Centrally view configuration/compliance data already recorded in authorized source accounts and Regions |
| 4 | Organize customer assessment controls and associated automated/manual evidence |
| 5 | Obtain AWS-side compliance reports and agreements |

Responses:

- A. AWS Audit Manager
- B. AWS Config aggregator
- C. AWS Artifact
- D. AWS Config rule
- E. AWS Config conformance pack

**Answer: 1-D, 2-E, 3-B, 4-A, 5-C.**

**Reasoning:** A rule evaluates; a pack packages; an aggregator centralizes a read-only view of collected data. Audit Manager organizes customer evidence, while Artifact supplies AWS-side documents. An aggregator does not install missing recorders or correct resources, and a downloaded AWS report does not prove customer access controls operated.

**Verify:** Trace a known resource from source recording through evaluation and the central view. Confirm assessment evidence covers the requested accounts, Regions, controls, and period rather than merely checking that each service is enabled.

[Review governance evidence](00-aws-security-foundations-for-beginners.md#governance-controls-and-evidence-from-first-principles).
