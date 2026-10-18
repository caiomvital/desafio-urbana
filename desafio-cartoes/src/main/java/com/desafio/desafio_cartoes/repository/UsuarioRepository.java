package com.desafio.desafio_cartoes.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.desafio.desafio_cartoes.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    @Query(value = "SELECT * FROM usuario WHERE LOWER(email) = LOWER(:email)", nativeQuery = true)
    Optional<Usuario> buscarPorEmail(@Param("email") String email);

    @Query(value = "SELECT COUNT(*) > 0 FROM usuario WHERE LOWER(email) = LOWER(:email) AND id <> :idIgnorado", nativeQuery = true)
    boolean existeEmailDeOutroUsuario(@Param("email") String email, @Param("idIgnorado") Long idIgnorado);

}
