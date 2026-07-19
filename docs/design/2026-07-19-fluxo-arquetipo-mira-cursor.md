# Fluxo de zona por arquétipo, posicionamento fixo, indicador de mira, cursor

> Spec de design, aprovada via brainstorming em 19/07/2026. Refina `docs/design/2026-07-18-fluxo-zona-colisao-alcance.md` (fluxo pós-nível-2) e complementa o HUD/feedback de combate.

## Contexto

Testando o fluxo de escolha de zona, ficou claro que ele não faz sentido igual pra todo arquétipo de movimento:

- **Nômade entre zonas** (Atena, Marte) atravessa livremente — escolher uma zona inicial não significa nada pra eles, é uma tela desnecessária.
- **Errante na zona** (Anúbis, Guan Yu) — o `ZoneSelect.vue` atual (Norte/Sul) já é exatamente o que faz sentido.
- **Imóvel** (Odin) — não faz sentido "escolher metade do mapa"; ele precisa escolher o **ponto exato** onde a torre fixa vai ficar.

Também faltam dois retoques de feedback: um indicador de pra onde o personagem está mirando (hoje só existe o anel de alcance, sem direção), e um cursor temático em vez do cursor padrão do sistema durante o jogo.

---

## 1. Fluxo pós-nível-2 por arquétipo

`chooseGod` (`useGameStore.ts`) passa a ramificar pelo `archetype` do deus escolhido, em vez de sempre ir pra `'zoneselect'`:

- **`nomade-entre-zonas`** — pula a escolha de zona. `zone` é setado direto pra `'norte'` (valor interno, só pra sair de `'neutra'` — o clamp de movimento já ignora o lado quando `canCross: true`, então o valor exato não importa pra colisão) e `runState` vai direto pra `'playing'`.
- **`errante-na-zona`** — comportamento atual, sem mudança: `runState = 'zoneselect'`, mostra `ZoneSelect.vue`.
- **`imovel`** — `runState = 'placement'` (novo estado), mostra o novo `PlacementSelect.vue`.

## 2. `PlacementSelect.vue` (novo) — posicionamento da torre fixa

Mesmo padrão visual do `ZoneSelect.vue` (overlay translúcido sobre o mapa real rodando por baixo), mas em vez de 2 metades clicáveis, é clique livre em qualquer ponto do mapa:

- Clique converte coordenada de tela pra coordenada de mundo (mesma técnica já usada em `onPointerMove` no `GamePage.vue`).
- Ponto é validado: precisa estar fora da estrada (mesma margem sólida da colisão — `ROAD_WIDTH/2 + PLAYER_RADIUS`) e dentro dos limites do mundo. Se inválido, mostra feedback rápido (ex: marcador pisca vermelho) e não avança.
- Se válido, mostra um marcador de prévia na posição clicada + um botão "CONFIRMAR" — clique em outro lugar só move a prévia; só confirma de fato ao clicar em "CONFIRMAR" (diferente do `ZoneSelect`, aqui errar o clique é mais custoso, então não é "clique já escolhe").
- Ao confirmar: nova action `chooseFixedPosition(x, y)` na store — grava `fixedPosition = {x, y}`, deriva `zone = sideOfRoad(x, y)` automaticamente (sem perguntar zona separada), `runState = 'playing'`.

`GamePage.vue`: ao entrar em `'playing'` vindo de `'placement'` (ou sempre que `archetype === 'imovel'` no reset/mount), a posição inicial do jogador passa a ser `gameStore.fixedPosition` em vez de `PLAYER_START` — teleporta direto pra lá (não anda até o ponto, já que é imóvel).

## 3. Indicador de direção de mira

`PlayerAvatar` (`player.ts`) ganha um segundo `Graphics` (seta/triângulo pequeno), método `setAimDirection(dx, dy)` — desenha a seta na borda do anel de alcance já existente, apontando na direção normalizada.

`GamePage.vue`, em `onTick`: chama `resolveAttackTarget(ctx)` (função pura já exportada de `combat.ts`, independente do acumulador de cadência do `CombatTicker`) uma vez por frame só pra fins visuais. Se achar um alvo, a seta aponta pra ele (cobre AUTO e melee); senão, aponta pra `player.facing` (cobre MANUAL·MOV parado ou sem alvo) — MANUAL·MOUSE já teria o alvo resolvido via `mouseWorldPos` dentro do próprio `resolveAttackTarget` quando há um inimigo na direção do mouse, então cai no mesmo caminho.

## 4. Cursor customizado

CSS `cursor` na raiz do `GamePage.vue`, condicional a `gameStore.runState === 'playing'` (classe aplicada via `:class`) — um retículo simples (círculo fino + ponto central) em dourado (`#c9a227`), via SVG inline como data URI (sem arquivo de asset novo). Fora do jogo (menu, diálogos, mod menu), cursor padrão do sistema.

---

## Impacto no código existente

- **`useGameStore.ts`** — `chooseGod` ramifica por arquétipo; `RunState` ganha `'placement'`; novo `fixedPosition = ref<{x,y} | null>(null)`; nova action `chooseFixedPosition(x, y)`; reset em `startRun()`.
- **Novo `src/components/PlacementSelect.vue`** — overlay de clique livre + validação + confirmação.
- **`player.ts`** — novo `Graphics` de seta + `setAimDirection()`.
- **`combat.ts`** — nenhuma mudança (só reaproveita `resolveAttackTarget` já exportado).
- **`GamePage.vue`** — renderiza `PlacementSelect` quando `runState === 'placement'`; usa `fixedPosition` como posição inicial pra arquétipo `imovel`; chama `player.setAimDirection()` por tick; classe de cursor condicional na raiz.

## Fora de escopo

- Reposicionar a torre fixa depois de colocada (é uma escolha única, igual zona hoje).
- Cursor customizado fora do gameplay (menu/diálogos ficam com o cursor padrão).
