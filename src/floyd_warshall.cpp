#include "algorithms.h"
#include <chrono>

AllPairsResult floyd_warshall(const Graph& g) {
    auto start = std::chrono::high_resolution_clock::now();
    
    int n = g.node_count();
    std::vector<std::vector<double>> dist(n, std::vector<double>(n));
    std::vector<std::vector<int>> next(n, std::vector<int>(n, -1));

    // Initialization
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < n; ++j) {
            dist[i][j] = g.get_matrix_weight(i, j);
            if (i != j && dist[i][j] < 1e17) {
                next[i][j] = j;
            }
        }
    }

    // O(V^3) Core Logic
    for (int k = 0; k < n; ++k) {
        for (int i = 0; i < n; ++i) {
            for (int j = 0; j < n; ++j) {
                if (dist[i][k] + dist[k][j] < dist[i][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                    next[i][j] = next[i][k];
                }
            }
        }
    }

    auto end = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double, std::milli> elapsed = end - start;

    return {dist, next, elapsed.count()};
}
