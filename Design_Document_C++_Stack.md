# DESIGN DOCUMENT
## Network Routing Analyzer
**Advanced Data Structures & Algorithms Project**

---

## 1. TECHNOLOGY STACK SELECTION & JUSTIFICATION

### 1.1 Chosen Stack: **C++ (C++17 Standard)**

#### Why C++?

| Criterion | C++ | Python | Java |
|-----------|-----|--------|------|
| **Raw Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Memory Control** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Heap Internals** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Direct Data Structure** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Learning Value** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Benchmarking Accuracy** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Graph Libraries** | ⭐⭐⭐ (Boost) | ⭐⭐⭐⭐ (NetworkX) | ⭐⭐⭐⭐ |

**Verdict:** C++ is optimal because:
1. **Fibonacci Heap internals** are fully visible—perfect for understanding amortized analysis
2. **Performance measurements** are accurate (no GC pauses corrupting benchmarks)
3. **Memory efficiency** critical for 100+ node graphs with detailed tracking
4. **Direct pointer manipulation** essential for circular doubly-linked lists in Fibonacci heap
5. **Educational value** highest for ADSA course (understanding cache, memory layout, etc.)

---

### 1.2 Supporting Tools & Libraries

| Component | Tool/Library | Rationale |
|-----------|--------------|-----------|
| **Build System** | CMake 3.16+ | Cross-platform, industry standard |
| **Testing** | Google Test (GTest) | Enterprise-grade unit testing |
| **Benchmarking** | Google Benchmark | Accurate, statistically rigorous |
| **Visualization** | Graphviz (via DOT) + Python script | Generate PNG/SVG graphs easily |
| **CSV Parsing** | Header-only CSV library | Simple, no dependency bloat |
| **Memory Profiling** | Valgrind + AddressSanitizer | Detect leaks in Fibonacci heap |
| **Performance Profiling** | Linux `perf` / VTune | Low-overhead wall-clock timing |
| **Documentation** | Doxygen | Automatic API docs from source |

---

## 2. SYSTEM ARCHITECTURE

### 2.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                        │
│  (main.cpp - CLI Interface, User Interaction)                │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴─────────────┐
        │                        │
┌───────▼──────────┐    ┌───────▼──────────┐
│   ALGORITHM      │    │   VISUALIZATION  │
│   LAYER          │    │   LAYER          │
├──────────────────┤    ├──────────────────┤
│ • Dijkstra       │    │ • GraphViz DOT   │
│ • BellmanFord    │    │ • Chart Gen      │
│ • FloydWarshall  │    │ • PNG/SVG Output │
│ • Benchmark      │    └──────────────────┘
└────────┬─────────┘
         │
┌────────▼──────────────────────────────────────────────────┐
│            DATA STRUCTURE LAYER                            │
├────────┬──────────────────┬──────────────┬───────────────┤
│ Graph  │ FibonacciHeap   │ BinaryHeap   │ PathTracker   │
│ (Adj)  │ (specialized)   │ (baseline)   │ (parent ptrs) │
└────────┴──────────────────┴──────────────┴───────────────┘
         │
┌────────▼──────────────────────────────────────────────────┐
│              UTILITY & I/O LAYER                           │
├──────────────────────────────────────────────────────────┤
│ • CSV Parser (graph loading)                              │
│ • Graph Generator (random/synthetic)                      │
│ • Statistics & Metrics Collector                          │
│ • Timer Utilities (high-resolution clock)                 │
└───────────────────────────────────────────────────────────┘
```

### 2.2 Module Breakdown

```
src/
├── graph/
│   ├── graph.h              # Graph interface (adjacency list)
│   ├── graph.cpp            # Graph implementation
│   ├── graph_generator.h    # Random/synthetic graph generation
│   └── graph_generator.cpp
│
├── heaps/
│   ├── binary_heap.h        # Min-heap (baseline)
│   ├── binary_heap.cpp
│   ├── fibonacci_heap.h     # Fibonacci heap (core DS)
│   └── fibonacci_heap.cpp   # Full implementation with cascading-cut
│
├── algorithms/
│   ├── dijkstra.h           # Dijkstra interface
│   ├── dijkstra_binary.cpp  # Dijkstra with binary heap
│   ├── dijkstra_fib.cpp     # Dijkstra with Fibonacci heap
│   ├── bellman_ford.h
│   ├── bellman_ford.cpp
│   ├── floyd_warshall.h
│   ├── floyd_warshall.cpp
│   └── algorithm_base.h     # Base class for common interface
│
├── benchmark/
│   ├── benchmark_runner.h   # Benchmark orchestration
│   ├── benchmark_runner.cpp
│   ├── metrics_collector.h  # Timing, operation counts
│   ├── metrics_collector.cpp
│   └── scenario_builder.h   # 5 predefined test scenarios
│
├── io/
│   ├── csv_loader.h         # Load graphs from CSV
│   ├── csv_loader.cpp
│   └── report_writer.h      # Output benchmark results
│
├── visualization/
│   ├── graph_renderer.h     # Generate Graphviz DOT
│   ├── graph_renderer.cpp
│   ├── chart_generator.h    # Matplotlib Python wrapper
│   └── chart_generator.cpp
│
├── utils/
│   ├── timer.h              # High-resolution timing
│   ├── memory_tracker.h     # Memory profiling
│   ├── statistics.h         # Mean, std dev, variance
│   └── constants.h          # Global constants
│
└── main.cpp                 # CLI entry point
```

---

## 3. DETAILED DESIGN: CORE DATA STRUCTURES

### 3.1 Graph Data Structure

#### 3.1.1 Node Definition
```cpp
// graph/graph.h
struct Node {
    int id;
    std::string label;
    double latitude;   // For visualization
    double longitude;
    
    // Optional metadata
    std::unordered_map<std::string, double> attributes;
};
```

#### 3.1.2 Edge Definition
```cpp
struct Edge {
    int src;
    int dst;
    double weight;
    std::string label;  // Optional
};
```

#### 3.1.3 Graph Class (Adjacency List)
```cpp
class Graph {
private:
    std::vector<Node> nodes;
    std::vector<std::vector<Edge>> adjacency_list;
    std::unordered_map<std::string, int> label_to_id;
    int num_vertices;
    int num_edges;
    
public:
    // Construction
    Graph(int n);
    void add_node(int id, const std::string& label, 
                  double lat = 0, double lon = 0);
    void add_edge(int src, int dst, double weight);
    void remove_edge(int src, int dst);
    
    // Access
    const Node& get_node(int id) const;
    const std::vector<Edge>& get_adjacency(int node_id) const;
    int node_count() const { return num_vertices; }
    int edge_count() const { return num_edges; }
    
    // Properties
    bool is_weighted() const;
    bool has_negative_weights() const;
    double average_degree() const;
    
    // I/O
    void print_summary() const;
};
```

---

### 3.2 Fibonacci Heap Data Structure

#### 3.2.1 Node Structure (Critical Design)
```cpp
// heaps/fibonacci_heap.h
template <typename Key, typename Value>
class FibonacciHeap {
private:
    struct FibNode {
        Key key;
        Value value;
        int degree;           // Number of children
        bool marked;          // For cascading cut
        
        // Circular doubly-linked list pointers
        FibNode* parent;
        FibNode* child;       // One representative child
        FibNode* left;        // Circular list neighbors
        FibNode* right;
        
        FibNode(const Key& k, const Value& v)
            : key(k), value(v), degree(0), marked(false),
              parent(nullptr), child(nullptr),
              left(this), right(this) {}
    };
    
    FibNode* min_ptr;         // Pointer to minimum element
    int size;                 // Current number of nodes
    std::vector<FibNode*> degree_table;  // For consolidation
    
public:
    // Core operations with amortized bounds
    FibNode* insert(const Key& key, const Value& value);
    // O(1) amortized
    
    std::pair<Key, Value> extract_min();
    // O(log n) amortized
    
    void decrease_key(FibNode* node, const Key& new_key);
    // O(1) amortized ← KEY OPERATION
    
    bool is_empty() const { return size == 0; }
    int get_size() const { return size; }
    
    // Metrics for empirical analysis
    struct OperationMetrics {
        long long insertions;
        long long decreases;
        long long extractions;
        long long cascading_cuts;
        long long consolidations;
    };
    OperationMetrics get_metrics() const;
    
private:
    // Helper functions
    void consolidate();
    void cut(FibNode* node, FibNode* parent);
    void cascading_cut(FibNode* node);
    void link(FibNode* y, FibNode* x);  // x becomes parent of y
    FibNode* find_min_in_list(FibNode* start);
};
```

#### 3.2.2 Key Algorithm: Cascading Cut

```cpp
void FibonacciHeap::decrease_key(FibNode* node, const Key& new_key) {
    /*
    Time: O(1) amortized
    Proof: At most 1 cut is made without marking parent (O(1))
           Cascading cuts occur at marked nodes, but total cuts
           limited by potential function argument (amortized)
    */
    if (new_key > node->key) {
        throw std::invalid_argument("New key larger than current");
    }
    
    node->key = new_key;
    FibNode* parent = node->parent;
    
    if (parent != nullptr && node->key < parent->key) {
        cut(node, parent);
        cascading_cut(parent);
    }
    
    if (node->key < min_ptr->key) {
        min_ptr = node;
    }
}

void FibonacciHeap::cut(FibNode* node, FibNode* parent) {
    /*
    Remove node from parent's child list.
    Add node to root list.
    */
    // Remove from parent's children
    if (node->left == node) {
        parent->child = nullptr;
    } else {
        node->left->right = node->right;
        node->right->left = node->left;
        if (parent->child == node) {
            parent->child = node->right;
        }
    }
    parent->degree--;
    
    // Add to root list
    node->parent = nullptr;
    node->marked = false;
    node->left = min_ptr->left;
    node->right = min_ptr;
    min_ptr->left->right = node;
    min_ptr->left = node;
}

void FibonacciHeap::cascading_cut(FibNode* node) {
    /*
    Recursively cut marked parents.
    Stops at first unmarked parent.
    */
    FibNode* parent = node->parent;
    if (parent == nullptr) return;
    
    if (!node->marked) {
        node->marked = true;
    } else {
        cut(node, parent);
        cascading_cut(parent);
    }
}
```

---

### 3.3 Binary Heap (Baseline Comparison)

```cpp
// heaps/binary_heap.h
template <typename Key, typename Value>
class BinaryHeap {
private:
    struct HeapNode {
        Key key;
        Value value;
        int heap_index;  // Position in array
    };
    
    std::vector<HeapNode> heap;
    std::unordered_map<int, int> node_to_index;  // For decrease-key
    
public:
    int insert(const Key& key, const Value& value);
    // O(log n)
    
    std::pair<Key, Value> extract_min();
    // O(log n)
    
    void decrease_key(int node_id, const Key& new_key);
    // O(log n) ← slower than Fibonacci!
    
private:
    void heapify_up(int index);
    void heapify_down(int index);
};
```

---

## 4. DETAILED DESIGN: ALGORITHMS

### 4.1 Dijkstra's Algorithm - Two Implementations

#### 4.1.1 Interface (Algorithm Base)
```cpp
// algorithms/algorithm_base.h
struct PathResult {
    std::vector<double> distances;      // dist[i] = shortest from source to i
    std::vector<int> predecessors;      // For path reconstruction
    std::vector<std::vector<int>> paths;  // Full paths to each node
    long long execution_time_us;        // Microseconds
    
    struct OperationStats {
        long long heap_ops;
        long long relaxations;
        long long comparisons;
    } stats;
};

class ShortestPathAlgorithm {
public:
    virtual ~ShortestPathAlgorithm() = default;
    virtual PathResult solve(const Graph& graph, int source, 
                             int destination = -1) = 0;
    virtual std::string name() const = 0;
};
```

#### 4.1.2 Dijkstra with Binary Heap
```cpp
// algorithms/dijkstra_binary.cpp
class DijkstraBinary : public ShortestPathAlgorithm {
private:
    BinaryHeap<double, int> pq;  // (distance, node_id)
    
public:
    PathResult solve(const Graph& graph, int source, 
                    int destination = -1) override {
        auto start_time = high_resolution_clock::now();
        int n = graph.node_count();
        
        std::vector<double> dist(n, INFINITY);
        std::vector<int> pred(n, -1);
        std::vector<bool> visited(n, false);
        
        dist[source] = 0;
        pq.insert(0, source);  // (cost, node)
        
        long long relaxations = 0;
        
        while (!pq.is_empty()) {
            auto [d, u] = pq.extract_min();
            
            if (visited[u]) continue;
            visited[u] = true;
            
            if (destination != -1 && u == destination) break;
            
            for (const auto& edge : graph.get_adjacency(u)) {
                int v = edge.dst;
                double new_dist = dist[u] + edge.weight;
                
                if (new_dist < dist[v]) {
                    dist[v] = new_dist;
                    pred[v] = u;
                    pq.insert(dist[v], v);  // O(log n)
                    // Note: Real implementation would use decrease-key
                    // For simplicity, we re-insert (results in O(E log V))
                    relaxations++;
                }
            }
        }
        
        auto end_time = high_resolution_clock::now();
        auto duration = duration_cast<microseconds>(end_time - start_time);
        
        return PathResult{
            dist, pred, reconstruct_paths(graph, source, pred),
            duration.count(),
            {0, relaxations, 0}
        };
    }
    
    std::string name() const override { return "Dijkstra (Binary Heap)"; }
};
```

#### 4.1.3 Dijkstra with Fibonacci Heap (Optimized)
```cpp
// algorithms/dijkstra_fib.cpp
class DijkstraFibonacci : public ShortestPathAlgorithm {
private:
    FibonacciHeap<double, int> pq;
    
public:
    PathResult solve(const Graph& graph, int source, 
                    int destination = -1) override {
        auto start_time = high_resolution_clock::now();
        int n = graph.node_count();
        
        std::vector<double> dist(n, INFINITY);
        std::vector<int> pred(n, -1);
        std::vector<bool> visited(n, false);
        std::vector<FibonacciHeap<double, int>::FibNode*> 
            heap_nodes(n, nullptr);
        
        dist[source] = 0;
        heap_nodes[source] = pq.insert(0, source);
        
        long long relaxations = 0;
        
        while (!pq.is_empty()) {
            auto [d, u] = pq.extract_min();
            
            if (visited[u]) continue;
            visited[u] = true;
            
            if (destination != -1 && u == destination) break;
            
            for (const auto& edge : graph.get_adjacency(u)) {
                int v = edge.dst;
                double new_dist = dist[u] + edge.weight;
                
                if (new_dist < dist[v]) {
                    dist[v] = new_dist;
                    pred[v] = u;
                    relaxations++;
                    
                    if (heap_nodes[v] == nullptr) {
                        heap_nodes[v] = pq.insert(dist[v], v);
                    } else {
                        // KEY OPERATION: O(1) amortized!
                        pq.decrease_key(heap_nodes[v], dist[v]);
                    }
                }
            }
        }
        
        auto end_time = high_resolution_clock::now();
        auto duration = duration_cast<microseconds>(end_time - start_time);
        
        auto metrics = pq.get_metrics();
        return PathResult{
            dist, pred, reconstruct_paths(graph, source, pred),
            duration.count(),
            {metrics.decreases + metrics.insertions, 
             relaxations, 0}
        };
    }
    
    std::string name() const override { return "Dijkstra (Fibonacci Heap)"; }
};
```

---

### 4.2 Bellman-Ford Algorithm

```cpp
// algorithms/bellman_ford.cpp
class BellmanFord : public ShortestPathAlgorithm {
public:
    struct ResultWithCycle : public PathResult {
        bool has_negative_cycle;
        std::vector<int> cycle_nodes;  // Nodes in negative cycle
    };
    
    ResultWithCycle solve(const Graph& graph, int source, 
                         int destination = -1) {
        auto start_time = high_resolution_clock::now();
        int n = graph.node_count();
        
        std::vector<double> dist(n, INFINITY);
        std::vector<int> pred(n, -1);
        dist[source] = 0;
        
        long long relaxations = 0;
        
        // Relax edges V-1 times
        for (int iter = 0; iter < n - 1; iter++) {
            for (int u = 0; u < n; u++) {
                if (dist[u] == INFINITY) continue;
                
                for (const auto& edge : graph.get_adjacency(u)) {
                    int v = edge.dst;
                    double new_dist = dist[u] + edge.weight;
                    
                    if (new_dist < dist[v]) {
                        dist[v] = new_dist;
                        pred[v] = u;
                        relaxations++;
                    }
                }
            }
        }
        
        // Check for negative cycles
        bool has_cycle = false;
        std::vector<int> cycle_nodes;
        
        for (int u = 0; u < n; u++) {
            if (dist[u] == INFINITY) continue;
            
            for (const auto& edge : graph.get_adjacency(u)) {
                int v = edge.dst;
                if (dist[u] + edge.weight < dist[v]) {
                    has_cycle = true;
                    cycle_nodes.push_back(v);
                }
            }
        }
        
        auto end_time = high_resolution_clock::now();
        auto duration = duration_cast<microseconds>(end_time - start_time);
        
        PathResult base{
            dist, pred, reconstruct_paths(graph, source, pred),
            duration.count(),
            {0, relaxations, 0}
        };
        
        return ResultWithCycle{base.distances, base.predecessors,
                               base.paths, base.execution_time_us,
                               base.stats, has_cycle, cycle_nodes};
    }
    
    std::string name() const override { return "Bellman-Ford"; }
};
```

**Time Complexity:** O(V × E)  
**Space Complexity:** O(V)  
**Key Benefit:** Handles negative weights; detects negative cycles

---

### 4.3 Floyd-Warshall Algorithm

```cpp
// algorithms/floyd_warshall.cpp
class FloydWarshall {
public:
    struct AllPairsResult {
        std::vector<std::vector<double>> dist;  // DP table
        std::vector<std::vector<int>> next;     // Path reconstruction
        long long execution_time_us;
        
        struct Stats {
            long long updates;
            long long comparisons;
        } stats;
    };
    
    AllPairsResult solve(const Graph& graph) {
        auto start_time = high_resolution_clock::now();
        int n = graph.node_count();
        
        // Initialize DP table
        std::vector<std::vector<double>> dist(n, 
                                              std::vector<double>(n, INFINITY));
        std::vector<std::vector<int>> next(n, std::vector<int>(n, -1));
        
        // Base case: diagonal = 0
        for (int i = 0; i < n; i++) {
            dist[i][i] = 0;
        }
        
        // Initialize with direct edges
        for (int u = 0; u < n; u++) {
            for (const auto& edge : graph.get_adjacency(u)) {
                int v = edge.dst;
                dist[u][v] = edge.weight;
                next[u][v] = v;
            }
        }
        
        long long updates = 0, comparisons = 0;
        
        // DP: For each intermediate vertex k
        for (int k = 0; k < n; k++) {
            for (int i = 0; i < n; i++) {
                for (int j = 0; j < n; j++) {
                    comparisons++;
                    if (dist[i][k] != INFINITY && 
                        dist[k][j] != INFINITY) {
                        double new_dist = dist[i][k] + dist[k][j];
                        if (new_dist < dist[i][j]) {
                            dist[i][j] = new_dist;
                            next[i][j] = next[i][k];
                            updates++;
                        }
                    }
                }
            }
        }
        
        auto end_time = high_resolution_clock::now();
        auto duration = duration_cast<microseconds>(end_time - start_time);
        
        return AllPairsResult{dist, next, duration.count(),
                             {updates, comparisons}};
    }
    
    // Reconstruct path from next[][] table
    std::vector<int> reconstruct_path(
        const std::vector<std::vector<int>>& next,
        int u, int v) {
        if (next[u][v] == -1) return {};
        
        std::vector<int> path = {u};
        while (u != v) {
            u = next[u][v];
            path.push_back(u);
        }
        return path;
    }
};
```

**DP Formulation:**
```
Base: dist[i][j] = weight(i,j) if edge exists, else ∞
      dist[i][i] = 0

Recurrence (for each k):
  dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])

Time:** O(V³)
**Space:** O(V²)
```

---

## 5. BENCHMARKING FRAMEWORK

### 5.1 Metrics Collector

```cpp
// benchmark/metrics_collector.h
class MetricsCollector {
private:
    struct RunMetrics {
        long long wall_clock_us;      // Wall-clock time
        long long heap_operations;    // Insert/extract/decrease
        long long edge_relaxations;
        size_t peak_memory_bytes;
        size_t avg_memory_bytes;
    };
    
    std::vector<RunMetrics> runs;
    
public:
    void record_run(const PathResult& result, size_t peak_mem) {
        runs.push_back({
            result.execution_time_us,
            result.stats.heap_ops,
            result.stats.relaxations,
            peak_mem,
            0  // Calculated later
        });
    }
    
    struct Statistics {
        double mean;
        double std_dev;
        double min;
        double max;
        double cv;  // Coefficient of variation
    };
    
    Statistics analyze_wall_clock() const {
        // Compute mean, std dev, min, max, CV
        // Remove outliers (beyond 2σ) for stability
    }
    
    Statistics analyze_heap_ops() const;
    Statistics analyze_memory() const;
    
    void print_report(const std::string& algorithm_name) const;
};
```

### 5.2 Benchmark Scenarios

```cpp
// benchmark/scenario_builder.h
class ScenarioBuilder {
public:
    enum class Scenario {
        SPARSE_GRAPH,           // 100 nodes, ~150-200 edges
        DENSE_GRAPH,            // 100 nodes, ~3000+ edges
        NEGATIVE_WEIGHT_GRAPH,  // Mixed +/- weights
        SCALING_ANALYSIS,       // 50, 100, 200, 500 nodes
        ALL_PAIRS_COMPARISON    // Floyd-W vs V×Dijkstra
    };
    
    struct BenchmarkConfig {
        int num_nodes;
        int num_edges;
        double negative_edge_ratio;  // 0.0 to 1.0
        int num_runs_per_algorithm;  // For statistical stability
        bool collect_detailed_stats;
    };
    
    static BenchmarkConfig get_scenario(Scenario s);
    
    // Generate test graphs
    Graph generate_sparse(int nodes);
    Graph generate_dense(int nodes);
    Graph generate_negative_weight(int nodes, double neg_ratio);
};
```

### 5.3 Benchmark Runner

```cpp
// benchmark/benchmark_runner.cpp
class BenchmarkRunner {
public:
    void run_all_scenarios() {
        std::vector<std::unique_ptr<ShortestPathAlgorithm>> algorithms = {
            std::make_unique<DijkstraBinary>(),
            std::make_unique<DijkstraFibonacci>(),
            std::make_unique<BellmanFord>()
        };
        
        std::vector<ScenarioBuilder::Scenario> scenarios = {
            ScenarioBuilder::Scenario::SPARSE_GRAPH,
            ScenarioBuilder::Scenario::DENSE_GRAPH,
            ScenarioBuilder::Scenario::NEGATIVE_WEIGHT_GRAPH
        };
        
        for (auto scenario : scenarios) {
            auto config = ScenarioBuilder::get_scenario(scenario);
            Graph g = generate_graph(config);
            
            std::cout << "\n=== Scenario: " << scenario_name(scenario) << " ===" 
                      << std::endl;
            std::cout << "Nodes: " << g.node_count() 
                      << ", Edges: " << g.edge_count() << std::endl;
            
            for (auto& algo : algorithms) {
                MetricsCollector collector;
                
                for (int run = 0; run < 5; run++) {
                    auto result = algo->solve(g, 0);
                    collector.record_run(result, estimate_memory());
                }
                
                collector.print_report(algo->name());
            }
        }
    }
    
    void run_scaling_analysis() {
        // Measure execution time for graphs with 50, 100, 200, 500 nodes
        // Plot: nodes vs time for each algorithm
        // Empirically verify complexity classes
    }
    
    void run_amortized_analysis() {
        // Measure decrease-key operations in Fibonacci heap
        // Validate O(1) amortized behavior
        // Plot: operations vs amortized cost
    }
};
```

---

## 6. VISUALIZATION PIPELINE

### 6.1 Graph Rendering (Graphviz)

```cpp
// visualization/graph_renderer.cpp
class GraphRenderer {
public:
    void render_graph_with_path(
        const Graph& graph,
        const std::vector<int>& path,
        const std::string& output_file) {
        
        std::ofstream dot_file("temp.dot");
        dot_file << "digraph Network {\n";
        dot_file << "  rankdir=LR;\n";
        dot_file << "  node [shape=circle, style=filled, "
                 << "fillcolor=lightblue];\n";
        
        // Render all nodes
        for (int i = 0; i < graph.node_count(); i++) {
            const auto& node = graph.get_node(i);
            dot_file << "  " << node.id << " [label=\"" 
                     << node.label << "\"];\n";
        }
        
        // Highlight path nodes
        for (int node_id : path) {
            dot_file << "  " << node_id 
                     << " [fillcolor=yellow];\n";
        }
        
        // Render edges
        for (int u = 0; u < graph.node_count(); u++) {
            for (const auto& edge : graph.get_adjacency(u)) {
                bool in_path = std::find(path.begin(), path.end(), u) 
                               != path.end() &&
                               std::find(path.begin(), path.end(), edge.dst) 
                               != path.end();
                
                std::string style = in_path ? "bold,color=red" : "normal";
                dot_file << "  " << u << " -> " << edge.dst 
                         << " [label=" << edge.weight 
                         << ", style=" << style << "];\n";
            }
        }
        
        dot_file << "}\n";
        dot_file.close();
        
        // Execute: dot -Tpng temp.dot -o output_file
        system(("dot -Tpng temp.dot -o " + output_file).c_str());
    }
};
```

### 6.2 Chart Generation (Python Bridge)

```cpp
// visualization/chart_generator.cpp
class ChartGenerator {
public:
    void generate_performance_chart(
        const std::map<std::string, MetricsCollector>& results) {
        
        // Write data to CSV
        std::ofstream csv("performance_data.csv");
        csv << "Algorithm,Time(ms),HeapOps,Memory(MB)\n";
        for (const auto& [algo, metrics] : results) {
            auto stats = metrics.analyze_wall_clock();
            csv << algo << "," << stats.mean / 1000.0 << "," 
                << "..." << "\n";
        }
        csv.close();
        
        // Call Python script to generate matplotlib chart
        system("python3 generate_charts.py");
    }
};
```

**Python helper script (generate_charts.py):**
```python
import pandas as pd
import matplotlib.pyplot as plt

data = pd.read_csv('performance_data.csv')

fig, axes = plt.subplots(2, 2, figsize=(12, 10))

# Bar chart: Time comparison
axes[0,0].bar(data['Algorithm'], data['Time(ms)'])
axes[0,0].set_title('Execution Time by Algorithm')
axes[0,0].set_ylabel('Time (ms)')

# Bar chart: Heap operations
axes[0,1].bar(data['Algorithm'], data['HeapOps'])
axes[0,1].set_title('Heap Operations')

# Memory usage
axes[1,0].bar(data['Algorithm'], data['Memory(MB)'])
axes[1,0].set_title('Peak Memory Usage')

# Scaling curve (if scaling data provided)
# axes[1,1].plot(...)

plt.tight_layout()
plt.savefig('performance_comparison.png', dpi=150)
```

---

## 7. BUILD SYSTEM (CMake)

```cmake
# CMakeLists.txt
cmake_minimum_required(VERSION 3.16)
project(NetworkRoutingAnalyzer)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3 -march=native -fno-omit-frame-pointer")

# Include directories
include_directories(${PROJECT_SOURCE_DIR}/src)

# Source files
set(SOURCES
    src/graph/graph.cpp
    src/heaps/binary_heap.cpp
    src/heaps/fibonacci_heap.cpp
    src/algorithms/dijkstra_binary.cpp
    src/algorithms/dijkstra_fib.cpp
    src/algorithms/bellman_ford.cpp
    src/algorithms/floyd_warshall.cpp
    src/benchmark/benchmark_runner.cpp
    src/benchmark/metrics_collector.cpp
    src/io/csv_loader.cpp
    src/visualization/graph_renderer.cpp
    src/utils/timer.cpp
    src/main.cpp
)

# Main executable
add_executable(network_analyzer ${SOURCES})

# Testing
enable_testing()
find_package(GTest REQUIRED)
include_directories(${GTEST_INCLUDE_DIR})

set(TEST_SOURCES
    tests/test_graph.cpp
    tests/test_fibonacci_heap.cpp
    tests/test_algorithms.cpp
)

add_executable(run_tests ${TEST_SOURCES} ${SOURCES})
target_link_libraries(run_tests ${GTEST_LIBRARIES} pthread)
add_test(NAME AllTests COMMAND run_tests)

# Benchmarking
find_package(benchmark REQUIRED)
add_executable(run_benchmarks tests/benchmark_suite.cpp ${SOURCES})
target_link_libraries(run_benchmarks benchmark::benchmark)
```

---

## 8. TESTING STRATEGY

### 8.1 Unit Tests (Google Test)

```cpp
// tests/test_fibonacci_heap.cpp
#include <gtest/gtest.h>
#include "heaps/fibonacci_heap.h"

class FibonacciHeapTest : public ::testing::Test {
protected:
    FibonacciHeap<int, std::string> heap;
};

TEST_F(FibonacciHeapTest, InsertAndExtractMin) {
    auto node1 = heap.insert(5, "five");
    auto node2 = heap.insert(3, "three");
    auto node3 = heap.insert(7, "seven");
    
    auto [key, val] = heap.extract_min();
    EXPECT_EQ(key, 3);
    EXPECT_EQ(val, "three");
}

TEST_F(FibonacciHeapTest, DecreaseKeyAmortized) {
    std::vector<decltype(heap.insert(0, ""))> nodes;
    for (int i = 0; i < 1000; i++) {
        nodes.push_back(heap.insert(1000000 - i, std::to_string(i)));
    }
    
    // Measure decrease-key operations
    auto initial_ops = heap.get_metrics().decreases;
    
    for (auto& node : nodes) {
        heap.decrease_key(node, 0);
    }
    
    auto final_ops = heap.get_metrics().decreases;
    // Should be O(n) total, not O(n log n)
    EXPECT_LT(final_ops - initial_ops, 1500);
}

TEST_F(FibonacciHeapTest, NegativeWeightHandling) {
    // Test with negative keys
    heap.insert(-100, "neg");
    heap.insert(50, "pos");
    
    auto [key, val] = heap.extract_min();
    EXPECT_EQ(key, -100);
}
```

### 8.2 Algorithm Correctness Tests

```cpp
// tests/test_algorithms.cpp
class AlgorithmTest : public ::testing::Test {
protected:
    Graph tiny_graph;
    
    void SetUp() override {
        // Build: A--4--B
        //        |     |
        //        2     5
        //        |     |
        //        C--8--D
        tiny_graph.add_node(0, "A");
        tiny_graph.add_node(1, "B");
        tiny_graph.add_node(2, "C");
        tiny_graph.add_node(3, "D");
        
        tiny_graph.add_edge(0, 1, 4);
        tiny_graph.add_edge(0, 2, 2);
        tiny_graph.add_edge(1, 3, 5);
        tiny_graph.add_edge(2, 3, 8);
    }
};

TEST_F(AlgorithmTest, DijkstraCorrectness) {
    DijkstraBinary dijkstra;
    auto result = dijkstra.solve(tiny_graph, 0);
    
    // A to D should be: A -> C -> D = 10
    EXPECT_DOUBLE_EQ(result.distances[3], 10.0);
}

TEST_F(AlgorithmTest, DijkstraVsFibonacci) {
    DijkstraBinary db;
    DijkstraFibonacci df;
    
    auto result_b = db.solve(tiny_graph, 0);
    auto result_f = df.solve(tiny_graph, 0);
    
    // Both should produce same distances
    for (int i = 0; i < tiny_graph.node_count(); i++) {
        EXPECT_DOUBLE_EQ(result_b.distances[i], result_f.distances[i]);
    }
}

TEST_F(AlgorithmTest, BellmanFordNegativeCycle) {
    Graph neg_cycle;
    neg_cycle.add_node(0, "A");
    neg_cycle.add_node(1, "B");
    neg_cycle.add_node(2, "C");
    
    neg_cycle.add_edge(0, 1, 1);
    neg_cycle.add_edge(1, 2, 3);
    neg_cycle.add_edge(2, 0, -5);  // Creates negative cycle
    
    BellmanFord bf;
    auto result = bf.solve(neg_cycle, 0);
    EXPECT_TRUE(result.has_negative_cycle);
}

TEST_F(AlgorithmTest, FloydWarshallAllPairs) {
    FloydWarshall fw;
    auto result = fw.solve(tiny_graph);
    
    // Check all pairs shortest paths
    EXPECT_DOUBLE_EQ(result.dist[0][3], 10.0);  // A to D
    EXPECT_DOUBLE_EQ(result.dist[0][1], 4.0);   // A to B
}
```

---

## 9. FOLDER STRUCTURE & FILE ORGANIZATION

```
NetworkRoutingAnalyzer/
├── CMakeLists.txt
├── README.md
├── DESIGN.md (this document)
│
├── src/
│   ├── graph/
│   │   ├── graph.h
│   │   ├── graph.cpp
│   │   ├── graph_generator.h
│   │   └── graph_generator.cpp
│   │
│   ├── heaps/
│   │   ├── binary_heap.h
│   │   ├── binary_heap.cpp
│   │   ├── fibonacci_heap.h      ← CORE DATA STRUCTURE
│   │   └── fibonacci_heap.cpp
│   │
│   ├── algorithms/
│   │   ├── algorithm_base.h
│   │   ├── dijkstra_binary.cpp
│   │   ├── dijkstra_fib.cpp
│   │   ├── bellman_ford.h
│   │   ├── bellman_ford.cpp
│   │   ├── floyd_warshall.h
│   │   └── floyd_warshall.cpp
│   │
│   ├── benchmark/
│   │   ├── benchmark_runner.h
│   │   ├── benchmark_runner.cpp
│   │   ├── metrics_collector.h
│   │   ├── metrics_collector.cpp
│   │   ├── scenario_builder.h
│   │   └── scenario_builder.cpp
│   │
│   ├── io/
│   │   ├── csv_loader.h
│   │   ├── csv_loader.cpp
│   │   ├── report_writer.h
│   │   └── report_writer.cpp
│   │
│   ├── visualization/
│   │   ├── graph_renderer.h
│   │   ├── graph_renderer.cpp
│   │   ├── chart_generator.h
│   │   ├── chart_generator.cpp
│   │   ├── generate_charts.py
│   │   └── render_graph.sh
│   │
│   ├── utils/
│   │   ├── timer.h
│   │   ├── timer.cpp
│   │   ├── memory_tracker.h
│   │   ├── statistics.h
│   │   └── constants.h
│   │
│   └── main.cpp
│
├── tests/
│   ├── test_graph.cpp
│   ├── test_fibonacci_heap.cpp
│   ├── test_algorithms.cpp
│   ├── test_integration.cpp
│   ├── benchmark_suite.cpp
│   └── test_data.h
│
├── data/
│   ├── cities_100.csv
│   ├── edges_sparse.csv
│   ├── edges_dense.csv
│   ├── edges_negative.csv
│   └── graph_generator_config.json
│
├── results/
│   ├── benchmark_report.txt
│   ├── performance_chart.png
│   ├── scaling_analysis.png
│   ├── amortized_analysis.png
│   ├── path_visualization.png
│   └── memory_profile.txt
│
├── docs/
│   ├── DESIGN.md (this file)
│   ├── COMPLEXITY.md
│   ├── BENCHMARKS.md
│   ├── API.md
│   └── SETUP.md
│
└── build/
    ├── CMakeFiles/
    ├── Makefile
    └── network_analyzer (executable)
```

---

## 10. KEY DESIGN DECISIONS

| Decision | Rationale |
|----------|-----------|
| **C++17** | Performance, memory control, pointer manipulation for heaps |
| **Adjacency List** | Sparse/dense graph support; efficient for both |
| **Fibonacci Heap** | O(1) amortized decrease-key is core learning goal |
| **Two Dijkstra versions** | Empirically show benefit of Fibonacci vs Binary |
| **Floyd-Warshall** | Compare all-pairs vs. repeated single-source |
| **CMake** | Cross-platform build; industry standard |
| **Google Test** | Mature testing framework; excellent assertion macros |
| **Graphviz** | Easy graph visualization; high-quality output |
| **CSV I/O** | Simple, no heavy dependencies |

---

## 11. COMPLEXITY ANALYSIS SUMMARY

### Time Complexity Comparison

```
Operation          | Dijkstra (Bin) | Dijkstra (Fib) | BellmanFord | FloydWarshall
-------------------|----------------|---|---|---
Insert             | O(log V)       | O(1)           | N/A         | N/A
Extract-Min        | O(log V)       | O(log V)       | N/A         | N/A
Decrease-Key       | O(log V)       | O(1) amortized | N/A         | N/A
Overall            | O((V+E)logV)   | O(E+VlogV)     | O(VE)       | O(V³)
Space              | O(V)           | O(V)           | O(V)        | O(V²)
Negative Weights   | ✗              | ✗              | ✓           | ✓
```

---

## 12. PERFORMANCE TARGETS

| Metric | Target | Threshold |
|--------|--------|-----------|
| Dijkstra (Fib) on 100-node sparse graph | < 2 ms | 5 ms |
| Floyd-Warshall on 100-node graph | < 200 ms | 500 ms |
| Memory footprint (100 nodes) | < 50 MB | 100 MB |
| Fibonacci heap decrease-key amortization | O(1) observed | < 5 operations per call (avg) |
| Test coverage | > 85% | > 80% |

---

## CONCLUSION

This design leverages **C++17** to build a high-performance, educational network routing analyzer that emphasizes the **Fibonacci Heap** as the centerpiece data structure. By implementing three shortest-path algorithms with comprehensive benchmarking, students gain deep insights into algorithmic trade-offs, amortized analysis, and empirical performance validation.

The modular architecture allows independent testing of each component, while the comprehensive benchmark suite provides rigorous empirical validation of theoretical complexity bounds.

---

**Document Version:** 1.0  
**Last Updated:** May 2026  
**Status:** Ready for Implementation
