CC = clang++
CFLAGS = -std=c++17 -Iinclude -Wall -g

# Find all source files except main.cpp
SRC_FILES = $(filter-out src/main.cpp, $(wildcard src/*.cpp))

all: NetworkRoutingAnalyzer test

NetworkRoutingAnalyzer: src/main.cpp $(SRC_FILES)
	$(CC) $(CFLAGS) $^ -o build/$@

# Test targets
build/test_graph: tests/test_graph.cpp $(SRC_FILES)
	@mkdir -p build
	$(CC) $(CFLAGS) $^ -o $@

build/test_fibonacci: tests/test_fibonacci.cpp $(SRC_FILES)
	@mkdir -p build
	$(CC) $(CFLAGS) $^ -o $@

build/test_dijkstra: tests/test_dijkstra.cpp $(SRC_FILES)
	@mkdir -p build
	$(CC) $(CFLAGS) $^ -o $@

build/test_bellman_ford: tests/test_bellman_ford.cpp $(SRC_FILES)
	@mkdir -p build
	$(CC) $(CFLAGS) $^ -o $@

build/test_floyd_warshall: tests/test_floyd_warshall.cpp $(SRC_FILES)
	@mkdir -p build
	$(CC) $(CFLAGS) $^ -o $@

test: build/test_graph build/test_fibonacci build/test_dijkstra build/test_bellman_ford build/test_floyd_warshall
	@echo "--- Running test_graph ---"
	@./build/test_graph
	@echo "--- Running test_fibonacci ---"
	@./build/test_fibonacci
	@echo "--- Running test_dijkstra ---"
	@./build/test_dijkstra
	@echo "--- Running test_bellman_ford ---"
	@./build/test_bellman_ford
	@echo "--- Running test_floyd_warshall ---"
	@./build/test_floyd_warshall

clean:
	rm -rf build/* NetworkRoutingAnalyzer
