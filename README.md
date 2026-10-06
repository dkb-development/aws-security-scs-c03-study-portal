# AWS Security SCS-C03 Study Portal

Interactive study portal and Markdown study materials for AWS Certified Security - Specialty SCS-C03 preparation.

Published site:

https://aws-security-scs-c03-practice.technicaldwiti.chatgpt.site

## What Is Included

- A dark-theme interactive web portal for topic-based study.
- Six topic sections aligned to the study plan:
  - Detection and Monitoring
  - Incident Response
  - Infrastructure Security
  - Identity and Access Management
  - Data Protection
  - Security Foundations and Governance
- Collapsible study material and question-bank sections per topic.
- Immediate answer reveal with explanations after each attempted question.
- Bookmarking, progress tracking, search, and JSON import/export.
- Markdown study guides and question/concept files in `docs/`.

## Important Files

- `app/page.tsx` - main interactive study portal UI.
- `lib/question-bank.ts` - topic metadata, question bank, and source summary.
- `lib/study-guides.ts` - generated module containing the study guide content used by the site.
- `docs/` - Markdown study guides, important concepts, and practice-question files.

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
