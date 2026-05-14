#include "algorithms.h"
#include <chrono>

RoutingResult bellman_ford(const Graph& g, int source, bool& has_negative_cycle) {
    auto start = std::chrono::high_resolution_clock::now();
    
    int n = g.node_count();
    std::vector<double> dist(n, 1e18); // INF
    std::vector<int> prev(n, -1);
    has_negative_cycle = false;

    dist[source] = 0;

    // Relax all edges V-1 times
    for (int i = 0; i < n - 1; ++i) {
        bool changed = false;
        for (int u = 0; u < n; ++u) {
            if (dist[u] > 1e17) continue;
            for (const auto& edge : g.get_adjacency(u)) {
                int v = edge.dst;
                double weight = edge.weight;
                if (dist[u] + weight < dist[v]) {
                    dist[v] = dist[u] + weight;
                    prev[v] = u;
                    changed = true;
                }
            }
        }
        if (!changed) break; // Early termination if no changes
    }

    // Check for negative cycles
    for (int u = 0; u < n; ++u) {
        if (dist[u] > 1e17) continue;
        for (const auto& edge : g.get_adjacency(u)) {
            int v = edge.dst;
            double weight = edge.weight;
            if (dist[u] + weight < dist[v]) {
                has_negative_cycle = true;
                break;
            }
        }
        if (has_negative_cycle) break;
    }

    auto end = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double, std::milli> elapsed = end - start;

    return {dist, prev, elapsed.count()};
}
