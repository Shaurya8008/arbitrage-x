#include "../include/graph.h"
#include "../include/algorithms.h"
#include <vector>
#include <cmath>
#include <algorithm>

using namespace std;

// Builds a graph where edge weights are -log(rate)
Graph build_arbitrage_graph(const vector<vector<double>>& exchange_rates) {
    int V = exchange_rates.size();
    Graph g(V);
    for (int i = 0; i < V; ++i) {
        for (int j = 0; j < V; ++j) {
            if (i != j && exchange_rates[i][j] > 0) {
                // To find a cycle where product of weights > 1, 
                // we find a cycle where sum of -log(weights) < 0.
                g.add_edge(i, j, -log(exchange_rates[i][j]));
            }
        }
    }
    return g;
}

// Extracts the nodes forming a negative cycle
vector<int> extract_arbitrage_cycle(const Graph& g, int source) {
    int V = g.node_count();
    double INF = 1e18;
    vector<double> dist(V, INF);
    vector<int> prev(V, -1);
    
    dist[source] = 0;

    // Relax all edges V - 1 times
    for (int i = 1; i <= V - 1; ++i) {
        for (int u = 0; u < V; ++u) {
            for (const auto& edge : g.get_adjacency(u)) {
                int v = edge.dst;
                double weight = edge.weight;
                if (dist[u] != INF && dist[u] + weight < dist[v]) {
                    dist[v] = dist[u] + weight;
                    prev[v] = u;
                }
            }
        }
    }

    // V-th iteration to find a cycle
    int cycle_start = -1;
    for (int u = 0; u < V; ++u) {
        for (const auto& edge : g.get_adjacency(u)) {
            int v = edge.dst;
            double weight = edge.weight;
            if (dist[u] != INF && dist[u] + weight < dist[v]) {
                cycle_start = v;
                break;
            }
        }
        if (cycle_start != -1) break;
    }

    vector<int> cycle;
    if (cycle_start == -1) {
        return cycle; // No arbitrage found
    }

    // We found a node that is PART of a negative cycle or reachable from one.
    // Trace back V times to guarantee we are ON the cycle.
    int curr = cycle_start;
    for (int i = 0; i < V; ++i) {
        curr = prev[curr];
    }

    // Now extract the actual cycle
    int cycle_node = curr;
    do {
        cycle.push_back(curr);
        curr = prev[curr];
    } while (curr != cycle_node && curr != -1);
    
    cycle.push_back(cycle_node);
    
    // Reverse because we traced backwards
    reverse(cycle.begin(), cycle.end());

    return cycle;
}
