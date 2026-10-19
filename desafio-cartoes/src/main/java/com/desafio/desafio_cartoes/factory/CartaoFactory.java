package com.desafio.desafio_cartoes.factory;

import com.desafio.desafio_cartoes.dto.CartaoRequestDTO;
import com.desafio.desafio_cartoes.entity.Cartao;
import com.desafio.desafio_cartoes.entity.Usuario;

/**
 * Factory Method: centraliza a regra de criação de um cartão novo
 * (todo cartão nasce ativo e vinculado ao seu dono).
 */
public final class CartaoFactory {

    private CartaoFactory() {
    }

    public static Cartao criar(CartaoRequestDTO dto, Usuario dono) {
        Cartao cartao = new Cartao(dto.numeroCartao(), dto.nome(), true, dto.tipoCartao());
        cartao.setUsuario(dono);
        return cartao;
    }
}
