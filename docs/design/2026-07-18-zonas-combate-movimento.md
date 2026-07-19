# Zonas de mapa, feedback de combate e movimento (sprint/stamina)

> Spec de design, aprovada via brainstorming em 18/07/2026. Complementa `docs/design/2026-07-18-armas-e-skill-tree.md` (que cobre armas/dano/skill tree) — este arquivo cobre especificamente a geometria do mapa, o feedback visual de combate e o sistema de movimento/stamina.

## Contexto

Testando o MVP integrado (`GamePage.vue` + `pixi/scene.ts` + `pixi/player.ts`), dois problemas concretos apareceram:

1. **A zona do jogador está errada.** Hoje `PLAYER_ZONE` (`mapDef.ts`) é um círculo fixo de raio 180 flutuando no centro do mapa, sem relação nenhuma com a estrada. O mapa deveria ser dividido em zonas de verdade pela própria estrada — o jogador escolhe em qual zona ficar, não fica preso num círculo arbitrário.
2. **Combate não dá feedback nenhum.** Dano é aplicado silenciosamente (`handleHit` em `GamePage.vue` só subtrai `hp` do inimigo) — sem indicação visual de que o ataque saiu, acertou, ou de quanto o inimigo já foi ferido.

Aproveitando a revisão, também entra um pedido novo: um sprint (Shift) com stamina, e o backlog de auto-scaling de atributos por nível.

---

## 1. Sistema de zonas

### Regra de divisão

A estrada atual (`ROAD_CURVES` em `mapDef.ts`) já vai de uma borda lateral à outra sem tocar as bordas superior/inferior — geometricamente, uma curva assim sempre divide o mapa em exatamente **2 regiões**: tudo acima da curva (**zona norte**) e tudo abaixo (**zona sul**). Não precisa redesenhar o traçado da estrada, só parar de ignorá-lo na hora de definir onde o jogador pode ficar.

**Mudança no traçado:** a estrada passa a nascer e morrer **fora da área visível**, não exatamente em `x=0`/`x=1920`. `ROAD_START`/o primeiro e último ponto de `ROAD_CURVES` ganham uma margem negativa (ex: início em `x=-200`, fim em `x=2120`, mantendo o `y` de entrada/saída atual) — puramente visual/de mundo, não muda a lógica de zona.

### Geometria da zona (implementação)

Cada zona é a região do plano de um lado da polyline da estrada (aproximada a partir de `WAYPOINTS`, já que são os pontos reais usados pro movimento dos inimigos). Teste de "jogador está em qual zona": para a posição `(x,y)` do jogador, achar o segmento de `WAYPOINTS` mais próximo em `x` e comparar `y` contra o `y` interpolado da estrada naquele `x` — acima = norte, abaixo = sul. Mesma lógica de clamp: se o jogador tentar cruzar pro lado errado, a posição é sujeita a um clamp perpendicular à estrada (empurrado de volta pro lado da zona atual), do mesmo jeito que hoje o clamp é radial num círculo.

### Quando a zona é escolhida

- **Nível 1 (antes de escolher deus):** o jogador começa numa **zona neutra** — um círculo pequeno centrado sobre a própria estrada (mesmo raio/posição do `PLAYER_ZONE` atual), que não pertence a nenhuma das duas zonas. Serve de "vestíbulo" até o nível 2.
- **Nível 2 (`ClassSelect.vue`):** escolher o deus também escolhe a zona inicial (norte ou sul) — a tela ganha essa segunda decisão junto com o deus. A partir daqui o clamp muda do círculo neutro pro clamp de zona real.
- **Depois da escolha:** arquétipos de movimento "nômade entre zonas" (Atena/Marte) podem atravessar pra outra zona quando quiserem (cruzar a estrada movendo-se livremente); "errante na zona" (Anúbis/Guan Yu) e "imóvel" (Odin) ficam clampados na zona escolhida — igual já estava previsto no design original dos arquétipos, só que agora com zona geométrica real em vez de um único círculo.

---

## 2. Movimento: sprint + stamina

- **Shift** ativa sprint: velocidade de movimento ×2 enquanto segurado (e enquanto há stamina).
- **Stamina** começa em 100 (novo campo em `useGameStore.ts`), consumida a uma taxa fixa só durante o sprint.
- **Regeneração:** stamina regenera sempre que Shift não está pressionado — tanto parado quanto andando na velocidade normal.
- **Ao zerar:** sprint desliga automaticamente (mesmo se Shift continuar pressionado), volta pra velocidade normal até regenerar.
- Arquétipo "imóvel" (Odin) não usa sprint (sem movimento livre, já é tratado à parte no `movementInput()` atual).

**Backlog (fora desta spec, entra num brainstorming futuro de afinidade):**
- Skill de melhoria de stamina na skill tree (capacidade máxima maior, custo menor, regen mais rápida).
- Auto-scaling de atributos a cada nível — todo atributo (HP, dano, velocidade, stamina) sobe automaticamente um percentual fixo (ex: +10%) ao subir de nível, e esse percentual pode variar por afinidade de deus.

---

## 3. Feedback visual de combate

Quatro elementos, todos entrando juntos:

1. **Barra de vida no inimigo** — mini-bar acima do círculo do inimigo, só visível depois que ele leva o primeiro hit (esconde em vida cheia, evita poluir a tela com inimigo saudável).
2. **Número de dano flutuante** — texto (`-10` etc) nasce no ponto de impacto e sobe/desaparece (popup padrão de ARPG), usando o valor real de `damagePerTick` aplicado naquele acerto.
3. **Flash no inimigo acertado** — o círculo do inimigo pisca (tint branco/vermelho por poucos frames) no instante do hit.
4. **Indicador de ataque saindo do jogador** — uma linha/partícula rápida do jogador até o alvo no momento do disparo/golpe, pra deixar claro que o ataque partiu (hoje `combat.ts` resolve o alvo e aplica dano sem nenhum efeito de origem).

Esses 4 itens valem tanto pro combate à distância atual quanto pro melee que entra com a spec de armas (`2026-07-18-armas-e-skill-tree.md`) — a única diferença é o alcance/trajetória do indicador (linha longa pro projétil, curta/instantânea pro melee).

---

## 4. Impacto no código existente

- **`mapDef.ts`** — `PLAYER_ZONE` (círculo único) sai; entram: margem negativa em `ROAD_CURVES`/`ROAD_START`, e uma função/constante que expõe a polyline de zona (reaproveita `WAYPOINTS`) pros dois lados (norte/sul), mais a zona neutra central (mesma forma de hoje, sem mudança).
- **`player.ts`** — clamp radial (`Math.min(distance, radius)`) é substituído por clamp perpendicular à polyline da estrada, condicionado a qual zona/arquétipo o jogador tem. Antes do nível 2, continua usando o clamp circular neutro atual.
- **`useGameStore.ts`** — novos campos: `stamina`, `maxStamina`, `isSprinting` (ou derivado), `zone` ('neutra'|'norte'|'sul'). Novas actions: `startSprint`/`stopSprint` (ou só ler `pressedKeys` direto no tick, como já é feito hoje) e tick de regen/consumo de stamina.
- **`GamePage.vue`** — `onKeyDown`/`onKeyUp` ganham handling de Shift; `movementInput()`/`onTick` aplicam o multiplicador ×2 condicionado a stamina > 0; novo tick de stamina (consumo/regen) por frame.
- **`ClassSelect.vue`** — ganha a escolha de zona (norte/sul) junto com o deus — passa a emitir/gravar os dois na store.
- **`combat.ts`** — `resolveAttackTarget`/`CombatTicker` passam a retornar/expor informação suficiente pra disparar os efeitos visuais (ponto de origem, ponto de impacto, valor de dano) em vez de só aplicar dano.
- **`enemy.ts`** — cada `Enemy` ganha um filho gráfico de barra de vida (visibilidade condicionada a `hp < maxHp`).
- **`HUD.vue`** — nova barra de stamina (mesmo padrão visual da barra de vida, cor própria).
- **Novo: `pixi/combatFx.ts`** (ou dentro de `combat.ts`) — pool simples de textos flutuantes de dano + tint temporário do inimigo + linha/partícula de ataque; reaproveita a técnica de object-pooling já usada em `enemy.ts`.

---

## 5. Fora de escopo (backlog, não entra nesta spec)

- Auto-scaling de atributos por nível e sistema de afinidade que varia esse scaling — brainstorming futuro dedicado.
- Skill de stamina na árvore — entra quando a skill tree (spec de armas) for implementada.
- Ajuste de sensação de movimento além do sprint (aceleração/desaceleração gradual) e calibração de ondas/dificuldade — ficam pra depois de jogar com zona+combate+sprint implementados, com dado novo de playtest.
