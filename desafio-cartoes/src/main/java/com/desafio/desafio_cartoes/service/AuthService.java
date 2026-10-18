package com.desafio.desafio_cartoes.service;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.desafio.desafio_cartoes.dto.LoginRequestDTO;
import com.desafio.desafio_cartoes.dto.LoginResponseDTO;
import com.desafio.desafio_cartoes.entity.Usuario;
import com.desafio.desafio_cartoes.repository.UsuarioRepository;
import com.desafio.desafio_cartoes.security.JwtService;

@Service
public class AuthService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository repository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public LoginResponseDTO login(LoginRequestDTO dto) {
        Usuario usuario = repository.buscarPorEmail(dto.email())
                .filter(u -> passwordEncoder.matches(dto.senha(), u.getSenha()))
                .orElseThrow(() -> new BadCredentialsException("E-mail ou senha inválidos."));

        return new LoginResponseDTO(
                jwtService.gerarToken(usuario),
                "Bearer",
                jwtService.getValidade().toSeconds(),
                usuario.getId(),
                usuario.getNome(),
                usuario.getPerfil());
    }
}
