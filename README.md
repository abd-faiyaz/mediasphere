# MediaSphere

A full-stack social platform for creating communities, posting threads, and discussing content, with AI-powered features via the Gemini API.

![MediaSphere Banner](https://j.top4top.io/p_34982d9241.png)

## Features

### Community Management
- Club creation and management
- Member roles and permissions
- Club discovery by interest

### Discussion Platform
- Thread-based discussions within clubs
- Image, video, and document sharing
- Comments
- Content moderation

### AI Services
- Content summarization
- Quiz generation from content
- Sentiment analysis
- Content and club recommendations
- Topic and theme extraction

### Authentication & Security
- Local authentication and OAuth
- JWT session handling
- Role-based access control
- Clerk OAuth integration

### User Interface
- Responsive layout
- Real-time notifications
- Dark/Light theme toggle
- PWA support

## Architecture

### Tech Stack

#### Frontend
- **Framework**: Next.js 15.2.4 with React 18.3.1
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Radix UI components
- **Authentication**: Clerk
- **State Management**: React hooks and context
- **Testing**: Jest with React Testing Library
- **Animations**: Framer Motion

#### Backend
- **Framework**: Spring Boot 3.5.0
- **Language**: Java 17
- **Database**: PostgreSQL with JPA/Hibernate
- **Security**: JWT tokens with Spring Security
- **Testing**: JUnit 5 with Mockito
- **Build Tool**: Maven
- **Documentation**: OpenAPI/Swagger

#### Database
- **Primary**: PostgreSQL
- **ORM**: Hibernate/JPA
- **Migrations**: SQL scripts
- **Health Monitoring**: Built-in health checks

#### DevOps & Deployment
- **Containerization**: Docker with Docker Compose
- **Environments**: Development and Production configurations
- **Database Management**: Automated scripts and health checks
- **Cloud**: Azure VM

## Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- Java 17+
- Maven 3.6+
- PostgreSQL 13+
- Docker & Docker Compose (optional)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mediasphere.git
   cd mediasphere
   ```

2. **Database Setup**
   ```bash
   cd docker/database
   docker-compose up -d
   ```

3. **Backend Setup**
   ```bash
   cd MediaSphere_backend
   mvn clean install
   mvn spring-boot:run
   ```

4. **Frontend Setup**
   ```bash
   cd MediaSphere_frontend
   npm install
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Database: localhost:5432

### Docker Deployment

**Development:**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

**Production:**
```bash
docker-compose -f docker-compose.production.yml up -d
```

## API Documentation

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user profile
- `POST /auth/oauth/clerk` - OAuth authentication

### Clubs
- `GET /clubs` - List all clubs
- `POST /clubs` - Create new club
- `GET /clubs/{id}` - Get club details
- `PUT /clubs/{id}` - Update club
- `DELETE /clubs/{id}` - Delete club
- `POST /clubs/{id}/join` - Join club
- `POST /clubs/{id}/leave` - Leave club

### Threads & Discussions
- `GET /clubs/{clubId}/threads` - Get club threads
- `POST /clubs/{clubId}/threads` - Create new thread
- `GET /threads/{id}` - Get thread details
- `POST /threads/{id}/comments` - Add comment
- `GET /threads/{id}/comments` - Get thread comments

### AI Services
- `POST /ai/analyze` - Content analysis (sentiment, themes, characters)
- `POST /ai/summarize` - Generate content summaries
- `POST /ai/quiz` - Generate quizzes
- `GET /ai/recommendations` - Get recommendations
- `POST /ai/prompts` - Generate discussion prompts

### Media & Search
- `POST /media/upload` - Upload media files
- `GET /search` - Global search
- `GET /notifications` - User notifications

## Testing

### Frontend
```bash
cd MediaSphere_frontend
npm run test                # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Generate coverage report
```

213 passing tests.

### Backend
```bash
cd MediaSphere_backend
mvn test                          # Run unit tests
mvn test -Dtest=ClubServiceTest   # Run specific test class
./run-unit-tests.sh               # Run with script
```

JUnit 5 with Mockito.

## Project Structure

```
mediasphere/
├── MediaSphere_frontend/          # Next.js React application
│   ├── app/                       # App router pages
│   ├── components/                # Reusable UI components
│   ├── hooks/                     # Custom React hooks
│   ├── lib/                       # Utility libraries
│   └── __tests__/                 # Frontend tests
├── MediaSphere_backend/           # Spring Boot application
│   ├── src/main/java/             # Java source code
│   │   ├── controller/            # REST controllers
│   │   ├── service/               # Business logic
│   │   ├── model/                 # Entity models
│   │   ├── repository/            # Data repositories
│   │   └── dto/                   # Data transfer objects
│   └── src/test/                  # Backend tests
├── docker/                        # Docker configurations
│   └── database/                  # Database setup
├── scripts/                       # Deployment & utility scripts
└── SQL_files/                     # Database migrations
```

## Configuration

### Environment Variables

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

**Backend (application.properties):**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/mediasphere
spring.datasource.username=mediasphere_user
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

## Deployment

### Azure
- **VM**: Ubuntu 24.04 LTS, B2ts_v2 (2 vCPUs, 1 GiB RAM)
- **Network**: Public IP with load balancing
- **Security**: SSH key authentication, firewall rules
- **Monitoring**: Azure monitoring and health checks

### Deployment Scripts
- `./scripts/vm-setup.sh` - Initial VM setup
- `./rebuild-frontend.sh` - Frontend rebuild
- `./update-frontend-vm.sh` - Update frontend on VM

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript/Java coding standards
- Write tests for new features
- Update API documentation for API changes
- Use conventional commit messages

## License

MIT License — see [LICENSE](LICENSE) for details.
