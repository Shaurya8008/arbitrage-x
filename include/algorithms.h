#ifndef ALGORITHMS_H
#define ALGORITHMS_H

#include <vector>
#include "graph.h"

struct RoutingResult {
    std::vector<double> distances;
    std::vector<int> predecessors;
    double execution_time_ms;
};

struct AllPairsResult {
    std::vector<std::vector<double>> distances;
    std::vector<std::vector<int>> next;
    double execution_time_ms;
};

RoutingResult dijkstra_binary(const Graph& g, int source);
RoutingResult dijkstra_fibonacci(const Graph& g, int source);
RoutingResult bellman_ford(const Graph& g, int source, bool& has_negative_cycle);
AllPairsResult floyd_warshall(const Graph& g);

// Crypto Arbitrage
Graph build_arbitrage_graph(const std::vector<std::vector<double>>& exchange_rates);
std::vector<int> extract_arbitrage_cycle(const Graph& g, int source);

#endif // ALGORITHMS_H
