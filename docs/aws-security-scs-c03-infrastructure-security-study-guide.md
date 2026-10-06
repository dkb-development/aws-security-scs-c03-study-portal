# AWS Security Specialty SCS-C03 Infrastructure Security Study Guide

Generated: 2026-10-06

This guide is exam-focused. It is based on the question bank and topic signals collected in this workspace, official AWS documentation, and original synthesis. It does not contain copied real exam questions, paid course content, or dumps.

Use it as a reverse-engineered study path: learn the infrastructure patterns that appear repeatedly, then practice the related questions in the portal.

---

## 0. AWS Component Primer: What Each Service Does First

This section explains the AWS components in simple words before going into exam decision rules.

Official references used for service meaning:

- SCS-C03 Infrastructure Security domain: https://docs.aws.amazon.com/aws-certification/latest/security-specialty-03/security-specialty-03-domain3.html
- Security groups: https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html
- Network ACLs: https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html
- AWS Network Firewall: https://docs.aws.amazon.com/network-firewall/latest/developerguide/what-is-aws-network-firewall.html
- AWS WAF: https://docs.aws.amazon.com/waf/latest/developerguide/waf-chapter.html
- AWS Shield and Shield Advanced: https://docs.aws.amazon.com/waf/latest/developerguide/ddos-overview.html
- CloudFront Origin Access Control: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html
- API Gateway mutual TLS: https://docs.aws.amazon.com/apigateway/latest/developerguide/rest-api-mutual-tls.html
- AWS PrivateLink and VPC endpoints: https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-aws-services.html
- AWS Verified Access: https://docs.aws.amazon.com/verified-access/latest/ug/what-is-verified-access.html
- VPC Traffic Mirroring: https://docs.aws.amazon.com/vpc/latest/mirroring/what-is-traffic-mirroring.html
- VPC Network Access Analyzer: https://docs.aws.amazon.com/vpc/latest/network-access-analyzer/what-is-network-access-analyzer.html
- EC2 Image Builder: https://docs.aws.amazon.com/imagebuilder/latest/userguide/what-is-image-builder.html
- Systems Manager Patch Manager: https://docs.aws.amazon.com/systems-manager/latest/userguide/patch-manager.html
- Amazon Inspector: https://docs.aws.amazon.com/inspector/latest/user/what-is-inspector.html
- EC2 Instance Metadata Service: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html
- Amazon Bedrock Guardrails: https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html
- AWS Transit Gateway: https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html
- AWS Direct Connect: https://docs.aws.amazon.com/directconnect/latest/UserGuide/Welcome.html

I am using text diagrams instead of screenshots because AWS console screens change often. Text diagrams are searchable, easy to revise, and work offline.

---

### 0.1 Infrastructure Security In AWS: What It Means

Infrastructure Security means protecting the places where workloads run and the network paths around them.

Plain English:

> Infrastructure Security is about who can reach your workloads, how traffic flows, what is exposed to the internet, how compute is hardened, and how private/hybrid connectivity is secured.

Real-world example:

A company runs a web app on EC2 behind an ALB and CloudFront. The app needs:

- internet edge protection
- Layer 7 request filtering
- DDoS protection
- private S3 origin access
- private database access
- locked-down EC2 administration
- vulnerability scanning
- secure hybrid network connectivity

That is Infrastructure Security.

Simple flow:

```text
Internet users
   |
   v
CloudFront / WAF / Shield
   |
   v
ALB / API Gateway
   |
   v
VPC network controls
   |
   v
Compute workload
   |
   v
Private data services
```

Exam angle:

Infrastructure questions usually ask:

- Which control works at which layer?
- Which service handles edge, network, compute, or private access?
- Which control is stateful or stateless?
- Which component needs routing, security groups, DNS, or IAM policy changes?
- Which managed service is the least operationally heavy answer?

---

### 0.2 Security Groups: Instance Or ENI-Level Allow Rules

Security groups are virtual firewalls attached to resources such as EC2 instances, ENIs, load balancers, and VPC endpoints.

Plain English:

> A security group says what traffic is allowed into and out of a resource.

Real-world example:

An EC2 instance should accept HTTPS only from an ALB security group, not from the whole internet.

Simple flow:

```text
Client
  |
  v
ALB security group
  |
  v
EC2 security group allows source = ALB security group on port 443
```

Example rule:

```text
Inbound:
  Type: HTTPS
  Port: 443
  Source: sg-alb12345
```

Exam angle:

Security groups are:

- stateful
- allow-only
- attached to ENIs/resources
- good for workload-level access control
- able to reference other security groups as sources or destinations

Trap:

Security groups cannot create explicit deny rules. If the question requires an explicit deny at subnet level, think NACL.

---

### 0.3 Network ACLs: Subnet-Level Allow And Deny Rules

Network ACLs control traffic entering and leaving subnets.

Plain English:

> A NACL is a subnet gate with numbered allow and deny rules.

Real-world example:

You want to block a known bad CIDR from reaching any instance in a subnet before it gets to instance-level controls.

Simple flow:

```text
Traffic enters subnet
      |
      v
NACL inbound rules, lowest number first
      |
      v
If allowed, traffic reaches resource security group
```

Example rule idea:

```text
Rule 100: DENY TCP 443 from 203.0.113.0/24
Rule 200: ALLOW TCP 443 from 0.0.0.0/0
Rule *: DENY all
```

Exam angle:

NACLs are:

- stateless
- subnet-level
- explicit allow and deny
- evaluated in rule-number order, lowest first
- applied both inbound and outbound

Trap:

Because NACLs are stateless, return traffic needs rules too. This is where ephemeral ports often appear in exam questions.

Another trap:

NACLs do not filter some VPC infrastructure traffic such as Route 53 Resolver DNS or IMDS. For DNS filtering, think Route 53 Resolver DNS Firewall.

---

### 0.4 AWS Network Firewall: Managed VPC Firewall And Deep Inspection

AWS Network Firewall is a managed network firewall for VPC traffic.

Plain English:

> Network Firewall is for centralized, stateful network inspection inside or at the edge of your VPC.

Real-world example:

Private subnets must access the internet through a firewall that blocks known malicious domains and inspects traffic before it goes to a NAT gateway.

Simple flow:

```text
Private subnet route table
      |
      v
Network Firewall endpoint
      |
      v
NAT gateway
      |
      v
Internet gateway
```

What it can do:

- stateful inspection
- stateless rules
- domain-based filtering
- Suricata-compatible rules
- intrusion detection and prevention patterns
- north/south and east/west inspection when routed correctly

Exam angle:

Choose Network Firewall when the question says:

- managed network firewall
- stateful VPC traffic inspection
- domain-based egress filtering
- Suricata-compatible rules
- traffic inspection beyond security groups and NACLs

Trap:

Network Firewall is not automatically in the path. You must route traffic through firewall endpoints.

---

### 0.5 Route 53 Resolver DNS Firewall: DNS Filtering

Route 53 Resolver DNS Firewall filters DNS queries from VPCs.

Plain English:

> DNS Firewall blocks or allows domain lookups before a workload connects to the destination.

Real-world example:

Your workloads should not resolve known malware domains or domains on a corporate block list.

Simple flow:

```text
EC2 instance
   |
   v
Route 53 Resolver
   |
   v
DNS Firewall rule group
   |
   +--> allow domain
   +--> block domain
```

Exam angle:

Choose DNS Firewall when:

- the question is about DNS query filtering
- NACL cannot block AmazonProvidedDNS traffic
- you need block/allow domain lists at resolver level

Trap:

DNS filtering is not the same as full network egress inspection. For packets and flows, think security groups, NACLs, Network Firewall, or traffic mirroring.

---

### 0.6 AWS WAF: Layer 7 Web Request Filtering

AWS WAF is a web application firewall.

Plain English:

> WAF checks HTTP and HTTPS requests before they reach your web application.

Real-world example:

A public application needs protection from SQL injection, cross-site scripting, suspicious headers, IP reputation lists, high request rates, and bot traffic.

Simple flow:

```text
Viewer request
      |
      v
CloudFront / ALB / API Gateway
      |
      v
AWS WAF web ACL
      |
      +--> allow
      +--> block
      +--> count
      +--> CAPTCHA / challenge
```

AWS WAF can attach to resources such as:

- CloudFront distributions
- Application Load Balancers
- API Gateway REST APIs
- AppSync GraphQL APIs
- Cognito user pools
- Verified Access instances

Exam angle:

Choose WAF when the question says:

- Layer 7 web attacks
- OWASP Top 10
- SQL injection
- cross-site scripting
- HTTP header/query/body matching
- rate-based web request controls
- bot control
- CAPTCHA or challenge

Trap:

WAF does not attach directly to an EC2 instance. Put CloudFront, ALB, API Gateway, or another supported resource in front.

---

### 0.7 AWS Shield And Shield Advanced: DDoS Protection

AWS Shield protects against DDoS attacks.

Plain English:

> Shield helps protect AWS resources when attackers flood them with traffic.

Real-world example:

A critical public application gets hit by a traffic flood. The company wants enhanced DDoS protections, visibility, cost protection, and AWS response support.

Simple flow:

```text
DDoS traffic
   |
   v
AWS edge / AWS Shield
   |
   v
CloudFront / Route 53 / ALB / NLB / Elastic IP
```

Exam angle:

Choose Shield Advanced when the question says:

- enhanced DDoS protection
- critical internet-facing application
- cost protection
- specialized DDoS response support
- advanced visibility into DDoS events

Choose WAF instead when the question is about application request matching, SQL injection, bots, CAPTCHA, or rate-based web rules.

Trap:

Shield Standard is automatic. Shield Advanced is the paid enhanced tier.

---

### 0.8 CloudFront Origin Access Control: Private S3 Origin Access

CloudFront Origin Access Control, or OAC, lets CloudFront securely access private S3 origins.

Plain English:

> OAC lets users access S3 content through CloudFront without making the S3 bucket public.

Real-world example:

A static site stores content in S3. Users should only access files through CloudFront. Direct S3 access must be blocked.

Simple flow:

```text
Viewer
  |
  v
CloudFront distribution
  |
  v
OAC signs request
  |
  v
Private S3 bucket allows CloudFront service principal
```

Example bucket policy shape:

```json
{
  "Effect": "Allow",
  "Principal": {
    "Service": "cloudfront.amazonaws.com"
  },
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::example-bucket/*",
  "Condition": {
    "StringEquals": {
      "AWS:SourceArn": "arn:aws:cloudfront::111122223333:distribution/EXAMPLE"
    }
  }
}
```

Exam angle:

Choose OAC when:

- CloudFront in front of private S3
- modern replacement for OAI
- S3 objects use SSE-KMS
- bucket should not be public

Trap:

OAC is for regular S3 bucket origins, not S3 static website endpoints. S3 website endpoints are custom origins.

---

### 0.9 API Gateway Mutual TLS: Client Certificate Authentication

API Gateway mutual TLS requires clients to present trusted X.509 certificates.

Plain English:

> mTLS means both sides prove identity: the server presents a certificate, and the client presents a certificate too.

Real-world example:

A business-to-business API should only accept requests from partners that have approved client certificates.

Simple flow:

```text
Client with certificate
      |
      v
API Gateway custom domain with mTLS
      |
      v
Truststore in S3
      |
      v
Backend integration
```

Exam angle:

Choose API Gateway mTLS when:

- callers must present client certificates
- custom domain is used
- truststore is in S3
- B2B or IoT-style certificate authentication

Trap:

API Gateway mTLS is configured on a custom domain name. Also, to force clients to use mTLS, disable the default execute-api endpoint.

---

### 0.10 VPC Endpoints And AWS PrivateLink: Private AWS Service Access

VPC endpoints let workloads privately access supported AWS services.

Plain English:

> A VPC endpoint lets a private subnet call AWS services without going through the public internet path.

Real-world example:

An EC2 instance in a private subnet needs to call Secrets Manager, SSM, CloudWatch, or S3 without a NAT gateway.

Simple flow:

```text
Private subnet workload
      |
      v
VPC endpoint
      |
      v
AWS service
```

Endpoint types:

| Endpoint type | Common use | Key idea |
|---|---|---|
| Gateway endpoint | S3, DynamoDB | Route table target |
| Interface endpoint | Many AWS services | ENIs with private IPs and security groups |
| Gateway Load Balancer endpoint | Appliance insertion | Security appliance traffic path |

Exam angle:

Choose VPC endpoints or PrivateLink when:

- private access to AWS services
- no internet gateway or NAT gateway
- keep traffic private
- endpoint policy controls allowed access
- private DNS troubleshooting appears

Trap:

Interface endpoints have ENIs and security groups. If a private subnet cannot reach the endpoint, check:

- endpoint security group
- workload security group
- subnet/AZ placement
- private DNS setting
- route table for gateway endpoints
- endpoint policy

---

### 0.11 AWS Verified Access: App Access Without Traditional VPN

Verified Access provides secure access to applications based on identity and device context.

Plain English:

> Verified Access lets users reach private apps without giving them broad network access through a VPN.

Real-world example:

Employees need browser access to internal apps. The company wants each request checked against user identity and device posture.

Simple flow:

```text
User request
   |
   v
Verified Access
   |
   +--> identity signal
   +--> device signal
   +--> policy decision
   |
   v
Private application
```

Exam angle:

Choose Verified Access when:

- private application access
- identity and device posture
- no traditional VPN
- per-request evaluation
- zero-trust style access

Trap:

Verified Access is not a general network pipe like Site-to-Site VPN or Direct Connect. It is application access control.

---

### 0.12 Transit Gateway: Scalable VPC And Hybrid Routing Hub

Transit Gateway connects VPCs and on-premises networks through a central hub.

Plain English:

> Transit Gateway is a cloud router for many VPCs and networks.

Real-world example:

A company has 80 VPCs and on-premises networks. Full-mesh VPC peering is hard to manage. Transit Gateway gives a central routing model.

Simple flow:

```text
VPC A
  |
  +--> Transit Gateway route table --> VPC B
  |
  +--> Direct Connect gateway
  |
  +--> VPN
```

Exam angle:

Choose Transit Gateway when:

- many VPCs
- hub-and-spoke routing
- route table segmentation
- hybrid connectivity at scale
- shared services VPC patterns

Trap:

Transit Gateway route tables control segmentation. Do not assume every attached VPC can reach every other VPC automatically in a secure design.

---

### 0.13 Direct Connect And VPN: Hybrid Connectivity

Direct Connect is a dedicated private network connection from your environment to AWS. Site-to-Site VPN is encrypted connectivity over the internet.

Plain English:

> Direct Connect gives private dedicated connectivity. VPN gives encrypted tunnels over the internet.

Real-world examples:

- Use Direct Connect for predictable private connectivity and high throughput.
- Use Site-to-Site VPN for encrypted connectivity, backup, or faster setup.
- Use Direct Connect plus VPN when encryption over Direct Connect is required and MACsec is not the answer.

Simple flow:

```text
On-premises router
      |
      +--> Direct Connect connection
      |       |
      |       +--> private VIF -> VPC
      |       +--> transit VIF -> Transit Gateway
      |       +--> public VIF -> public AWS services
      |
      +--> Site-to-Site VPN tunnel
```

Exam angle:

Know these terms:

| Term | Meaning |
|---|---|
| Private VIF | Private access to VPC resources |
| Public VIF | Access AWS public service endpoints |
| Transit VIF | Connect to Transit Gateway through Direct Connect gateway |
| MACsec | Layer 2 encryption for supported Direct Connect connections |
| VPN | IPsec tunnels over internet path |

Trap:

Direct Connect alone is not automatically encrypted at the application layer. Read the question carefully if it asks for encryption in transit.

---

### 0.14 VPC Traffic Mirroring: Packet Copies For Inspection

Traffic Mirroring copies network packets from an ENI to a monitoring target.

Plain English:

> Traffic Mirroring is for packet-level inspection, not just flow metadata.

Real-world example:

A security team runs an IDS appliance and wants a copy of selected EC2 traffic for deep inspection.

Simple flow:

```text
Source ENI
   |
   v
Traffic mirror filter
   |
   v
Traffic mirror target
   |
   v
IDS / monitoring appliance
```

Exam angle:

Choose Traffic Mirroring when:

- full packet copies
- IDS/IPS appliance
- deep packet inspection by third-party tool
- VPC Flow Logs are insufficient

Trap:

VPC Flow Logs give metadata. Traffic Mirroring gives packet copies.

---

### 0.15 VPC Network Access Analyzer: Find Unintended Reachability

Network Access Analyzer checks whether network paths match your intent.

Plain English:

> Network Access Analyzer helps answer "Can this resource be reached from there?"

Real-world example:

Before go-live, a team wants to prove that databases are not reachable from the internet.

Simple flow:

```text
Define unwanted path
      |
      v
Network Access Analyzer
      |
      v
Find matching network paths
      |
      v
Fix route table / SG / NACL / gateway issue
```

Exam angle:

Choose Network Access Analyzer when:

- identify unintended network access
- prove isolation
- analyze reachability paths
- pre-attack exposure discovery

Trap:

Network Access Analyzer finds paths. It is not a firewall by itself.

---

### 0.16 Amazon Inspector: Vulnerability Scanning For Workloads

Amazon Inspector scans workloads for vulnerabilities and exposure.

Plain English:

> Inspector looks for known vulnerabilities in deployed workloads.

Real-world example:

The security team needs continuous vulnerability scanning for EC2 instances, ECR container images, and Lambda functions.

Simple flow:

```text
EC2 / ECR / Lambda
      |
      v
Amazon Inspector
      |
      v
Findings
      |
      v
Security Hub / remediation workflow
```

Exam angle:

Choose Inspector when:

- vulnerability scanning
- EC2 packages
- ECR container image vulnerabilities
- Lambda function vulnerabilities
- network reachability findings

Trap:

Inspector scans for vulnerabilities. It is not the same as GuardDuty threat detection or Macie S3 sensitive-data discovery.

---

### 0.17 EC2 Image Builder: Hardened AMIs And Container Images

EC2 Image Builder automates creation and maintenance of machine images and container images.

Plain English:

> Image Builder helps create secure, patched, tested images repeatedly.

Real-world example:

A company wants every EC2 instance to start from a golden AMI that already includes hardening settings, security agents, approved packages, and tests.

Simple flow:

```text
Base image
   |
   v
Image Builder recipe
   |
   +--> install patches
   +--> apply hardening
   +--> run tests
   |
   v
Approved AMI / container image
   |
   v
Distribution to accounts and Regions
```

Exam angle:

Choose EC2 Image Builder when:

- hardened AMIs
- golden images
- repeatable image pipeline
- patched server images
- tested and approved images

Trap:

Image Builder helps before deployment. Patch Manager helps keep running managed nodes patched after deployment.

---

### 0.18 Systems Manager Patch Manager: Patch Running Fleets

Patch Manager automates patching for managed nodes.

Plain English:

> Patch Manager keeps running instances and managed nodes patched according to your rules.

Real-world example:

A company has EC2 instances across many accounts. It needs scheduled patching, patch baselines, compliance reporting, and controlled rollout.

Simple flow:

```text
Managed nodes
   |
   v
Patch baseline / patch policy
   |
   v
Scan or install
   |
   v
Compliance result
```

Exam angle:

Choose Patch Manager when:

- patch EC2 fleets
- scan for missing patches
- apply approved patches
- patch compliance reports
- multi-account patch policy through Systems Manager Quick Setup

Trap:

Patch Manager compliance means patches required by your baseline are installed. It does not mean the entire workload is secure.

---

### 0.19 Systems Manager Session Manager: Secure Admin Access

Session Manager gives shell access to managed instances without inbound SSH or RDP.

Plain English:

> Session Manager replaces many bastion-host and SSH-key patterns.

Real-world example:

Administrators need access to private EC2 instances, but security policy bans inbound SSH and public IPs.

Simple flow:

```text
Admin IAM identity
      |
      v
Session Manager
      |
      v
SSM Agent on EC2
      |
      v
Audited session
```

Exam angle:

Choose Session Manager when:

- no inbound administrative ports
- audited access
- private instances
- no bastion host
- no SSH key pair management

Trap:

The instance needs SSM Agent, IAM permissions, and network access to Systems Manager endpoints.

---

### 0.20 IMDSv2: Safer EC2 Metadata Access

The Instance Metadata Service gives EC2 instances metadata and role credentials. IMDSv2 adds session-oriented protections.

Plain English:

> IMDSv2 makes it harder for SSRF-style attacks to steal instance role credentials.

Real-world example:

A vulnerable web app can make server-side HTTP requests. If IMDSv1 is allowed, an attacker may try to call the metadata endpoint. Enforcing IMDSv2 reduces that risk.

Simple flow:

```text
Application on EC2
      |
      v
Needs role credentials
      |
      v
IMDSv2 token request
      |
      v
Metadata request with token
```

Exam angle:

Choose IMDSv2 when:

- prevent SSRF access to metadata
- require metadata tokens
- harden EC2 instance role credential access

Trap:

IMDSv2 is not a replacement for least-privilege IAM roles. It protects access to metadata; the role still needs correct permissions.

---

### 0.21 Amazon Bedrock Guardrails: GenAI Application Protection

Bedrock Guardrails provides safeguards for generative AI applications.

Plain English:

> Guardrails help filter unsafe prompts, unsafe outputs, denied topics, sensitive data, and hallucination-style issues.

Real-world example:

A customer-support chatbot must avoid disallowed advice, block harmful content, and mask PII in responses.

Simple flow:

```text
User prompt
   |
   v
Bedrock Guardrail
   |
   +--> content filter
   +--> denied topic filter
   +--> sensitive information filter
   +--> grounding check
   |
   v
Foundation model / response
```

Exam angle:

Choose Bedrock Guardrails when:

- GenAI safety
- prompt attack protection
- harmful content filtering
- denied topics
- PII masking in prompts or responses
- contextual grounding checks

Trap:

WAF protects HTTP requests at the application edge. Bedrock Guardrails protect GenAI input/output behavior. They are different layers.

---

### 0.22 Quick Component Map

| Need | Best-fit service or feature |
|---|---|
| Allow-only resource firewall | Security group |
| Subnet-level explicit deny | Network ACL |
| Stateful VPC network inspection | AWS Network Firewall |
| DNS query filtering | Route 53 Resolver DNS Firewall |
| Web app Layer 7 filtering | AWS WAF |
| DDoS protection and response support | Shield Advanced |
| Private S3 through CloudFront | CloudFront OAC |
| Client certificate auth for APIs | API Gateway mTLS |
| Private AWS service access | VPC endpoint / PrivateLink |
| Private app access without VPN | Verified Access |
| Many VPC and hybrid routing hub | Transit Gateway |
| Dedicated private on-premises connection | Direct Connect |
| Packet copies to IDS | Traffic Mirroring |
| Find unintended network paths | Network Access Analyzer |
| Vulnerability scanning | Amazon Inspector |
| Hardened image pipeline | EC2 Image Builder |
| Patch running EC2 fleets | Patch Manager |
| Admin access without SSH | Session Manager |
| Protect metadata credentials from SSRF | IMDSv2 |
| GenAI safety controls | Bedrock Guardrails |

---

## 1. What This Domain Means In The Exam

Infrastructure Security is 18% of scored SCS-C03 content.

Official SCS-C03 task groups:

| Official task | Meaning in simple words |
|---|---|
| Task 3.1: Network edge services | Protect internet-facing and edge-facing applications with CloudFront, WAF, Shield, geolocation, rate limiting, and related controls. |
| Task 3.2: Compute workloads | Harden, scan, patch, and safely administer EC2, containers, Lambda, and GenAI-related workloads. |
| Task 3.3: Network security controls | Design and troubleshoot VPC controls, segmentation, hybrid connectivity, private access, and reachability. |

Local question-bank signal:

| Infrastructure cluster | Local question count |
|---|---:|
| Edge protection | 106 |
| Network controls | 86 |
| Compute controls | 32 |
| Private and hybrid access | 13 |
| Total | 237 |

What this tells us:

- Edge controls are the highest-signal part of the collected bank.
- Security group vs NACL vs Network Firewall is core.
- WAF vs Shield appears repeatedly.
- CloudFront OAC and API Gateway mTLS are high-value details.
- Compute controls appear through Inspector, Image Builder, Patch Manager, Session Manager, IMDSv2, and GenAI protections.
- Private/hybrid access is smaller in count but still very exam-relevant because it creates tricky design choices.

---

## 2. The Core Mental Model

Use this model:

```text
Edge:
  CloudFront, WAF, Shield, Route 53, API Gateway

Network:
  Security groups, NACLs, Network Firewall, DNS Firewall, endpoints, TGW

Compute:
  Inspector, Image Builder, Patch Manager, Session Manager, IMDSv2

Private/hybrid:
  PrivateLink, Verified Access, Direct Connect, VPN, Transit Gateway

GenAI and modern app controls:
  Bedrock Guardrails, IAM, logging, encryption, network isolation
```

Short version:

```text
Protect entry points -> segment networks -> harden workloads -> keep access private -> verify exposure
```

Exam trick:

Many wrong answers choose a service that is real but works at the wrong layer.

Example:

```text
SQL injection?              -> WAF, not Network Firewall
DDoS response support?      -> Shield Advanced, not WAF alone
Subnet explicit deny?       -> NACL, not security group
Full packet copy?           -> Traffic Mirroring, not Flow Logs
Private AWS service access? -> VPC endpoint, not public NAT path
```

---

## 3. High-Return Topics From The Question Signals

| Priority | Topic | Why it matters | Exam action |
|---|---|---|---|
| Very high | WAF vs Shield | Most common edge comparison | WAF for Layer 7 request filtering; Shield Advanced for DDoS support/cost protection |
| Very high | Security group vs NACL | Classic AWS networking decision | SG is stateful allow-only resource control; NACL is stateless allow/deny subnet control |
| Very high | VPC endpoints and PrivateLink | Many private-access scenarios | Interface endpoint has ENIs/SG/private DNS; gateway endpoint uses route tables |
| High | Network Firewall | Strong signal for stateful inspection and domain egress filtering | Route traffic through firewall endpoints |
| High | CloudFront OAC | Repeated S3-private-origin pattern | Use OAC over legacy OAI for new S3 origin designs |
| High | CloudFront/ALB origin protection | Prevent direct origin access | Use custom headers, SGs, OAC, HTTPS-only patterns |
| High | Inspector | Repeated compute vulnerability scanning | Use for EC2, ECR, Lambda vulnerability findings |
| High | Bedrock Guardrails | Newer SCS-C03 infrastructure topic | Use for prompt attacks, harmful content, denied topics, sensitive info filters |
| Medium-high | API Gateway mTLS | Specific but testable | Use custom domain and S3 truststore; disable execute-api endpoint if needed |
| Medium-high | Session Manager | Secure admin access | Avoid bastions and inbound SSH/RDP |
| Medium-high | Image Builder vs Patch Manager | Before vs after deployment | Image Builder creates hardened images; Patch Manager patches running fleets |
| Medium | Transit Gateway | Scalable segmentation | Use route tables and attachments |
| Medium | Direct Connect vs VPN | Hybrid connectivity | DX for private dedicated path, VPN for encrypted internet tunnels |
| Medium | Network Access Analyzer | Exposure discovery | Identify unintended reachability paths |
| Medium | Traffic Mirroring | Packet-level inspection | Use when Flow Logs metadata is not enough |

---

## 4. Scenario 1: Security Group vs NACL

This is the most fundamental infrastructure decision.

### Good Mental Model

```text
Security group = resource-level allow list
NACL           = subnet-level rule table with allow and deny
```

### Comparison Table

| Feature | Security group | Network ACL |
|---|---|---|
| Scope | ENI/resource | Subnet |
| Rule type | Allow only | Allow and deny |
| State | Stateful | Stateless |
| Evaluation | All matching allow rules | Lowest rule number first |
| Return traffic | Automatically allowed | Must be explicitly allowed |
| Best for | Workload access | Subnet boundary filtering |

### Real-World Example

Requirement:

```text
Only ALB can reach EC2 app instances on port 443.
```

Best answer:

```text
EC2 security group inbound source = ALB security group, port 443.
```

Requirement:

```text
Block a known malicious CIDR from all resources in a subnet.
```

Best answer:

```text
NACL deny rule with lower rule number than the allow rule.
```

### Exam Trap

If ping or a connection fails, do not only check inbound rules. For NACLs, return traffic matters.

```text
Client ephemeral port <---- response traffic must be allowed by NACL
```

---

## 5. Scenario 2: Stateful Inspection And Egress Filtering

### What The Question Usually Says

```text
Private subnet workloads must access the internet, but only approved domains.
Need stateful inspection.
Security groups and NACLs are insufficient.
```

### Best Pattern

```text
Private subnet route table
      |
      v
Network Firewall endpoint
      |
      v
NAT gateway
      |
      v
Internet gateway
```

### Why

Network Firewall gives managed VPC-level inspection, including stateful rule groups and domain-based filtering. Security groups and NACLs are simpler packet controls and do not provide the same inspection model.

### Common Mistake

```text
Create a NACL deny rule for every bad domain.
```

Why wrong:

NACLs work with IPs and ports, not domain-intelligence-style filtering.

---

## 6. Scenario 3: WAF vs Shield

### What The Services Do

```text
WAF:
  Looks inside HTTP/HTTPS web requests.

Shield:
  Protects against DDoS attacks.
```

### Decision Table

| Requirement | Choose |
|---|---|
| SQL injection protection | WAF |
| Cross-site scripting protection | WAF |
| Rate-based web request blocking | WAF |
| Bot control, CAPTCHA, challenge | WAF |
| Network/transport DDoS protection | Shield |
| Enhanced DDoS visibility and response support | Shield Advanced |
| DDoS cost protection | Shield Advanced |
| Centralized WAF rollout across accounts | Firewall Manager |

### Real-World Example

Requirement:

```text
Block requests from bots that are performing credential stuffing.
```

Best answer:

```text
AWS WAF Bot Control or Fraud Control style protections.
```

Requirement:

```text
Critical application needs advanced DDoS response support and cost protection.
```

Best answer:

```text
AWS Shield Advanced.
```

### Exam Trap

WAF rate-based rules can help with Layer 7 floods, but if the wording emphasizes DDoS support, cost protection, and specialized response help, Shield Advanced is usually the stronger answer.

---

## 7. Scenario 4: Private S3 Origin Behind CloudFront

### What The Question Usually Says

```text
Users should access S3 content only through CloudFront.
The S3 bucket must not be public.
New design.
```

### Best Pattern

```text
Viewer
  |
  v
CloudFront
  |
  v
OAC signed request
  |
  v
Private S3 bucket policy allows CloudFront service principal
```

### Why OAC

OAC is the current preferred CloudFront-to-S3 private origin pattern for new designs. It supports newer S3 Regions, SSE-KMS, and dynamic requests better than legacy OAI.

### Bucket Policy Shape

```json
{
  "Effect": "Allow",
  "Principal": {
    "Service": "cloudfront.amazonaws.com"
  },
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::example-bucket/*",
  "Condition": {
    "StringEquals": {
      "AWS:SourceArn": "arn:aws:cloudfront::111122223333:distribution/EXAMPLE"
    }
  }
}
```

### Exam Trap

Do not make the S3 bucket public and rely only on obscurity. The bucket policy should allow CloudFront and deny direct public access.

---

## 8. Scenario 5: Protect ALB Origin Behind CloudFront

### What The Question Usually Says

```text
Application uses CloudFront in front of ALB.
Users must not bypass CloudFront by calling ALB directly.
Traffic must remain HTTPS.
```

### Good Pattern

```text
Viewer -> HTTPS -> CloudFront -> HTTPS -> ALB
                         |
                         +--> origin custom header
                              validated by app or ALB rule
```

Additional controls:

- restrict ALB security group to CloudFront origin-facing prefix list when appropriate
- require HTTPS from viewer to CloudFront
- require HTTPS from CloudFront to origin
- validate a secret custom header at the origin

### Exam Trap

Do not choose "make ALB public and hope users use CloudFront." Direct ALB access must be blocked or rejected.

---

## 9. Scenario 6: API Gateway Mutual TLS

### What The Question Usually Says

```text
Clients must present certificates.
API must trust only approved client CAs.
B2B or IoT style integration.
```

### Best Pattern

```text
Client certificate
      |
      v
API Gateway custom domain with mTLS
      |
      v
S3 truststore
      |
      v
API backend
```

### Key Exam Details

- mTLS uses a custom domain.
- The truststore is stored in S3.
- Clients present certificates from trusted CAs.
- Disable the default execute-api endpoint if clients must use only the mTLS custom domain.

### Trap

API Gateway mTLS is not just an IAM authorizer. It happens during TLS negotiation using client certificates.

---

## 10. Scenario 7: Private AWS Service Access

### What The Question Usually Says

```text
Private subnet workload must call AWS service.
No internet gateway or NAT gateway.
Keep traffic private.
```

### Best Pattern

```text
Private subnet
  |
  +--> Interface endpoint for Secrets Manager / SSM / CloudWatch / etc.
  |
  +--> Gateway endpoint for S3 or DynamoDB
```

### Troubleshooting Checklist

If a private instance cannot reach an interface endpoint, check:

```text
1. Endpoint exists in reachable AZ/subnet.
2. Endpoint security group allows inbound from workload.
3. Workload security group allows outbound to endpoint.
4. Private DNS is enabled if using normal service hostname.
5. VPC DNS hostnames and resolution are enabled.
6. Endpoint policy allows the intended action/resource.
```

For gateway endpoints, check:

```text
1. Route table has gateway endpoint route.
2. Endpoint policy allows action/resource.
3. Resource policy does not deny the request.
4. IAM policy allows the request.
```

### Exam Trap

Endpoint policies do not replace IAM and resource policies. Authorization can still fail because of IAM, bucket policy, KMS key policy, SCP, or explicit deny.

---

## 11. Scenario 8: Private App Access Without VPN

### What The Question Usually Says

```text
Employees need access to internal web applications.
Do not use a traditional VPN.
Evaluate every request based on identity and device posture.
```

### Best Answer

```text
AWS Verified Access
```

### Why

Verified Access focuses on application access decisions. It can use identity and device context for each request.

### Trap

If the requirement is full network connectivity to VPC resources, Verified Access may not be enough. For network-level hybrid access, think VPN, Direct Connect, or Client VPN.

---

## 12. Scenario 9: Hybrid Connectivity

### Decision Tree

```text
Need quick encrypted tunnels over internet?
    -> Site-to-Site VPN

Need dedicated private connectivity and predictable bandwidth?
    -> Direct Connect

Need encryption over Direct Connect?
    -> MACsec if supported, or VPN over Direct Connect depending on requirement

Need many VPCs and on-premises networks connected centrally?
    -> Transit Gateway

Need app access without full network VPN?
    -> Verified Access
```

### VIF Memory Table

| VIF | Use |
|---|---|
| Private VIF | Access a VPC using private IPs |
| Public VIF | Access AWS public services |
| Transit VIF | Access Transit Gateway through Direct Connect gateway |

### Trap

Direct Connect improves private connectivity, but encryption requirements still matter. If the question says traffic must be encrypted, look for MACsec, VPN, TLS, or application encryption depending on context.

---

## 13. Scenario 10: Compute Hardening

### Main Compute Controls

```text
Before deployment:
  EC2 Image Builder
  approved AMIs
  hardened container images
  code scanning

During runtime:
  Amazon Inspector
  Patch Manager
  Session Manager
  IMDSv2
  GuardDuty runtime signals
```

### Common Comparisons

| Requirement | Choose |
|---|---|
| Create hardened golden AMIs | EC2 Image Builder |
| Patch running EC2 fleet | Patch Manager |
| Scan EC2/ECR/Lambda vulnerabilities | Inspector |
| Admin shell without inbound SSH | Session Manager |
| Reduce SSRF risk to metadata | IMDSv2 |
| Code/security issue before deploy | Amazon Q Developer / CodeGuru-style scanning |

### Real-World Example

A company wants all new instances to use approved, patched, tested AMIs.

Best answer:

```text
EC2 Image Builder pipeline with hardening components, tests, and distribution.
```

A company wants existing EC2 fleets patched monthly with compliance reporting.

Best answer:

```text
Systems Manager Patch Manager with patch baselines or patch policies.
```

### Trap

Do not use Image Builder to patch already-running fleets. Do not use Patch Manager to create golden AMIs.

---

## 14. Scenario 11: GenAI Infrastructure Controls

SCS-C03 includes newer application and GenAI security topics.

### What To Know

GenAI apps still need normal security:

- IAM least privilege
- network isolation
- encryption
- logging
- data access boundaries
- input/output protection

But they also need model-specific controls:

- prompt attack filtering
- harmful content filters
- denied topics
- sensitive data masking
- grounding checks

### Best Pattern

```text
User prompt
   |
   v
App authentication and authorization
   |
   v
Bedrock Guardrails
   |
   v
Foundation model
   |
   v
Guardrail output checks
   |
   v
User response
```

### Exam Trap

Do not choose WAF for prompt injection just because the app is HTTP-based. WAF can help protect the web endpoint, but Bedrock Guardrails are the more direct GenAI control.

---

## 15. Decision Trees

### 15.1 Edge Protection

```text
Need HTTP request filtering?
    -> AWS WAF

Need DDoS enhanced support/cost protection?
    -> Shield Advanced

Need CDN and edge caching?
    -> CloudFront

Need private S3 origin behind CloudFront?
    -> OAC

Need client certificate auth for API?
    -> API Gateway mTLS

Need central WAF policy across accounts?
    -> Firewall Manager
```

### 15.2 Network Controls

```text
Need resource-level allow list?
    -> Security group

Need subnet-level explicit deny?
    -> NACL

Need stateful domain/IP inspection in VPC?
    -> Network Firewall

Need DNS domain block/allow list?
    -> Route 53 Resolver DNS Firewall

Need private AWS service access?
    -> VPC endpoint / PrivateLink

Need full packet copy for IDS?
    -> Traffic Mirroring

Need find unintended access paths?
    -> Network Access Analyzer
```

### 15.3 Compute Controls

```text
Need hardened AMI pipeline?
    -> EC2 Image Builder

Need vulnerability scanning?
    -> Amazon Inspector

Need patch running nodes?
    -> Patch Manager

Need admin access without SSH?
    -> Session Manager

Need protect EC2 metadata credentials?
    -> IMDSv2
```

### 15.4 Private And Hybrid Access

```text
Need application access without VPN?
    -> Verified Access

Need encrypted tunnel over internet?
    -> Site-to-Site VPN

Need private dedicated connection?
    -> Direct Connect

Need many VPCs and on-prem networks routed centrally?
    -> Transit Gateway

Need private access to AWS service endpoint?
    -> PrivateLink / VPC endpoint
```

---

## 16. Common Exam Traps

| Trap | Better thinking |
|---|---|
| Use security group for explicit deny | Security groups allow only; use NACL or policy deny |
| Forget NACL return traffic | NACLs are stateless; allow ephemeral return ports |
| Use WAF for network-layer DDoS support | Shield/Shield Advanced handles DDoS protection |
| Use Shield for SQL injection | WAF handles Layer 7 request filtering |
| Attach WAF directly to EC2 | WAF attaches to supported front doors such as CloudFront, ALB, API Gateway |
| Make S3 bucket public behind CloudFront | Use OAC and bucket policy |
| Assume endpoint policy replaces IAM | Endpoint, IAM, resource, SCP, and KMS policies can all matter |
| Use Flow Logs for packet payloads | Use Traffic Mirroring for packet copies |
| Use Image Builder to patch running instances | Use Patch Manager for running managed nodes |
| Open SSH during admin emergency | Prefer Session Manager when available |
| Treat Direct Connect as automatically encrypted app traffic | Check MACsec, VPN, TLS, or app encryption requirement |
| Use WAF for prompt injection | Use Bedrock Guardrails for GenAI prompt/output controls |

---

## 17. Worked Examples

### Example 1: Private Subnet Needs S3 Access

Scenario:

An EC2 instance in a private subnet needs to read from S3. The company does not want traffic through a NAT gateway.

Good answer:

```text
Create an S3 gateway endpoint and update the private subnet route table.
```

Why:

Gateway endpoints support S3 and DynamoDB and use route table entries.

What not to do:

```text
Make the instance public or route through an internet gateway.
```

---

### Example 2: Private Subnet Needs Secrets Manager Access

Scenario:

A Lambda function in a VPC needs to retrieve a secret. No NAT gateway is available.

Good answer:

```text
Create a Secrets Manager interface endpoint.
Check endpoint security group and private DNS.
```

Why:

Secrets Manager uses an interface endpoint, which has endpoint ENIs and security groups.

---

### Example 3: Layer 7 Attack

Scenario:

A web app faces SQL injection and credential stuffing.

Good answer:

```text
AWS WAF with managed rules, Bot Control/Fraud Control as appropriate, and rate-based rules.
```

Why:

These are HTTP-layer request patterns.

---

### Example 4: Large DDoS Against Critical App

Scenario:

A public app requires enhanced DDoS protection and response support.

Good answer:

```text
AWS Shield Advanced with protected resources and WAF integration where needed.
```

Why:

Shield Advanced is the enhanced DDoS service tier.

---

### Example 5: Packet-Level IDS

Scenario:

A security appliance must inspect packet payloads from selected EC2 ENIs.

Good answer:

```text
VPC Traffic Mirroring to an IDS target.
```

Why:

Flow Logs only provide metadata. Traffic Mirroring copies packets.

---

### Example 6: Hardened AMI Rollout

Scenario:

Every new EC2 instance must use a patched, tested, hardened AMI.

Good answer:

```text
EC2 Image Builder pipeline.
```

Why:

Image Builder creates and distributes compliant images.

---

### Example 7: Existing Fleet Patching

Scenario:

Hundreds of running EC2 instances need monthly security patching and compliance reports.

Good answer:

```text
Systems Manager Patch Manager.
```

Why:

Patch Manager patches running managed nodes and reports compliance.

---

### Example 8: Internal Apps Without VPN

Scenario:

Employees need browser access to internal apps. Access must depend on identity and device posture on every request.

Good answer:

```text
AWS Verified Access.
```

Why:

Verified Access is built for application access without traditional VPN-style broad network access.

---

## 18. Original Mini Practice Set

These questions are original and are designed around the repeated topic signals.

### Q1. SG vs NACL

A subnet must explicitly deny traffic from a known bad CIDR before traffic reaches instances. Which control fits best?

A. Security group inbound rule  
B. Network ACL deny rule  
C. CloudFront OAC  
D. IAM permissions boundary

**Answer:** B

**Explanation:** NACLs support explicit deny at subnet level. Security groups are allow-only.

---

### Q2. Network Firewall

Private subnets require stateful egress inspection and domain-based filtering before traffic reaches a NAT gateway. Which service is most appropriate?

A. AWS Network Firewall  
B. AWS Shield Standard  
C. IAM Access Analyzer  
D. CloudTrail Lake

**Answer:** A

**Explanation:** Network Firewall provides managed VPC traffic inspection and supports stateful/domain-oriented filtering patterns.

---

### Q3. WAF vs Shield

A public web application needs protection from SQL injection and suspicious HTTP request patterns. Which service is most directly relevant?

A. AWS WAF  
B. AWS Shield Advanced  
C. VPC Flow Logs  
D. AWS Backup

**Answer:** A

**Explanation:** AWS WAF inspects HTTP and HTTPS requests for Layer 7 web application patterns.

---

### Q4. Shield Advanced

A critical internet-facing workload needs enhanced DDoS protection, cost protection, and response support. What should the company consider?

A. AWS Shield Advanced  
B. EC2 Image Builder  
C. S3 Object Lock  
D. Amazon Macie

**Answer:** A

**Explanation:** Shield Advanced adds enhanced DDoS protections and support capabilities beyond automatic Shield Standard.

---

### Q5. CloudFront And Private S3

A new CloudFront design must serve private S3 objects without making the bucket public. Which pattern is preferred?

A. Public bucket with obscure object names  
B. CloudFront OAC with bucket policy allowing CloudFront  
C. NACL allow rule for CloudFront IPs  
D. Disable S3 Block Public Access

**Answer:** B

**Explanation:** OAC is the modern CloudFront-to-S3 private origin access pattern.

---

### Q6. API mTLS

An API must require callers to present trusted client certificates. Where is mTLS configured in API Gateway?

A. On a custom domain name with a truststore in S3  
B. On a NACL rule  
C. In VPC Flow Logs  
D. In CloudTrail Lake

**Answer:** A

**Explanation:** API Gateway mTLS uses a custom domain name and an S3 truststore of trusted CA certificates.

---

### Q7. Interface Endpoint Troubleshooting

An EC2 instance in a private subnet cannot call Secrets Manager through an interface endpoint. IAM permissions are correct. What should you check first?

A. Endpoint security group, workload security group, private DNS, and subnet/AZ placement  
B. CloudFront OAC signing behavior  
C. S3 Object Lock retention mode  
D. Shield Advanced cost protection

**Answer:** A

**Explanation:** Interface endpoints use endpoint ENIs with security groups and private DNS behavior.

---

### Q8. Packet Payload Inspection

A company needs to copy packet traffic from EC2 ENIs to an IDS appliance. Which feature fits?

A. VPC Traffic Mirroring  
B. VPC Flow Logs  
C. CloudTrail management events  
D. AWS Artifact

**Answer:** A

**Explanation:** Traffic Mirroring sends packet copies to monitoring appliances. Flow Logs provide metadata only.

---

### Q9. Hardened Images

A company wants repeatable hardened AMIs with tested security baselines and patch updates before deployment. Which service fits?

A. EC2 Image Builder  
B. GuardDuty  
C. S3 Glacier  
D. Route 53 Resolver DNS Firewall

**Answer:** A

**Explanation:** Image Builder automates creation, testing, and distribution of hardened AMIs and container images.

---

### Q10. Matching

Match the requirement to the best service or feature.

| Requirement | Answer |
|---|---|
| A. Layer 7 HTTP filtering | AWS WAF |
| B. Enhanced DDoS support | Shield Advanced |
| C. Stateful VPC inspection | AWS Network Firewall |
| D. Private S3 through CloudFront | OAC |
| E. Admin access without SSH | Session Manager |
| F. Vulnerability scanning for EC2/ECR/Lambda | Amazon Inspector |

---

### Q11. Ordering

Place these controls from edge to workload for a common public web app.

```text
1. CloudFront
2. AWS WAF
3. ALB
4. Security group
5. EC2 or container workload
```

Why:

CloudFront and WAF protect at the edge, ALB routes traffic, security groups restrict resource access, and the workload serves the application.

---

## 19. Final Audit Addendum: Thin Infrastructure Topics

This section was added after rechecking the full question bank and important-topic matrix.

### 19.1 AWS WAF Scope-Down Statements

A scope-down statement narrows which requests a managed rule group or rate-based rule evaluates.

Plain English:

> Scope-down means "only run this WAF rule logic against this subset of requests."

Real-world example:

You use an AWS Managed Rules rule group, but only want it to inspect requests to `/login` or requests from a specific country. A scope-down statement limits the rule group to those requests.

Simple flow:

```text
Viewer request
      |
      v
Scope-down statement matches?
      |
      +--> No: managed rule group does not evaluate this request
      +--> Yes: managed rule group evaluates this request
```

Exam angle:

Choose scope-down statements when the question says:

- narrow managed rule group evaluation
- narrow rate-based rule evaluation
- reduce inspected request set
- apply WAF logic only to matching paths, geos, headers, or other conditions

Common trap:

Rule priority decides order. Scope-down decides which requests a containing rule evaluates.

### 19.2 CloudFront Response Headers Policies

CloudFront response headers policies add, override, or remove HTTP response headers sent to viewers.

Plain English:

> Response headers policies let CloudFront add security headers without changing origin code.

Examples of headers:

- `Strict-Transport-Security`
- `Content-Security-Policy`
- `X-Frame-Options`
- `Access-Control-Allow-Origin`
- remove `X-Powered-By`

Simple flow:

```text
Origin response
      |
      v
CloudFront cache behavior
      |
      v
Response headers policy
      |
      v
Viewer receives modified headers
```

Exam angle:

Choose CloudFront response headers policy when the question says:

- add HTTP security headers at the edge
- remove origin headers before sending to viewers
- no code changes at the origin
- apply headers through CloudFront cache behavior

Common trap:

Response headers policies do not decide whether CloudFront caches an object. Cache policies and origin request policies handle caching/request behavior.

### 19.3 API Gateway Authorizers

API Gateway authorizers control who can invoke an API.

Plain English:

> API Gateway authorizers authenticate and authorize API callers before the request reaches the backend.

Common choices:

| Need | Better fit |
|---|---|
| Use Amazon Cognito user pool tokens for REST API | Cognito authorizer |
| Use JWT/OIDC style validation for HTTP API | JWT authorizer |
| Need custom logic, cookies, database lookup, or complex policy decision | Lambda authorizer |
| Use SigV4 and IAM permissions | IAM authorization |
| Need client certificates on a custom domain | mTLS |

Exam angle:

If the scenario says "custom authorization logic," choose Lambda authorizer. If it says "Cognito user pool tokens," choose Cognito authorizer or JWT authorizer depending on API type. If it says "AWS principal signs the request," choose IAM authorization.

Common trap:

API keys and usage plans are for metering/throttling. They are not strong authentication by themselves.

### 19.4 Amazon Q Developer, CodeGuru, And Inspector SBOM

These show up as newer workload-security signals.

| Tool | Exam meaning |
|---|---|
| Amazon Q Developer code review | Reviews code for security vulnerabilities and code quality issues during development |
| CodeGuru-style scanning | Older wording around code security/performance analysis; current questions may use Amazon Q Developer wording |
| Amazon Inspector SBOM export | Exports software bill of materials for supported monitored resources |

Decision rule:

```text
Source code vulnerability before deploy
    -> Amazon Q Developer code review / code scanning

Deployed EC2, ECR, Lambda vulnerability or SBOM
    -> Amazon Inspector
```

Common trap:

Inspector is mainly post-deployment workload vulnerability/exposure assessment. Code scanning is earlier in the software development lifecycle.

---

## 20. Last-Day Revision Checklist

Before the exam, make sure you can answer these quickly:

- What is stateful and allow-only?
- What is stateless and supports explicit deny?
- When do you choose Network Firewall?
- When do you choose DNS Firewall?
- What is the difference between WAF and Shield Advanced?
- Which resources can AWS WAF protect?
- What is the modern CloudFront-to-S3 private access pattern?
- What does API Gateway mTLS require?
- What is the difference between gateway and interface VPC endpoints?
- What do endpoint policies not replace?
- When do you choose Verified Access instead of VPN?
- When do you choose Direct Connect instead of VPN?
- What is a private VIF, public VIF, and transit VIF?
- When do you use Traffic Mirroring instead of Flow Logs?
- What is Network Access Analyzer used for?
- What does Inspector scan?
- What is Inspector SBOM export for?
- When do you use Image Builder vs Patch Manager?
- What does Session Manager avoid?
- Why enforce IMDSv2?
- When are Bedrock Guardrails the better answer than WAF?
- What does a WAF scope-down statement do?
- When do you use CloudFront response headers policies?
- When do you choose Cognito/JWT/Lambda/IAM authorization for API Gateway?
- When is Amazon Q Developer code review more relevant than Inspector?

Final mental model:

```text
Edge:
  CloudFront + response headers + WAF + Shield + API Gateway

Network:
  SG + NACL + Network Firewall + DNS Firewall + endpoints

Private access:
  PrivateLink + Verified Access + Direct Connect + VPN + Transit Gateway

Compute:
  Image Builder + Inspector + Inspector SBOM + Patch Manager + Session Manager + IMDSv2

Modern app controls:
  Bedrock Guardrails + API authorizers + Amazon Q Developer + IAM + encryption + logging + isolation
```
