# 💰 ExpenseIQ — Professional Expense Tracker

A full-stack expense tracking application built with **Spring Boot**, **React**, and **MySQL**. Features JWT authentication, budget management, real-time dashboards, and visual analytics.

---

## 🏗️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Java 17, Spring Boot 3.2, Spring Security |
| Auth      | JWT (JSON Web Tokens)               |
| Database  | MySQL 8+, Spring Data JPA / Hibernate |
| Frontend  | React 18, React Router v6           |
| Charts    | Recharts                            |
| HTTP      | Axios                               |
| Styling   | Custom CSS (design system)          |

---

## 📁 Project Structure

```
Expense-Tracker/
├── backend/                         # Spring Boot API
│   └── src/main/java/com/example/expensetracker/
│       ├── config/                  # Security, JWT, CORS
│       ├── controller/              # REST endpoints
│       ├── service/                 # Business logic
│       ├── repository/              # JPA repositories
│       ├── entity/                  # JPA entities (User, Expense, Budget)
│       └── dto/                     # Request/response DTOs
│
├── frontend/                        # React app
│   └── src/
│       ├── context/                 # Auth context (React Context API)
│       ├── services/                # Axios API layer
│       ├── components/              # Shared components (Layout, etc.)
│       └── pages/                   # Dashboard, Expenses, Budgets, Reports
│
└── database/
    └── schema.sql                   # MySQL schema + seed data
```

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8+
- Maven 3.8+

---

### 1. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Run the schema
source /path/to/expense-tracker/database/schema.sql
```

Or simply start the Spring Boot app — Hibernate will auto-create all tables (`spring.jpa.hibernate.ddl-auto=update`).

---

### 2. Backend Setup

```bash
cd backend
```

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/expense_tracker_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

Run the app:

```bash
mvn spring-boot:run
```

Backend starts at **http://localhost:8080**

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend starts at **http://localhost:3000** (proxies API calls to port 8080)

---

## 🔐 Authentication

All API endpoints (except `/api/auth/**`) require a JWT Bearer token.

**Register**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "secret123"
}
```

Response includes a `token` — pass it as `Authorization: Bearer <token>` in all subsequent requests.

---

## 📡 API Reference

### Expenses

| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| GET    | `/api/expenses`       | List all expenses (filterable)     |
| POST   | `/api/expenses`       | Create a new expense               |
| PUT    | `/api/expenses/{id}`  | Update an expense                  |
| DELETE | `/api/expenses/{id}`  | Delete an expense                  |

**Query params for GET:**
- `month` + `year` — filter by month
- `category` — filter by category
- `startDate` + `endDate` — date range (`YYYY-MM-DD`)

### Budgets

| Method | Endpoint             | Description              |
|--------|----------------------|--------------------------|
| GET    | `/api/budgets`       | Get budgets (`?month=&year=`) |
| POST   | `/api/budgets`       | Create or update a budget |
| DELETE | `/api/budgets/{id}`  | Delete a budget          |

### Dashboard

| Method | Endpoint          | Description                  |
|--------|-------------------|------------------------------|
| GET    | `/api/dashboard`  | Get full dashboard stats     |

---

## 📊 Features

- **Dashboard** — Monthly/yearly totals, spending trend chart, category pie chart, recent transactions
- **Expenses** — Full CRUD with search, filter by category/month/year, table view
- **Budgets** — Set per-category monthly limits, track % used with color-coded progress bars
- **Reports** — Annual bar charts, category breakdowns, top expenses list
- **Auth** — JWT-secured, session-less, bcrypt password hashing

---

## 🎨 Demo Login

If you ran the seed data:
- **Email:** `demo@expenseiq.com`
- **Password:** `password123`

---

## 🛠️ Environment Variables (Optional)

For production, override via environment:

```bash
export SPRING_DATASOURCE_PASSWORD=yourpassword
export APP_JWT_SECRET=yoursecretkey
```

---

## 📦 Build for Production

**Backend:**
```bash
cd backend
mvn clean package
java -jar target/expensetracker-1.0.0.jar
```

**Frontend:**
```bash
cd frontend
npm run build
```

Serve the `build/` folder from a static host or configure Spring Boot to serve it.

---

## 🤝 License

MIT — free to use and modify.
