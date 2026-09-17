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
xdg-open index.html      # ou cavalo_viz.html
```

## Modos do visualizador

| modo | o que mostra |
|---|---|
| Grafo | o grafo do cavalo 8×8: 64 vértices, 168 arestas |
| Árvore | a árvore geradora por BFS a partir de (0,0) |
| Loops | os **105 ciclos fundamentais**, animados um a um. Cada um aparece como dois caminhos (laranja e azul) que se encontram na aresta amarela que fecha o ciclo |
| XOR | combinação de ciclos sobre GF(2): a diferença simétrica de dois tours é sempre um elemento do espaço de ciclos |
| Simetria | as órbitas de arestas sob o grupo diedral D4 |
| Hierarquia | classificação dos loops em determinados e livres |
| Solução | um tour hamiltoniano |

O modo **Loops** é o mais relevante historicamente: foi notando que caminhos da
árvore de recursão colidem que o projeto chegou ao espaço de ciclos. A
[página de teoria](https://github.com/matheus-fsc/KnightMove/wiki/Teoria-GF2)
explica a conexão.

## Estrutura

| caminho | conteúdo |
|---|---|
| `index.html`, `cavalo_viz.html` | visualizador principal do 8×8 |
| `unicornios_viz.html` | caudas da distribuição de assinaturas |
| `js/`, `css/` | lógica (um arquivo por modo em `js/modes/`) e estilos |
| `cavalo_data.json` | dados do grafo, gerado por `cavalo_engine.py` |
| `assinaturas_6x6.json` | assinaturas booleanas do 6×6, gerado por `test_6x6_z3.py` |

### Regenerando os dados

```bash
python cavalo_engine.py     # -> cavalo_data.json  (grafo, loops, orbitas D4, tour)
python test_6x6_z3.py       # -> assinaturas_6x6.json
python plot_curva.py        # -> curva_pesos_assinaturas.png
python plot_heatmap.py      # -> heatmap_correlacao.png
```

## O que saiu daqui

Os scripts de busca puramente de pesquisa (`knight_8x8_allsat_async.py`,
`dfs_knight_xorSearch.py`, `cavalo_engine_z3`) foram movidos para
[KnightMove](https://github.com/matheus-fsc/KnightMove), em
`experiments/05_solvers_xor/`, onde ficam junto do resto do trabalho com Z3 e
cláusulas XOR. Permanecem no histórico deste repositório.

## Licença

MIT. Ver [LICENSE](LICENSE).
