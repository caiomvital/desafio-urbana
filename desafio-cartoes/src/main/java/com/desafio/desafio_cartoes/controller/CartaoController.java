package com.desafio.desafio_cartoes.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.desafio.desafio_cartoes.dto.CartaoRequestDTO;
import com.desafio.desafio_cartoes.dto.CartaoResponseDTO;
import com.desafio.desafio_cartoes.dto.CartaoUpdateDTO;
import com.desafio.desafio_cartoes.service.CartaoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/cartoes")
public class CartaoController {

    private final CartaoService service;

    public CartaoController(CartaoService service) {
        this.service = service;
    }

    @GetMapping
    public List<CartaoResponseDTO> listar() {
        return service.listar()
        .stream()
        .map(CartaoResponseDTO::de)
        .toList();
    }

    @GetMapping("/{id}")
    public CartaoResponseDTO localizar(@PathVariable Long id) {
        return CartaoResponseDTO.de(service.localizar(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CartaoResponseDTO cadastrar(@RequestParam Long usuarioId, @Valid @RequestBody CartaoRequestDTO cartao) {
        return CartaoResponseDTO.de(service.cadastrar(cartao, usuarioId));
    }

    @PutMapping("/{id}")
    public CartaoResponseDTO atualizar(@PathVariable Long id, @Valid @RequestBody CartaoUpdateDTO cartao) {
        return CartaoResponseDTO.de(service.atualizar(id, cartao));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@PathVariable Long id) {
        service.remover(id);
    }

    @PatchMapping("/{id}/ativar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void ativar(@PathVariable Long id) {
        service.ativar(id);
    }

    @PatchMapping("/{id}/desativar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desativar(@PathVariable Long id) {
        service.desativar(id);
    }

}
