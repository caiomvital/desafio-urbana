package com.desafio.desafio_cartoes.dto;

import com.desafio.desafio_cartoes.entity.Cartao;
import com.desafio.desafio_cartoes.entity.TipoCartao;

public record CartaoResponseDTO(
    Long id,
    Long numeroCartao,
    String nome,
    Boolean status,
    TipoCartao tipoCartao,
    Long usuarioId
) {

    public static CartaoResponseDTO de(Cartao cartao){
        return new CartaoResponseDTO(cartao.getId(), cartao.getNumeroCartao(), cartao.getNome(), cartao.getStatus(), cartao.getTipoCartao(), cartao.getUsuario().getId());
    }

}
