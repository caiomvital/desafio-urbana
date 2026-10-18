package com.desafio.desafio_cartoes.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequestDTO(
    @NotBlank String email,
    @NotBlank String senha
) {}
