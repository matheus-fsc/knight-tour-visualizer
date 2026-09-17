# knight-tour-visualizer

Frontend estático para inspecionar visualmente o **grafo do passeio do cavalo**:
a árvore geradora BFS, os ciclos fundamentais, as órbitas do grupo diedral D4 e
o XOR de ciclos sobre GF(2).

**[Abrir o visualizador](https://matheus-fsc.github.io/knight-tour-visualizer/)**
(roda no navegador, sem instalar nada).

> Este repositório é a **parte visual** de um projeto maior. A pesquisa vive em
> **[KnightMove](https://github.com/matheus-fsc/KnightMove)**: o invariante de
> deficit `Q(n)=3`, a formalização em Lean 4, os solvers e os experimentos,
> com a documentação completa na
> **[wiki](https://github.com/matheus-fsc/KnightMove/wiki)**.

## Rodando

Não precisa de build nem de servidor, é HTML estático:

```bash
xdg-open index.html
```

## Modos do visualizador

| modo | o que mostra |
|---|---|
| Grafo | o grafo do cavalo 8×8: 64 vértices, 168 arestas |
| Árvore | a árvore geradora por BFS a partir de (0,0) |
| Loops | os **105 ciclos fundamentais**, animados um a um. Cada um aparece como dois caminhos (laranja e azul) que se encontram na aresta amarela que fecha o ciclo |
| Fusão GF(2) | combinação de ciclos sobre GF(2): a diferença simétrica de dois tours é sempre um elemento do espaço de ciclos |
| Simetria | as órbitas de arestas sob o grupo diedral D4 |
| Hierarquia | classificação dos loops em determinados e livres |
| Solução | um tour hamiltoniano |

O modo **Loops** é o mais relevante historicamente: foi notando que caminhos da
árvore de recursão colidem que o projeto chegou ao espaço de ciclos. A
[página de teoria](https://github.com/matheus-fsc/KnightMove/wiki/Teoria-GF2)
explica a conexão.

## O que o painel mostra

| campo | significado |
|---|---|
| `V`, `E` | vértices e arestas do grafo do cavalo 8×8: 64 e 168 |
| `H¹` | dimensão do espaço de ciclos, `beta_1 = E - V + 1 = 105` |
| `Obrig.` | arestas que todo tour precisa conter |
| `Impos.` | arestas que nenhum tour contém |
| `Det.` / `Livres` | loops determinados por restrição e loops com grau de liberdade |
| `Q` | o **deficit**: dimensões do espaço de ciclos que os tours não alcançam |
| `rank` | dimensão do espaço gerado pelos tours, `beta_1 - Q` |

As casas contornadas em amarelo tracejado têm **grau 2**. Suas duas arestas são
obrigatórias em todo tour, e são elas que produzem o deficit: quatro casas de
grau 2 dão quatro restrições, que colapsam para três, logo `Q = 3` e
`rank = 102`. O visualizador calcula isso a partir dos graus do tabuleiro, então
o número aparece pela mesma razão pela qual é verdadeiro.

O porquê está em
[Invariante-Q](https://github.com/matheus-fsc/KnightMove/wiki/Invariante-Q).

## Estrutura

| caminho | conteúdo |
|---|---|
| `index.html` | o visualizador (o site abre direto nele) |
| `cavalo_viz.html` | redirecionamento para `index.html`, mantido para não quebrar links antigos |
| `js/`, `css/` | lógica (um arquivo por modo em `js/modes/`) e estilos |
| `cavalo_data.json` | dados do grafo, gerado por `cavalo_engine.py` |

### Regenerando os dados

```bash
python cavalo_engine.py     # -> cavalo_data.json  (grafo, loops, orbitas D4, tour)
```

## O que saiu daqui

Os scripts de busca puramente de pesquisa (`knight_8x8_allsat_async.py`,
`dfs_knight_xorSearch.py`, `cavalo_engine_z3`) foram movidos para
[KnightMove](https://github.com/matheus-fsc/KnightMove), em
`experiments/05_solvers_xor/`, junto do resto do trabalho com Z3 e cláusulas XOR.

A visualização de **unicórnios 6×6** (caudas da distribuição de assinaturas
booleanas) foi removida em setembro de 2026. Era uma linha exploratória
anterior ao espaço de ciclos e não reflete mais o entendimento do problema: a
pergunta que ela tentava responder, que estrutura os tours compartilham, tem
hoje resposta algébrica exata no invariante `Q(n) = 3`. Ela e os scripts de
assinaturas estão arquivados em
[KnightMove/experiments/01_backtracking/assinaturas_6x6/](https://github.com/matheus-fsc/KnightMove/tree/main/experiments/01_backtracking/assinaturas_6x6).

Tudo permanece no histórico deste repositório.

## Licença

MIT. Ver [LICENSE](LICENSE).
