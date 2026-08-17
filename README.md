# Elysium

Jogo de ação 2D em navegador — combate por zonas, árvore de habilidades e progressão de
nível, com renderização em PixiJS.

## O que é

Projeto pessoal de game dev. O jogador escolhe uma zona, enfrenta inimigos em tempo real e
evolui por uma árvore de habilidades pensada para continuar fazendo sentido depois do nível
20, num modo infinito de dificuldade crescente.

## Como o projeto é conduzido

O design é especificado antes da implementação. Cada decisão de combate, progressão e
balanceamento vira um documento datado em `docs/design/`, aprovado antes de virar código —
inclusive os refinos que só apareceram depois do primeiro playtest.

- `2026-07-18-armas-e-skill-tree.md` — combate, progressão e a tela da árvore
- `2026-07-18-zonas-combate-movimento.md` — sistema de zonas
- `2026-07-18-fluxo-zona-colisao-alcance.md` — refino pós-playtest
- `2026-07-18-balanceamento-e-ferramentas-dev.md` — cura por nível e ferramentas de balanceamento
- `2026-07-19-fluxo-arquetipo-mira-cursor.md` — arquétipos e mira

## Estado

Em desenvolvimento.

## Stack

Vue 3 · Quasar · PixiJS · Pinia · Vite · TypeScript
