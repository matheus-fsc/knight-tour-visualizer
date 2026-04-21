# knight-tour-visualizer

Projeto de estudo e visualização do **grafo do passeio do cavalo** com foco em estrutura combinatória, ciclos fundamentais e simetrias do tabuleiro.

## Contexto

O repositório combina:

- geração de dados matemáticos em Python para tabuleiros de cavalo;
- análise de ciclos e assinaturas booleanas;
- frontend estático para inspeção visual dos resultados.

O núcleo do projeto modela o tabuleiro como grafo, calcula uma árvore geradora por BFS e usa as arestas fora da árvore para representar ciclos fundamentais (base de \(H^1\)).

## Estrutura conceitual

- `cavalo_engine.py`: gera `cavalo_data.json` com descrição do grafo 8x8, arestas, loops fundamentais, classificação por simetria e solução hamiltoniana heurística.
- `knight_8x8_allsat_async.py`, `dfs_knight_xorSearch.py`, `test_6x6_z3.py`: scripts de busca/validação e enumeração.
- `assinaturas_6x6.json`: base de assinaturas booleanas para análise estatística/topológica no caso 6x6.
- `cavalo_viz.html` + `js/` + `css/`: visualizador principal do 8x8.
- `unicornios_viz.html`: visualização das caudas da distribuição de assinaturas.

## Resultados trabalhados no projeto

- Grafo do cavalo em 8x8 com 64 vértices e 168 arestas.
- Decomposição por árvore geradora BFS e ciclos fundamentais.
- Classificação de loops em conjuntos determinados/livres por restrições estruturais.
- Exploração de órbitas de arestas sob simetrias do grupo \(D_4\).
- Análise de distribuição de pesos booleanos no universo 6x6.

## Objetivo

Servir como laboratório visual e computacional para investigar propriedades globais do passeio do cavalo, conectando **busca combinatória**, **simetria** e **interpretação topológica** em uma interface navegável.
