package com.desafio.desafio_cartoes.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.desafio.desafio_cartoes.entity.Cartao;
import com.desafio.desafio_cartoes.entity.Usuario;
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

    public Cartao cadastrar(Cartao cartao, Long usuarioId) {

        if (cartao == null) {
            throw new IllegalArgumentException("Cartão não pode ser nulo");
        }

        Usuario usuario = usuarioRepository.findById(usuarioId).orElseThrow(() -> new NoSuchElementException("Usuário não encontrado."));

        cartao.setUsuario(usuario);
        
        return repository.save(cartao);
    }

    public List<Cartao> listar() {

        return repository.findAll();
    }

    public Cartao localizar(Long id) {
        return repository.findById(id).orElseThrow(() -> new NoSuchElementException("Cartão não encontrado."));
    }

    public Cartao atualizar(Long id, Cartao novosDados) {
        Cartao cartao = localizar(id);

        cartao.setNome(novosDados.getNome());
        cartao.setTipoCartao(novosDados.getTipoCartao());

        return repository.save(cartao);

    }

    @Transactional
    public void remover(Long id) {
        Cartao cartao = localizar(id);
        
        repository.delete(cartao);
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
}
