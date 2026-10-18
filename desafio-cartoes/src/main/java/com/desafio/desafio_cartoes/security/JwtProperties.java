package com.desafio.desafio_cartoes.security;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configurações do JWT ({@code app.jwt.*}). O segredo precisa ter ao menos 32 caracteres (HS256).
 */
@ConfigurationProperties(prefix = "app.jwt")
public record JwtProperties(String secret, Duration validade) {

    public JwtProperties {
        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException("app.jwt.secret deve ter ao menos 32 caracteres.");
        }
        if (validade == null) {
            validade = Duration.ofHours(2);
        }
    }
}
