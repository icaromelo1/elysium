# Balanceamento (cura por nível) e ferramentas de dev (velocidade + mod menu)

> Spec de design, aprovada via brainstorming em 18/07/2026. Cobre 3 sub-temas relacionados: cura progressiva ao subir de nível, e duas ferramentas de dev pro Icaro balancear o jogo (controle de velocidade + mod menu de atributos). Complementa `docs/design/2026-07-18-armas-e-skill-tree.md`.

## Contexto

Depois de implementar zonas/combate/movimento e o sistema completo de armas/skill tree, chegou a hora de balancear de verdade. Três necessidades concretas surgiram:

1. **Level-up não dá nenhum respiro.** Hoje subir de nível só abre a tela de escolha — não cura vida nem reduz vazamentos. Numa run que já sofreu dano/vazamento antes do level-up, isso empilha punição sem nenhuma recompensa de sobrevivência.
2. **Não dá pra saber se os atributos estão aplicando.** Auditei o código de multiplicadores (`statMultiplier`, afinidade, sprint) e a matemática está correta — mas o HUD só mostra HP/XP/stamina/vazamentos, nunca dano/velocidade/alcance atuais. O Icaro não tem como *ver* uma skill de stat aplicando, só sentir indiretamente. Isso também explica a suspeita de "atributo que não atualiza" — provavelmente é só falta de visibilidade, não bug de lógica.
3. **Testar balanceamento manualmente é lento.** Esperar spawn de onda, XP, level-up no ritmo normal do jogo pra testar uma mudança é caro. Precisa de fast-forward e de um jeito de trocar valores sem editar código e reiniciar o dev server toda vez.

Também entra um fix pequeno e isolado: o círculo da zona neutra continua desenhado depois que o jogador já escolheu zona real (deveria sumir, sobrando só o anel de alcance).

---

## 1. Cura ao subir de nível

Toda vez que `level` incrementa (dentro do loop de `addXp` em `useGameStore.ts`):

- **Vida:** cura `min(50%, 8% + nível%)` da vida máxima atual. Ex: nível 3 → 11%, nível 15 → 23%, nível 20+ → cap em 50%. Escala com o nível pra acompanhar o aumento de dificuldade das ondas.
- **Vazamentos:** reduz `1 + floor(nível / 10)` do contador `leaks` (nunca abaixo de 0). Nível 1-9 → -1, nível 10-19 → -2, nível 20+ → -3.

São números de partida — o objetivo desta spec é ligar o sistema, não fechar o balanceamento fino (isso é trabalho contínuo, facilitado pelo mod menu da seção 3).

---

## 2. Zona neutra some após escolher zona real

`MapScene` ganha `setNeutralZoneVisible(visible: boolean)`, controlando a visibilidade do `zoneMarker` já desenhado em `drawStatic()`. `GamePage.vue` chama isso com `false` assim que `gameStore.zone !== 'neutra'` (mesmo watcher que já centraliza a câmera na tela de escolha de zona). O anel de alcance do jogador (já implementado) continua sendo o único indicador visual de raio a partir daí.

---

## 3. Controle de velocidade do jogo (1x-10x)

- Nova barra/slider no HUD (visível só quando `runState === 'playing'`, mesmo canto que os outros painéis), com valor discreto de 1 a 10.
- O multiplicador é aplicado numa única ponta: o `deltaMs` recebido em `onTick` (`GamePage.vue`) é multiplicado pelo valor da velocidade antes de ser usado em qualquer lugar — movimento, combate, spawn de onda, stamina, tudo acelera junto, como um fast-forward de verdade. Não precisa tocar em `combat.ts`, `enemy.ts` ou nenhum outro sistema individualmente.
- Estado (`gameSpeed`) vive na store (`useGameStore.ts`), resetado pra `1` em `startRun()`.

---

## 4. Mod menu (admin, atributos globais)

Painel de dev, aberto por uma tecla dedicada (`` ` `` — igual a consoles de debug de outros jogos), sobreposto ao jogo sem pausar nada, editável em tempo real.

**Escopo desta versão:** constantes globais hoje hardcoded em `GamePage.vue`/`useGameStore.ts` — não inclui editar os 90+ nós individuais da skill tree (fica pra uma iteração futura, quando também vai precisar mostrar os que ainda não são editáveis, só pra visibilidade).

Categorias:
- **Jogador:** `BASE_MOVE_SPEED`, `BASE_DAMAGE_PER_TICK`, `BASE_FIRE_INTERVAL_MS`, `BASE_MAX_HP`, `MELEE_RANGE`, `PROJECTILE_BASE_RANGE`, `SPRINT_MULTIPLIER`, `AFFINITY_MULTIPLIER`, stamina drain/regen por segundo.
- **Inimigos:** `ENEMY_HP`, `ENEMY_SPEED`, `ENEMY_HIT_PLAYER_DAMAGE`, `ENEMY_HIT_RANGE`, intervalo de spawn de onda (`WaveSpawner`).
- **Progressão:** os coeficientes da fórmula de cura por nível (seção 1), fórmula de XP por nível (`nextXpToNext`).

Cada campo é editável (number input), e o painel também mostra **valores calculados em tempo real** (não editáveis diretamente, só leitura): `damageMultiplier`, `moveSpeedMultiplier`, `attackSpeedMultiplier`, `rangeMultiplier` atuais, e se a afinidade está alinhada — resolve o problema de visibilidade da seção 2 de graça.

### Arquitetura

Todas essas constantes saem de `const` fixas no topo de `GamePage.vue` e viram um novo state reativo — `useTunablesStore` (Pinia, novo arquivo `src/stores/useTunablesStore.ts`) — com um valor default igual ao que já existe hoje. `GamePage.vue` lê os valores de lá em vez de constantes locais. O mod menu (`AdminPanel.vue`, novo componente) só lê/escreve nesse store, sem lógica própria — mantém `GamePage.vue` como única fonte da lógica de jogo, e o painel como pura UI de edição.

---

## Fora de escopo (fica pro backlog)

- Editar os 90+ nós individuais da skill tree no mod menu (iteração futura do mesmo painel).
- Persistir os valores tunados entre sessões (hoje reseta ao recarregar a página — aceitável pra uso de dev).
- Qualquer proteção/senha no mod menu — é local, single-player, sem necessidade.
