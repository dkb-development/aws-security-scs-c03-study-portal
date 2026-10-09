# 4. Identity And Access Management: Original Scenario Practice

[Bank index and sources](aws-security-scs-c03-scenario-bank-index.md) | [Study guide](04-identity-and-access-management-study-guide.md)

Candidate signals: R1, R4, R5, R8. The tests focus on actual principals, supported grant paths, and identity-system boundaries. No live question wording is used.

## IAM-01: The Resource Policy Names A Role, Not A Session

**Format:** Single answer. **Focus:** Same-account resource-policy evaluation.

A bucket and the ReportReader role are in the same AWS account. The bucket policy grants GetObject directly to the **IAM role ARN**, not an assumed-role session ARN. The role's identity policy also permits the operation. Its permissions boundary allows only ListBucket and has no GetObject allow. There are no explicit denies, organization restrictions, or KMS dependencies in this scenario.

Will a session of that role succeed when reading an object under the described grant?

- A. No. A resource-policy grant to the role ARN remains limited by the role boundary's implicit restriction.
- B. Yes. Every same-account resource-policy grant bypasses all boundary limits.
- C. Yes. The existence of any Allow in a permissions boundary grants all S3 operations.
- D. No, because S3 always requires the bucket policy to name the session ARN rather than the role ARN.

**Answer: A.** The exact recipient of the resource-policy grant matters. This scenario explicitly uses a role ARN, so the stated boundary limit applies.

**Why the other choices fail:** B overgeneralizes from different same-account user/session grant cases. C confuses a limiting policy with a permission grant and ignores action scope. D invents a session-ARN requirement.

**Change one fact:** A direct grant to a same-account assumed-role session has different implicit-deny behavior. Do not transfer this answer to that case without reevaluating the grant path; explicit denies and other applicable controls still matter.

**Verify:** Inspect the exact Principal in the bucket policy and the boundary attached to the role. Test with the intended role session and object rather than a different administrator identity.

[AWS boundary evaluation distinctions](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html).

## IAM-02: A Data-Center Worker Needs Renewable AWS Access

**Format:** Single answer. **Focus:** Roles Anywhere and credential renewal.

A scheduled job runs on servers outside AWS. The company already operates a private certificate authority and can protect workload private keys. The job must retrieve selected S3 objects without storing permanent IAM access keys. An interactive employee login is unsuitable. The security team also needs to control which certificate-bearing workloads can obtain which role permissions.

Which design most directly fits the available identity infrastructure?

- A. Store one shared IAM user's access key in every server's environment and rotate it annually.
- B. Give the job an Identity Center console session that an employee manually refreshes before every run.
- C. Configure Roles Anywhere trust anchor, profile, and constrained role trust/permissions; obtain temporary credentials using approved workload certificates.
- D. Publish presigned URLs for every present and future object without an authenticated renewal service.

**Answer: C.** Roles Anywhere supports certificate-based temporary AWS credentials for external workloads. Role trust conditions and profiles must intentionally restrict access; merely registering a CA is not a full least-privilege design.

**Why the other choices fail:** A violates the no-permanent-AWS-key requirement. B imposes an interactive dependency. D does not provide the described renewable workload identity or automatically cover future objects.

**Verify:** Test approved and unapproved certificates/roles, credential refresh, certificate revocation handling, and private-key protection. Temporary AWS credentials do not remove the need to protect the credential that can renew them.

[Roles Anywhere components](https://docs.aws.amazon.com/rolesanywhere/latest/userguide/introduction.html).

## IAM-03: The Central Template Is Updated, The Account Role Is Not

**Format:** Single answer. **Focus:** Identity Center provisioning.

An engineer signs in through Identity Center and can select the intended AWS account and permission set. An administrator added a needed read action to the permission-set definition, but provisioning the update into this target account failed. Inspection shows the target role still has the old policy. A fresh session receives AccessDenied for the newly intended action; other applicable controls are known to permit it.

Which response best addresses the demonstrated failure while preserving central management?

- A. Reset the employee's identity-provider password and leave provisioning unchanged.
- B. Replace the target role with a separately maintained permanent IAM user.
- C. Disable the organization's SCPs without inspecting the failed provisioning operation.
- D. Resolve the provisioning failure and provision the corrected permission set to the target account, then verify the role policy and retry using the intended identity.

**Answer: D.** The stale target configuration is explicit evidence. Authentication and account assignment have already succeeded.

**Why the other choices fail:** A changes authentication, not target permissions. B abandons the centralized model and adds permanent credentials. C removes unrelated restrictions and does not repair the known failed policy propagation.

**Verify:** Check operation status and the actual account role, not just the central template's displayed JSON. Reconfirm account and session identity when testing; another account can have a differently provisioned version.

[Identity Center permission sets](https://docs.aws.amazon.com/singlesignon/latest/userguide/permissionsetsconcept.html).

## IAM-04: A Tag Match Can Still Be An Escalation Path

**Format:** Multiple response. **Select TWO.** **Focus:** Action-specific ABAC and trusted attributes.

A service wants project-scoped reads of existing S3 objects. Its proposed GetObject statement compares a principal's Project tag with the object's Project tag using `aws:ResourceTag/Project`. Developers can also freely pass arbitrary Project session tags. Object tagging is restricted to a trusted ingestion role. The requirement is that a developer assigned to Billing cannot obtain Payroll access simply by changing request attributes.

Which two changes directly address the identified gaps?

- A. Replace GetObject with `s3:*` to ensure every action supports the same condition.
- B. Use the supported `s3:ExistingObjectTag/Project` condition for the intended GetObject object-tag check.
- C. Keep arbitrary session tags and assume resource encryption makes the tag value trustworthy.
- D. Remove object tags so that every request uses an empty project comparison.
- E. Restrict the source, allowed values, and passing of authorization-relevant session tags so callers cannot claim another project.

**Answer: B and E.** B makes the intended object-tag check action-appropriate. E protects the identity attribute on which authorization depends.

**Why the other choices fail:** A broadens actions and does not make unsupported condition combinations valid. C confuses encryption with attribute authority. D removes the basis for project isolation instead of securing it.

**Verify:** Test matching, mismatched, and missing tags, plus an attempted Project-tag escalation. This read policy is not automatically an upload or delete policy; supported condition keys differ by operation.

[S3 tag condition support](https://docs.aws.amazon.com/AmazonS3/latest/userguide/tagging-and-policies.html) and [session tags](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_session-tags.html).

## IAM-05: Trace A Failed Cross-Account Workflow

**Format:** Ordering. **Use all four steps.** **Focus:** Trust before downstream permissions.

A pipeline in account A must assume ReleaseRole in B, then read a deployment artifact in B. The run fails before an artifact request is made. The response procedure requires identifying the actual caller before editing policies, validating assumption before testing data access, and inspecting evidence for the final request.

Order the investigation steps.

- A. After assumption succeeds, use the issued role credentials to make the narrow artifact request and inspect its result and any resource/KMS requirements.
- B. Identify the pipeline's actual AWS caller and confirm the failed operation is AssumeRole.
- C. Re-test AssumeRole after any scoped correction, confirming the resulting role session/account.
- D. Evaluate the caller's permission to assume the target role and the target trust conditions, including relevant restrictions.

**Answer: B -> D -> C -> A.**

**Reasoning:** B avoids editing the wrong identity. D examines the permission relationship that actually failed. C proves the first stage works. A evaluates a separate downstream operation using the principal that will perform it.

**Closest wrong sequence:** B -> A -> D -> C asks the downstream resource policy to fix a session-issuance failure. A trust-policy allow is not itself an S3 read permission, and an S3 allow is not a role-assumption grant.

[Review role and request paths](00-aws-security-foundations-for-beginners.md#roles-sessions-and-policy-requests).

## IAM-06: Authentication And Authorization Are Different Products

**Format:** Matching. **Use each response once.** **Focus:** Identity-system roles.

A company has employee AWS access and a separate customer application. Match each required capability to the most directly relevant service function. A real solution can combine several functions, but they must not be treated as interchangeable.

| Capability | Requirement |
| --- | --- |
| 1 | Employees obtain assigned AWS account roles through centrally managed permission sets |
| 2 | Customers authenticate to an application and receive signed user tokens |
| 3 | An application exchanges supported identity evidence for temporary AWS credentials |
| 4 | A backend evaluates whether a particular user may perform an application action on a particular business record |

Responses:

- A. Cognito identity pool
- B. Verified Permissions with application enforcement
- C. IAM Identity Center
- D. Cognito user pool

**Answer: 1-C, 2-D, 3-A, 4-B.**

**Reasoning:** C addresses workforce AWS-account access. D provides application-user authentication/token issuance. A supplies temporary AWS credentials through its configured identity/role mapping. B evaluates application policy decisions that the backend must enforce; it does not replace the backend's IAM role.

**Verify:** A valid customer token is not proof that the caller owns every requested record. Validate tokens and enforce tenant/resource permissions at the application's protected operations.

[Review tokens and attribute ownership](00-aws-security-foundations-for-beginners.md#federation-tokens-and-attribute-ownership).
