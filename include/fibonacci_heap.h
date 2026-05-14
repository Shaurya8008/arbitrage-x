#ifndef FIBONACCI_HEAP_H
#define FIBONACCI_HEAP_H

#include <vector>
#include <cmath>
#include <stdexcept>
#include <utility>

template <typename Key, typename Value>
class FibonacciHeap {
public:
    struct FibNode {
        Key key;
        Value value;
        int degree;
        bool marked;
        FibNode* parent;
        FibNode* child;
        FibNode* left;
        FibNode* right;

        FibNode(const Key& k, const Value& v)
            : key(k), value(v), degree(0), marked(false),
              parent(nullptr), child(nullptr),
              left(this), right(this) {}
    };

private:
    FibNode* min_ptr;
    int n_nodes;

    // Helper to add a node to a root list
    void add_to_root_list(FibNode* node) {
        if (min_ptr == nullptr) {
            min_ptr = node;
            node->left = node;
            node->right = node;
        } else {
            node->left = min_ptr;
            node->right = min_ptr->right;
            min_ptr->right->left = node;
            min_ptr->right = node;
            if (node->key < min_ptr->key) {
                min_ptr = node;
            }
        }
    }

    void remove_from_root_list(FibNode* node) {
        node->left->right = node->right;
        node->right->left = node->left;
    }

    void link(FibNode* y, FibNode* x) {
        remove_from_root_list(y);
        y->left = y;
        y->right = y;
        y->parent = x;
        if (x->child == nullptr) {
            x->child = y;
        } else {
            y->left = x->child;
            y->right = x->child->right;
            x->child->right->left = y;
            x->child->right = y;
        }
        x->degree++;
        y->marked = false;
    }

    void cut(FibNode* x, FibNode* y) {
        if (x->right == x) {
            y->child = nullptr;
        } else {
            x->left->right = x->right;
            x->right->left = x->left;
            if (y->child == x) {
                y->child = x->right;
            }
        }
        y->degree--;
        add_to_root_list(x);
        x->parent = nullptr;
        x->marked = false;
    }

    void cascading_cut(FibNode* y) {
        FibNode* z = y->parent;
        if (z != nullptr) {
            if (!y->marked) {
                y->marked = true;
            } else {
                cut(y, z);
                cascading_cut(z);
            }
        }
    }

    void consolidate() {
        int max_degree = static_cast<int>(std::log2(n_nodes)) + 2;
        std::vector<FibNode*> A(max_degree, nullptr);

        std::vector<FibNode*> root_nodes;
        FibNode* current = min_ptr;
        if (current != nullptr) {
            do {
                root_nodes.push_back(current);
                current = current->right;
            } while (current != min_ptr);
        }

        for (FibNode* w : root_nodes) {
            FibNode* x = w;
            int d = x->degree;
            while (A[d] != nullptr) {
                FibNode* y = A[d];
                if (x->key > y->key) {
                    std::swap(x, y);
                }
                link(y, x);
                A[d] = nullptr;
                d++;
            }
            A[d] = x;
        }

        min_ptr = nullptr;
        for (int i = 0; i < max_degree; ++i) {
            if (A[i] != nullptr) {
                if (min_ptr == nullptr) {
                    min_ptr = A[i];
                    min_ptr->left = min_ptr;
                    min_ptr->right = min_ptr;
                } else {
                    A[i]->left = min_ptr;
                    A[i]->right = min_ptr->right;
                    min_ptr->right->left = A[i];
                    min_ptr->right = A[i];
                    if (A[i]->key < min_ptr->key) {
                        min_ptr = A[i];
                    }
                }
            }
        }
    }

public:
    FibonacciHeap() : min_ptr(nullptr), n_nodes(0) {}

    FibNode* insert(const Key& key, const Value& value) {
        FibNode* node = new FibNode(key, value);
        add_to_root_list(node);
        n_nodes++;
        return node;
    }

    std::pair<Key, Value> extract_min() {
        FibNode* z = min_ptr;
        if (z == nullptr) throw std::runtime_error("Heap is empty");

        std::pair<Key, Value> min_data = {z->key, z->value};

        if (z->child != nullptr) {
            FibNode* child = z->child;
            std::vector<FibNode*> children;
            do {
                children.push_back(child);
                child = child->right;
            } while (child != z->child);

            for (FibNode* c : children) {
                add_to_root_list(c);
                c->parent = nullptr;
            }
        }

        remove_from_root_list(z);
        if (z == z->right) {
            min_ptr = nullptr;
        } else {
            min_ptr = z->right;
            consolidate();
        }
        n_nodes--;
        delete z;
        return min_data;
    }

    void merge(FibonacciHeap& other) {
        if (other.min_ptr == nullptr) return;
        if (min_ptr == nullptr) {
            min_ptr = other.min_ptr;
            n_nodes = other.n_nodes;
        } else {
            // Concatenate root lists
            FibNode* min1 = min_ptr;
            FibNode* min2 = other.min_ptr;
            FibNode* next1 = min1->right;
            FibNode* prev2 = min2->left;

            min1->right = min2;
            min2->left = min1;
            next1->left = prev2;
            prev2->right = next1;

            if (min2->key < min1->key) {
                min_ptr = min2;
            }
            n_nodes += other.n_nodes;
        }
        other.min_ptr = nullptr;
        other.n_nodes = 0;
    }

    void decrease_key(FibNode* x, const Key& k) {
        if (k > x->key) {
            throw std::invalid_argument("New key is greater than current key");
        }
        x->key = k;
        FibNode* y = x->parent;
        if (y != nullptr && x->key < y->key) {
            cut(x, y);
            cascading_cut(y);
        }
        if (x->key < min_ptr->key) {
            min_ptr = x;
        }
    }

    bool is_empty() const { return min_ptr == nullptr; }
    int size() const { return n_nodes; }
};

#endif // FIBONACCI_HEAP_H
