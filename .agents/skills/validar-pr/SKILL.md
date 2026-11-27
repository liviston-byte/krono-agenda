---
name: validar-pr
description: Valida um pull request do Krono com verificações de qualidade, traduções e console no navegador antes de considerá-lo pronto para revisão ou merge.
---

# Validar PR do Krono

Use esta skill quando for pedido para validar um PR ou determinar se as mudanças do Krono estão prontas para seguir.

## Regras

- Siga as instruções do `AGENTS.md` na raiz e qualquer instrução aplicável ao escopo alterado.
- Não reverta nem sobrescreva mudanças existentes do usuário. Inspecione `git status` antes de começar e atribua falhas ao PR apenas quando houver evidência.
- Execute verificações separadamente e registre comando, resultado e falhas. Não esconda falhas com `|| true`, não marque itens não executados como aprovados e não altere código para fazer a validação passar sem autorização.
- “Liberar o PR” significa recomendar pronto para revisão/merge somente quando todos os critérios obrigatórios estiverem verdes. Não faça merge, push ou publicação por conta própria.

## Procedimento

1. **Identifique o escopo.** Confira `git status`, branch e diff contra a base do PR (preferencialmente `origin/<base>`). Se a base não estiver disponível localmente, diga isso no relatório e não invente uma comparação. Separe mudanças preexistentes das mudanças do PR quando possível.

2. **Lint.** Confira os scripts disponíveis em `package.json`. Rode o lint definido pelo projeto com `npm.cmd run lint`. Se não houver script, marque **bloqueado: script de lint ausente**; não crie ou instale ferramentas para esta validação.

3. **Tipos.** Rode `npx.cmd tsc --noEmit` para checar TypeScript sem gerar artefatos. Se o projeto documentar um comando de tipos próprio, prefira-o e registre o comando utilizado.

4. **Testes.** Rode `npm.cmd test` e aguarde o término. Registre quantidade de testes e resultado.

5. **Script de comentários.** Descubra no repositório o script de verificação de comentários solicitado pelo projeto/PR (por exemplo, em `package.json`, `scripts/`, configuração de CI ou instruções aplicáveis). Rode o comando exato documentado. Se não existir ou não for possível identificá-lo sem adivinhação, marque **bloqueado: script de comentários ausente/não identificado**. Não substitua por uma busca genérica de comentários.

6. **Chaves de tradução.** Compare recursivamente as chaves JSON de `src/shared/i18n/locales/pt-BR/translation.json` e `src/shared/i18n/locales/en-US/translation.json`. Relate chaves ausentes em cada idioma, JSON inválido ou duplicatas detectáveis. Chaves devem coincidir exatamente; valores traduzidos não precisam ser iguais. Se houver validador oficial no projeto, rode-o também.

7. **App e console no navegador MCP.** Inicie o servidor de desenvolvimento usando o comando do projeto (normalmente `npm.cmd run dev -- --host 127.0.0.1`) e abra a URL local informada no navegador nativo MCP/CUA. Use a documentação atual do CUA para selecionar o navegador, navegar até a URL e inspecionar o console do navegador. Recarregue a aplicação e observe inicialização e tela principal. Registre erros de console e falhas de carregamento; avisos devem ser listados separadamente. Não use um navegador alternativo nem alegue que inspecionou o console se o navegador MCP não estiver disponível. Se login for necessário, use uma sessão já autenticada; não peça nem exponha credenciais. Encerre o servidor ao terminar, se iniciado por esta validação.

8. **Decisão.** Considere verde somente se lint, tipos, testes, script de comentários, paridade das traduções e console do navegador estiverem aprovados. Qualquer item ausente, impossível de executar ou falho bloqueia a recomendação de liberação. Não confunda uma verificação ignorada com sucesso.

## Relatório

Entregue um relatório conciso, com cabeçalhos separados por verificação:

- **Escopo** — branch/base e limitações.
- **Lint** — comando e resultado.
- **Tipos** — comando e resultado.
- **Testes** — comando, contagem e resultado.
- **Comentários** — script/comando e resultado.
- **Traduções** — comparação e chaves faltantes, se houver.
- **Navegador MCP** — URL/app inspecionado, erros e avisos do console.
- **Decisão** — “Liberado para PR” somente com tudo verde; caso contrário, “Bloqueado”, com os itens pendentes.
