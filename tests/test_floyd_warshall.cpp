#include <iostream>
#include <cassert>
#include "graph.h"
#include "algorithms.h"

void test_floyd_warshall_basic() {
    Graph g(4);
    g.add_edge(0, 2, -2);
    g.add_edge(1, 0, 4);
    g.add_edge(1, 2, 3);
    g.add_edge(2, 3, 2);
    g.add_edge(3, 1, -1);

    auto result = floyd_warshall(g);

    // Shortest path from 0 to 1: 0 -> 2 -> 3 -> 1
    // 0->2 (-2), 2->3 (2), 3->1 (-1) = -1
    assert(result.distances[0][1] == -1);
    
    // Shortest path from 1 to 3: 1 -> 0 -> 2 -> 3
    // 1->0 (4), 0->2 (-2), 2->3 (2) = 4
    assert(result.distances[1][3] == 4);
    
    std::cout << "Floyd-Warshall Basic All-Pairs Test Passed!" << std::endl;
}

int main() {
    test_floyd_warshall_basic();
    return 0;
}
