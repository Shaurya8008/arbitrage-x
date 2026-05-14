#include <iostream>
#include <cassert>
#include <vector>
#include <algorithm>
#include "fibonacci_heap.h"

void test_fib_basic() {
    FibonacciHeap<int, std::string> heap;
    heap.insert(10, "ten");
    heap.insert(5, "five");
    heap.insert(20, "twenty");
    
    assert(heap.size() == 3);
    auto min = heap.extract_min();
    assert(min.first == 5);
    assert(min.second == "five");
    assert(heap.size() == 2);
    
    min = heap.extract_min();
    assert(min.first == 10);
    assert(heap.size() == 1);
    
    std::cout << "Fibonacci Heap Basic Test Passed!" << std::endl;
}

void test_fib_decrease_key() {
    FibonacciHeap<int, int> heap;
    auto n1 = heap.insert(100, 1);
    auto n2 = heap.insert(50, 2);
    auto n3 = heap.insert(200, 3);
    
    heap.decrease_key(n3, 10);
    auto min = heap.extract_min();
    assert(min.first == 10);
    assert(min.second == 3);
    
    std::cout << "Fibonacci Heap Decrease-Key Test Passed!" << std::endl;
}

void test_fib_large() {
    FibonacciHeap<int, int> heap;
    std::vector<int> vals;
    for (int i = 0; i < 1000; ++i) {
        int v = rand() % 10000;
        vals.push_back(v);
        heap.insert(v, i);
    }
    
    std::sort(vals.begin(), vals.end());
    for (int i = 0; i < 1000; ++i) {
        auto min = heap.extract_min();
        assert(min.first == vals[i]);
    }
    assert(heap.is_empty());
    std::cout << "Fibonacci Heap Large Scale Test Passed!" << std::endl;
}

int main() {
    test_fib_basic();
    test_fib_decrease_key();
    test_fib_large();
    return 0;
}
