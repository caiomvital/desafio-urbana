package com.desafio.desafio_cartoes.dto;

import com.desafio.desafio_cartoes.entity.TipoCartao;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CartaoRequestDTO( 
 
    @NotNull Long numeroCartao,
    @NotBlank String nome,
    @NotNull TipoCartao tipoCartao
    ) {

    }


