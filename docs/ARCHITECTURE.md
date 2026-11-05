# Architecture Documentation: Intelligent Department Workflow Automation Agent

## Overview
A centralized, enterprise-grade multi-tier digital permission platform built for educational institutions to automate student on-duty (OD), leave, and event participation requests.

## Architecture Layers
1. **Presentation Layer (Frontend)**: React.js with Tailwind CSS, responsive role-based dashboards, real-time application timeline visualizer, and form validations.
2. **Application Layer (Backend)**: Node.js with Express.js REST APIs, JWT authentication, role-based authorization middleware, and automated workflow orchestrator.
3. **Workflow & Intelligent Automation Services**:
   - **Workflow Engine**: Enforces multi-level approval steps with automatic step progression or termination upon rejection.
   - **Automatic Request Routing**: Resolves mentor and HOD assignments dynamically from the database.
   - **Priority Assessment**: Detects urgent requests based on lead times and flags high priority.
   - **Automated Reminder Cron**: Background job that scans for stagnant applications older than 24 hours and issues alerts.
   - **PDF Generation**: Generates cryptographically verifiable signed PDF permission passes with reference codes.
4. **Data Persistence Layer (MySQL)**: Normalized 3NF schema, foreign keys, cascade deletes, and indexing for high-throughput queries.
