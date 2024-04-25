FROM eclipse-temurin:21.0.1_12-jre
EXPOSE 8082
COPY target/demo-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
