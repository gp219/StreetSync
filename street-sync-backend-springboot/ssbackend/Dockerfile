# Stage 1: Build the JAR using Maven and Java 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
# Run the maven wrapper if it exists, otherwise use maven
RUN mvn clean package -DskipTests

# Stage 2: Run the JAR using Java 21 JRE
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
# Spring Boot 4 builds the jar in the target folder
COPY --from=build /app/target/*.jar app.jar
EXPOSE 10000
ENTRYPOINT ["java", "-jar", "app.jar"]