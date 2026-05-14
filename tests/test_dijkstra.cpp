#include <iostream>
#include <cassert>
#include "graph.h"
#include "algorithms.h"

void test_dijkstra_simple() {
    Graph g(5);
    // Tiny Graph (5 nodes, 7 edges) from PRD
    // A(0), B(1), C(2), D(3), E(4)
    g.add_edge(0, 1, 4);  // A -> B
    g.add_edge(0, 2, 2);  // A -> C
    g.add_edge(1, 2, 1);  // B -> C
    g.add_edge(1, 3, 5);  // B -> D
    g.add_edge(2, 3, 8);  // C -> D
    g.add_edge(2, 4, 10); // C -> E
    g.add_edge(3, 4, 2);  // D -> E

    auto result = dijkstra_binary(g, 0);

    // Expected: Shortest path A -> E = 11 (A -> B -> D -> E)
    // Wait, let's re-calculate:
    // A -> B (4), B -> D (5), D -> E (2) = 11
    // A -> C (2), C -> E (10) = 12
    // A -> C (2), C -> D (8), D -> E (2) = 12
    // A -> B (4), B -> C (1), C -> E (10) = 15
    
    assert(result.distances[4] == 11);
    std::cout << "Dijkstra Binary Simple Test Passed!" << std::endl;
}

void test_dijkstra_comparison() {
    // Generate a random sparse graph
    int n = 100;
    auto g = Graph::generate_sparse(n, 0.1);
    
    auto res_binary = dijkstra_binary(g, 0);
    auto res_fib = dijkstra_fibonacci(g, 0);
    
    for (int i = 0; i < n; ++i) {
        // Use a small epsilon for double comparison if needed, 
        // but here weights are usually discrete or well-behaved.
        if (std::abs(res_binary.distances[i] - res_fib.distances[i]) > 1e-9) {
            std::cerr << "Mismatch at node " << i << ": Binary=" << res_binary.distances[i] 
                      << ", Fib=" << res_fib.distances[i] << std::endl;
            assert(false);
        }
    }
    std::cout << "Dijkstra Comparison Test Passed! (Binary vs Fib are identical)" << std::endl;
}

int main() {
    test_dijkstra_simple();
    test_dijkstra_comparison();
    return 0;
}
