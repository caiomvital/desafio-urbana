package com.desafio.desafio_cartoes.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.desafio.desafio_cartoes.entity.Cartao;

public interface CartaoRepository extends JpaRepository<Cartao, Long> {

    

}
