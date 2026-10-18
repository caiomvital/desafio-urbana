package com.desafio.desafio_cartoes.dto;

import com.desafio.desafio_cartoes.entity.Perfil;
import com.desafio.desafio_cartoes.entity.Usuario;

public record UsuarioResponseDTO(
    Long id,
    String nome,
    String email,
    Perfil perfil
) {

    public static UsuarioResponseDTO de(Usuario usuario) {
        return new UsuarioResponseDTO(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getPerfil());
    }
}
