package com.desafio.desafio_cartoes.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.NoSuchElementException;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.desafio.desafio_cartoes.dto.CartaoRequestDTO;
import com.desafio.desafio_cartoes.entity.Cartao;
import com.desafio.desafio_cartoes.entity.TipoCartao;
import com.desafio.desafio_cartoes.entity.Usuario;
import com.desafio.desafio_cartoes.exception.ConflitoException;
import com.desafio.desafio_cartoes.repository.CartaoRepository;
import com.desafio.desafio_cartoes.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class CartaoServiceTest {

    @Mock
    private CartaoRepository repository;

    @Mock
    private UsuarioRepository usuarioRepository;

    private CartaoService service;
    private Usuario usuario;

    @BeforeEach
    void setUp() {
        service = new CartaoService(repository, usuarioRepository);
        usuario = new Usuario("Ana", "ana@email.com", "hash");
        ReflectionTestUtils.setField(usuario, "id", 1L);
    }

    private Cartao cartaoDoUsuario(Long id) {
        Cartao cartao = new Cartao(123L, "Cartão", true, TipoCartao.COMUM);
        ReflectionTestUtils.setField(cartao, "id", id);
        cartao.setUsuario(usuario);
        return cartao;
    }

    @Test
    void cadastrarDeveCriarCartaoAtivoVinculadoAoUsuario() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(repository.existeNumeroCartao(123L)).thenReturn(false);
        when(repository.save(any(Cartao.class))).thenAnswer(inv -> inv.getArgument(0));

        Cartao criado = service.cadastrar(new CartaoRequestDTO(123L, "Meu cartão", TipoCartao.ESTUDANTE), 1L);

        assertTrue(criado.getStatus());
        assertEquals(usuario, criado.getUsuario());
        assertEquals(TipoCartao.ESTUDANTE, criado.getTipoCartao());
    }

    @Test
    void cadastrarParaUsuarioInexistenteDeveLancarNoSuchElement() {
        when(usuarioRepository.findById(9L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class,
                () -> service.cadastrar(new CartaoRequestDTO(123L, "Meu cartão", TipoCartao.COMUM), 9L));
    }

    @Test
    void cadastrarComNumeroDuplicadoDeveLancarConflito() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(repository.existeNumeroCartao(123L)).thenReturn(true);

        assertThrows(ConflitoException.class,
                () -> service.cadastrar(new CartaoRequestDTO(123L, "Meu cartão", TipoCartao.COMUM), 1L));
        verify(repository, never()).save(any());
    }

    @Test
    void desativarEAtivarDevemAlterarStatus() {
        Cartao cartao = cartaoDoUsuario(10L);
        when(repository.findById(10L)).thenReturn(Optional.of(cartao));

        service.desativar(10L);
        assertFalse(cartao.getStatus());

        service.ativar(10L);
        assertTrue(cartao.getStatus());
    }

    @Test
    void localizarDoUsuarioComCartaoDeOutroUsuarioDeveLancarNoSuchElement() {
        Usuario outro = new Usuario("Bia", "bia@email.com", "hash");
        ReflectionTestUtils.setField(outro, "id", 2L);
        Cartao cartao = cartaoDoUsuario(10L);
        cartao.setUsuario(outro);
        when(repository.findById(10L)).thenReturn(Optional.of(cartao));

        assertThrows(NoSuchElementException.class, () -> service.localizarDoUsuario(1L, 10L));
    }

    @Test
    void removerDoUsuarioDeveExcluirCartaoDoDono() {
        Cartao cartao = cartaoDoUsuario(10L);
        when(repository.findById(10L)).thenReturn(Optional.of(cartao));

        service.removerDoUsuario(1L, 10L);

        verify(repository).delete(cartao);
    }

    @Test
    void alterarStatusDoUsuarioDeveAtualizarSomenteSeForDono() {
        Cartao cartao = cartaoDoUsuario(10L);
        when(repository.findById(10L)).thenReturn(Optional.of(cartao));

        service.alterarStatusDoUsuario(1L, 10L, false);

        assertFalse(cartao.getStatus());
    }

    @Test
    void listarPorUsuarioInexistenteDeveLancarNoSuchElement() {
        when(usuarioRepository.existsById(9L)).thenReturn(false);

        assertThrows(NoSuchElementException.class, () -> service.listarPorUsuario(9L));
    }
}
