# 2. Incident Response: Original Scenario Practice

[Bank index and sources](aws-security-scs-c03-scenario-bank-index.md) | [Study guide](02-incident-response-study-guide.md)

Candidate signals: R2, R3, R6, R8. These original scenarios emphasize evidence, time, scope, and business impact rather than a universal response checklist.

## IR-01: Containment Without Losing The Workload

**Format:** Single answer. **Focus:** Scope, active harm, and evidence.

A validated GuardDuty finding and application evidence identify one compromised EC2 worker in an Auto Scaling group. Healthy workers can handle the workload. The affected worker is actively contacting an unapproved external destination. The response team has an approved containment runbook and a prepared forensic account. Operations proposes terminating the worker immediately; investigators need its available disk and volatile evidence, subject to stopping active harm.

Which response best balances the stated requirements?

- A. Leave the worker fully connected until every possible forensic artifact has been collected.
- B. Remove it from service, prevent automated disposal while needed, apply tested containment controls, verify harmful traffic has stopped, and preserve appropriate evidence under the runbook.
- C. Terminate it, then assume a newly launched worker's logs and memory are equivalent evidence.
- D. Shut down the entire Auto Scaling group so no healthy worker can process another job.

**Answer: B.** It scopes action to the affected worker, preserves business capacity, and treats verified containment and evidence handling as coordinated tasks.

**Why the other choices fail:** A allows known active harm indefinitely. C destroys volatile state and substitutes evidence from a different system. D adds avoidable outage given healthy capacity and an identified affected worker.

**Verify:** Do not assume a security-group update instantly kills every tracked connection. Check actual activity and escalate to stronger approved containment if needed. Record actions and timestamps; collect volatile evidence only when the incident's risks permit.

[Review response access and evidence](00-aws-security-foundations-for-beginners.md#response-access-and-evidence-basics).

## IR-02: The Attacker Can Renew Credentials

**Format:** Single answer. **Focus:** Existing sessions versus new session issuance.

A build system's federation configuration was changed so an unauthorized external subject can assume a deployment role. Investigators confirm issued role sessions, and the attacker can still satisfy the current trust conditions. The security team must prevent fresh unauthorized sessions and invalidate affected older role sessions while maintaining a controlled recovery path for legitimate deployments.

Which response addresses both parts of the exposure?

- A. Shorten the role's maximum session duration and assume all existing credentials are immediately invalidated.
- B. Remove the attacker's source IP from a build dashboard allow list but leave the AWS trust relationship unchanged.
- C. Apply a time-based deny to old sessions only, without changing the federation trust that allowed issuance.
- D. Correct the unauthorized federation/trust path and apply appropriate revocation or explicit-deny controls to affected sessions, then validate new legitimate sessions separately.

**Answer: D.** The issuer path and the already-issued credentials are different control points.

**Why the other choices fail:** A changes future session constraints, not a reliable immediate revocation of all prior sessions. B may protect the dashboard but not direct STS access. C leaves a path to obtain new sessions after the cutoff.

**Verify:** Confirm the unauthorized subject cannot obtain a new session and that affected old credentials cannot perform the protected operations. Investigate resources and persistent changes created during the exposure; credential containment does not erase them.

[Role-session revocation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_revoke-sessions.html).

## IR-03: Evidence Was Copied, But Analysts Cannot Use It

**Format:** Single answer. **Focus:** Encrypted evidence dependencies.

Responders preserve an EBS snapshot encrypted with a customer managed KMS key in the affected account. They share the snapshot with a dedicated forensic account. The analyst can identify the shared snapshot but cannot perform the intended copy/use workflow because key access is denied. Policy review confirms that the source key authorization for the forensic principal is missing. The original evidence must remain protected and the analysis copy must stay encrypted.

What is the most appropriate next step?

- A. Configure the scoped cross-account KMS authorization and required workflow permissions, create the permitted encrypted forensic copy, and record source-to-copy provenance.
- B. Disable the source KMS key to force EBS to return an unencrypted snapshot.
- C. Make the original snapshot public so the forensic account no longer needs KMS access.
- D. Select a forensic-account destination key for a copy operation but leave authorization to use the source key unresolved.

**Answer: A.** Snapshot sharing alone does not grant use of its encryption key. The copy workflow may require more than a simple read permission; scope it to the documented operations and selected keys.

**Why the other choices fail:** B removes a decryption dependency rather than removing encryption. C is neither appropriate evidence handling nor a substitute for key authorization; encrypted snapshots cannot simply be made public. D chooses how to protect the destination without granting the access needed to process the encrypted source.

**Verify:** Test the copy and mounting process using the actual forensic role, retain the original, and document snapshot IDs, keys, timestamps, operator, and analysis-copy location.

[Sharing encrypted EBS snapshots](https://docs.aws.amazon.com/ebs/latest/userguide/share-kms-key.html).

## IR-04: Duplicate Findings Corrupt Rollback State

**Format:** Multiple response. **Select TWO.** **Focus:** Idempotent response automation.

An event-driven quarantine workflow saves an instance's security groups and replaces them with isolation groups. The event is delivered twice. On the second execution, the workflow overwrites the saved original groups with the isolation groups. Later, the rollback uses the wrong saved state. Events may be duplicated, and legitimate finding updates must still be processed.

Which two changes best address this failure?

- A. Use durable incident/resource/action state with an atomic transition so duplicate containment does not overwrite the original configuration.
- B. Retry every duplicate from the beginning until it reports success.
- C. Before each action, inspect current resource and workflow state, distinguish meaningful updates from duplicates, and record a verified result.
- D. Assume the event service guarantees exactly-once end-to-end business effects and remove duplicate checks.
- E. Eliminate saved state and restore every instance to one hard-coded security-group configuration.

**Answer: A and C.** A protects first-captured state against concurrent/repeated processing; C makes repeated execution safe and preserves meaningful updates.

**Why the other choices fail:** B repeats the corrupting action. D relies on a guarantee the design does not have. E may restore the wrong application permissions and violates resource-specific rollback requirements.

**Verify:** Replay duplicate and out-of-order inputs in a test environment. Check that original state remains unchanged, real updates are handled, and failed actions lead to bounded retry or escalation rather than silent completion.

[Review response automation](00-aws-security-foundations-for-beginners.md#response-automation-and-safe-recovery).

## IR-05: Recover After Containment Is Complete

**Format:** Ordering. **Use all four steps.** **Focus:** Trusted recovery.

An incident has already been contained and evidence preserved. Investigators identified a vulnerable image and a leaked application secret. A recovery plan requires an isolated validation environment and approval before serving production traffic. Put the remaining steps in the required order.

- A. Approve the validated replacement and gradually return traffic while monitoring for regression or renewed compromise.
- B. Correct the image/entry point, replace the affected secret, and establish a trusted recovery configuration.
- C. Restore required data into the isolated replacement environment using authorized recovery identities and keys.
- D. Test data integrity, decryption, fresh application authentication, security controls, and required functionality; record whether recovery objectives are met.

**Answer: B -> C -> D -> A.**

**Reasoning:** Restoring into the unchanged vulnerable environment would reintroduce the cause. C rebuilds the service using B's corrected basis. D validates both data and the fresh credential/configuration path. A is last because production exposure requires the specified approval and validation.

**Closest wrong sequence:** C -> A -> B -> D returns traffic before the cause is corrected and before the required validation. In real incidents some preparation can run in parallel; this scenario explicitly defines the recovery gates.

[Review safe recovery](00-aws-security-foundations-for-beginners.md#response-automation-and-safe-recovery).

## IR-06: Test The Capability You Actually Need

**Format:** Matching. **Use each response once.** **Focus:** Readiness evidence.

A security manager has budget for four exercises. Each must produce different evidence of readiness. Match the need to the most suitable activity.

| Need | Desired evidence |
| --- | --- |
| 1 | Confirm escalation, decision ownership, and communications without changing production resources |
| 2 | Prove a specific quarantine automation works safely against a controlled test resource |
| 3 | Measure whether the service can restore usable data within its recovery objectives |
| 4 | Evaluate application resilience under a bounded, approved fault with stop conditions |

Responses:

- A. Isolated restore drill with application and timing checks
- B. Tabletop incident exercise
- C. Scoped runbook execution test with permission, rollback, and duplicate-event checks
- D. Controlled fault-injection experiment

**Answer: 1-B, 2-C, 3-A, 4-D.**

**Reasoning:** B tests coordination, not runtime execution. C demonstrates the automation, not the entire organization's crisis process. A tests recovery rather than merely backup-job completion. D tests response to selected faults; it does not by itself prove forensic evidence handling or every attack-response path.

**Verify:** Define success criteria and owners before each exercise. Record failed assumptions and retest after correcting them rather than treating exercise attendance as proof of readiness.

[Review Incident Response readiness](02-incident-response-study-guide.md).
