# 🛒 Ghar Se Grocery (SIBMS)
### *Next-Generation Smart Inventory, Billing & Hyperlocal Kirana Commerce Platform*

[![Frontend CI/CD](https://github.com/Tushar-Kumar-dev/ghar-se-grocery/actions/workflows/frontend-ci-cd.yml/badge.svg)](https://github.com/Tushar-Kumar-dev/ghar-se-grocery/actions)
[![Backend CI/CD](https://github.com/Tushar-Kumar-dev/ghar-se-grocery/actions/workflows/backend-ci-cd.yml/badge.svg)](https://github.com/Tushar-Kumar-dev/ghar-se-grocery/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2+-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17_LTS-ED8B00?logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

---

## 📖 Overview

**Ghar Se Grocery** is an enterprise-grade, full-stack Kirana commerce and inventory automation ecosystem designed for modern local retail. It empowers neighborhood Kirana stores with quick-commerce discovery (strict 10 KM radius via Haversine geolocation), AI-powered Mandi Parchi handwriting/slip stock intake, real-time POS thermal receipt printing, digitized Khata (credit ledger), and automated WhatsApp billing alerts.

---

## 🏗️ System Architecture & Monorepo Structure

```text
ghar-se-grocery/
├── .github/
│   ├── PULL_REQUEST_TEMPLATE.md        # PR quality & checklist contract
│   └── workflows/
│       ├── frontend-ci-cd.yml         # Vite build, lint & Vercel deployment
│       └── backend-ci-cd.yml          # Maven test, Docker build & Render deploy
├── frontend/                           # React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/                # Modular UI (POS, Inventory, Khata, Orders)
│   │   ├── context/                   # Global State (Auth, Store, Cart)
│   │   └── services/                  # Location (Haversine 10KM), API & Audio
│   ├── public/                        # PWA Manifest & App Icons
│   ├── Dockerfile
│   └── package.json
├── backend/                            # Spring Boot 3 + Java 17 + MySQL
│   ├── src/main/java/com/sibms/
│   │   ├── config/                    # Security, CORS & OpenAPI Swagger
│   │   ├── controller/                # REST Controllers
│   │   ├── service/                   # Business Logic Layer
│   │   ├── repository/                # Spring Data JPA
│   │   └── entity/                    # Relational Database Entities
│   ├── src/main/resources/
│   │   ├── application.yml            # Dynamic environment properties
│   │   └── db/migration/              # Flyway schema versioning (V1..V4)
│   ├── Dockerfile                     # Multi-stage Eclipse Temurin JRE build
│   └── pom.xml
├── docker-compose.yml                  # 1-Click local development orchestration
├── .gitignore                         # Multi-stack production ignore rules
└── README.md
```

---

## ✨ Key Capabilities

- **📍 Hyperlocal 10 KM Kirana Discovery**: Real-time GPS calculation filtering stores strictly within 10 kilometers with live distance badges.
- **📄 AI Mandi Parchi Slip Intake**: OCR-ready parsing converting handwritten vendor invoices directly into live inward inventory.
- **⚡ Lightning POS & Thermal Invoicing**: Barcode scanning, quick cart manipulation, hotkey checkout, and 58mm/80mm thermal receipt generation.
- **📒 Digitized Customer Khata**: Track store credit (*Udhar*), record partial settlements, and dispatch automated WhatsApp invoice reminders.
- **🛡️ Enterprise Security**: Stateless JWT Authentication, Role-Based Access Control (Store Admin vs Customer), and BCrypt encrypted credentials.
- **🗄️ Zero-Drift Database Migration**: Fully automated MySQL schema lifecycle using Flyway migrations.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/) installed **OR**
- Node.js 20+ & Java 17 LTS & MySQL 8.0

### Option A: 1-Click Launch with Docker Compose (Recommended)
```bash
# Clone the repository
git clone https://github.com/Tushar-Kumar-dev/ghar-se-grocery.git
cd ghar-se-grocery

# Spin up MySQL and Spring Boot in containers
docker-compose up -d

# Start Frontend locally
cd frontend
npm install
npm run dev
```
- **Frontend App**: `http://localhost:5173`
- **Backend Swagger API**: `http://localhost:8080/swagger-ui.html`
- **MySQL Database**: `localhost:3306` (`sibms`)

---

### Option B: Native Manual Setup

#### 1. Backend (Spring Boot 3)
```bash
cd backend
# Run database migrations and start server
mvn clean spring-boot:run
```

#### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Production Deployment Architecture (₹0 / Free Tier)

| Service | Hosting Platform | Tier | Purpose |
|---|---|---|---|
| **Frontend** | [Vercel](https://vercel.com) | Free Hobby | Global Edge CDN distribution, automated branch previews |
| **Backend** | [Render.com](https://render.com) | Free Web Service | Multi-stage Dockerized Spring Boot 3 JRE container |
| **Database** | [TiDB Cloud](https://tidbcloud.com) | Free Serverless | 5 GB MySQL 8.0 wire-compatible cloud cluster |

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
