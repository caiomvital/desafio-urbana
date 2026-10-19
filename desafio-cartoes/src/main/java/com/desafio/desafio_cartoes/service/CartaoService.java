package com.desafio.desafio_cartoes.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.desafio.desafio_cartoes.dto.CartaoRequestDTO;
import com.desafio.desafio_cartoes.dto.CartaoUpdateDTO;
import com.desafio.desafio_cartoes.entity.Cartao;
import com.desafio.desafio_cartoes.entity.Usuario;
import com.desafio.desafio_cartoes.exception.ConflitoException;
import com.desafio.desafio_cartoes.factory.CartaoFactory;
import com.desafio.desafio_cartoes.repository.CartaoRepository;
import com.desafio.desafio_cartoes.repository.UsuarioRepository;

@Service
public class CartaoService {
    private final CartaoRepository repository;
    private final UsuarioRepository usuarioRepository;
    public CartaoService(CartaoRepository repository, UsuarioRepository usuarioRepository) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public Cartao cadastrar(CartaoRequestDTO dto, Long usuarioId) {

        if (dto == null) {
            throw new IllegalArgumentException("Cartão não pode ser nulo");
        }

        Usuario usuario = usuarioRepository.findById(usuarioId).orElseThrow(() -> new NoSuchElementException("Usuário não encontrado."));

        if (repository.existeNumeroCartao(dto.numeroCartao())) {
            throw new ConflitoException("Já existe um cartão com este número.");
        }

        return repository.save(CartaoFactory.criar(dto, usuario));
    }

    @Transactional(readOnly = true)
    public List<Cartao> listar() {

        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Cartao> listarPorUsuario(Long usuarioId) {
        if (!usuarioRepository.existsById(usuarioId)) {
            throw new NoSuchElementException("Usuário não encontrado.");
        }
        return repository.listarPorUsuario(usuarioId);
    }

    @Transactional(readOnly = true)
    public Cartao localizar(Long id) {
        return repository.findById(id).orElseThrow(() -> new NoSuchElementException("Cartão não encontrado."));
    }

    /** Localiza o cartão garantindo que ele pertence ao usuário informado. */
    @Transactional(readOnly = true)
    public Cartao localizarDoUsuario(Long usuarioId, Long cartaoId) {
        Cartao cartao = localizar(cartaoId);
        if (!cartao.getUsuario().getId().equals(usuarioId)) {
            throw new NoSuchElementException("Cartão não encontrado para este usuário.");
        }
        return cartao;
    }

    @Transactional
    public Cartao atualizar(Long id, CartaoUpdateDTO novosDados) {
        Cartao cartao = localizar(id);

        cartao.setNome(novosDados.nome());
        cartao.setTipoCartao(novosDados.tipoCartao());

        return repository.save(cartao);

    }

    @Transactional
    public void remover(Long id) {
        Cartao cartao = localizar(id);

        repository.delete(cartao);
    }

    @Transactional
    public void removerDoUsuario(Long usuarioId, Long cartaoId) {
        repository.delete(localizarDoUsuario(usuarioId, cartaoId));
    }

    @Transactional
    public void ativar(Long id){
        Cartao cartao = localizar(id);

        cartao.setStatus(true);

    }

    @Transactional
    public void desativar(Long id){
        Cartao cartao = localizar(id);
        cartao.setStatus(false);

    }

    @Transactional
    public void alterarStatusDoUsuario(Long usuarioId, Long cartaoId, boolean ativo) {
        localizarDoUsuario(usuarioId, cartaoId).setStatus(ativo);
    }
}
