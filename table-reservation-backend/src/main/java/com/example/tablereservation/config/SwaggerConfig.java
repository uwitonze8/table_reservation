package com.example.tablereservation.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Table Reservation API")
                        .version("1.0.0")
                        .description("REST API for Restaurant Table Reservation System")
                        .contact(new Contact()
                                .name("Table Reservation Team")
                                .email("support@tablereservation.com")));
    }
}
