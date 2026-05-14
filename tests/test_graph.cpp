#include <iostream>
#include <cassert>
#include "graph.h"

void test_basic_graph() {
    Graph g(3);
    g.add_node(0, "A");
    g.add_node(1, "B");
    g.add_node(2, "C");
    g.add_edge(0, 1, 10.5);
    g.add_edge(1, 2, 5.0);
    
    assert(g.node_count() == 3);
    assert(g.get_adjacency(0).size() == 1);
    assert(g.get_matrix_weight(0, 1) == 10.5);
    assert(g.get_matrix_weight(0, 2) > 1e15); // INF
    std::cout << "Basic Graph Test Passed!" << std::endl;
}

void test_generators() {
    auto sparse = Graph::generate_sparse(50, 0.05);
    assert(sparse.node_count() == 50);
    
    auto dense = Graph::generate_dense(10);
    assert(dense.node_count() == 10);
    
    std::cout << "Generators Test Passed!" << std::endl;
}

int main() {
    test_basic_graph();
    test_generators();
    return 0;
}
