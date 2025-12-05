FROM openjdk:17-jdk-slim AS build
VOLUME /tmp
COPY ./target/table-reservation-backend-*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]