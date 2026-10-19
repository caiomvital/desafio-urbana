package com.desafio.desafio_cartoes.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.desafio.desafio_cartoes.dto.UsuarioRequestDTO;
import com.desafio.desafio_cartoes.dto.UsuarioUpdateDTO;
import com.desafio.desafio_cartoes.entity.Usuario;
import com.desafio.desafio_cartoes.exception.ConflitoException;
import com.desafio.desafio_cartoes.factory.UsuarioFactory;
import com.desafio.desafio_cartoes.repository.CartaoRepository;
import com.desafio.desafio_cartoes.repository.UsuarioRepository;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;
    private final CartaoRepository cartaoRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository repository, CartaoRepository cartaoRepository,
            PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.cartaoRepository = cartaoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Usuario cadastrar(UsuarioRequestDTO dto) {

        if (dto == null) {
            throw new IllegalArgumentException("Usuário não pode ser nulo");
        }

        if (repository.buscarPorEmail(dto.email()).isPresent()) {
            throw new ConflitoException("Já existe um usuário com este e-mail.");
        }

        return repository.save(UsuarioFactory.comum(dto.nome(), dto.email(), passwordEncoder.encode(dto.senha())));
    }

    @Transactional(readOnly = true)
    public List<Usuario> listar(){

        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Usuario localizar(Long id) {
        return repository.findById(id).orElseThrow(() -> new NoSuchElementException("Usuário não encontrado."));
    }

    @Transactional
    public Usuario atualizar(Long id, UsuarioUpdateDTO novosDados) {
        Usuario usuario = localizar(id);

        if (repository.existeEmailDeOutroUsuario(novosDados.email(), id)) {
            throw new ConflitoException("Já existe um usuário com este e-mail.");
        }

        usuario.setNome(novosDados.nome());
        usuario.setEmail(novosDados.email());

        return repository.save(usuario);

    }

    @Transactional
    public void remover(Long id) {
        Usuario usuario = localizar(id);
        if (cartaoRepository.contarPorUsuario(id) > 0) {
            throw new ConflitoException("Usuário possui cartões associados.");
        }
        repository.delete(usuario);
    }


}
