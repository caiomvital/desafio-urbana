package com.desafio.desafio_cartoes.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.desafio.desafio_cartoes.repository.UsuarioRepository;
import com.desafio.desafio_cartoes.factory.UsuarioFactory;

/**
 * Garante a existência de um administrador inicial (credenciais em {@code app.admin.*}).
 */
@Component
public class AdminInitializer implements ApplicationRunner {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String senha;

    public AdminInitializer(UsuarioRepository repository, PasswordEncoder passwordEncoder,
            @Value("${app.admin.email:admin@desafio.com}") String email,
            @Value("${app.admin.senha:admin123}") String senha) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.senha = senha;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (repository.buscarPorEmail(email).isPresent()) {
            return;
        }
        repository.save(UsuarioFactory.administrador("Administrador", email, passwordEncoder.encode(senha)));
    }
}
