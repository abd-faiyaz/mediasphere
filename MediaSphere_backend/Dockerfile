# MediaSphere Backend Dockerfile
# Optimized multi-stage build for production deployment

# Stage 1: Dependencies cache
FROM maven:3.9.6-eclipse-temurin-21-alpine AS dependencies
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Stage 2: Build application
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests -B

# Stage 3: Runtime
FROM eclipse-temurin:21-jre-alpine AS runtime

# Install wget for healthcheck
RUN apk add --no-cache wget

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy built jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Change ownership to appuser
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Set JVM options for container environment
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC"

# Run the application
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
