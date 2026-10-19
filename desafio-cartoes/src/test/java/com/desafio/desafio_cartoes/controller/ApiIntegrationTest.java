package com.desafio.desafio_cartoes.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ApiIntegrationTest {

    @Autowired
    private MockMvc mvc;

    private final ObjectMapper json = new ObjectMapper();

    private String login(String email, String senha) throws Exception {
        MvcResult res = mvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + email + "\",\"senha\":\"" + senha + "\"}"))
                .andExpect(status().isOk())
                .andReturn();
        return "Bearer " + json.readTree(res.getResponse().getContentAsString()).get("token").asText();
    }

    private long criarUsuario(String nome, String email) throws Exception {
        MvcResult res = mvc.perform(post("/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"nome\":\"" + nome + "\",\"email\":\"" + email + "\",\"senha\":\"123456\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        JsonNode corpo = json.readTree(res.getResponse().getContentAsString());
        return corpo.get("id").asLong();
    }

    @Test
    void loginComCredenciaisInvalidasRetorna401() throws Exception {
        mvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"admin@desafio.com\",\"senha\":\"errada\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rotasProtegidasExigemToken() throws Exception {
        mvc.perform(get("/usuarios")).andExpect(status().isUnauthorized());
    }

    @Test
    void cadastroRejeitaSenhaCurta() throws Exception {
        mvc.perform(post("/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"nome\":\"Caio\",\"email\":\"caio@email.com\",\"senha\":\"123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros.senha").value("A senha deve ter ao menos 6 caracteres."));
    }

    @Test
    void cadastroDeUsuarioEPublicoEValidaCampos() throws Exception {
        mvc.perform(post("/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"nome\":\"\",\"email\":\"invalido\",\"senha\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros.nome").exists())
                .andExpect(jsonPath("$.erros.email").exists())
                .andExpect(jsonPath("$.erros.senha").exists());
    }

    @Test
    void emailDuplicadoRetorna409() throws Exception {
        criarUsuario("Ana", "ana@email.com");

        mvc.perform(post("/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"nome\":\"Outra\",\"email\":\"ANA@email.com\",\"senha\":\"123456\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void usuarioComumNaoListaTodosMasAdminLista() throws Exception {
        criarUsuario("Ana", "ana@email.com");

        mvc.perform(get("/usuarios").header("Authorization", login("ana@email.com", "123456")))
                .andExpect(status().isForbidden());

        mvc.perform(get("/usuarios").header("Authorization", login("admin@desafio.com", "admin123")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void usuarioNaoAcessaDadosDeOutroUsuario() throws Exception {
        long ana = criarUsuario("Ana", "ana@email.com");
        long bia = criarUsuario("Bia", "bia@email.com");
        String tokenAna = login("ana@email.com", "123456");

        mvc.perform(get("/usuarios/" + ana).header("Authorization", tokenAna)).andExpect(status().isOk());
        mvc.perform(get("/usuarios/" + bia).header("Authorization", tokenAna)).andExpect(status().isForbidden());
        mvc.perform(get("/usuarios/" + bia + "/cartoes").header("Authorization", tokenAna))
                .andExpect(status().isForbidden());
    }

    @Test
    void fluxoCompletoDeCartoesDoUsuario() throws Exception {
        long ana = criarUsuario("Ana", "ana@email.com");
        String token = login("ana@email.com", "123456");
        String base = "/usuarios/" + ana + "/cartoes";

        // adicionar
        MvcResult criado = mvc.perform(post(base)
                .header("Authorization", token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"numeroCartao\":1001,\"nome\":\"Meu cartão\",\"tipoCartao\":\"ESTUDANTE\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value(true))
                .andExpect(jsonPath("$.tipoCartao").value("ESTUDANTE"))
                .andReturn();
        long cartaoId = json.readTree(criado.getResponse().getContentAsString()).get("id").asLong();

        // número duplicado
        mvc.perform(post(base)
                .header("Authorization", token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"numeroCartao\":1001,\"nome\":\"Outro\",\"tipoCartao\":\"COMUM\"}"))
                .andExpect(status().isConflict());

        // listar
        mvc.perform(get(base).header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        // inativar e reativar
        mvc.perform(patch(base + "/" + cartaoId + "/desativar").header("Authorization", token))
                .andExpect(status().isNoContent());
        mvc.perform(get(base).header("Authorization", token))
                .andExpect(jsonPath("$[0].status").value(false));
        mvc.perform(patch(base + "/" + cartaoId + "/ativar").header("Authorization", token))
                .andExpect(status().isNoContent());

        // usuário com cartão não pode ser removido
        mvc.perform(delete("/usuarios/" + ana).header("Authorization", token))
                .andExpect(status().isConflict());

        // remover cartão e depois o usuário
        mvc.perform(delete(base + "/" + cartaoId).header("Authorization", token))
                .andExpect(status().isNoContent());
        mvc.perform(delete("/usuarios/" + ana).header("Authorization", token))
                .andExpect(status().isNoContent());
    }

    @Test
    void listagemGlobalDeCartoesSoParaAdmin() throws Exception {
        criarUsuario("Ana", "ana@email.com");

        mvc.perform(get("/cartoes").header("Authorization", login("ana@email.com", "123456")))
                .andExpect(status().isForbidden());
        mvc.perform(get("/cartoes").header("Authorization", login("admin@desafio.com", "admin123")))
                .andExpect(status().isOk());
    }

    @Test
    void tipoDeCartaoInvalidoRetorna400() throws Exception {
        long ana = criarUsuario("Ana", "ana@email.com");

        mvc.perform(post("/usuarios/" + ana + "/cartoes")
                .header("Authorization", login("ana@email.com", "123456"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"numeroCartao\":1,\"nome\":\"X\",\"tipoCartao\":\"VIP\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void swaggerDocsDisponivelSemAutenticacao() throws Exception {
        mvc.perform(get("/v3/api-docs")).andExpect(status().isOk());
    }
}
