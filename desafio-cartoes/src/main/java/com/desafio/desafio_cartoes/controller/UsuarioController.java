package com.desafio.desafio_cartoes.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.desafio.desafio_cartoes.dto.CartaoRequestDTO;
import com.desafio.desafio_cartoes.dto.CartaoResponseDTO;
import com.desafio.desafio_cartoes.dto.UsuarioRequestDTO;
import com.desafio.desafio_cartoes.dto.UsuarioResponseDTO;
import com.desafio.desafio_cartoes.dto.UsuarioUpdateDTO;
import com.desafio.desafio_cartoes.service.CartaoService;
import com.desafio.desafio_cartoes.service.UsuarioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;


@RestController
@Tag(name = "Usuários")
@RequestMapping ("/usuarios")
public class UsuarioController {

    private static final String DONO_OU_ADMIN = "@acesso.donoOuAdmin(authentication, #id)";

    private final UsuarioService service;
    private final CartaoService cartaoService;

    public UsuarioController(UsuarioService service, CartaoService cartaoService){
        this.service = service;
        this.cartaoService = cartaoService;
    }

    @Operation(summary = "Lista todos os usuários (ADMIN)")
    @GetMapping
    public List<UsuarioResponseDTO> listar(){
        return service.listar().stream().map(UsuarioResponseDTO::de).toList();
    }

    @Operation(summary = "Consulta um usuário (dono ou ADMIN)")
    @GetMapping("/{id}")
    @PreAuthorize(DONO_OU_ADMIN)
    public UsuarioResponseDTO localizar(@PathVariable Long id){
        return UsuarioResponseDTO.de(service.localizar(id));
    }

    @Operation(summary = "Cadastra um usuário (público)")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponseDTO cadastrar(@Valid @RequestBody UsuarioRequestDTO dto) {
        return UsuarioResponseDTO.de(service.cadastrar(dto));
    }

    @Operation(summary = "Altera um usuário (dono ou ADMIN)")
    @PutMapping("/{id}")
    @PreAuthorize(DONO_OU_ADMIN)
    public UsuarioResponseDTO atualizar(@PathVariable Long id, @Valid @RequestBody UsuarioUpdateDTO dto) {
        return UsuarioResponseDTO.de(service.atualizar(id, dto));
    }

    @Operation(summary = "Remove um usuário sem cartões (dono ou ADMIN)")
    @DeleteMapping("/{id}")
    @PreAuthorize(DONO_OU_ADMIN)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@PathVariable Long id) {
        service.remover(id);
    }

    // ---- Cartões do usuário ----

    @Operation(summary = "Lista os cartões do usuário")
    @GetMapping("/{id}/cartoes")
    @PreAuthorize(DONO_OU_ADMIN)
    public List<CartaoResponseDTO> listarCartoes(@PathVariable Long id) {
        return cartaoService.listarPorUsuario(id).stream().map(CartaoResponseDTO::de).toList();
    }

    @Operation(summary = "Adiciona um cartão ao usuário")
    @PostMapping("/{id}/cartoes")
    @PreAuthorize(DONO_OU_ADMIN)
    @ResponseStatus(HttpStatus.CREATED)
    public CartaoResponseDTO adicionarCartao(@PathVariable Long id, @Valid @RequestBody CartaoRequestDTO dto) {
        return CartaoResponseDTO.de(cartaoService.cadastrar(dto, id));
    }

    @Operation(summary = "Remove um cartão do usuário")
    @DeleteMapping("/{id}/cartoes/{cartaoId}")
    @PreAuthorize(DONO_OU_ADMIN)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerCartao(@PathVariable Long id, @PathVariable Long cartaoId) {
        cartaoService.removerDoUsuario(id, cartaoId);
    }

    @Operation(summary = "Ativa um cartão do usuário")
    @PatchMapping("/{id}/cartoes/{cartaoId}/ativar")
    @PreAuthorize(DONO_OU_ADMIN)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void ativarCartao(@PathVariable Long id, @PathVariable Long cartaoId) {
        cartaoService.alterarStatusDoUsuario(id, cartaoId, true);
    }

    @Operation(summary = "Inativa um cartão do usuário")
    @PatchMapping("/{id}/cartoes/{cartaoId}/desativar")
    @PreAuthorize(DONO_OU_ADMIN)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desativarCartao(@PathVariable Long id, @PathVariable Long cartaoId) {
        cartaoService.alterarStatusDoUsuario(id, cartaoId, false);
    }

}
