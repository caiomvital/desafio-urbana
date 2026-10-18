package com.desafio.desafio_cartoes.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
public class Cartao {

@Id
@GeneratedValue (strategy = GenerationType.IDENTITY)
private Long id;
@Column (nullable = false, unique = true)
@NotNull 
private Long numeroCartao;
@Column (nullable = false)
@NotBlank 
private String nome;
@Column (nullable = false)
@NotNull 
private Boolean status;
@Column(nullable = false)
@Enumerated (EnumType.STRING)
@NotNull
private TipoCartao tipoCartao;
@ManyToOne (fetch = FetchType.LAZY)
@JoinColumn (name = "usuario_id", nullable = false)
private Usuario usuario;


public Cartao(){}

public Cartao(Long numeroCartao, String nome, Boolean status, TipoCartao tipoCartao){
this.numeroCartao = numeroCartao;
this.nome = nome;
this.status = status;
this.tipoCartao = tipoCartao;
}

public Long getId() {
    return id;
}

public Long getNumeroCartao() {
    return numeroCartao;
}

public void setNumeroCartao(Long numeroCartao) {
    this.numeroCartao = numeroCartao;
}

public String getNome() {
    return nome;
}

public void setNome(String nome) {
    this.nome = nome;
}

public Boolean getStatus() {
    return status;
}

public void setStatus(Boolean status) {
    this.status = status;
}

public TipoCartao getTipoCartao() {
    return tipoCartao;
}

public void setTipoCartao(TipoCartao tipoCartao) {
    this.tipoCartao = tipoCartao;
}

public Usuario getUsuario() {
    return usuario;
}

public void setUsuario(Usuario usuario) {
    this.usuario = usuario;
}

}
