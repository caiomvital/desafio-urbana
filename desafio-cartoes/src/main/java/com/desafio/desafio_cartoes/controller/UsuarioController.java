package com.desafio.desafio_cartoes.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.desafio.desafio_cartoes.dto.UsuarioRequestDTO;
import com.desafio.desafio_cartoes.dto.UsuarioResponseDTO;
import com.desafio.desafio_cartoes.dto.UsuarioUpdateDTO;
import com.desafio.desafio_cartoes.service.UsuarioService;

import jakarta.validation.Valid;


@RestController
@RequestMapping ("/usuarios")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service){
        this.service = service;
    }

    @GetMapping
    public List<UsuarioResponseDTO> listar(){
        return service.listar().stream().map(UsuarioResponseDTO::de).toList();
    }

    @GetMapping("/{id}")
    public UsuarioResponseDTO localizar(@PathVariable Long id){
        return UsuarioResponseDTO.de(service.localizar(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponseDTO cadastrar(@Valid @RequestBody UsuarioRequestDTO dto) {
        return UsuarioResponseDTO.de(service.cadastrar(dto));
    }

    @PutMapping("/{id}")
    public UsuarioResponseDTO atualizar(@PathVariable Long id, @Valid @RequestBody UsuarioUpdateDTO dto) {
        return UsuarioResponseDTO.de(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@PathVariable Long id) {
        service.remover(id);
    }

}
