# PROJECT REQUIREMENTS DOCUMENT (PRD)
## Network Routing Analyzer
**Project 3 — Advanced Data Structures & Algorithms**

---

## 1. EXECUTIVE SUMMARY

The **Network Routing Analyzer** is an educational software project that simulates a network router by implementing and comparing three fundamental shortest-path algorithms. The system will load and analyze a graph of 100+ cities/nodes, compute shortest paths using **Dijkstra's Algorithm** (with Fibonacci Heap optimization), **Bellman-Ford Algorithm** (for negative-weight edges), and **Floyd-Warshall Algorithm** (for all-pairs shortest paths). 

The project emphasizes empirical performance analysis to demonstrate the trade-offs between algorithm complexity, data structure choices, and real-world applicability in sparse vs. dense network topologies.

**Difficulty Level:** Very High  
**Target Audience:** Students confident in graph theory and heap internals  
**Expected Duration:** 4–6 weeks

---

## 2. OBJECTIVES & LEARNING OUTCOMES

### Primary Objectives
1. **Implement three distinct shortest-path algorithms** with full correctness verification
2. **Engineer a Fibonacci Heap** from scratch with all required operations
3. **Design a comprehensive empirical benchmark suite** to compare algorithms
4. **Demonstrate algorithmic trade-offs** on real and synthetic network topologies
5. **Create a visual/interactive interface** to explore routing results

### Learning Outcomes
By completing this project, students will:
- Master **heap data structures** and understand amortized analysis
- Deepen **graph algorithm understanding** through implementation and empirical testing
- Gain proficiency in **performance benchmarking** and algorithm analysis
- Apply **software engineering best practices** (modular design, testing, documentation)
- Appreciate the **practical constraints** that influence algorithm selection in real systems

---

## 3. FUNCTIONAL REQUIREMENTS

### 3.1 Core System Components

#### 3.1.1 Graph Data Structure
- **Node Representation:**
  - Unique identifier (ID: 0–N)
  - Label (city name)
  - Optional metadata (coordinates for visualization, population, etc.)

- **Edge Representation:**
  - Source and destination nodes
  - Weight (distance/latency/cost)
  - Support for **weighted directed graphs**
  - Support for **negative weights** (for Bellman-Ford testing)

- **Graph Variants:**
  - **Sparse graph:** ~100 cities, ~150–200 edges (realistic routing networks)
  - **Dense graph:** ~100 cities, ~3000+ edges (fully connected scenarios)
  - **Negative-weight graph:** Mixed positive/negative weights (test Bellman-Ford)

#### 3.1.2 Fibonacci Heap Implementation
Complete, production-grade implementation with:

- **Operations Required:**
  - `insert(key, value)` — Insert element, O(1) amortized
  - `extract_min()` — Remove minimum element, O(log n) amortized
  - `decrease_key(node, new_key)` — Decrease key value, **O(1) amortized**
  - `cascading_cut()` — Cascade cuts for rebalancing (internal)
  - `mark_node()` — Node marking for cascading-cut optimization (internal)

- **Data Structure Details:**
  - Circular doubly-linked list for root list
  - Child list for each node (doubly-linked, circular)
  - Tracking of minimum pointer
  - Degree tracking and consolidation mechanism

- **Testing Requirements:**
  - Unit tests for each operation
  - Empirical validation of O(1) amortized decrease-key
  - Memory footprint analysis
  - Comparison against binary heap on decrease-key operations

#### 3.1.3 Dijkstra's Algorithm (Single-Source Shortest Path)
- **Version 1: With Binary Heap**
  - Time Complexity: O((V + E) log V)
  - Baseline implementation for comparison

- **Version 2: With Fibonacci Heap**
  - Time Complexity: O(E + V log V)
  - Demonstrates practical benefit of Fibonacci heap's O(1) decrease-key
  - Should outperform binary heap on graphs with high update frequency

- **Constraints:**
  - No negative edge weights
  - Handles both sparse and dense graphs efficiently

#### 3.1.4 Bellman-Ford Algorithm (Handles Negative Edges)
- **Capabilities:**
  - Detects negative-weight cycles
  - Computes single-source shortest paths
  - Time Complexity: O(V × E)
  - Slower than Dijkstra but necessary for negative weights

- **Features:**
  - Return flag for negative cycle detection
  - Detailed path reconstruction
  - Relaxation iteration logging (optional)

#### 3.1.5 Floyd-Warshall Algorithm (All-Pairs Shortest Paths)
- **Purpose:**
  - Compute shortest paths between **all pairs of vertices**
  - Returns distance matrix and next-vertex matrix for path reconstruction

- **DP Table Structure:**
  - `dist[i][j]` — Shortest distance from vertex i to vertex j
  - `next[i][j]` — Next vertex on shortest path from i to j
  - Intermediate vertex k across all iterations

- **Time Complexity:** O(V³)
- **Space Complexity:** O(V²)

- **Optimizations (optional):**
  - Early termination if no improvements
  - Space-optimized variant (single array)

---

### 3.2 Data Loading & Graph Generation

#### 3.2.1 Input Formats
- **CSV Format:**
  ```
  NodeID,NodeName,Latitude,Longitude
  0,Mumbai,19.0760,72.8777
  1,Delhi,28.7041,77.1025
  ...
  ```

- **Edge List Format:**
  ```
  Source,Destination,Weight
  0,1,1400
  1,2,800
  ...
  ```

#### 3.2.2 Synthetic Graph Generation
- **Sparse Random Graph:** Erdős-Rényi model (edge probability p ≈ 0.02)
- **Dense Random Graph:** Complete/near-complete graphs
- **Real-World Topology:** Use actual city data (100+ major cities globally)
- **Negative-Weight Graph:** Insert 5–10% negative edges with bounds validation

---

### 3.3 Algorithm Analysis & Benchmarking

#### 3.3.1 Performance Metrics
For each algorithm and graph variant, measure and report:

1. **Execution Time**
   - Wall-clock time (milliseconds/microseconds)
   - CPU cycles (if profiler available)

2. **Memory Usage**
   - Peak heap allocation
   - Data structure overhead (Fibonacci heap vs binary heap)

3. **Operation Counts**
   - Number of heap operations (insert, decrease-key, extract-min)
   - Number of edge relaxations (Bellman-Ford)
   - Comparison operations

4. **Empirical vs. Theoretical**
   - Validate O(1) amortized decrease-key for Fibonacci heap
   - Measure constant factors and hidden complexity

#### 3.3.2 Test Scenarios
- **Scenario 1:** Sparse graph (100 nodes, ~150 edges)
  - Run Dijkstra (binary), Dijkstra (Fibonacci), Bellman-Ford
  - Expected: Dijkstra variants near-identical; Bellman-Ford slower

- **Scenario 2:** Dense graph (100 nodes, ~3000+ edges)
  - Run Dijkstra variants, compare heap operations
  - Expected: Fibonacci heap shows advantage

- **Scenario 3:** Negative-weight graph
  - Run Bellman-Ford; verify negative cycle detection
  - Compare Bellman-Ford vs Dijkstra (on subgraph without negatives)

- **Scenario 4:** All-pairs shortest paths
  - Run Floyd-Warshall; compare execution vs. running Dijkstra V times
  - Show when Floyd-Warshall is more efficient

- **Scenario 5:** Scaling analysis
  - Graphs with 50, 100, 200, 500 nodes
  - Plot execution time vs. graph size
  - Empirically validate algorithmic complexity

---

### 3.4 Output & Visualization

#### 3.4.1 Textual Output
- **Shortest Path Report:**
  ```
  Algorithm: Dijkstra (Fibonacci Heap)
  Source: Mumbai (0)
  Destination: Berlin (45)
  Distance: 7234.5 km
  Path: Mumbai -> Delhi -> Amritsar -> ... -> Berlin
  Execution Time: 2.34 ms
  Heap Operations: 142 insert, 43 decrease-key, 89 extract-min
  ```

- **Comparison Table:**
  ```
  ┌────────────────────────┬──────────┬──────────┬─────────────┐
  │ Algorithm              │ Time(ms) │ Memory MB│ Heap Ops    │
  ├────────────────────────┼──────────┼──────────┼─────────────┤
  │ Dijkstra (Binary Heap) │ 3.45     │ 2.1      │ 245         │
  │ Dijkstra (Fib. Heap)   │ 2.12     │ 2.8      │ 242 (fewer) │
  │ Bellman-Ford           │ 45.67    │ 1.5      │ N/A         │
  │ Floyd-Warshall         │ 234.5    │ 78.0     │ N/A         │
  └────────────────────────┴──────────┴──────────┴─────────────┘
  ```

#### 3.4.2 Visual Output (Interactive or PNG/SVG)
- **Graph Visualization:**
  - Node layout (spring-force, circular, or geographic)
  - Highlight shortest path(s) in bold/colored edges
  - Display edge weights

- **Performance Charts:**
  - Bar chart: Execution time comparison across algorithms
  - Line graph: Scaling (nodes vs. time) for each algorithm
  - Scatter plot: Heap operations vs. edge count
  - Heatmap: Floyd-Warshall distance matrix

- **Empirical Analysis Chart:**
  - Decrease-key operation count vs. expected O(1) behavior
  - Amortized cost curve for Fibonacci heap

---

## 4. NON-FUNCTIONAL REQUIREMENTS

### 4.1 Code Quality
- **Language:** C++, Python, or Java (C++ preferred for performance)
- **Code Organization:**
  - Separate modules for each algorithm
  - Dedicated heap implementation
  - Graph utility functions
  - Test suite with 50+ test cases
- **Documentation:**
  - Inline comments explaining complex logic (especially Fibonacci heap)
  - README with setup, build, and usage instructions
  - Algorithm pseudocode in docs
  - Complexity analysis document

### 4.2 Testing & Validation
- **Unit Tests:**
  - Test each heap operation individually
  - Verify algorithm correctness on small, known graphs
  - Negative-cycle detection for Bellman-Ford
  - Path reconstruction accuracy

- **Integration Tests:**
  - Run all three algorithms on same graph; cross-validate results
  - Ensure path costs match (within floating-point tolerance)

- **Performance Tests:**
  - Benchmark on graphs of various sizes and densities
  - Repeat runs for statistical significance

- **Edge Cases:**
  - Single-node graph
  - Disconnected components
  - Self-loops (if applicable)
  - Very large weights (overflow testing)

### 4.3 Performance Targets
- **Dijkstra (Fibonacci) on 100-node sparse graph:** < 5 ms
- **Floyd-Warshall on 100-node graph:** < 500 ms
- **Memory footprint:** < 100 MB for 100-node graph

### 4.4 Documentation
- **README.md:** Quick start guide
- **DESIGN.md:** Architecture, module descriptions, data structure details
- **COMPLEXITY.md:** Big-O analysis, proof of Fibonacci heap amortization
- **BENCHMARKS.md:** Raw benchmark results, interpretation, conclusions
- **API.md:** Function signatures, parameter descriptions, return values

---

## 5. MANDATORY DATA STRUCTURES & ALGORITHMS

### 5.1 Must-Implement
| Component | Requirement | Notes |
|-----------|-------------|-------|
| **Fibonacci Heap** | Full implementation with all ops | O(1) amortized decrease-key is critical |
| **Floyd-Warshall DP** | All-pairs shortest paths | O(V³) time, O(V²) space DP table |
| **Dijkstra** | Two versions: binary & Fibonacci | Compare performance empirically |
| **Bellman-Ford** | Single-source, negative edges | Cycle detection required |

### 5.2 Supporting Structures
- Directed weighted graph (adjacency list)
- Priority queue (binary heap as baseline)
- Simple path tracking (parent pointers or edge list)

---

## 6. DELIVERABLES CHECKLIST

### Phase 1: Core Implementation (Week 1–2)
- [ ] Graph data structure + I/O (CSV parsing)
- [ ] Binary heap implementation
- [ ] Dijkstra's algorithm (binary heap version)
- [ ] Basic test suite (10+ tests)

### Phase 2: Advanced Data Structures (Week 3)
- [ ] Fibonacci heap implementation (complete)
- [ ] Dijkstra's algorithm (Fibonacci heap version)
- [ ] Comparative testing framework
- [ ] Unit tests for Fibonacci heap (20+ tests)

### Phase 3: Additional Algorithms (Week 3–4)
- [ ] Bellman-Ford implementation
- [ ] Floyd-Warshall implementation
- [ ] Negative-weight graph generation
- [ ] Cycle detection verification

### Phase 4: Benchmarking & Analysis (Week 4–5)
- [ ] Benchmark suite (5 test scenarios)
- [ ] Performance profiling tools
- [ ] Statistical analysis (average, std dev)
- [ ] Empirical vs. theoretical complexity curves

### Phase 5: Visualization & Documentation (Week 5–6)
- [ ] Graph visualization module
- [ ] Performance comparison charts
- [ ] README + API documentation
- [ ] Design document with proofs
- [ ] Benchmark report + interpretation

### Final Deliverables
```
project/
├── README.md
├── DESIGN.md
├── COMPLEXITY.md
├── BENCHMARKS.md
├── API.md
├── src/
│   ├── graph.cpp/py
│   ├── fibonacci_heap.cpp/py
│   ├── dijkstra.cpp/py
│   ├── bellman_ford.cpp/py
│   ├── floyd_warshall.cpp/py
│   └── main.cpp/py
├── tests/
│   ├── test_graph.cpp/py
│   ├── test_fibonacci_heap.cpp/py
│   ├── test_algorithms.cpp/py
│   └── test_benchmarks.cpp/py
├── data/
│   ├── cities_100.csv
│   ├── edges_sparse.csv
│   ├── edges_dense.csv
│   └── edges_negative.csv
├── results/
│   ├── performance_report.txt
│   ├── benchmark_chart.png
│   ├── scaling_graph.png
│   ├── path_visualization.png
│   └── amortized_analysis.png
└── build/ (or __pycache__ for Python)
```

---

## 7. TECHNICAL SPECIFICATIONS

### 7.1 Fibonacci Heap Operations

#### Insert(key, value)
```
Time: O(1) amortized
Space: O(1)
- Create new node with (key, value)
- Add to root list
- Update min pointer if necessary
```

#### Extract-Min()
```
Time: O(log n) amortized
Space: O(1)
- Remove min element from root list
- Add all children to root list
- Consolidate roots by degree
- Update min pointer
```

#### Decrease-Key(node, new_key)
```
Time: O(1) amortized ← KEY OPTIMIZATION
Space: O(1)
- Update node key
- If heap property violated, cut node from parent
- Add cut node to root list
- If parent was already cut, recursively cut parent (cascading cut)
```

#### Supporting: Consolidate()
```
Time: O(log n) amortized
- Iterate through root list
- Merge roots of same degree
- Maintain single root per degree
```

### 7.2 Floyd-Warshall DP Formulation
```
Base Case:
  dist[i][j] = weight(i, j) if edge exists
  dist[i][i] = 0
  dist[i][j] = ∞ otherwise

Recurrence:
  For k = 0 to V-1:
    For i = 0 to V-1:
      For j = 0 to V-1:
        dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])

Path Reconstruction:
  next[i][j] tracks the next vertex on shortest path
```

### 7.3 Algorithm Complexity Summary

| Algorithm | Time | Space | Notes |
|-----------|------|-------|-------|
| **Dijkstra (Binary Heap)** | O((V+E) log V) | O(V) | No negative weights |
| **Dijkstra (Fibonacci Heap)** | O(E + V log V) | O(V) | Same, with better decrease-key |
| **Bellman-Ford** | O(V × E) | O(V) | Handles negatives; detects cycles |
| **Floyd-Warshall** | O(V³) | O(V²) | All-pairs; simpler than V×Dijkstra for dense |

---

## 8. ACCEPTANCE CRITERIA

### Correctness
- [ ] All three algorithms produce correct shortest paths on sample graphs
- [ ] Results match reference implementations (e.g., NetworkX, Boost)
- [ ] Negative cycle detection works correctly in Bellman-Ford
- [ ] Path reconstruction is accurate

### Performance
- [ ] Fibonacci heap decrease-key empirically shows O(1) amortized behavior
- [ ] Dijkstra (Fib) outperforms Dijkstra (Binary) on dense graphs
- [ ] Floyd-Warshall is feasible on 100-node graphs (< 1 second)
- [ ] Benchmark results are reproducible (CV < 5%)

### Code Quality
- [ ] No memory leaks (verified with valgrind/sanitizers)
- [ ] All public functions documented
- [ ] Test coverage > 80%
- [ ] Code follows consistent style guide

### Documentation
- [ ] README is clear and complete
- [ ] DESIGN.md explains all algorithms and data structures
- [ ] COMPLEXITY.md includes proofs of amortized analysis
- [ ] Benchmark report interprets results and draws conclusions

---

## 9. MILESTONES & TIMELINE

| Week | Milestone | Deliverable |
|------|-----------|-------------|
| 1–2 | Core Implementation | Dijkstra (binary), graph I/O, basic tests |
| 3 | Advanced Structures | Fibonacci heap, Dijkstra (Fib), heap tests |
| 3–4 | Extended Algorithms | Bellman-Ford, Floyd-Warshall, cycle tests |
| 4–5 | Benchmarking | Benchmark suite, performance analysis |
| 5–6 | Polish & Documentation | Visualization, final reports, all docs |
| 6 | Final Submission | Complete project package |

---

## 10. RISK MITIGATION

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Fibonacci heap complexity | High | Start with detailed pseudocode; test incrementally |
| Performance measurement variance | Medium | Run tests multiple times; use statistical tools |
| Large graph visualization | Medium | Limit initial visualization to < 50 nodes; use sampling |
| Floating-point precision | Low | Use fixed precision (e.g., 2 decimal places) for distances |
| Negative cycle ambiguity | Low | Document handling clearly; test thoroughly |

---

## 11. SUCCESS METRICS

### Technical
- All algorithms implemented and correct ✓
- Fibonacci heap achieves O(1) amortized decrease-key ✓
- Benchmark suite runs without errors ✓
- Documentation complete and clear ✓

### Educational
- Student demonstrates understanding of amortized analysis ✓
- Student can explain algorithm trade-offs ✓
- Student profiles and optimizes code ✓
- Student interprets benchmark results insightfully ✓

---

## 12. APPENDIX: SAMPLE TEST DATA

### Tiny Graph (5 nodes, 7 edges)
```
Nodes: A(0), B(1), C(2), D(3), E(4)
Edges:
  A → B (4)
  A → C (2)
  B → C (1)
  B → D (5)
  C → D (8)
  C → E (10)
  D → E (2)

Expected: Shortest path A → E = 13 (A → C → D → E)
```

### Negative-Weight Test Graph
```
Nodes: A(0), B(1), C(2)
Edges:
  A → B (1)
  B → C (3)
  C → A (-5)

Expected: Negative cycle A → B → C → A (cost -1); Bellman-Ford detects
```

---

## CONCLUSION

The Network Routing Analyzer project provides a comprehensive platform to study, implement, and analyze fundamental shortest-path algorithms. By implementing both classic and advanced data structures (especially the Fibonacci Heap), students will gain deep insights into algorithm design, performance trade-offs, and empirical validation. The project bridges theory and practice, preparing students for real-world systems that rely on these algorithms.

---

**Document Version:** 1.0  
**Last Updated:** May 2026  
**Author:** ADSA Project Team  
**Status:** Approved for Implementation
