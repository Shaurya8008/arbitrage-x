#include <iostream>
#include <cassert>
#include "graph.h"
#include "algorithms.h"

void test_bellman_simple() {
    Graph g(5);
    g.add_edge(0, 1, 6);
    g.add_edge(0, 2, 7);
    g.add_edge(1, 2, 8);
    g.add_edge(1, 3, 5);
    g.add_edge(1, 4, -4); // Negative edge
    g.add_edge(2, 3, -3); // Negative edge
    g.add_edge(2, 4, 9);
    g.add_edge(3, 1, -2);
    g.add_edge(4, 0, 2);
    g.add_edge(4, 3, 7);

    bool has_cycle = false;
    auto result = bellman_ford(g, 0, has_cycle);
    
    assert(!has_cycle);
    // Path 0 -> 4 is 0->2->3->1->4 = 7 - 3 - 2 - 4 = -2
    assert(result.distances[4] == -2);
    std::cout << "Bellman-Ford Simple Negative Edge Test Passed!" << std::endl;
}

void test_bellman_negative_cycle() {
    Graph g(3);
    g.add_edge(0, 1, 1);
    g.add_edge(1, 2, 1);
    g.add_edge(2, 1, -5); // Creates a negative cycle between 1 and 2

    bool has_cycle = false;
    auto result = bellman_ford(g, 0, has_cycle);
    
    assert(has_cycle == true);
    std::cout << "Bellman-Ford Negative Cycle Detection Test Passed!" << std::endl;
}

int main() {
    test_bellman_simple();
    test_bellman_negative_cycle();
    return 0;
}
