# AgencySync Backend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Environment variables (optional - defaults work for dev):
- `PORT` - Server port (default: 5000)
- `JWT_SECRET` - Secret for JWT tokens
- `NODE_ENV` - development/production

3. Start server:
```bash
npm run dev  # Development with nodemon
npm start    # Production
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get single client
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Proposals
- `GET /api/proposals` - Get all proposals
- `GET /api/proposals/:id` - Get single proposal
- `POST /api/proposals` - Create proposal
- `PUT /api/proposals/:id` - Update proposal
- `DELETE /api/proposals/:id` - Delete proposal

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Time Tracking
- `GET /api/time` - Get all time entries
- `POST /api/time` - Create time entry
- `PUT /api/time/:id` - Update time entry
- `DELETE /api/time/:id` - Delete time entry