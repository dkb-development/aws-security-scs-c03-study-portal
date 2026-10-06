# AWS Security SCS-C03 Study Portal

Interactive study portal and Markdown study materials for AWS Certified Security - Specialty SCS-C03 preparation.

Published site:

https://aws-security-scs-c03-practice.technicaldwiti.chatgpt.site

## What Is Included

- A dark-theme interactive web portal for topic-based study.
- Six topic sections aligned to the study plan:
  - 01 - Detection and Monitoring
  - 02 - Incident Response
  - 03 - Infrastructure Security
  - 04 - Identity and Access Management
  - 05 - Data Protection
  - 06 - Security Foundations and Governance
- Collapsible study material and question-bank sections per topic.
- Immediate answer reveal with explanations after each attempted question.
- Bookmarking, progress tracking, search, and JSON import/export.
- Markdown study guides and question/concept files in `docs/`.

## Important Files

- `app/page.tsx` - main interactive study portal UI.
- `lib/question-bank.ts` - topic metadata, question bank, and source summary.
- `lib/study-guides.ts` - generated module containing the study guide content used by the site.
- `docs/` - Markdown study guides, important concepts, and practice-question files.

## Study Guide Order

Read the numbered study guide files in this order:

1. `docs/01-detection-and-monitoring-study-guide.md`
2. `docs/02-incident-response-study-guide.md`
3. `docs/03-infrastructure-security-study-guide.md`
4. `docs/04-identity-and-access-management-study-guide.md`
5. `docs/05-data-protection-study-guide.md`
6. `docs/06-security-foundations-and-governance-study-guide.md`

## Local Development

Install dependencies:

```bash
npm install
```

Run the local development server:

```bash
npm run dev
```

Build the site:

```bash
npm run build
```

Lint the project:

```bash
npm run lint
```

## Notes

This repository is intended as a personal exam-preparation workspace. Review AWS's current exam guide and certification policies directly before taking the exam.
