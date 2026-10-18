package com.desafio.desafio_cartoes.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.desafio.desafio_cartoes.entity.Cartao;

public interface CartaoRepository extends JpaRepository<Cartao, Long> {

    @Query(value = "SELECT * FROM cartao WHERE usuario_id = :usuarioId ORDER BY id", nativeQuery = true)
    List<Cartao> listarPorUsuario(@Param("usuarioId") Long usuarioId);

    @Query(value = "SELECT COUNT(*) > 0 FROM cartao WHERE numero_cartao = :numeroCartao", nativeQuery = true)
    boolean existeNumeroCartao(@Param("numeroCartao") Long numeroCartao);

    @Query(value = "SELECT COUNT(*) FROM cartao WHERE usuario_id = :usuarioId", nativeQuery = true)
    long contarPorUsuario(@Param("usuarioId") Long usuarioId);

}
