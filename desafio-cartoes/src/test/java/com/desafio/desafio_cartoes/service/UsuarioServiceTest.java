package com.desafio.desafio_cartoes.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.desafio.desafio_cartoes.dto.UsuarioRequestDTO;
import com.desafio.desafio_cartoes.dto.UsuarioUpdateDTO;
import com.desafio.desafio_cartoes.entity.Perfil;
import com.desafio.desafio_cartoes.entity.Usuario;
import com.desafio.desafio_cartoes.exception.ConflitoException;
import com.desafio.desafio_cartoes.repository.CartaoRepository;
import com.desafio.desafio_cartoes.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository repository;

    @Mock
    private CartaoRepository cartaoRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private UsuarioService service;

    @BeforeEach
    void setUp() {
        service = new UsuarioService(repository, cartaoRepository, passwordEncoder);
    }

    @Test
    void cadastrarDeveCriptografarSenhaEAtribuirPerfilUser() {
        when(repository.buscarPorEmail("ana@email.com")).thenReturn(Optional.empty());
        when(repository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        service.cadastrar(new UsuarioRequestDTO("Ana", "ana@email.com", "segredo"));

        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(repository).save(captor.capture());
        Usuario salvo = captor.getValue();
        assertEquals("Ana", salvo.getNome());
        assertNotEquals("segredo", salvo.getSenha());
        assertEquals(true, passwordEncoder.matches("segredo", salvo.getSenha()));
        assertEquals(Perfil.USER, salvo.getPerfil());
    }

    @Test
    void cadastrarComEmailDuplicadoDeveLancarConflito() {
        when(repository.buscarPorEmail("ana@email.com")).thenReturn(Optional.of(new Usuario()));

        assertThrows(ConflitoException.class,
                () -> service.cadastrar(new UsuarioRequestDTO("Ana", "ana@email.com", "segredo")));
        verify(repository, never()).save(any());
    }

    @Test
    void cadastrarComDtoNuloDeveLancarIllegalArgument() {
        assertThrows(IllegalArgumentException.class, () -> service.cadastrar(null));
    }

    @Test
    void localizarInexistenteDeveLancarNoSuchElement() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> service.localizar(99L));
    }

    @Test
    void atualizarDeveAlterarNomeEEmail() {
        Usuario existente = new Usuario("Ana", "ana@email.com", "hash");
        when(repository.findById(1L)).thenReturn(Optional.of(existente));
        when(repository.existeEmailDeOutroUsuario("nova@email.com", 1L)).thenReturn(false);
        when(repository.save(existente)).thenReturn(existente);

        Usuario resultado = service.atualizar(1L, new UsuarioUpdateDTO("Ana Maria", "nova@email.com"));

        assertEquals("Ana Maria", resultado.getNome());
        assertEquals("nova@email.com", resultado.getEmail());
    }

    @Test
    void atualizarComEmailDeOutroUsuarioDeveLancarConflito() {
        when(repository.findById(1L)).thenReturn(Optional.of(new Usuario("Ana", "ana@email.com", "hash")));
        when(repository.existeEmailDeOutroUsuario("bia@email.com", 1L)).thenReturn(true);

        assertThrows(ConflitoException.class,
                () -> service.atualizar(1L, new UsuarioUpdateDTO("Ana", "bia@email.com")));
    }

    @Test
    void removerUsuarioComCartoesDeveLancarConflito() {
        Usuario usuario = new Usuario("Ana", "ana@email.com", "hash");
        when(repository.findById(1L)).thenReturn(Optional.of(usuario));
        when(cartaoRepository.contarPorUsuario(1L)).thenReturn(1L);

        assertThrows(ConflitoException.class, () -> service.remover(1L));
        verify(repository, never()).delete(any());
    }

    @Test
    void removerUsuarioSemCartoesDeveExcluir() {
        Usuario usuario = new Usuario("Ana", "ana@email.com", "hash");
        when(repository.findById(1L)).thenReturn(Optional.of(usuario));

        service.remover(1L);

        verify(repository).delete(usuario);
    }

    @Test
    void listarDeveRetornarTodosOsUsuarios() {
        List<Usuario> usuarios = List.of(new Usuario("Ana", "a@a.com", "h"), new Usuario("Bia", "b@b.com", "h"));
        when(repository.findAll()).thenReturn(usuarios);

        assertEquals(2, service.listar().size());
    }
}
