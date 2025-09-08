# College Frontend

A React-based frontend for the college management system.

## Setup Instructions

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the example environment file and configure your settings:
```bash
cp .env.example .env
```

Edit `.env` file with your API endpoint:
```
HTTPS=false
REACT_APP_API_URL=http://your-backend-server:8080
```

### 4. Run the application
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| REACT_APP_API_URL | Backend API URL | http://localhost:8080 |
| HTTPS | Enable HTTPS | false |

## Deployment

For production deployment, update the `REACT_APP_API_URL` in your `.env` file to point to your production backend server.

## Features

- Student Management
- Professor Management  
- Class Management
- Student Enrollment System
- Schedule Management
- Authentication System