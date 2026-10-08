# SocialX

> A production-oriented full-stack social media platform with real-time messaging, notifications, reactions, caching, background jobs, and scalable backend architecture.

## 🌐 Project Overview

**SocialX** is a full-stack social media application built to go beyond basic CRUD functionality.

The project includes:

- User authentication and profiles
- Posts, likes, comments and stories
- Follow/follow-request functionality
- Real-time private messaging
- Message seen/read status
- Typing indicators
- Unread message counters
- Message replies
- Message reactions
- Real-time notifications
- Redis caching and rate limiting
- Background notification processing with BullMQ
- PostgreSQL database with Prisma ORM
- Cloud/media upload support
- Responsive React frontend
- Docker and CI/CD support

The project is designed with production-oriented concepts such as database indexing, cursor pagination, connection pooling, caching, rate limiting, queues/workers, and real-time communication.

---

## ✨ Key Features

### 👤 User & Profile
- User registration and authentication
- Login/logout
- User profiles
- Profile pictures
- Search users
- Follow/unfollow functionality
- Follow requests and notifications

### 📝 Social Features
- Create and view posts
- Like posts
- Comment on posts
- Stories
- User feeds
- Real-time social notifications

### 💬 Real-Time Messaging
SocialX uses **Socket.IO** for real-time communication.

Features include:

- Private one-to-one messaging
- Real-time message delivery
- Typing indicators
- Message seen/read status
- Unread message count
- Sender-specific unread counters
- Message replies
- Message reactions
- Real-time reaction updates
- Private message request flow

### 🔔 Notifications
- Real-time notification delivery
- Unread notification counter
- Background notification processing
- Redis/BullMQ based worker architecture

### ⚡ Performance & Scalability
The backend includes several production-oriented optimizations:

- Redis caching
- Cache invalidation
- Redis rate limiting
- Database indexes
- Cursor-based pagination
- PostgreSQL connection pooling
- Background jobs with BullMQ
- Socket.IO room-based communication
- Load/performance testing with Autocannon

---

## 🏗️ Architecture

```text
                         ┌──────────────────┐
                         │      Users       │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  React Frontend │
                         │     Vercel      │
                         └────────┬─────────┘
                                  │ HTTPS
                                  ▼
                    ┌──────────────────────────┐
                    │ Node.js + Express Server │
                    │         Render           │
                    └───────┬─────────┬────────┘
                            │         │
                 ┌──────────┘         └──────────┐
                 ▼                               ▼
        ┌────────────────┐              ┌────────────────┐
        │ PostgreSQL     │              │ Redis / Upstash│
        │ Prisma ORM     │              │ Cache / Limits │
        │     Neon       │              └───────┬────────┘
        └────────────────┘                      │
                                                ▼
                                      ┌──────────────────┐
                                      │ BullMQ Workers   │
                                      │ Background Jobs  │
                                      └──────────────────┘

                    ┌──────────────────────────┐
                    │       Socket.IO          │
                    │ Real-time Communication  │
                    └──────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3
- Tailwind CSS
- Redux
- Socket.IO Client
- Emoji Picker

### Backend
- Node.js
- Express.js
- Socket.IO
- JWT
- bcrypt
- Helmet
- CORS
- Morgan
- Winston
- Zod

### Database
- PostgreSQL
- Prisma ORM
- pg
- Prisma PostgreSQL adapter

### Caching & Background Processing
- Redis
- ioredis
- BullMQ
- Upstash Redis

### Media & Storage
- Cloudinary
- Multer

### Testing & Performance
- Jest
- Supertest
- Autocannon

### DevOps
- Git
- GitHub
- Docker
- GitHub Actions
- Vercel
- Render

---

## 📁 Project Structure

```text
Social Media App/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── ...
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── workers/
│   ├── utils/
│   ├── prisma/
│   ├── SocketHandler.js
│   ├── db.js
│   ├── redis.js
│   ├── index.js
│   └── package.json
│
├── .github/
│   └── workflows/
│
├── docker/
│   └── ...
│
└── README.md
```

---

## 🚀 Local Development

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd "Social Media App"
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Install frontend dependencies

```bash
cd ../client
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `server` directory.

Example:

```env
PORT=6001

CLIENT_URL=http://localhost:3000

DATABASE_URL=your_postgresql_connection_string

UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

> Add only the variables actually used by your backend. Never commit `.env` files or secrets to GitHub.

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Apply database migrations

```bash
npx prisma migrate deploy
```

For local development where you are creating new migrations:

```bash
npx prisma migrate dev
```

### 7. Start the backend

```bash
cd server
npm run dev
```

The backend runs locally on:

```text
http://localhost:6001
```

### 8. Start the frontend

In another terminal:

```bash
cd client
npm start
```

The frontend runs locally on:

```text
http://localhost:3000
```

---

## 🔐 Environment Variables

### Backend

| Variable | Purpose |
|---|---|
| `PORT` | Backend server port |
| `CLIENT_URL` | Frontend URL used for CORS |
| `DATABASE_URL` | PostgreSQL connection string |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis authentication token |
| `JWT_SECRET` | JWT signing secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

Additional environment variables may be required depending on the enabled project modules.

### Frontend

The frontend should use a production API base URL and production Socket.IO URL instead of hard-coded localhost URLs.

Example:

```env
REACT_APP_API_URL=https://your-backend-url
REACT_APP_SOCKET_URL=https://your-backend-url
```

> Use the exact variable names expected by your frontend code.

---

## 🗄️ Database

SocialX uses **PostgreSQL** with **Prisma ORM**.

The schema includes entities for:

- Users
- Posts
- Likes
- Comments
- Stories
- Follows
- Messages
- Message requests
- Message reactions
- Notifications and related application data

Indexes are used for frequently accessed query paths such as messaging and user lookup.

---

## ⚡ Redis

Redis is used for performance and backend infrastructure features such as:

- Caching
- Cache invalidation
- Rate limiting
- Fast temporary data access
- Supporting background job infrastructure

Production Redis can be hosted using Upstash.

---

## 🔄 Background Jobs

SocialX uses **BullMQ** for background processing.

This keeps asynchronous work away from the main request-response path and allows notification-related work to be processed by workers.

---

## 🔌 Real-Time Communication

**Socket.IO** is used for real-time application features.

Examples:

```text
User
  │
  ├── Send Message ──────────────► Receiver
  │                                  │
  ├── Typing Indicator ────────────►│
  │                                  │
  ├── Seen Status ◄─────────────────┤
  │                                  │
  └── Message Reaction ◄────────────┘
```

Socket rooms are used to deliver user-specific events.

---

## 📈 Performance Engineering

The project includes backend optimization work focused on handling higher traffic.

Implemented areas include:

- Query optimization
- Database indexing
- Cursor pagination
- Connection pooling
- Redis caching
- Cache invalidation
- Redis rate limiting
- Queue + worker processing
- Autocannon load testing

Example performance metrics collected during testing:

```text
Average Latency : ~55.77 ms
P50             : ~30 ms
P90             : ~42 ms
P95             : ~58 ms
P99             : ~68 ms
Maximum         : ~4025 ms
```

> Performance numbers depend on the test environment, workload, database state, network and deployment configuration.

---

## 🧪 Testing

Backend tests use:

- Jest
- Supertest

Run tests with:

```bash
npm test
```

---

## 🐳 Docker

The project also contains Docker-related configuration for containerized development/deployment.

Example:

```bash
docker build -t socialx-server .
docker run -p 6001:6001 socialx-server
```

Use the project's actual Docker configuration when running the complete application.

---

## 🔁 CI/CD

GitHub Actions is used for automated project workflows.

The repository includes CI configuration under:

```text
.github/workflows/
```

The goal is to automatically validate changes before they are deployed.

---

## ☁️ Production Deployment

Recommended production architecture:

```text
GitHub
   │
   ├──────────────► Vercel
   │                 │
   │                 │ React Frontend
   │                 ▼
   │              Users
   │
   └──────────────► Render
                     │
                     ├── Node.js + Express
                     ├── Socket.IO
                     ├── Prisma
                     │
                     ├────────► Neon PostgreSQL
                     │
                     └────────► Upstash Redis
```

### Frontend

Deploy the `client` directory to Vercel.

### Backend

Deploy the `server` directory as a Render Web Service.

Typical commands:

```text
Build Command:
npm install && npx prisma generate && npx prisma migrate deploy

Start Command:
npm start
```

> Confirm the migration strategy and production database before running migrations against production.

### Production URLs

Add these after deployment:

```text
Frontend: https://your-socialx-frontend-url
Backend:  https://your-socialx-backend-url
```

---

## 🔒 Security

The backend includes security-related middleware and practices such as:

- Helmet
- CORS configuration
- JWT authentication
- Password hashing with bcrypt
- Request validation with Zod
- Redis-based rate limiting
- Environment variables for secrets

Never expose:

```text
DATABASE_URL
JWT_SECRET
CLOUDINARY_API_SECRET
UPSTASH_REDIS_REST_TOKEN
```

in source code or commit them to GitHub.

---

## 🎯 Project Goals

SocialX was built with a focus on learning and implementing real-world backend engineering concepts rather than only creating a basic social media UI.

The main goals are:

1. Build a complete full-stack application.
2. Implement real-time communication.
3. Design efficient database queries.
4. Introduce caching and rate limiting.
5. Handle asynchronous work using queues/workers.
6. Improve scalability and performance.
7. Implement production-oriented deployment.
8. Build a project that demonstrates practical software engineering skills.

---

## 🚧 Current Development

SocialX is continuously being improved.

Planned/improvable areas include:

- Further production hardening
- More automated tests
- Improved observability
- Additional scalability improvements
- UI/UX refinements
- Further optimization based on production metrics

---

## 👨‍💻 Author

**Ravi Shankar Gupta**

B.Tech — Electronics & Communication Engineering

Interested in:

- Software Engineering
- Backend Development
- Distributed Systems
- System Design
- Scalable Web Applications

---

## ⭐ Feedback

If you find the project useful or interesting, consider giving the repository a ⭐ on GitHub.
