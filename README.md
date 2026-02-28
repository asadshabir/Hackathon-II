# AI Todo Chatbot - Phase V: Advanced Features & Deployment Architecture

An advanced AI-powered todo chatbot with sophisticated features including task priorities, tags, due dates, recurring tasks, time-based reminders, real-time synchronization, analytics, and user preferences. The application follows an event-driven architecture using Dapr, Kafka, and microservice patterns.

## 🚀 Features

- ✅ **User Authentication**: Secure JWT-based authentication with HTTP-only cookies
- 📝 **Todo Management**: Create, read, update, delete, and toggle todos
- 🎨 **Modern UI**: Beautiful interface with Tailwind CSS and shadcn/ui
- 🌙 **Dark Mode**: Full dark mode support
- 🔒 **Multi-user Support**: Complete data isolation between users
- 📱 **Responsive Design**: Works seamlessly on all devices
- ⚡ **Fast**: Optimized with Next.js 15 App Router and FastAPI

### Advanced Features (Phase V)
- 🏷️ **Task Priorities**: Low, Medium, High, Urgent with visual indicators
- 🏷️ **Tags & Categories**: User-defined categories with multi-select and color coding
- 📅 **Due Dates**: Timezone-aware with calendar UI and deadline tracking
- 🔁 **Recurring Tasks**: Daily, weekly, monthly recurrence rules
- ⏰ **Time-based Reminders**: Notifications via Dapr Jobs API
- 🔄 **Real-time Sync**: WebSocket-based synchronization across devices
- 📊 **Analytics Dashboard**: Productivity metrics, streaks, and visualizations
- ⚙️ **User Preferences**: Customizable notification channels, themes, defaults
- 🤖 **AI Chatbot**: Natural language processing for all features
- 🌐 **Event-Driven Architecture**: Kafka-based pub/sub with 15+ event types
- 🛡️ **Resilience**: Circuit breakers, retries, and failure handling
- 🔍 **Observability**: Distributed tracing, metrics, and logging

### Deployment Architecture
- 🐳 **Docker Compose**: Local full-stack deployment
- 🚢 **Minikube**: Kubernetes testing environment with Dapr & Kafka
- ☁️ **Vercel**: Frontend hosting with global CDN
- 🤖 **AI Fallback**: Hugging Face Inference API support

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.5.9 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context + Hooks
- **Form Validation**: Zod
- **HTTP Client**: Fetch API with credentials
- **Real-time**: WebSocket connections
- **Charts**: Recharts for analytics dashboard

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **ORM**: SQLModel
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT with HTTP-only cookies
- **Validation**: Pydantic
- **AI Integration**: OpenAI Agents SDK + Hugging Face Inference API
- **Event Processing**: Kafka via Dapr Pub/Sub
- **Service Mesh**: Dapr for distributed system primitives

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Minikube for local Kubernetes
- **Deployment**: Vercel for frontend hosting
- **Observability**: Jaeger (tracing), Prometheus (metrics), Grafana (dashboards)
- **Messaging**: Apache Kafka with Strimzi operator
- **Caching**: Redis for session and temporary data

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL database (or Neon account)
- Git

## 🏃 Quick Start (Local Development)

### 1. Clone the Repository

```bash
git clone https://github.com/asadshabir/full-stack-todo-app.git
cd full-stack-todo-app
```

### 2. Choose Your Deployment Method

The system supports three deployment targets:

#### Option A: Docker Compose (Recommended for Local Development)

```bash
# From project root
docker-compose up -d

# Access services:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Jaeger: http://localhost:16686
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001
```

#### Option B: Individual Service Setup

##### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and add your database URL and JWT secret
# DATABASE_URL=postgresql+psycopg://...
# JWT_SECRET=your-secret-key-here
# OPENAI_API_KEY=your-openai-key
# HF_API_KEY=your-hf-key (optional)

# Run the server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be running at http://localhost:8000

##### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Edit .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_DAPR_HTTP_PORT=3500

# Run the development server
npm run dev
```

Frontend will be running at http://localhost:3000

#### Option C: Minikube (Kubernetes)

```bash
# Install Minikube and kubectl
# Start Minikube cluster
minikube start

# Install Dapr
dapr init -k

# Deploy Kafka via Strimzi
kubectl apply -f deploy/kafka/strimzi/

# Deploy application
kubectl apply -f deploy/minikube/

# Port forward for access
kubectl port-forward svc/frontend 3000:3000
kubectl port-forward svc/backend 8000:8000
```

## 🌐 Deployment

### Three-Target Deployment Architecture

The system supports three deployment targets as per the local production-ready containerization mandate:

#### 1. Docker Compose (Local Production-Ready)

Full-stack deployment using Docker Compose with all services:

```bash
# From project root
docker-compose up -d --build

# Verify all services are healthy
docker-compose ps

# Access the deployed system:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Jaeger (tracing): http://localhost:16686
# Prometheus (metrics): http://localhost:9090
# Grafana (dashboards): http://localhost:3001
```

#### 2. Minikube (Local Kubernetes)

Kubernetes deployment for production-like testing:

```bash
# Install prerequisites
minikube start
kubectl cluster-info

# Install Dapr
dapr init -k

# Deploy Kafka via Strimzi operator
kubectl apply -f deploy/kafka/strimzi/

# Deploy application with Dapr annotations
kubectl apply -f deploy/minikube/

# Verify deployments
kubectl get pods,svc,deployments

# Access services
minikube service frontend --url
minikube service backend --url
```

#### 3. Vercel (Frontend Hosting)

Frontend-only deployment to Vercel's global CDN:

1. Go to [Vercel](https://vercel.com/)
2. Click "Import Project" → "Import Git Repository"
3. Select your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
5. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Your backend URL (Docker Compose, Minikube, or hosted)
   - `NEXT_PUBLIC_DAPR_HTTP_PORT`: Dapr HTTP port (usually 3500)
   - `NEXT_PUBLIC_WEBSOCKET_URL`: WebSocket URL for real-time sync
6. Deploy!

Vercel will provide a globally distributed URL like: `https://your-app.vercel.app`

### Environment Variables for All Targets

#### Backend (.env)
```env
# Database
DATABASE_URL=postgresql+psycopg://user:pass@localhost:5432/todoapp
NEON_DATABASE_URL=your_neon_connection_string

# AI Providers
OPENAI_API_KEY=your_openai_key
HF_API_KEY=your_hf_key (optional, for fallback)
HF_MODEL_NAME=microsoft/DialoGPT-medium
HF_API_URL=https://api-inference.huggingface.co/models/...

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS (adjust for your deployment)
CORS_ORIGINS=http://localhost:3000,https://your-vercel-app.vercel.app

# Dapr Configuration
DAPR_HTTP_PORT=3500
DAPR_GRPC_PORT=50001

# Kafka Configuration
KAFKA_BROKERS=localhost:9092
```

#### Frontend (Vercel env or .env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000  # Adjust for deployment target
NEXT_PUBLIC_DAPR_HTTP_PORT=3500
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8000/ws  # Adjust for deployment
```

## 📝 Advanced Configuration

### Dapr Components

The system uses Dapr for distributed system primitives:

#### Pub/Sub (Apache Kafka)
- Component: `pubsub.kafka`
- Topics: 15+ event types including `task.created`, `task.updated`, `reminder.due`, etc.

#### State Management (PostgreSQL)
- Component: `statestore.postgresql`
- Used for: Session state, temporary data, Dapr state operations

#### Secrets Management
- Component: `secretstores.local.env` or `secretstores.kubernetes`
- Used for: API keys, database credentials, service secrets

### Event Schema

All events follow CloudEvents specification:
- **task.created**: Emitted when a new task is created
- **task.updated**: Emitted when a task is modified
- **task.completed**: Emitted when a task is completed
- **reminder.due**: Emitted when a reminder is due
- **notification.sent**: Emitted when notification is delivered
- And 10+ other event types for comprehensive system monitoring

### AI Provider Configuration

The system supports dual AI providers for redundancy:

#### Primary: OpenAI
- Environment: `OPENAI_API_KEY`
- Models: gpt-3.5-turbo, gpt-4, etc.

#### Fallback: Hugging Face Inference API
- Environment: `HF_API_KEY`, `HF_MODEL_NAME`
- Models: microsoft/DialoGPT-medium, etc.
- Automatic fallback when OpenAI unavailable

## 🧪 Testing

### Backend API Testing

```bash
cd backend
python test_api.py
```

### Frontend Testing

Navigate to:
- http://localhost:3000 - Landing page
- http://localhost:3000/signup - Sign up page
- http://localhost:3000/signin - Sign in page
- http://localhost:3000/dashboard - Dashboard (requires auth)

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Available Endpoints

#### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Authenticate user and get JWT token
- `GET /api/auth/me` - Get current user information
- `POST /api/auth/signout` - Clear authentication cookie

#### Todos
- `GET /api/todos` - Get all todos for authenticated user
- `POST /api/todos` - Create a new todo
- `GET /api/todos/{id}` - Get a specific todo
- `PUT /api/todos/{id}` - Update a todo
- `PATCH /api/todos/{id}/toggle` - Toggle todo completion status
- `DELETE /api/todos/{id}` - Delete a todo

## 🔐 Security Features

- JWT tokens stored in HTTP-only cookies (XSS protection)
- CORS configuration for cross-origin requests
- Password hashing with bcrypt
- SQL injection protection with SQLModel/SQLAlchemy
- Environment variable management for secrets
- User-specific data isolation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

**Asad Shabir**
- GitHub: [@asadshabir](https://github.com/asadshabir)

## 🙏 Acknowledgments

- Built with ❤️ for Hackathon Phase 2
- Assisted by Claude Sonnet 4.5

---

**Live Demo**: [Add your Vercel URL here after deployment]
**Backend API**: [Add your Railway URL here after deployment]
