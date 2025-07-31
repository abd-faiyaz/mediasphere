# MediaSphere

A modern full-stack social platform for media enthusiasts to create communities, engage in discussions, and discover content through AI-powered features.

![MediaSphere Banner](https://j.top4top.io/p_34982d9241.png)

## 🌟 Features

### 🏘️ Community Management
- **Club Creation & Management**: Create and manage topic-based communities
- **Member Management**: Advanced member roles and permissions
- **Club Discovery**: Find communities based on interests and preferences

### 💬 Discussion Platform
- **Thread-based Discussions**: Organized conversations within clubs
- **Rich Media Support**: Share images, videos, and documents
- **Real-time Interactions**: Live comments and engagement
- **Moderation Tools**: Advanced content moderation and management

### 🤖 AI-Powered Services
- **Content Summarization**: AI-generated summaries of long discussions
- **Quiz Generation**: Interactive quizzes from any content
- **Sentiment Analysis**: Analyze discussion tone and engagement
- **Smart Recommendations**: Personalized content and club suggestions
- **Topic Analysis**: Extract key themes and insights from conversations

### 🔐 Authentication & Security
- **Multi-Auth Support**: Local authentication and OAuth integration
- **JWT Token Management**: Secure session handling
- **Role-based Access Control**: Granular permissions system
- **OAuth Providers**: Integration with Clerk and other providers

### 📱 Modern User Experience
- **Responsive Design**: Mobile-first responsive interface
- **Real-time Updates**: Live notifications and updates
- **Dark/Light Theme**: Customizable user interface
- **Progressive Web App**: PWA capabilities for mobile experience

## 🏗️ Architecture

### Tech Stack

#### Frontend
- **Framework**: Next.js 15.2.4 with React 18.3.1
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Radix UI components
- **Authentication**: Clerk integration
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
- **Cloud Deployment**: Azure VM ready

## 🚀 Quick Start

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

**Development Environment:**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

**Production Environment:**
```bash
docker-compose -f docker-compose.production.yml up -d
```

## 📊 API Documentation

The backend provides a comprehensive REST API with the following endpoints:

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
- `POST /ai/quiz` - Generate interactive quizzes
- `GET /ai/recommendations` - Get personalized recommendations
- `POST /ai/prompts` - Generate discussion prompts

### Media & Search
- `POST /media/upload` - Upload media files
- `GET /search` - Global search functionality
- `GET /notifications` - User notifications

## 🧪 Testing

### Frontend Testing
```bash
cd MediaSphere_frontend
npm run test                # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Generate coverage report
```

**Test Coverage**: 213 passing tests with comprehensive component and integration testing.

### Backend Testing
```bash
cd MediaSphere_backend
mvn test                   # Run unit tests
mvn test -Dtest=ClubServiceTest  # Run specific test class
./run-unit-tests.sh       # Run with script
```

**Test Framework**: JUnit 5 with Mockito for comprehensive service layer testing.

## 🗂️ Project Structure

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

## 🔧 Configuration

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

## 🚀 Deployment

### Azure Cloud Deployment
The project includes Azure VM deployment configurations:

- **VM Configuration**: Ubuntu 24.04 LTS, B2ts_v2 (2 vCPUs, 1 GiB RAM)
- **Public IP**: Configured with load balancing
- **Security**: SSH key authentication, firewall rules
- **Monitoring**: Azure monitoring and health checks

### Deployment Scripts
- `./scripts/vm-setup.sh` - Initial VM setup
- `./rebuild-frontend.sh` - Frontend rebuild script
- `./update-frontend-vm.sh` - Update frontend on VM

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript/Java coding standards
- Write comprehensive tests for new features
- Update documentation for API changes
- Use conventional commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **API Documentation**: [Swagger UI when running locally]
- **Issue Tracker**: [GitHub Issues]
- **Documentation**: [Project Wiki]

## 👥 Team

- **Development**: Full-stack development team
- **UI/UX**: Modern responsive design
- **DevOps**: Cloud deployment and CI/CD
- **AI Integration**: Gemini API and content analysis

## 📈 Roadmap

- [ ] Real-time chat functionality
- [ ] Advanced AI content moderation
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Third-party integrations
- [ ] Multilingual support

---

**Built with ❤️ by the MediaSphere team**

*A platform where communities thrive and conversations matter.*
