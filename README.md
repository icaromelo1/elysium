# Elysium

Jogo de ação 2D em navegador, com combate por zonas, árvore de habilidades e progressão
de nível, renderizado em PixiJS.

## Descrição

Projeto pessoal de desenvolvimento de jogos. O jogador seleciona uma zona, enfrenta
inimigos em tempo real e evolui por uma árvore de habilidades projetada para permanecer
relevante após o nível 20, em um modo infinito de dificuldade crescente.

## Método

O design é especificado antes da implementação. Cada decisão de combate, progressão e
balanceamento origina um documento datado em `docs/design/`, aprovado antes de virar
código, incluindo os refinamentos identificados após o primeiro playtest.

* `2026-07-18-armas-e-skill-tree.md`: combate, progressão e a tela da árvore
* `2026-07-18-zonas-combate-movimento.md`: sistema de zonas
* `2026-07-18-fluxo-zona-colisao-alcance.md`: refinamento pós-playtest
* `2026-07-18-balanceamento-e-ferramentas-dev.md`: cura por nível e ferramentas de balanceamento
* `2026-07-19-fluxo-arquetipo-mira-cursor.md`: arquétipos e mira

## Estado

Em desenvolvimento.

## Stack

Vue 3, Quasar, PixiJS, Pinia, Vite, TypeScript
