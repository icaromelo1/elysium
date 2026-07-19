# Fluxo de escolha de zona, colisão real com a estrada, indicador de alcance

> Spec de design, aprovada via brainstorming em 18/07/2026. Refina `docs/design/2026-07-18-zonas-combate-movimento.md` (que introduziu o sistema de zonas norte/sul) depois do primeiro playtest real.

## Contexto

Testando a implementação de zonas (spec anterior), 3 problemas concretos apareceram:

1. **Escolha de zona junto com o deus é confusa.** Hoje `ClassSelect.vue` tem um toggle Norte/Sul genérico no topo, sem relação visual com o mapa — o jogador escolhe "às cegas". Deveria ser uma tela própria, depois de escolher o deus, mostrando o mapa real com as zonas destacadas pra escolher visualmente.
2. **Colisão com a estrada não é sólida.** O clamp de zona hoje empurra o jogador de volta usando uma margem fixa de 24px a partir do centro da estrada — mas o asfalto desenhado tem 46px de largura, então dá pra "pisar" visualmente na estrada. A colisão precisa respeitar a largura real, bloqueando 100% (sem exceção, por enquanto — "body-block" é uma skill futura do arquétipo Sentinela, ainda não implementada).
3. **Sem indicador de alcance.** O jogador não tem como saber até onde o ataque alcança — precisa de um anel visual ao redor do personagem, visível só pra ele.

Também fica registrado em backlog: spawn do jogador aleatorizado, com garantia futura (multiplayer) de que ninguém nasce em cima de outro jogador.

---

## 1. Tela de escolha de zona (depois do deus)

### Fluxo

`runState` ganha um novo valor entre a escolha de deus e o jogo: `classselect` → **`zoneselect`** → `playing`. `ClassSelect.vue` perde o toggle Norte/Sul (volta a só escolher o deus); ao clicar "ESCOLHER", em vez de voltar direto pro jogo, abre a nova tela `ZoneSelect.vue`.

### Visual

Um dialog igual ao `ClassSelect` em estrutura (mesmo padrão de overlay), mas com o backdrop bem mais transparente — o mapa real do jogo (o `MapScene`/canvas já rodando por baixo) fica visível através do overlay, com as 2 zonas (norte/sul) destacadas por uma cor semi-transparente sobreposta (mesmo princípio do diagrama do artifact anterior, só que em cima do jogo de verdade em vez de um SVG estático).

- As 2 regiões (norte/sul) são áreas clicáveis reais — clicar em qualquer ponto dentro da metade desejada do mapa escolhe aquela zona (não precisa de um botão "confirmar" separado).
- Ao abrir essa tela, a câmera centraliza no centro geométrico do mundo (`WORLD_W/2, WORLD_H/2`) em vez do centro da zona neutra — garante que o mapa inteiro fique visível e a projeção das regiões clicáveis bata exatamente com o que está desenhado no canvas.
- Ao escolher, a store grava a zona e o `runState` volta pra `playing`.

---

## 2. Colisão real com a estrada

- Nova constante `ROAD_WIDTH = 46` em `mapDef.ts` (hoje esse valor só existe como literal solto em `scene.ts`) — reaproveitada tanto pro desenho quanto pro clamp.
- O clamp de zona (`player.ts`, `kind: 'zone'` com `canCross: false`) passa a empurrar o jogador pra fora de uma faixa de `ROAD_WIDTH / 2 + PLAYER_RADIUS` a partir do centro da estrada (`roadYAtX`), em vez dos 24px fixos atuais — ninguém consegue mais sobrepor visualmente o asfalto.
- **Sem exceção por enquanto.** O "body-block" (arquétipo Sentinela, já mapeado na spec de armas/skill tree — "tanque corpo a corpo, bloqueio, body-block") é o gancho natural pra liberar isso no futuro, mas não faz parte desta spec. Fica documentado aqui como backlog: quando a skill tree existir, o clamp de estrada precisa checar uma flag de "pode atravessar a estrada" antes de aplicar o bloqueio.

---

## 3. Indicador de alcance

- Um anel (círculo só com stroke, sem preencher) desenhado ao redor do jogador, raio igual ao `range` que `combat.ts`/`CombatContext` já usa pra mirar — sempre visível durante o `runState === 'playing'`, sem toggle.
- Só o próprio jogador vê (é renderizado localmente, não é uma entidade sincronizável — relevante quando multiplayer existir, mas já nasce certo por ser puramente visual/client-side).
- Fica desenhado numa camada acima do jogador mas abaixo da UI (mesmo `entityLayer`/z-order do jogador, já que não precisa competir com HUD).

---

## 4. Backlog (fora desta spec)

- **Spawn aleatorizado do jogador** — hoje `PLAYER_START` é fixo (`900, 430`). Aleatorizar dentro da zona neutra fica pra depois.
- **Anti-overlap multiplayer** — quando o multiplayer existir, garantir que jogadores não nasçam na mesma posição (server-side, fora do escopo desta spec solo).
- **Body-block** (liberar atravessar a estrada) — entra junto com a implementação da skill tree (arquétipo Sentinela).

---

## 5. Impacto no código existente

- **`mapDef.ts`** — nova constante `ROAD_WIDTH`.
- **`scene.ts`** — `drawStatic()` passa a usar `ROAD_WIDTH` em vez do literal `46`.
- **`player.ts`** — margem do clamp de zona passa a ser `ROAD_WIDTH / 2 + PLAYER_RADIUS` em vez de `24`.
- **`useGameStore.ts`** — `RunState` ganha `'zoneselect'`; `chooseGod(godId, archetype)` perde o parâmetro de zona (volta a só setar deus/arquétipo, e transiciona pra `'zoneselect'` em vez de `'playing'`); nova action `chooseZone(zone: 'norte' | 'sul')` grava a zona e transiciona pra `'playing'`.
- **`ClassSelect.vue`** — remove o toggle Norte/Sul e a lógica de `selectedZone`; `choose(god)` volta a chamar só `gameStore.chooseGod(god.id, god.archetype)`.
- **Novo `ZoneSelect.vue`** — overlay semi-transparente com as 2 regiões clicáveis sobre o mapa real.
- **`GamePage.vue`** — renderiza `ZoneSelect` quando `runState === 'zoneselect'`; ao entrar nesse estado, centraliza a câmera no centro do mundo (`scene.follow(WORLD_W / 2, WORLD_H / 2)`); novo desenho do anel de alcance (provavelmente dentro de `player.ts` ou um novo pequeno helper, atualizado toda vez que `player.root.position` muda).
