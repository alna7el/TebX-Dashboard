# Tebex - Healthcare Management System

A comprehensive healthcare management system built with NestJS, MongoDB, and Keycloak for authentication. This system provides a complete solution for managing clinics, appointments, patients, doctors, and medical services.

## 🏥 Features

### Core Features

- **User Management**: Role-based access control with Keycloak integration
- **Clinic Management**: Multi-clinic support with branch management
- **Appointment Scheduling**: Advanced appointment booking and management
- **Patient Management**: Complete patient records and medical history
- **Doctor Management**: Doctor profiles, specialities, and working hours
- **Medical Services**: Service catalog with pricing and billing
- **Diagnosis & Prescriptions**: Medical diagnosis and prescription management
- **File Management**: Secure file upload with Azure Blob Storage
- **Email Notifications**: Automated email notifications using Handlebars templates
- **QR Code Generation**: QR codes for appointments and patient identification
- **Statistics & Reporting**: Comprehensive analytics and reporting

### Technical Features

- **RESTful API**: Complete REST API with Swagger documentation
- **Authentication**: Keycloak-based authentication and authorization
- **Database**: MongoDB with Mongoose ODM
- **File Storage**: Azure Blob Storage integration
- **Email Service**: Nodemailer with Handlebars templates
- **Validation**: Class-validator for request validation
- **Scheduling**: Automated tasks with NestJS Schedule
- **Docker Support**: Complete Docker containerization

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- MongoDB
- Keycloak server

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Application
PORT=3333
NODE_ENV=development

# Database
DATABASE_URL=mongodb://localhost:27017/tebex

# Keycloak Configuration
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=tebex
KEYCLOAK_CLIENT_ID=tebex-client
KEYCLOAK_CLIENT_PASSWORD=your-client-secret

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM_ADDRESS=noreply@tebex.com

# Azure Storage (for file uploads)
AZURE_STORAGE_CONNECTION_STRING=your-azure-connection-string

# Docker Configuration
APP_PORT=3333
MONGO_PORT=27017
KEYCLOAK_PORT=8080
KC_HOSTNAME=localhost
```

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd tebex
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start Keycloak and MongoDB with Docker**

   ```bash
   docker network create tebex
   docker-compose up -d
   ```

4. **Run the application**

   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

5. **Access the application**
   - API: http://localhost:3333
   - Swagger Documentation: http://localhost:3333/docs
   - Keycloak Admin: http://localhost:8080

## 🏗️ Project Structure

```
src/
├── appointments/           # Appointment management
├── branches/              # Branch management
├── cities/                # City management
├── clinics/               # Clinic management
├── clinic_user_working_hours/  # Doctor working hours
├── common/                # Common utilities and validators
├── counters/              # Auto-increment counters
├── countries/             # Country management
├── diagnosis/             # Medical diagnosis
├── districts/             # District management
├── doctor_attendance/     # Doctor attendance tracking
├── doctors/               # Doctor management
├── files/                 # File management
├── file-upload/           # File upload service
├── icd10/                 # ICD-10 codes
├── keycloak/              # Keycloak integration
├── lookups/               # Lookup data
├── mailer/                # Email service
├── patients/              # Patient management
├── practitionar/          # Practitioner management
├── prescriptions/         # Prescription management
├── providers/             # Provider management
├── qrcode/                # QR code generation
├── roles/                 # Role management
├── seeds/                 # Database seeders
├── services/              # Medical services
├── speciality/            # Medical specialities
├── statistics/            # Statistics and reporting
├── templates/             # Email templates
├── transactions/          # Financial transactions
├── users/                 # User management
├── app.module.ts          # Main application module
└── main.ts               # Application entry point
```

## 📚 API Documentation

The API documentation is available at `http://localhost:3333/docs` when the application is running. The documentation includes:

- All available endpoints
- Request/response schemas
- Authentication requirements
- Example requests and responses

### Key Endpoints

#### Authentication

- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

#### Users

- `GET /users` - Get all users
- `POST /users` - Create new user
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### Appointments

- `GET /appointments` - Get all appointments
- `POST /appointments` - Create new appointment
- `GET /appointments/:id` - Get appointment by ID
- `PUT /appointments/:id` - Update appointment
- `DELETE /appointments/:id` - Cancel appointment

#### Patients

- `GET /patients` - Get all patients
- `POST /patients` - Create new patient
- `GET /patients/:id` - Get patient by ID
- `PUT /patients/:id` - Update patient

#### Clinics

- `GET /clinics` - Get all clinics
- `POST /clinics` - Create new clinic
- `GET /clinics/:id` - Get clinic by ID

## 🔧 Development

### Available Scripts

```bash
# Development
npm run start:dev          # Start in development mode with hot reload
npm run start:debug        # Start in debug mode

# Production
npm run build              # Build the application
npm run start:prod         # Start in production mode

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run end-to-end tests

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
```

### Database Seeding

The application includes database seeders for initial data:

```bash
# Seeders are automatically run on application startup
# Manual seeding can be done through the SeederService
```

### Docker Development

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

## 🔐 Authentication & Authorization

The system uses Keycloak for authentication and authorization:

### Roles

- **Admin**: Full system access
- **Doctor**: Medical staff access
- **Receptionist**: Front desk operations
- **Patient**: Limited patient access

### Keycloak Setup

1. Create a new realm called "tebex"
2. Create a new client called "tebex-client"
3. Configure client settings and roles
4. Set up user roles and permissions

## 📊 Database Schema

The system uses MongoDB with the following main collections:

- **users**: User accounts and profiles
- **patients**: Patient information and medical records
- **appointments**: Appointment scheduling and management
- **clinics**: Clinic information and settings
- **services**: Medical services and pricing
- **diagnosis**: Medical diagnoses and ICD-10 codes
- **prescriptions**: Medical prescriptions
- **transactions**: Financial transactions and billing

## 🚀 Deployment

### Production Deployment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Set up production environment variables**

3. **Deploy with Docker**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Environment Configuration

Ensure all production environment variables are properly configured:

- Database connection string
- Keycloak configuration
- Email service credentials
- Azure Storage connection string
- Security settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the UNLICENSED license.

## 🆘 Support

For support and questions:

- Check the API documentation at `/docs`
- Review the logs for error details
- Contact the development team

## 🔄 Recent Updates

### Latest Features

- Enhanced appointment scheduling with working hours
- Improved file upload with Azure Blob Storage
- Added comprehensive statistics and reporting
- Enhanced email notifications with templates
- Added QR code generation for appointments

### Bug Fixes

- Fixed appointment availability calculation
- Resolved date query issues in appointment service
- Improved time slot generation logic
- Enhanced error handling and validation

---

**Tebex** - Empowering healthcare management with modern technology.
