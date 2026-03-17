---
name: hr_domain_knowledge
description: Expert knowledge of HR performance and risk metrics used in the Smart Performance System.
---

# HR Domain Knowledge Skill

This skill provides the necessary context and rules for handling HR-specific data and logic within the `smart_performance_system`.

## Core Concepts

### 1. Turnover Risk (Attrition)
- **Definition**: The probability of an employee leaving the company within a specific timeframe.
- **Factors**: Tenure, salary positioning, performance trends, attendance patterns, and department stability.
- **Modeling**: Handled by the `ml-service` (FastAPI) and consumed by the `server` (NestJS).

### 2. Fairness & Equity
- **Gender Pay Gap**: Analysis of salary distribution across genders.
- **Performance Equity**: Ensuring performance ratings are consistent across different demographics.
- **Adverse Impact**: Detecting bias in promotion or hiring decisions.

## Implementation Rules
- Always use canonical domain models for risk factors (`RiskFactor`, `TurnoverRisk`).
- Ensure sensitive demographic data is handled according to privacy compliance standards.
- Prefer data-driven insights over subjective assessments in UI components.
