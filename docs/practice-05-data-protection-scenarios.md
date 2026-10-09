# 5. Data Protection: Original Scenario Practice

[Bank index and sources](aws-security-scs-c03-scenario-bank-index.md) | [Study guide](05-data-protection-study-guide.md)

Candidate signals: R2, R4, R6, R8. Key permissions, custody, availability, and lifecycle are distinct concerns in these independently authored scenarios.

## DATA-01: Key Administration Still Works, Decryption Does Not

**Format:** Single answer. **Focus:** Custom key-store dependencies.

A regulated workload uses a KMS key backed by an AWS CloudHSM custom key store. After maintenance, administrators can still view the KMS key, its aliases, and its policy, but cryptographic operations fail. The custom key store is disconnected. The key policy and workload identity permissions are unchanged and still permit the operation. The HSM cluster retains the required key material.

Which action should be prioritized?

- A. Attach a broader identity policy because viewing key metadata proves the HSM connection is healthy.
- B. Diagnose and restore the custom key store's supported connection to the healthy HSM cluster, then test cryptographic use with the workload identity.
- C. Create a standard KMS key with the same alias and assume it can decrypt the existing ciphertext.
- D. Enable automatic rotation on the disconnected custom-store key to recover connectivity.

**Answer: B.** Metadata administration and successful cryptographic execution have different dependencies. The disconnected store is direct evidence of a missing operational dependency.

**Why the other choices fail:** A broadens permission without restoring key access. C does not reproduce the original key relationship by reusing an alias. D is not a connectivity repair, and custom-store keys do not offer that automatic-rotation path.

**Verify:** Check store/cluster health and connection details, then test existing ciphertext. Retain the operational monitoring that detects recurrence; a visible key in the console does not prove it is usable.

[CloudHSM custom key-store behavior](https://docs.aws.amazon.com/kms/latest/developerguide/keystore-cloudhsm.html).

## DATA-02: Old Imported Material Still Matters

**Format:** Single answer. **Focus:** Imported material after rotation.

A company uses an eligible symmetric KMS key with imported material. It completed supported on-demand rotation to newly imported material. Later, an older permanently associated material expires. The KMS key becomes unusable for cryptographic operations even though the newer material remains available. The company retained protected copies of all required original material.

Which response best addresses the dependency and future risk?

- A. Reimport the required expired material into the existing key using the supported process, and monitor the lifecycle of all associated material rather than only the current version.
- B. Repoint the alias to a new randomly generated key; old ciphertext follows the alias automatically.
- C. Delete every non-current material because rotation guarantees that all stored data was re-encrypted.
- D. Enable automatic rotation for imported material and wait for KMS to regenerate the customer's original bytes.

**Answer: A.** Current encryption material is not the only material needed for key availability and older ciphertext. Recovery requires the appropriate original material and key relationship.

**Why the other choices fail:** B changes future key selection, not old ciphertext's cryptographic dependency. C confuses rotation with bulk data re-encryption. D proposes neither a supported automatic-rotation solution for imported material nor a way to reconstruct lost customer bytes.

**Verify:** Check the key state and associated material inventory, then test older and newer ciphertext. Keep durable recovery copies and expiration alerts under separated access controls.

[Imported material availability](https://docs.aws.amazon.com/kms/latest/developerguide/import-keys-protect.html).

## DATA-03: A Renewed Certificate Is Not On The Server

**Format:** Single answer. **Focus:** Certificate management versus deployment.

A team requested an exportable ACM public certificate and installed it on its own TLS servers outside an ACM-managed service integration. ACM successfully renewed the certificate. Monitoring still finds the old certificate on one server, and clients will reject that endpoint when the old certificate expires. DNS and application routing are correct.

Which change closes the demonstrated lifecycle gap?

- A. Disable client certificate verification so the old server certificate remains accepted.
- B. Request the same DNS record again and assume that DNS validation replaces files on the server.
- C. Export and securely deploy the renewed certificate/key material through the supported process, reload the server as required, and verify the certificate actually served by each endpoint.
- D. Recreate the server's IAM role without changing certificate deployment.

**Answer: C.** Renewal in ACM and installation on self-managed servers are distinct steps. The scenario explicitly uses an exportable certificate, not an arbitrary non-exportable ACM certificate.

**Why the other choices fail:** A removes an important authentication check rather than fixing expiry. B confuses issuance validation with server configuration. D does not replace the TLS material presented by the server.

**Verify:** Check each endpoint's served certificate, expected names, chain, and expiration, and protect exported private material. Automate the renewal-to-deployment handoff with failure notification, not just renewal-status monitoring.

[ACM exportable certificate lifecycle](https://docs.aws.amazon.com/acm/latest/userguide/acm-exportable-certificates.html).

## DATA-04: Two Owners Must Authorize A Cross-Account Read

**Format:** Multiple response. **Select TWO.** **Focus:** S3 and KMS authorization together.

An analytics role in account A must read selected objects directly from a bucket in account B. The objects use a customer managed KMS key in B. The role's IAM policies in A already allow the required GetObject and Decrypt operations on the exact resources. No applicable explicit denies exist, the key is enabled, and there is no alternate grant. Review finds that neither B's bucket policy nor B's key policy permits the intended external role/account access.

Which two changes complete the missing authorization paths?

- A. Add an appropriately scoped bucket-policy grant for the intended role and objects.
- B. Add another identical IAM GetObject allow to the caller in A.
- C. Change the bucket default to SSE-S3 and assume existing KMS-encrypted objects are rewritten immediately.
- D. Grant only `kms:DescribeKey` to the role through the bucket policy.
- E. Add the required external-use authorization to B's customer managed key policy, scoped to the intended principal and cryptographic use.

**Answer: A and E.** The caller-side permissions already exist. The missing controls belong to the resource/key-owning account, and both data access and decryption must succeed.

**Why the other choices fail:** B duplicates the already-present caller grant. C neither preserves the stated encryption design nor rewrites existing objects automatically. D confuses S3 and KMS policy scopes and metadata access with decryption.

**Verify:** Read an allowed object using the real role, then test an out-of-scope object/key. Record the exact encryption key on each tested object rather than inferring it from today's default.

[Cross-account KMS authorization](https://docs.aws.amazon.com/kms/latest/developerguide/key-policy-modifying-external-accounts.html).

## DATA-05: Publish Only A Tested Secret Version

**Format:** Ordering. **Use all four steps.** **Focus:** Lambda-based secret rotation.

A database credential uses a supported Lambda rotation workflow. The application retrieves the current secret version, and the function must safely handle retries. The database and Secrets Manager are reachable, permissions are configured, and the task is to order the logical rotation stages, not to invent a new credential strategy.

- A. Test the candidate credential against the intended database/service.
- B. Create or reuse the candidate secret version for this rotation request.
- C. Promote the tested candidate to the current version using the supported stage update.
- D. Set the intended target credential to match the candidate according to the chosen rotation strategy.

**Answer: B -> D -> A -> C.**

**Reasoning:** B establishes the candidate consistently for retries. D changes the target's authentication state. A proves the candidate works before C exposes it as current to consumers. The function must verify that the candidate refers to the intended target rather than blindly trusting substituted host/user values.

**Closest wrong sequence:** B -> C -> D -> A allows applications to retrieve a password before the target accepts it. Existing pooled database connections are not proof that a fresh connection using the new secret succeeds.

**Verify:** Inspect version stages and function results without logging passwords; test a fresh application connection and refresh behavior after promotion.

[Secrets Manager rotation stages](https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotate-secrets_lambda-functions.html).

## DATA-06: Integrity, Retention, And Backup Are Different Promises

**Format:** Matching. **Use each response once.** **Focus:** Protection guarantees.

A records team has four requirements. All selected features will be configured in supported services with appropriate permissions. Match each requirement to the most direct mechanism.

| Requirement | Required property |
| --- | --- |
| 1 | Keep earlier S3 object versions available after later writes, without claiming mandatory non-deletability |
| 2 | Prevent deletion/shortening of an S3 object version's compliance-mode retention during its protected period |
| 3 | Apply immutable retention controls to supported AWS Backup recovery points using the appropriate vault-lock mode |
| 4 | Validate that a deployment artifact was signed by a trusted publisher and has not changed since signing |

Responses:

- A. Digital signature verification with a trusted signing-key relationship
- B. S3 Object Lock with configured compliance retention
- C. S3 Versioning
- D. AWS Backup Vault Lock with the required compliance-mode lifecycle

**Answer: 1-C, 2-B, 3-D, 4-A.**

**Reasoning:** Versioning retains versions but is not itself mandatory immutable retention. Object Lock protects the configured object version. Vault Lock operates on the backup-vault/recovery-point model, with important grace-period/retention details. Signatures establish integrity and signer association when verified correctly; encryption alone does not establish publisher identity.

**Verify:** Include the dependencies each feature does not preserve automatically, especially key availability, trusted verification keys, restore permissions, and application usability.

[Review retention and recovery](05-data-protection-study-guide.md#e-prove-that-retained-data-can-be-recovered).
