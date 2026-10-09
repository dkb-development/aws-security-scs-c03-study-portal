# Study Material Review

Review started: 2026-10-09. Exam target: SCS-C03.

## Acceptance Standard

A developer with basic AWS familiarity should be able to explain how a control works, configure it conceptually, diagnose its failure, and choose between plausible alternatives. One-line service definitions and keyword-to-service tables are useful revision aids but do not satisfy this standard.

Official AWS objectives define required coverage. Local question-bank frequency is a practice signal, not evidence of actual exam frequency or guaranteed question weight. No study document guarantees every possible exam scenario.

## Scope And Progress

The initial review inspected the structure, foundation links, representative teaching/scenario sections in all six guides, and Detection-related topics in the local banks/important-concepts file. It was not a line-by-line factual certification of Topics 2-6 or every imported question. Detailed review and rewriting proceed one topic at a time.

| File/topic | Current status | Next work |
| --- | --- | --- |
| 00 Foundations | Expanded alongside all six domain passes | Connected lesson navigation, mechanisms, diagrams, examples, and return links; short lookup entries retained |
| 01 Detection | Rewritten and checked against all 13 Domain 1 skills | Reader review and refinements |
| 02 Incident Response | Detailed expansion complete | Guided lessons, six scenario workshops, nine-skill map, evidence/response foundations; reader refinements remain welcome |
| 03 Infrastructure Security | Detailed expansion complete | Packet-path lessons, six workshops, objective map, private/edge/device foundations and service-lifecycle corrections |
| 04 IAM | Detailed expansion complete | Request-path teaching, six workshops, eight-skill map, federation foundations, corrected S3 ABAC and resource-policy exceptions |
| 05 Data Protection | Detailed expansion complete | Data/key teaching path, six workshops, twelve-skill map, certificate/secret foundations, current imported-key rotation and ACM distinctions |
| 06 Governance | Detailed expansion complete | Control lifecycle lessons, six workshops, twelve-skill map, policy/evidence foundations and scope/availability corrections |

## Findings From The Initial Review

- Detection repeated service descriptions while lacking meaningful implementation/troubleshooting coverage. Missing areas included agent setup, alarm evaluation, log delivery permissions, validation/retention, transit gateway evidence, and reliable alert delivery.
- Many "worked examples" identified a service from one clue without explaining competing designs or failure conditions. The revised chapter includes longer original scenarios and explanations for each option.
- Most foundation links were concentrated at the start of chapters. The six expanded teaching paths now add point-of-use foundation links and return navigation; older lookup/practice sections remain available.
- Foundation sections had uneven depth. Connected lessons now explain the underlying mechanisms across all six domains, with examples, diagrams, and return paths. Short lookup entries are retained rather than represented as complete standalone lessons.
- Current AWS documentation contradicts blanket CloudTrail Lake recommendations: new customers cannot enroll after May 31, 2026. The revised Detection/foundations content states the constraint.
- Security Hub CSPM and current Security Hub need distinct treatment, including ASFF versus OCSF and behavior-investigation versus exposure-graph capabilities.
- The old EventBridge exact severity list `[7, 8, 9]` was not a general threshold. The new example uses a numeric comparison and explains fractional values.
- Topic 4's S3 ABAC examples now use `s3:ExistingObjectTag/Project` for `s3:GetObject`. The added teaching explains supported actions, attribute ownership, and negative tests. Policy evaluation now distinguishes direct resource-policy grants from ordinary identity-derived permissions.
- Older question-bank material includes abbreviated/aging assertions about service defaults, new-customer availability, suppression and other behavior. Those banks remain reference inputs, not the factual authority for the new chapter. Reconcile them in a separate bank pass before republishing the full portal.

## Detection Coverage Preservation

| Previous theme | Revised location |
| --- | --- |
| CloudTrail management/data events and Insights | Section 2 |
| CloudTrail Lake | Sections 2.5 and 8.1, including availability correction |
| Organization logging | Section 3 |
| CloudWatch, Logs Insights, metrics and notification | Sections 4 and 9 |
| VPC Flow Logs and Resolver logs | Section 5 |
| GuardDuty protection, findings and organization setup | Section 6 |
| Security Hub | Section 7.1 with product distinction |
| Macie, Inspector and Access Analyzer | Section 7.3 and expanded foundations |
| Detective | Section 8.3 and expanded foundations |
| Security Lake / OCSF | Section 8.2 |
| Athena | Section 8.1 and expanded query foundations |
| EventBridge / SNS / response handoff | Section 9 |
| OpenSearch Security Analytics | Section 8.3 |
| Revision questions and readiness | Sections 12-13, now scenario based |

Added: Config/State Manager assessment mechanics, central archive security, detailed agent setup, missing-data reasoning, TGW logging, application logging failure paths, scoped lake subscribers, health checks, coverage verification and a complete company design.

## Sources And Verification

### Completion Of Sequential Domain Passes

Completed 2026-10-10. Topics 2-6 retain their existing reference and practice content while adding connected teaching paths, original multi-constraint workshops, inline foundations, and official-skill coverage maps. Each domain was validated, committed, and pushed before moving to the next.

Substantive corrections include IAM resource-policy exceptions and S3 object-tag condition keys; imported symmetric KMS key on-demand rotation and ACM exportable certificates; Config aggregation/remediation scope; and organization-policy/control enforcement boundaries. The strategy now records these recurring factual and coverage checks.

Residual scope: this pass is not a line-by-line revalidation of every historical question-bank answer. Those older banks need reconciliation before the complete portal is republished. Source/JSON/link validation is not an AWS deployment test or a rendered mobile/website review.

### Readability Pass

The follow-up editorial pass preserves the complete Detection teaching content and the foundations text while adding a more scannable reading structure. Topic 1 now has four grouped reading passes, focused subheadings, 24 text diagrams, and a consistent Situation / Decision / Options / Answer / Reasoning layout for the 16 practice scenarios.

The foundations file adds Detection quick navigation, clearer subsection boundaries, and three additional diagrams. In total, 17 text diagrams were added across the two files. The strategy now records reusable visual choices, paragraph guidance, scenario structure, stable-link rules, and content-preservation checks.

Verification compared against the files at the start of this editorial pass, including the substantive uncommitted content from the prior pass. All original text tokens remained in order, and all 187 original fenced examples across the two files remained intact. This is an editorial/source review, not a new factual review of every foundation topic or an AWS deployment test.

### Documentation Checks

The rewritten Detection chapter links the official AWS Domain 1 guide and relevant service documentation alongside explanations. Sources were checked on the review date. Examples are original teaching examples; no AWS infrastructure was provisioned to test them.

Markdown checks cover local relative links and heading anchors, fenced-block balance, JSON syntax in the updated teaching files, and Git whitespace errors. These catch document defects, not every service configuration error.

The GitHub export's `docs` directory is the working review copy. The corresponding Site `docs` copies are synchronized for later website integration. Generated website content and the live site are not updated by this Markdown-only pass. Older `outputs` files are historical artifacts, not the revised study path.
