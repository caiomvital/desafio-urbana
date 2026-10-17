package com.desafio.desafio_cartoes.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.desafio.desafio_cartoes.dto.UsuarioRequestDTO;
import com.desafio.desafio_cartoes.dto.UsuarioUpdateDTO;
import com.desafio.desafio_cartoes.entity.Usuario;
import com.desafio.desafio_cartoes.repository.UsuarioRepository;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;

    public UsuarioService(UsuarioRepository repository) {
        this.repository = repository;
    }

    public Usuario cadastrar(UsuarioRequestDTO dto) {

        if (dto == null) {
            throw new IllegalArgumentException("Usuário não pode ser nulo");
        }

        Usuario usuario = new Usuario(dto.nome(), dto.email(), dto.senha());

        return repository.save(usuario);
    }

    public List<Usuario> listar(){
        
        return repository.findAll();
    }

    public Usuario localizar(Long id) {
        return repository.findById(id).orElseThrow(() -> new NoSuchElementException("Usuário não encontrado."));
    }

    public Usuario atualizar(Long id, UsuarioUpdateDTO novosDados) {
        Usuario usuario = localizar(id);

        usuario.setNome(novosDados.nome());
        usuario.setEmail(novosDados.email());
    
        return repository.save(usuario);
        
    }

    @Transactional 
    public void remover(Long id) {
        Usuario usuario = localizar(id);
        if (!usuario.getCartoes().isEmpty()) {
            throw new IllegalStateException("Usuário possui cartões associados");
        }
        repository.delete(usuario);
    }


}
