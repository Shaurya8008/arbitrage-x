#include "algorithms.h"
#include "fibonacci_heap.h"
#include <chrono>
#include <vector>

RoutingResult dijkstra_fibonacci(const Graph& g, int source) {
    auto start = std::chrono::high_resolution_clock::now();
    
    int n = g.node_count();
    std::vector<double> dist(n, 1e18); // INF
    std::vector<int> prev(n, -1);
    
    // Store pointers to nodes in the heap for O(1) Decrease-Key
    std::vector<FibonacciHeap<double, int>::FibNode*> node_ptrs(n, nullptr);
    FibonacciHeap<double, int> pq;

    dist[source] = 0;
    for (int i = 0; i < n; ++i) {
        node_ptrs[i] = pq.insert(dist[i], i);
    }

    while (!pq.is_empty()) {
        auto min_node = pq.extract_min();
        double d = min_node.first;
        int u = min_node.second;
        node_ptrs[u] = nullptr; // Node is extracted

        if (d > 1e17) break; // Remaining nodes are unreachable

        for (const auto& edge : g.get_adjacency(u)) {
            int v = edge.dst;
            double weight = edge.weight;
            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                prev[v] = u;
                if (node_ptrs[v] != nullptr) {
                    pq.decrease_key(node_ptrs[v], dist[v]);
                }
            }
        }
    }

    auto end = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double, std::milli> elapsed = end - start;

    return {dist, prev, elapsed.count()};
}
