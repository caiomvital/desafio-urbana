package com.desafio.desafio_cartoes.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

/**
 * Regra de autorização usada em {@code @PreAuthorize("@acesso.donoOuAdmin(authentication, #id)")}:
 * administradores acessam qualquer usuário; os demais, somente o próprio.
 */
@Component("acesso")
public class AcessoUsuario {

    public boolean donoOuAdmin(Authentication authentication, Long usuarioId) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            return false;
        }
        if ("ADMIN".equals(jwt.getClaimAsString("perfil"))) {
            return true;
        }
        Object id = jwt.getClaim("id");
        return id instanceof Number numero && usuarioId != null && numero.longValue() == usuarioId;
    }
}
