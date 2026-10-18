package com.desafio.desafio_cartoes.dto;

import com.desafio.desafio_cartoes.entity.Perfil;

public record LoginResponseDTO(
    String token,
    String tipo,
    long expiraEmSegundos,
    Long usuarioId,
    String nome,
    Perfil perfil
) {}
