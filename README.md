# Desafio Cartões — Cadastro de usuários e cartões de ônibus

Aplicação web para gerenciar usuários e seus cartões de ônibus, com autenticação e perfis de acesso.

| Parte | Pasta | Tecnologias |
| --- | --- | --- |
| API | [`desafio-cartoes`](desafio-cartoes) | Java 25, Spring Boot 4, Spring Security (JWT), JPA, Flyway, PostgreSQL, Swagger |
| Interface | [`desafio-cartoes-front`](desafio-cartoes-front) | Angular 22, Bootstrap 5, Vitest |

## Como executar

### Pré-requisitos
- JDK 25 (o projeto exige no mínimo Java 8; usa a versão LTS atual)
- Node 22 ou superior e npm
- PostgreSQL com um banco vazio chamado `desafio_cartoes`:
  ```sql
  CREATE DATABASE desafio_cartoes;
  ```

### 1. API (porta 8080)
```bash
cd desafio-cartoes
cp src/main/resources/application.properties.example src/main/resources/application.properties
./mvnw spring-boot:run
```
Antes de executar, edite `application.properties` e informe a senha do seu PostgreSQL (`SUA_SENHA`) e um segredo JWT próprio. Esse arquivo fica fora do Git. Como alternativa, deixe o arquivo como está e defina as variáveis de ambiente abaixo, que têm precedência.

As tabelas são criadas pelo Flyway na primeira execução, e um administrador inicial é criado automaticamente.

| Variável | Padrão | Uso |
| --- | --- | --- |
| `DB_URL` | `jdbc:postgresql://localhost:5432/desafio_cartoes` | Conexão com o banco |
| `DB_USERNAME` / `DB_PASSWORD` | `postgres` / `SUA_SENHA` | Credenciais do banco |
| `JWT_SECRET` | valor de exemplo (troque) | Chave de assinatura do token (mín. 32 caracteres) |
| `JWT_VALIDADE` | `2h` | Validade do token |
| `ADMIN_EMAIL` / `ADMIN_SENHA` | `admin@desafio.com` / `admin123` | Administrador inicial |
| `CORS_ORIGENS` | `http://localhost:4200` | Origens liberadas, separadas por vírgula |
| `SHOW_SQL` | `false` | Exibe o SQL no log |

### 2. Interface (porta 4200)
```bash
cd desafio-cartoes-front
npm install
npm start
```
Acesse `http://localhost:4200` e entre com `admin@desafio.com` / `admin123`, ou crie uma conta em "Cadastre-se".

### Documentação da API
Com a API no ar: `http://localhost:8080/swagger-ui.html`. Use o botão **Authorize** com o token devolvido por `POST /auth/login`.

### Testes
```bash
cd desafio-cartoes && ./mvnw test          # API: unitários e de integração (H2)
cd desafio-cartoes-front && npm test       # Interface: unitários
```

## Funcionalidades

**Usuários:** consultar (lista todos), incluir, alterar e remover.
**Cartões:** adicionar a um usuário, remover de um usuário, consultar (lista todos) e ativar/desativar.

| Perfil | Permissões |
| --- | --- |
| Visitante | Entrar e cadastrar-se |
| `USER` | Gerenciar o próprio cadastro e os próprios cartões |
| `ADMIN` | Tudo do `USER`, mais listar/editar/remover qualquer usuário, listar todos os cartões e editar nome e tipo de cartões |

Regras de negócio: e-mail e número de cartão são únicos; um usuário com cartões associados não pode ser removido; todo cartão nasce ativo.

## Arquitetura

Aplicação **monolítica em camadas**, organizada por responsabilidade:

```
controller  →  service  →  repository  →  banco (PostgreSQL)
   │              │
  dto         factory / entity
```

- **controller:** endpoints REST, validação de entrada (`@Valid`) e documentação OpenAPI.
- **service:** regras de negócio e transações.
- **repository:** acesso a dados com Spring Data JPA; consultas pontuais em SQL nativo (`nativeQuery`).
- **dto:** objetos de entrada e saída (records); as entidades nunca são expostas pela API.
- **factory:** criação centralizada de objetos de domínio.
- **security:** autenticação JWT sem estado, perfis e regra de acesso "dono ou administrador".
- **exception:** tratamento global de erros no formato `ProblemDetail`.

### Padrões de projeto
- **Factory Method** (`CartaoFactory`, `UsuarioFactory`): concentra as regras de criação (cartão nasce ativo e vinculado ao dono; perfil de cada tipo de usuário).
- **Repository**, **Service Layer** e **DTO**: separam persistência, regra de negócio e contrato da API.
- **Injeção de dependência** por construtor em todas as classes.

### Sobre microsserviços
O desafio lista microsserviços entre os requisitos diferenciais. Optei por um monólito modular: o domínio é pequeno (dois agregados fortemente relacionados), e dividir em serviços adicionaria rede, consistência distribuída, gateway e duplicação de segurança sem benefício para este escopo. Os pacotes já separam as responsabilidades, e uma divisão futura seguiria a fronteira natural: **autenticação/usuários** em um serviço e **cartões** em outro, validando o token JWT com a mesma chave.

## Requisitos do desafio

**Obrigatórios:** Java, Spring Boot, Maven, JPA, camadas, banco relacional (PostgreSQL), Angular e repositório Git online — atendidos.

**Diferenciais:**

| Item | Situação |
| --- | --- |
| Login | Atendido (JWT) |
| Perfil com permissão | Atendido (`ADMIN` e `USER`) |
| Migração das tabelas | Atendido (Flyway) |
| Swagger | Atendido (OpenAPI com autenticação Bearer) |
| `nativeQuery` | Atendido (repositories) |
| Evitar Lombok | Atendido (sem Lombok) |
| Padrão DTO | Atendido |
| Design Pattern | Atendido (Factory Method e outros acima) |
| Design responsivo | Atendido (Bootstrap 5) |
| Microsserviços | Não adotado, pelos motivos acima |

## Decisões de segurança
- Senhas armazenadas com BCrypt.
- Token JWT assinado com HS256; o backend valida assinatura, expiração e perfil a cada requisição.
- No front, o token fica no `localStorage`. É um trade-off conhecido (exposição a XSS); um cookie `HttpOnly` seria mais seguro, mas exigiria mudanças na API.
