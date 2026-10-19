package com.desafio.desafio_cartoes.factory;

import com.desafio.desafio_cartoes.entity.Perfil;
import com.desafio.desafio_cartoes.entity.Usuario;

/**
 * Factory Method: define o perfil de cada tipo de usuário criado pela aplicação.
 * A senha deve chegar já criptografada.
 */
public final class UsuarioFactory {

    private UsuarioFactory() {
    }

    public static Usuario comum(String nome, String email, String senhaCriptografada) {
        return criar(nome, email, senhaCriptografada, Perfil.USER);
    }

    public static Usuario administrador(String nome, String email, String senhaCriptografada) {
        return criar(nome, email, senhaCriptografada, Perfil.ADMIN);
    }

    private static Usuario criar(String nome, String email, String senhaCriptografada, Perfil perfil) {
        Usuario usuario = new Usuario(nome, email, senhaCriptografada);
        usuario.setPerfil(perfil);
        return usuario;
    }
}
