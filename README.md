# 🚀 TaskHub

**TaskHub** is a full-stack project management platform for teams and organizations. Create organizations, manage projects, assign tasks, collaborate with comments, and invite team members — all in one place.

## 📋 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 19, Vite, Tailwind CSS        |
| Backend    | Spring Boot 3.4, Spring Security, JPA |
| Database   | MySQL 8.x                           |
| Auth       | JWT (JSON Web Tokens)               |
| Email      | Spring Mail (Gmail SMTP)            |

## 📁 Project Structure

```
TaskHub/
├── taskhub-frontend/        # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page-level components
│   │   ├── context/         # React context providers
│   │   ├── services/        # API service layer
│   │   └── assets/          # Static assets
│   ├── .env.example         # Frontend env template
│   └── package.json
│
├── taskhub-backend/         # Spring Boot backend
│   ├── src/main/java/com/taskhub/
│   │   ├── config/          # Security & app configuration
│   │   ├── controller/      # REST API controllers
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── entity/          # JPA entities
│   │   ├── exception/       # Global exception handling
│   │   ├── repository/      # Spring Data JPA repositories
│   │   ├── security/        # JWT auth & filters
│   │   └── service/         # Business logic layer
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── .env.example         # Backend env template
│   └── pom.xml
│
├── .gitignore
└── README.md
```

## ⚙️ Prerequisites

- **Java 21** or higher
- **Node.js 18+** and npm
- **MySQL 8.x** running locally
- **Maven 3.9+**
- **Git**

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/SohanPatil810/TaskHub.git
cd TaskHub
```

### 2. Backend Setup

```bash
cd taskhub-backend

# Copy the env template and fill in your credentials
cp .env.example .env

# Edit .env with your actual values:
# - DB_PASSWORD: Your MySQL root password
# - JWT_SECRET: A secure random string (min 64 chars)
# - MAIL_USERNAME: Your Gmail address
# - MAIL_PASSWORD: Your Gmail App Password

# Run the backend
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`.

### 3. Frontend Setup

```bash
cd taskhub-frontend

# Copy the env template
cp .env.example .env

# Install dependencies
npm install

# Run the frontend
npm run dev
```

The frontend will start on `http://localhost:5173`.

### 4. MySQL Database

Create the database (or let Spring Boot auto-create it):

```sql
CREATE DATABASE IF NOT EXISTS taskhub;
```

> **Note:** With `createDatabaseIfNotExist=true` in the connection URL, the database will be created automatically on first run.

## 🔐 Environment Variables

### Backend (`taskhub-backend/.env`)

| Variable        | Description                         |
|-----------------|-------------------------------------|
| `DB_URL`        | MySQL JDBC connection URL           |
| `DB_USERNAME`   | MySQL username                      |
| `DB_PASSWORD`   | MySQL password                      |
| `JWT_SECRET`    | JWT signing secret (min 64 chars)   |
| `MAIL_USERNAME` | Gmail address for sending emails    |
| `MAIL_PASSWORD` | Gmail App Password                  |

### Frontend (`taskhub-frontend/.env`)

| Variable       | Description              |
|----------------|--------------------------|
| `VITE_API_URL` | Backend API base URL     |

> ⚠️ **Never commit `.env` files with real credentials.** Use `.env.example` as a template.

## 🌟 Features

- **Organization Management** — Create and manage organizations
- **Project Tracking** — Create projects with priorities and statuses
- **Task Management** — Assign tasks, set deadlines, track progress
- **Team Collaboration** — Comment on tasks in real-time
- **Invite System** — Email-based team invitations with secure tokens
- **JWT Authentication** — Secure login and registration
- **Role-Based Access** — Organization-level role management

## 📡 API Endpoints

| Method | Endpoint                                    | Description              |
|--------|---------------------------------------------|--------------------------|
| POST   | `/api/auth/register`                        | Register new user        |
| POST   | `/api/auth/login`                           | Login & get JWT token    |
| GET    | `/api/organizations/my`                     | Get user's organizations |
| POST   | `/api/organizations`                        | Create organization      |
| GET    | `/api/organizations/{id}/projects`          | Get projects             |
| POST   | `/api/organizations/{id}/projects`          | Create project           |
| GET    | `/api/.../tasks`                            | Get tasks                |
| POST   | `/api/.../tasks`                            | Create task              |
| POST   | `/api/.../comments`                         | Add comment              |
| POST   | `/api/organizations/{id}/invitations`       | Invite member            |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## 👨‍💻 Author
Sohan Patil

GitHub: https://github.com/SohanPatil810

⭐ Support
If you found this project useful, please consider giving it a ⭐ Star on GitHub.

Your support helps the project grow and motivates future improvements.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
