# AGENTS.md — Diretrizes de Desenvolvimento do Krono

Este arquivo define as regras que qualquer agente de IA deve seguir ao propor, implementar ou refatorar funcionalidades no projeto **Krono** (Agenda & Lembretes).

---

## 1. Visão do Produto & Princípios
- **Local-first por padrão:** Todos os dados do usuário (compromissos, histórico de sonecas e áudios) vivem no navegador via IndexedDB (`Dexie.js`). Não adicione dependências de backend, login obrigatório ou chamadas de rede para o fluxo principal.
- **Offline-ready:** Novas funcionalidades devem continuar operando sem conexão com a internet.
- **Identidade dos Lembretes:** Preserve e respeite as duas mecânicas centrais do produto:
  - **Cápsula do Eu do Passado:** Notas de contexto (*"Por que isso importa?"*) e áudios curtos gravados pelo usuário.
  - **Soneca com Fricção Inteligente:** Adiar até 2 vezes é rápido; a partir da 3ª tentativa, exigir motivo e sugerir/reagendar para um bloco livre real.

---

## 2. Stack & Restrições Técnicas
- **Stack fixa:** React + TypeScript (`strict: true`) + Vite + Tailwind CSS v4 + Zustand + Dexie.js + `date-fns` + `i18next` + `lucide-react` + Vitest.
- **Sem dependências desnecessárias:** Não instale bibliotecas novas quando a stack atual ou APIs nativas do navegador (`Intl`, `Notification`, `MediaRecorder`, `AudioContext`) resolverem o problema.
- **Camada de dados centralizada:** Leituras e escritas no IndexedDB devem passar pelos repositórios em `src/features/<feature>/` (ex.: `src/features/agenda/agendaRepository.ts`). Evite espalhar `db.items.update(...)` diretamente dentro de componentes visuais.

---

## 3. Arquitetura de Pastas
Siga a organização modular por feature:
- `src/app/` — Entrypoint, layout principal e estado global (`store.ts`).
- `src/design-system/` — Tokens CSS (`tokens.css`) e componentes base reutilizáveis.
- `src/features/<feature>/` — Regras de negócio, repositórios, hooks, testes e componentes específicos da feature.
- `src/shared/` — Banco (`db/`), traduções (`i18n/`), tipos globais (`types/`) e utilitários (`utils/`).

---

## 4. Design System & Direção Visual (`frontend-design`)
- **Tokens obrigatórios:** Use sempre as variáveis CSS de `src/design-system/tokens.css` (paleta papel mineral + azul cobalto + suporte Light/Dark). Nunca use cores hexadecimais soltas nos componentes.
- **Tipografia intencional:**
  - Interface geral: `DM Sans`
  - Notas da Cápsula do Eu do Passado e títulos editoriais: `Newsreader` (classe `.font-serif-editorial`)
  - Horários e contadores: `IBM Plex Mono` (classe `.font-mono-time`)
- **Regras estéticas:**
  - Mantenha a lista de compromissos como uma **linha do tempo cronológica** com trilho lateral de horários — não reverta para uma grade genérica de cards SaaS idênticos.
  - **Proibido** usar rótulos em caixa alta (`ALL CAPS` / `uppercase`).
  - Respeite `prefers-reduced-motion` e garanta foco visível (`focus-visible`) em todos os elementos interativos.
  - Reutilize os componentes de `src/design-system/` (`Button`, `Card`, `Badge`, `Modal`, `Input`, `Textarea`, `TimeChip`).

---

## 5. Internacionalização (i18n) Obrigatória
- **Zero texto hardcoded:** Toda string visível ao usuário deve ser adicionada em:
  - `src/shared/i18n/locales/pt-BR/translation.json`
  - `src/shared/i18n/locales/en-US/translation.json`
- **Datas e horários:** Formate sempre usando `src/shared/utils/dateFormat.ts` (respeitando o idioma ativo).

---

## 6. Qualidade, Testes & Comandos (Windows)
- **Testes unitários:** Toda nova regra de negócio pura (cálculos de agenda, recorrência, filtros, soneca) deve acompanhar testes em Vitest (`*.test.ts`).
- **Validação obrigatória:** Antes de finalizar qualquer entrega de código, execute e garanta que passem sem erros:
  ```powershell
  npm.cmd run build
  npm.cmd test
  ```
- **Nota de ambiente (Windows):** Use sempre `npm.cmd` e `npx.cmd` no PowerShell caso a execução de scripts `.ps1` esteja bloqueada.
