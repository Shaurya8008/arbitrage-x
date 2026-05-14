#include "algorithms.h"
#include "binary_heap.h"
#include <chrono>

RoutingResult dijkstra_binary(const Graph& g, int source) {
    auto start = std::chrono::high_resolution_clock::now();
    
    int n = g.node_count();
    std::vector<double> dist(n, 1e18); // INF
    std::vector<int> prev(n, -1);
    BinaryHeap<double, int> pq;

    dist[source] = 0;
    pq.insert(0, source);

    while (!pq.is_empty()) {
        auto min_node = pq.extract_min();
        double d = min_node.first;
        int u = min_node.second;

        if (d > dist[u]) continue;

        for (const auto& edge : g.get_adjacency(u)) {
            int v = edge.dst;
            double weight = edge.weight;
            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                prev[v] = u;
                pq.insert(dist[v], v);
            }
        }
    }

    auto end = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double, std::milli> elapsed = end - start;

    return {dist, prev, elapsed.count()};
}
