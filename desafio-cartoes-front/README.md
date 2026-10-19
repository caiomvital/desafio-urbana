# Desafio Cartões — Frontend

Interface Angular para o cadastro de usuários e cartões de ônibus. Consome a API Spring Boot do projeto `desafio-cartoes`.

## Requisitos

- Node 22+ e npm
- API rodando em `http://localhost:8080` (o CORS do backend libera `http://localhost:4200`)

## Como executar

```bash
npm install
npm start        # http://localhost:4200
npm test         # testes unitários (Vitest)
npm run build    # build de produção
```

Usuário administrador padrão (criado pelo backend): `admin@desafio.com` / `admin123`.
A URL da API fica no token `API_URL` em `src/app/core/api.config.ts`.

## Funcionalidades

| Perfil | O que pode fazer |
| --- | --- |
| Visitante | Entrar e criar conta |
| Usuário | Ver resumo, editar o perfil, listar/adicionar/remover/ativar/desativar os próprios cartões |
| Administrador | Tudo acima, mais: CRUD de usuários, cartões de qualquer usuário e lista global de cartões (com edição) |

As listas têm busca, filtros (tipo e situação, nos cartões) e paginação. Exclusões pedem confirmação e as ações exibem avisos (toasts).

## Estrutura

```
src/app
├── core/       # API_URL, modelos, serviços HTTP, autenticação (service, interceptor, guards)
├── shared/     # toast, confirmação, paginação, tabela de cartões, helpers de formulário
├── layout/     # navbar e casca das páginas autenticadas
└── pages/      # login, cadastro, inicio, usuarios-lista, usuario-form,
                # cartoes-usuario, cartoes-lista, cartao-form, nao-encontrado
```

## Decisões técnicas

- **Angular standalone + signals** para estado; formulários reativos tipados.
- **JWT no `localStorage`** com validade controlada no cliente. O backend sempre revalida o token, então alterar o storage não dá acesso. O trade-off é a exposição a XSS; um cookie `HttpOnly` seria mais seguro, mas exigiria mudanças na API.
- **Interceptor** anexa o `Bearer` token só nas chamadas da API, encerra a sessão em 401 e avisa em 403.
- **Guards** (`authGuard`, `adminGuard`, `visitanteGuard`) protegem as rotas; as telas de admin são carregadas sob demanda (lazy loading).
- **SSR**: apenas `/login` é pré-renderizado, porque a sessão vive no navegador.
- **Bootstrap 5** (CSS) para layout responsivo; os componentes interativos (menu, modal, toasts) são implementados em Angular, sem o JS do Bootstrap.
- **Regras da API refletidas na UI**: o número do cartão não é editável; só administradores editam cartões; usuário com cartões não pode ser removido; ninguém remove a si mesmo pela lista.
