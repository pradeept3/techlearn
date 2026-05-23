# TechLearn — Full-Stack AI Education Platform

A production-ready education platform for learning Python, SQL, Machine Learning, Java, Spring Boot, Cloud, NLP, LLMs, and Data Analysis. Built with React + TypeScript, Spring Boot, FastAPI (AI service), PostgreSQL, Pinecone, and multi-LLM support.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    TechLearn Platform                    │
├──────────────┬──────────────────┬───────────────────────┤
│   Frontend   │     Backend      │      AI Service        │
│  React + TS  │  Spring Boot     │  FastAPI + LangChain  │
│  Tailwind    │  REST API        │  RAG Pipeline          │
│  Zustand     │  PostgreSQL      │  Pinecone / Weaviate   │
│              │  JWT Auth        │  Multi-LLM Support     │
└──────┬───────┴────────┬─────────┴──────────┬────────────┘
       │                │                    │
   CloudFront        AWS ECS              AWS ECS
   + S3              + RDS                + Fargate
       │                │                    │
       └────────────────┴────────────────────┘
                        │
                   Render.com
                  (Alternative)
```

## 📁 Project Structure

```
techlearn/
├── frontend/          # React + TypeScript + Tailwind
├── backend/           # Spring Boot REST API
├── ai-service/        # FastAPI + LangChain RAG
├── infra/
│   ├── aws/           # CloudFormation / CDK templates
│   ├── render/        # render.yaml for Render.com
│   └── docker/        # Docker Compose for local dev
└── README.md
```

## 🚀 Quick Start (Local Dev)

### Prerequisites
- Node.js 18+, npm 9+
- Java 17+, Maven 3.9+
- Python 3.11+
- Docker + Docker Compose
- PostgreSQL 15

### 1. Clone & Setup
```bash
git clone https://github.com/yourorg/techlearn.git
cd techlearn
```

### 2. Start all services with Docker Compose
```bash
cd infra/docker
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Backend (Spring Boot) on port 8080
- AI Service (FastAPI) on port 8000
- Frontend (Vite dev) on port 5173
- pgAdmin on port 5050

### 3. Manual startup (without Docker)

**Frontend:**
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

**Backend:**
```bash
cd backend
cp src/main/resources/application.example.yml src/main/resources/application.yml
# Edit application.yml with your DB credentials
mvn spring-boot:run
```

**AI Service:**
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
python ingest.py        # Load course content into vector DB
uvicorn app.main:app --reload --port 8000
```

---

## 🔐 Environment Variables

### Frontend (.env.local)
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_AI_SERVICE_URL=http://localhost:8000
VITE_APP_NAME=TechLearn
```

### Backend (application.yml)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/techlearn
    username: postgres
    password: yourpassword
  jpa:
    hibernate:
      ddl-auto: update

jwt:
  secret: your-256-bit-secret-key
  expiration: 86400000

ai-service:
  url: http://localhost:8000
```

### AI Service (.env)
```env
# Choose ONE LLM provider
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
OLLAMA_BASE_URL=http://localhost:11434

# LLM Provider: openai | anthropic | google | ollama
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini

# Vector DB: pinecone | weaviate | chroma (local)
VECTOR_DB=chroma
PINECONE_API_KEY=...
PINECONE_INDEX=techlearn-courses
WEAVIATE_URL=http://localhost:8090
WEAVIATE_API_KEY=...

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/techlearn
```

---

## 🌩️ Deployment

### AWS Deployment
```bash
cd infra/aws
# Set your AWS credentials
aws configure

# Deploy infrastructure with CloudFormation
aws cloudformation deploy \
  --template-file cloudformation.yml \
  --stack-name techlearn-prod \
  --capabilities CAPABILITY_IAM

# Deploy frontend to S3 + CloudFront
cd ../../frontend
npm run build
aws s3 sync dist/ s3://your-techlearn-bucket --delete
aws cloudfront create-invalidation --distribution-id XXXXX --paths "/*"
```

### Render.com Deployment (Simpler)
```bash
cd infra/render
# Push to GitHub, then connect repo on render.com
# render.yaml auto-configures all services
```

---

## 🤖 AI Chatbot — Switching LLM Providers

The AI service supports plug-and-play LLM providers. Just set `LLM_PROVIDER` in `.env`:

| Provider   | Model             | Notes                    |
|------------|-------------------|--------------------------|
| `openai`   | gpt-4o-mini       | Best quality, paid       |
| `anthropic`| claude-3-5-haiku  | Fast, great reasoning    |
| `google`   | gemini-1.5-flash  | Free tier available      |
| `ollama`   | llama3.2          | Fully local, free        |

---

## 📚 Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18, TypeScript, Tailwind CSS, Zustand, React Query, Vite |
| Backend     | Spring Boot 3.2, Spring Security, JWT, Spring Data JPA |
| Database    | PostgreSQL 15, Hibernate ORM        |
| AI Service  | FastAPI, LangChain, LangGraph       |
| Vector DB   | Pinecone / Weaviate / ChromaDB      |
| LLM         | OpenAI / Anthropic / Google / Ollama |
| Auth        | JWT + Refresh Tokens                |
| Hosting     | AWS (S3, CloudFront, ECS, RDS) / Render |
| CI/CD       | GitHub Actions                      |
| Containers  | Docker, Docker Compose              |
