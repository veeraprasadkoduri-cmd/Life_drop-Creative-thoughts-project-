# 🩸 LifeDrop — Blood Donation Management System

> Built by **Tech Expert Solutions** | Production-Ready Full-Stack Application

LifeDrop is a modern, production-grade blood donation management platform featuring a React frontend, Node.js/Express backend, MongoDB database, Nginx reverse proxy, Docker containers, and GitHub Actions CI/CD.

---

## 🚀 Quick Start (One Command)

```bash
git clone https://github.com/your-org/lifedrop.git
cd lifedrop
docker-compose up -d
```

Open **http://localhost** in your browser. ✅

---

## 🏗️ Architecture

```
lifedrop/
├── frontend/          # React + Vite + Tailwind CSS
├── backend/           # Node.js + Express + MongoDB
├── nginx/             # Reverse proxy config
├── .github/workflows/ # CI/CD pipeline
├── docker-compose.yml
└── README.md
```

## 📦 Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS, Axios |
| Backend     | Node.js, Express.js, JWT, bcrypt    |
| Database    | MongoDB 7                           |
| Proxy       | Nginx 1.25                          |
| Container   | Docker, Docker Compose              |
| CI/CD       | GitHub Actions                      |
| Deployment  | AWS EC2 (Ubuntu)                    |

---

## 🔐 Authentication

- First registered user is automatically assigned **Admin** role
- All subsequent users get **User** role
- JWT tokens expire in **7 days**

### Default Flow
1. Register at `/register`
2. Login at `/login`
3. Users → `/dashboard` → manage own donor profile
4. Admin → `/admin` → view all donors, search, filter, export CSV

---

## 🌐 API Endpoints

| Method | Endpoint              | Auth     | Description               |
|--------|-----------------------|----------|---------------------------|
| POST   | /api/auth/register    | Public   | Register new user         |
| POST   | /api/auth/login       | Public   | Login                     |
| GET    | /api/auth/me          | User     | Get current user          |
| POST   | /api/donor/create     | User     | Create donor profile      |
| GET    | /api/donor/all        | User     | Get donors (filtered)     |
| GET    | /api/donor/my         | User     | Get own profile           |
| PUT    | /api/donor/:id        | User     | Update donor profile      |
| DELETE | /api/donor/:id        | Admin    | Delete donor              |
| GET    | /api/export-csv       | Admin    | Export donors to CSV      |
| GET    | /api/health           | Public   | Health check              |

---

## 🐳 Docker Setup

### Services
| Service   | Container          | Port (internal) |
|-----------|--------------------|-----------------|
| nginx     | lifedrop-nginx     | 80 (exposed)    |
| frontend  | lifedrop-frontend  | 80              |
| backend   | lifedrop-backend   | 5000            |
| mongo     | lifedrop-mongo     | 27017           |

### Commands
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild after code change
docker-compose up -d --build

# View running containers
docker-compose ps
```

---

## ⚙️ Environment Variables

### backend/.env
```env
MONGO_URI=mongodb://mongo:27017/lifedrop
JWT_SECRET=your_super_secret_key_here
PORT=5000
NODE_ENV=production
```

### frontend/.env
```env
VITE_API_URL=/api
```

---

## 🔧 Local Development (Without Docker)

### Prerequisites
- Node.js 18+
- MongoDB running locally

### Backend
```bash
cd backend
npm install
# Edit .env → set MONGO_URI=mongodb://localhost:27017/lifedrop
npm run dev
```

### Frontend
```bash
cd frontend
npm install
# Edit .env → set VITE_API_URL=http://localhost:5000/api
npm run dev
```

---

## ☁️ AWS EC2 Deployment

### 1. Launch EC2 Instance
- **AMI**: Ubuntu 22.04 LTS
- **Instance**: t2.micro or t3.small
- **Security Group**: Open ports 22 (SSH), 80 (HTTP), 443 (HTTPS)

### 2. Connect & Install Dependencies
```bash
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
newgrp docker

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Verify
docker --version
docker compose version
```

### 3. Deploy Application
```bash
# Clone repository
mkdir -p /opt/lifedrop && cd /opt/lifedrop
git clone https://github.com/your-org/lifedrop.git .

# Set environment
cp backend/.env.example backend/.env
nano backend/.env   # Set your JWT_SECRET

# Start
docker compose up -d
```

---

## 🔄 GitHub Actions CI/CD

### Required Secrets (Settings → Secrets → Actions)

| Secret           | Description                              |
|------------------|------------------------------------------|
| `DOCKER_USERNAME`| Docker Hub username                      |
| `DOCKER_PASSWORD`| Docker Hub password or access token      |
| `EC2_HOST`       | EC2 public IP address                    |
| `EC2_USER`       | EC2 SSH username (usually `ubuntu`)      |
| `EC2_SSH_KEY`    | EC2 private key (PEM file contents)      |
| `JWT_SECRET`     | JWT secret for production                |

### Workflow Triggers
- **Push to `main`** → full build + deploy pipeline
- **Pull Request** → build & validate only

---

## 📱 Features

### User Features
- ✅ Register / Login with JWT
- ✅ Create and update donor profile
- ✅ View own donation information
- ✅ Responsive mobile-first design

### Admin Features
- ✅ View all registered donors
- ✅ Search by name, city, mobile, blood group
- ✅ Filter by blood group, city, area
- ✅ Delete donor records
- ✅ Export filtered donors to CSV

### UI/UX
- ✅ Red & white healthcare theme
- ✅ Sidebar navigation
- ✅ Toast notifications
- ✅ Loading spinners
- ✅ Confirmation dialogs
- ✅ Empty state handling
- ✅ Mobile-responsive

---

## 🛡️ Security Features

- JWT authentication with 7-day expiry
- bcrypt password hashing (12 rounds)
- CORS configuration
- Input validation (express-validator)
- Environment variable protection
- Non-root Docker user
- Security headers via Nginx

---

## 📄 License

MIT License — © 2024 Tech Expert Solutions
