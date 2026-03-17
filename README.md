# Smart HR Performance Management System

An intelligent, integrated system for managing and analyzing human resource performance using AI.

## 🚀 Overview

Smart HR is designed to transform traditional HR management into a data-driven, predictive, and equitable process. By integrating with ERPNext and utilizing advanced ML models, the system provides deep insights into employee turnover risks, fairness metrics, and performance trends.

## 🏗 Project Structure

- **`client/`**: React-based frontend application.
- **`server/`**: NestJS-powered backend API.
- **`ml-service/`**: Python FastAPI service for machine learning models.
- **`infrastructure/`**: Docker, Nginx, and deployment configurations.
- **`postgres/`**: Database initialization and migration scripts.
- **`docs/`**: Detailed project documentation.

## 🛠 Features

- **Auth & User Management**: Secure JWT-based authentication and Role-Based Access Control (RBAC).
- **ERPNext Integration**: Seamless synchronization of employee, attendance, and performance data.
- **Turnover Risk Prediction**: Predict employee attrition with contributing factor analysis.
- **Fairness & Equity Analysis**: Monitor and analyze performance and pay equity across various demographics.
- **Interactive Dashboards**: Data visualization for HR managers and administrators.
- **Audit Logging**: Comprehensive tracking of all system actions for compliance.

## 🚦 Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- Python 3.9+ (for local ML development)

### Quick Start

1. Clone the repository.
2. Copy `.env.example` to `.env`.
3. Run the system using Docker:
   ```bash
   docker-compose up -d
   ```
4. Access the applications:
   - Frontend: `http://localhost:3001`
   - Backend API: `http://localhost:3000/api`
   - ML Service API: `http://localhost:8000`

## 📚 Documentation

For more details, see:
- [Architecture Design](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Data Contract](docs/DATA_CONTRACT.md)
- [Scalability Strategy](docs/SCALABILITY_STRATEGY.md)

## ⚖️ License

UNLICENSED
