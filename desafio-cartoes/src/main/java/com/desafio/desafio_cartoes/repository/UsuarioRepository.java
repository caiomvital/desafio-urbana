package com.desafio.desafio_cartoes.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.desafio.desafio_cartoes.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    

}
