# 1. Detection: Original Scenario Practice

[Bank index and sources](aws-security-scs-c03-scenario-bank-index.md) | [Study guide](01-detection-and-monitoring-study-guide.md)

Candidate signals: R3, R4, R5, R8. The detailed situations are original, not reported exam items. Read the requirement before choosing a service.

## DET-01: A Successful Read With No Audit Record

**Format:** Single answer. **Focus:** Logging coverage and retrospective limits.

A payments team stores settlement files in one prefix of a private S3 bucket. Its organization trail records management events in every active Region. During a controlled test, a role successfully downloads a file, but investigators cannot find the GetObject operation in the trail's S3 logs. They can find a bucket-policy change from the same period. Delivery is healthy, and the trail has no S3 data-event selectors.

The team needs attributable evidence of future reads of settlement files without collecting object operations across every bucket. Which change best meets that requirement?

- A. Enable CloudTrail Insights and leave event selectors unchanged.
- B. Query the same management-event records with a broader date range.
- C. Configure appropriately scoped S3 read data-event selection for the settlement objects and validate with a fresh test read.
- D. Enable VPC Flow Logs and use network byte counts as the identity record for each object read.

**Answer: C.** The missing category is object-level data activity. Scoped collection meets the evidence requirement without indiscriminate organization-wide object logging.

**Why the other choices fail:** A does not replace the selectors needed to record these underlying object operations. B cannot recover an event category that was never collected. D supplies network metadata, not an attributable object/API audit record.

**Verify:** Make another controlled read after the selector takes effect; inspect the recorded principal, object, event time, and delivery destination. This does not recreate historical reads that were not captured elsewhere.

**Change one fact:** If the event exists at the source but not in the archive, investigate delivery instead of adding duplicate event coverage.

[Review CloudTrail event types](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/logging-data-events-with-cloudtrail.html).

## DET-02: Delegation Exists, Coverage Does Not

**Format:** Single answer. **Focus:** Organization and Regional configuration.

A company designated its security account as the GuardDuty delegated administrator in one Region. An acquired account already belongs to the organization and runs production in a different enabled Region. The central team sees no detector or member coverage for that account in the workload Region. It has not configured GuardDuty there, but it has an organization CloudTrail trail and centralized billing.

The requirement is managed threat detection in both Regions for existing and future member accounts, with administration from the same security account. What should the team do?

- A. Configure the delegated administration/member relationship and required detection features in each workload Region, choosing enrollment settings that cover existing and future accounts.
- B. Enable cross-Region finding aggregation alone and assume that missing Regional detectors are created by aggregation.
- C. Recreate the organization trail because GuardDuty can operate only where customer-managed trails deliver to the administrator's bucket.
- D. Move the acquired account to the security OU; OU placement alone activates every GuardDuty feature.

**Answer: A.** Organization membership, Regional enrollment, protection-feature configuration, and central viewing are distinct responsibilities.

**Why the other choices fail:** B can centralize available findings but cannot replace missing collection/detection. C invents a customer-trail prerequisite for GuardDuty's foundational ingestion. D changes organizational placement, not service configuration by itself.

**Verify:** Compare the account/Region inventory with enabled members and desired protection plans. Test expected findings through a controlled, approved validation procedure; no findings alone is not evidence of coverage.

[GuardDuty organization and Region rules](https://docs.aws.amazon.com/guardduty/latest/ug/guardduty_organizations.html).

## DET-03: Findings Are Not The Requested Dataset

**Format:** Single answer. **Focus:** Findings versus a normalized security data lake.

A security team already receives findings from several AWS services. Its new analytics platform must correlate supported AWS security logs with a custom source using OCSF, retain the data in customer-controlled S3 storage, and give an approved third-party subscriber access. The requirement is access to the underlying normalized records, not only a dashboard of findings.

Which design most directly addresses the new requirement while retaining the existing finding workflow?

- A. Export only Security Hub CSPM findings and treat that export as a complete replacement for source logs.
- B. Enable Detective and require the external analytics platform to use Detective as its general raw-log subscriber interface.
- C. Send all CloudWatch alarms to SNS and retain notification messages as the full underlying dataset.
- D. Configure Security Lake sources, a compatible custom-source pipeline, retention/access controls, and the appropriate subscriber mechanism.

**Answer: D.** The defining requirements are normalized records, S3-backed lake storage, and controlled subscriber access. Source compatibility and subscriber permissions still require configuration.

**Why the other choices fail:** A preserves findings but not every underlying source record. B is an investigation capability, not the requested general-purpose lake ingestion/subscription design. C stores derived notifications rather than the full normalized evidence.

**Verify:** Follow a test record from each source through normalization, storage, and authorized subscriber access. Include an unauthorized-subscriber denial test.

[Security Lake purpose and integrations](https://docs.aws.amazon.com/security-lake/latest/userguide/what-is-security-lake.html).

## DET-04: Two Independent Alert Failures

**Format:** Multiple response. **Select TWO.** **Focus:** Pattern matching and target authorization.

An EventBridge rule should invoke a Lambda triage function for direct GuardDuty events with numeric severity at least 7. The rule matches the exact list `7, 8, 9`. A captured severity-7.5 event fails the pattern test. Separately, a severity-8 event matches, but target invocation fails with a permission error. No EventBridge target execution role is configured, and the function's resource policy has no permission for this rule to invoke it.

Which two changes directly address the demonstrated failures?

- A. Increase the function's execution-role permissions to AdministratorAccess.
- B. Replace exact severity enumeration with a numeric comparison that matches values greater than or equal to 7.
- C. Increase EventBridge retries without changing either configuration.
- D. Add scoped permission allowing EventBridge to invoke the function from this rule.
- E. Add more logging permissions to the function and assume matching will change.

**Answer: B and D.** B repairs the selection predicate; D repairs the distinct target authorization path.

**Why the other choices fail:** A changes what the running function can do, not who can invoke it. C repeats failed attempts without correcting either cause. E may improve later function logging but does not fix filtering or invocation authorization.

**Verify:** Test below-threshold, exact-threshold, and fractional-above-threshold events; then verify invocation and the function's processing result. A successful match is not proof that the target completed its work.

[EventBridge comparison operators](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-create-pattern-operators.html) and [resource-based target permissions](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-use-resource-based.html).

## DET-05: Restore A Broken Log Pipeline

**Format:** Ordering. **Use all four steps.** **Focus:** Repair and prove the full path.

A fleet's CloudWatch agent is installed but does not publish the application's security log. Investigation has already established two defects: the configured file path is wrong, and the instance role lacks the required destination logging permissions. The team has approved a least-privilege fix. Its change process requires repairing a canary before rolling out to the fleet.

Put the following actions in the required order.

- A. Roll out the validated configuration and permissions through fleet management, and check fleet coverage.
- B. On the canary, apply the corrected file path and scoped destination permissions, then load/restart the agent configuration as required.
- C. After the canary is running with the fix, generate a uniquely identifiable application security event.
- D. Verify that event in the intended log group/stream with the expected timestamp and readable content; inspect agent errors if it is absent.

**Answer: B -> C -> D -> A.**

**Reasoning:** B establishes the conditions for collection. C creates evidence after the change rather than relying on an old record. D proves end-to-end delivery. Only then does A expand the change. Installation status alone cannot prove the application log is being read or delivered.

**Closest wrong sequence:** B -> A -> C -> D spreads an unvalidated fix before the required canary evidence exists. This is the order required by this rollout scenario, not a universal rule that every permission change must precede every configuration edit.

[CloudWatch agent troubleshooting](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/troubleshooting-CloudWatch-Agent.html).

## DET-06: Choose Evidence That Can Answer The Question

**Format:** Matching. **Use each response once.** **Focus:** Observation boundaries.

An investigation team needs four different types of evidence. All listed collection mechanisms were enabled before the event, with the relevant scope. Match each request to its primary source; correlation may still require other records.

| Request | Evidence needed |
| --- | --- |
| 1 | Identify the principal that changed a security-group rule |
| 2 | Inspect accepted/rejected network-flow metadata on an ENI |
| 3 | Inspect domain queries observed through the VPC Resolver |
| 4 | Find recorded configuration and rule-compliance history for a resource |

Responses:

- A. Route 53 Resolver query logs
- B. AWS Config
- C. CloudTrail management events
- D. VPC Flow Logs

**Answer: 1-C, 2-D, 3-A, 4-B.**

**Reasoning:** C records API activity and caller context. D describes flows but not application payloads or every IAM decision. A supplies DNS observations, not proof that a subsequent connection succeeded. B supplies recorded configuration/evaluation state; use CloudTrail alongside it when the question is who made a change.

**Verify:** Check collection scope and timestamps before concluding an event did not occur. A flow marked ACCEPT does not prove the application authorized the request, and a DNS record does not prove data exfiltration.

[Review network evidence](00-aws-security-foundations-for-beginners.md#dns-and-network-evidence-explained).
