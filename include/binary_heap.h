#ifndef BINARY_HEAP_H
#define BINARY_HEAP_H

#include <vector>
#include <stdexcept>
#include <algorithm>

template <typename Key, typename Value>
class BinaryHeap {
private:
    struct HeapNode {
        Key key;
        Value value;
    };
    std::vector<HeapNode> heap;

    void heapify_up(int index) {
        while (index > 0) {
            int parent = (index - 1) / 2;
            if (heap[index].key < heap[parent].key) {
                std::swap(heap[index], heap[parent]);
                index = parent;
            } else {
                break;
            }
        }
    }

    void heapify_down(int index) {
        int smallest = index;
        int left = 2 * index + 1;
        int right = 2 * index + 2;

        if (left < heap.size() && heap[left].key < heap[smallest].key)
            smallest = left;
        if (right < heap.size() && heap[right].key < heap[smallest].key)
            smallest = right;

        if (smallest != index) {
            std::swap(heap[index], heap[smallest]);
            heapify_down(smallest);
        }
    }

public:
    void insert(const Key& key, const Value& value) {
        heap.push_back({key, value});
        heapify_up(heap.size() - 1);
    }

    std::pair<Key, Value> extract_min() {
        if (heap.empty()) throw std::runtime_error("Heap is empty");
        std::pair<Key, Value> min_node = {heap[0].key, heap[0].value};
        heap[0] = heap.back();
        heap.pop_back();
        if (!heap.empty()) heapify_down(0);
        return min_node;
    }

    bool is_empty() const { return heap.empty(); }
    int size() const { return heap.size(); }
};

#endif // BINARY_HEAP_H
