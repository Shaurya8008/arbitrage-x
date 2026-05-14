# Network Routing Analyzer — Tech Stack

## 📌 Project Overview
A high-performance network routing simulator that analyzes shortest path algorithms on sparse and dense graphs using:
- Dijkstra Algorithm (with Fibonacci Heap)
- Bellman-Ford Algorithm
- Floyd-Warshall Algorithm

The project demonstrates:
- Time complexity comparison
- Memory usage analysis
- Sparse vs Dense graph performance
- Fibonacci Heap amortized efficiency

---

# 🖥️ Recommended Tech Stack

## 1. Programming Language
### ✅ C++
Best choice for Advanced DSA projects because:
- Fast execution speed
- STL support
- Pointer-level heap implementation
- Better control over memory
- Ideal for graph algorithms

### Recommended Standard
```bash
C++17
```

---

# 2. Core Data Structures

## Graph Representation
### Adjacency List
Used for:
- Dijkstra
- Bellman-Ford

Why?
- Efficient for sparse graphs
- Lower memory usage

```cpp
vector<vector<pair<int,int>>> graph;
```

---

## Adjacency Matrix
Used for:
- Floyd-Warshall

Why?
- Easier DP table computation
- Faster all-pairs traversal

```cpp
vector<vector<int>> dist;
```

---

# 3. Mandatory Advanced Data Structure

## Fibonacci Heap
### Full Operations Required
- Insert
- Extract-Min
- Decrease-Key
- Merge
- Cascading Cut
- Consolidation

### Why Fibonacci Heap?
Improves Dijkstra complexity:

Normal Priority Queue:
```text
O((V + E) log V)
```

Fibonacci Heap:
```text
O(E + V log V)
```

### Key Concepts
- Circular doubly linked list
- Lazy merging
- Amortized analysis
- Marked nodes
- Degree table

---

# 4. Algorithms Used

## Dijkstra Algorithm
### Purpose
Shortest path for:
- Positive weighted graphs

### Complexity
O(E + V log V)

---

## Bellman-Ford Algorithm
### Purpose
- Handles negative edges
- Detects negative cycles

### Complexity
O(VE)

---

## Floyd-Warshall Algorithm
### Purpose
- All-pairs shortest path
- Dense graph analysis

### Complexity
O(V^3)

### Core DP Relation
dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])

---

# 5. Performance Analysis Tools

## Benchmarking
Use:
```cpp
#include <chrono>
```

Metrics:
- Execution time
- Heap operations count
- Decrease-key frequency
- Memory usage

---

# 6. Graph Dataset

## Recommended Dataset Sources
- OpenStreetMap
- SNAP Stanford Graph Dataset
- Random graph generator

### Graph Size
Minimum:
```text
100+ nodes
500–5000 edges
```

### Types
- Sparse graphs
- Dense graphs
- Negative weighted graphs

---

# 7. Visualization (Optional but Highly Recommended)

## Graph Visualization
### Option 1: Graphviz
Generate routing graphs visually.

### Option 2: Python + Matplotlib
Use for:
- Time complexity charts
- Heap operation comparison

---

# 8. UI / Interface

## Recommended
### Console-Based CLI
Simple and ideal for DSA projects.

Features:
- Select algorithm
- Load graph
- Compare runtimes
- Display shortest path
- Generate reports

---

# 9. File Handling

## Input Format
```txt
source destination weight
```

Example:
```txt
0 1 4
0 2 3
1 3 2
```

---

# 10. Development Tools

## IDE
- VS Code
- CLion
- Code::Blocks

## Compiler
```bash
g++ -std=c++17
```

---

# 11. Version Control

## Git + GitHub
Why?
- Track heap implementation stages
- Store datasets
- Showcase project professionally

Recommended structure:
```text
/src
/include
/datasets
/results
/docs
```

---

# 12. Testing Strategy

## Unit Testing
Test separately:
- Fibonacci Heap operations
- Graph loading
- Relaxation steps
- Negative cycle detection

---

# 13. Suggested Libraries

## C++ STL
```cpp
vector
queue
unordered_map
set
chrono
fstream
iomanip
```

---

# 14. Project Architecture

```text
NetworkRoutingAnalyzer/
│
├── src/
│   ├── main.cpp
│   ├── graph.cpp
│   ├── fibonacci_heap.cpp
│   ├── dijkstra.cpp
│   ├── bellman_ford.cpp
│   └── floyd_warshall.cpp
│
├── include/
│   ├── graph.h
│   ├── fibonacci_heap.h
│   └── algorithms.h
│
├── datasets/
│
├── results/
│
└── README.md
```

---

# 15. Recommended Features

## Basic Features
✅ Load graph from file  
✅ Run all 3 algorithms  
✅ Compare execution times  
✅ Print shortest path  

## Advanced Features
✅ Dense vs sparse analysis  
✅ Negative cycle detection  
✅ Fibonacci heap visualization  
✅ Performance graphs  
✅ Random graph generation  

---

# 16. Expected Learning Outcomes

By completing this project you will understand:
- Advanced heap internals
- Amortized analysis
- Graph theory
- Dynamic programming
- Routing systems
- Performance benchmarking
- Sparse vs dense graph optimization

---

# 17. Best Tech Stack Summary

| Component | Technology |
|---|---|
| Language | C++17 |
| Graph Storage | Adjacency List + Matrix |
| Heap | Custom Fibonacci Heap |
| Algorithms | Dijkstra, Bellman-Ford, Floyd-Warshall |
| Visualization | Graphviz / Python |
| Benchmarking | chrono |
| Dataset | SNAP / OpenStreetMap |
| Version Control | GitHub |
| IDE | VS Code / CLion |

---

# 18. Why This Stack is Best

This stack is ideal because:
- C++ gives maximum algorithmic performance
- Manual Fibonacci Heap implementation demonstrates deep DSA knowledge
- Easy benchmarking and complexity analysis
- Industry-level graph processing concepts
- Strong resume + viva project

---

# 🚀 Production Upgrade: ArbitrageX (Full-Stack)

The project has been upgraded to a production-ready, full-stack arbitrage platform.

### Modern Full-Stack Extensions
- **Backend API**: Node.js (Express) acting as a gateway to the C++ engine.
- **Frontend**: React 18 (Vite) with a premium dark-themed dashboard.
- **Database**: Serverless Neon PostgreSQL for cloud persistence.
- **ORM**: Drizzle ORM for type-safe database migrations and queries.
- **Auth**: Real-world authentication schema compatible with Better-Auth.
- **Docker**: Multi-stage containerization for seamless cloud deployment.

### Live Market Integration
- **Real-Time Rates**: Integrates with Frankfurter (Fiat) and CoinGecko (Crypto) APIs.
- **Engine Logic**: The C++ Bellman-Ford algorithm analyzes live rates fetched via the API gateway.
- **Cloud Persistence**: Simulation results and user-specific trades are saved directly to the Neon DB.

### Deployment Guide
1. **Environment**: Ensure `DATABASE_URL` is set in `.env`.
2. **Build & Run**:
   ```bash
   docker-compose up --build
   ```
3. **Access**: Navigate to `http://localhost:3001`.
