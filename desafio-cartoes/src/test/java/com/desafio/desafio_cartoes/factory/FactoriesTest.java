package com.desafio.desafio_cartoes.factory;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import com.desafio.desafio_cartoes.dto.CartaoRequestDTO;
import com.desafio.desafio_cartoes.entity.Cartao;
import com.desafio.desafio_cartoes.entity.Perfil;
import com.desafio.desafio_cartoes.entity.TipoCartao;
import com.desafio.desafio_cartoes.entity.Usuario;

class FactoriesTest {

    @Test
    void cartaoNasceAtivoEVinculadoAoDono() {
        Usuario dono = new Usuario("Ana", "ana@email.com", "hash");

        Cartao cartao = CartaoFactory.criar(new CartaoRequestDTO(123L, "Meu cartão", TipoCartao.ESTUDANTE), dono);

        assertEquals(123L, cartao.getNumeroCartao());
        assertEquals("Meu cartão", cartao.getNome());
        assertEquals(TipoCartao.ESTUDANTE, cartao.getTipoCartao());
        assertTrue(cartao.getStatus());
        assertSame(dono, cartao.getUsuario());
    }

    @Test
    void usuarioComumTemPerfilUser() {
        Usuario usuario = UsuarioFactory.comum("Ana", "ana@email.com", "hash");

        assertEquals(Perfil.USER, usuario.getPerfil());
        assertEquals("hash", usuario.getSenha());
    }

    @Test
    void administradorTemPerfilAdmin() {
        Usuario admin = UsuarioFactory.administrador("Admin", "admin@email.com", "hash");

        assertEquals(Perfil.ADMIN, admin.getPerfil());
    }
}
