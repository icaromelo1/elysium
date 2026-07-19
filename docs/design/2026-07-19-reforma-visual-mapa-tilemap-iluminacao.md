# Reforma visual do mapa — tilemap, autotile, iluminação dinâmica

> Spec de design, aprovada via brainstorming em 19/07/2026. Substitui a abordagem 100% vetorial do mapa (blobs + estrada como stroke) por um tilemap de verdade, tema grego/romano, estilo flat (Bloons TD 6), com sistema de iluminação estático e dinâmico. Escopo: só o mapa/mundo do jogo — personagem, inimigos, HUD e diálogos continuam como estão.

## Contexto

O mapa hoje é 100% `Graphics` vetorial do PixiJS: blobs de terreno (círculos coloridos soltos, posição/raio arbitrários) e a estrada como uma polilinha com stroke sólido. Isso passa uma sensação "técnica"/"painel de controle" em vez de jogo de verdade. A direção acordada: visual flat e colorido tipo Bloons TD 6, tema mitológico grego/romano, saindo do escuro-dourado atual pro mapa em si (HUD/menus ficam como estão por enquanto).

**Pipeline de arte:** os tiles/props vêm de imagem gerada externamente (Gemini ou asset pack) — eu não gero as imagens, só desenho a arquitetura de código que consome essas texturas.

O pedido cresceu durante o brainstorm de "trocar paleta" pra um sistema de iluminação de verdade (horário fixo por mapa + ciclo dinâmico com direção de luz e sombra, ligado à progressão de dificuldade). Isso é grande demais pra uma implementação só, então o design está decomposto em **4 fases**, cada uma com seu próprio plano de implementação depois — mas todas esboçadas aqui juntas pra dar a visão completa antes de começar.

---

## Fase 1 — Fundação do tilemap

Troca os blobs de terreno por uma grade de tiles de verdade.

- **Tile size:** 64px. O mundo (1920×1080) é coberto por uma grade de tiles com uma margem extra além da borda visível (evita qualquer aresta cortada, já que 1080 não é múltiplo exato de 64) — `WORLD_W`/`WORLD_H` continuam os mesmos, usados só pra câmera/zona, sem relação obrigatória com a grade.
- **Novo `src/game/tilemap.ts`** — `TileType` ('grama' | 'caminho' | 'agua'), uma matriz 2D (`TileGrid`) descrevendo o tile de cada célula, e funções de conversão mundo↔célula.
- **Renderização:** um `Sprite` do PixiJS por tile visível (na escala do mapa, ~500 tiles — tranquilo pro PixiJS, não precisa de tilemap batching especial). Texturas carregadas via `Assets.load()` do PixiJS a partir de `src/assets/tiles/*.png` (arquivos gerados externamente).
- **Paleta base — Mediterrâneo Vívido** (a que você escolheu): oliveira `#6f9a52`, terra `#d8b177`, egeu `#3b6e8f`, terracota `#c1592f`, mármore `#f2e8d5`, ouro `#b5872a`. **Importante:** os tiles devem ser gerados em iluminação neutra/meio-dia, sem mood pré-cozido de horário — quem aplica o tom de amanhecer/noite/etc. é o sistema de iluminação da Fase 3/4, por cima.
- **Props decorativos** (coluna dórica, coluna quebrada, estátua, oliveira, cipreste, ânfora) — sprites individuais gerados no mesmo pipeline, posicionados sobre a grade em pontos fixos, sem colisão (só cenário).
- **Impacto:** `TERRAIN_BLOBS` (`mapDef.ts`) sai; `scene.ts`'s `drawStatic()` ganha a renderização de tilemap + props no lugar dos blobs.

## Fase 2 — Caminho como autotile

O caminho atual (curva orgânica corrigida na rodada anterior) é substituído por um caminho novo, desenhado do zero pra caber bem na grade — a correção de alinhamento que fizemos foi validação de conceito de um protótipo, não precisa ser preservada.

- **Layout novo:** `WAYPOINTS` vira uma sequência de células de grade (não mais coordenadas livres), formando um caminho com viradas em ângulo reto — desenhado pensando em ficar bom com autotile.
- **Autotile mínimo:** 2 sprites-base (reto + curva), com rotação aplicada em código (`sprite.rotation`) pras 4 orientações de reta (H/V) e as 4 de curva — não precisa gerar 8 imagens diferentes, só 2.
- **Seleção de peça:** função pura que olha os vizinhos de cada célula de caminho (tem vizinho reto acima/abaixo/esquerda/direita?) e decide reto vs curva + rotação — lógica clássica de autotile, pequena.
- **`enemy.ts`:** continua fazendo lerp entre pontos consecutivos — só troca a fonte dos pontos (centros das células do novo caminho em vez das coordenadas antigas).
- **Zona (`sideOfRoad`/`roadYAtX`):** recalculada em cima do novo caminho em grade.
- **Impacto:** `drawFilletPath`/`ROAD_DRAW_POINTS` (adicionados na rodada anterior) saem, substituídos pelo autotile.

## Fase 3 — Horário fixo por mapa

Sistema de iluminação **estático** — aplicado uma vez no início da run, não muda durante a partida. Base pra Fase 4.

- **`TimeOfDay`:** `'amanhecer' | 'dia' | 'tarde' | 'entardecer' | 'noite'`.
- **Novo `src/game/lighting.ts`** — `LIGHTING_PRESETS: Record<TimeOfDay, { tintColor: number; tintAlpha: number }>`. Cada preset é uma cor + intensidade de overlay (ex: `noite` = tint azul-escuro com alpha alto; `entardecer` = tint terracota/laranja com alpha médio; `dia` = quase sem tint).
- **`MapScene`** ganha uma camada `lightingOverlay` (um retângulo cobrindo o viewport inteiro, `blendMode: 'multiply'`) e `setTimeOfDay(time: TimeOfDay)`, que repinta o overlay com o preset.
- **Configuração por mapa:** cada mapa declara seu horário padrão (por enquanto só existe o mapa grego/romano — fica hardcoded, mas a estrutura já é um registro `Record<mapId, TimeOfDay>` pensando em mapas futuros).

## Fase 4 — Ciclo dinâmico, direção de luz e sombra

Construído em cima da Fase 3. **Escopo: só os props do cenário (colunas, árvores, estátuas) — personagem e inimigos não ganham sombra/reatividade de luz agora, isso fica pra quando tiverem arte própria.**

- **Gatilho:** `survivalTimeMs` (já existe em `useGameStore.ts`) empurra o horário pra frente — a cada 3 minutos de sobrevivência avança um estágio (amanhecer→dia→tarde→entardecer→noite, 5 estágios = 15 minutos até anoitecer por completo). Número de partida, ajustável depois via mod menu se fizer sentido. Pra esta fase, o ciclo **não** volta a amanhecer — para em `noite` e fica lá (loop completo fica de fora, ver "Fora de escopo").
- **Transição suave:** em vez de trocar o preset de uma vez, o overlay interpola continuamente entre o preset atual e o próximo conforme o progresso dentro do estágio (cor e alpha, não é corte seco).
- **Direção de luz:** um valor `sunAngle` (0–360°) derivado do progresso do horário — baixo/lateral ao amanhecer/entardecer, alto/quase vertical ao meio-dia, irrelevante à noite (sombra some).
- **Sombra dos props:** cada prop estático ganha uma sombra pareada — uma elipse escura semi-transparente (`Graphics`), cujo comprimento/rotação são recalculados a partir de `sunAngle` sempre que a iluminação atualiza (não precisa ser todo frame — a luz muda devagar, dá pra recalcular a cada ~500ms sem perda perceptível).
- **Onde vive o estado:** `sunAngle`/horário interpolado ficam em `GamePage.vue`/`scene.ts` (não na store Pinia) — mesmo padrão já usado pra `effectsState`/`combatFx`, estado de motor de jogo fica fora do Pinia.

---

## Impacto no código existente (visão geral das 4 fases)

- **`mapDef.ts`** — `TERRAIN_BLOBS` sai; `WAYPOINTS` redesenhado pra grade; `sideOfRoad`/`roadYAtX` recalculados pro novo caminho.
- **`scene.ts`** — `drawStatic()` reescrito (tilemap + props + autotile do caminho); nova camada de iluminação + sombra.
- **`enemy.ts`** — sem mudança de lógica, só a fonte dos waypoints.
- **Novos arquivos:** `src/game/tilemap.ts`, `src/game/lighting.ts`, e um módulo de props/sombra (nome exato decidido na implementação da Fase 1/4).
- **Novas pastas de asset:** `src/assets/tiles/`, `src/assets/props/` (imagens geradas externamente, carregadas via `Assets.load()` do PixiJS).
- **`useGameStore.ts`** — sem campo novo obrigatório (o horário/ângulo de luz fica fora da store, ver Fase 4).

## Fora de escopo

- Sombra/reatividade de luz do personagem e dos inimigos — entra quando eles tiverem arte própria.
- Ciclo de horário que loopa de volta pro amanhecer dentro de uma run muito longa — o MVP da Fase 4 para em `noite`.
- Múltiplos mapas de fato jogáveis — a estrutura (`Record<mapId, TimeOfDay>`) já fica pronta, mas só o mapa grego/romano existe agora.
- HUD, menus, diálogos — seguem no visual escuro-dourado já aprovado.
