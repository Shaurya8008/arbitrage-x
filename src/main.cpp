#include <iostream>
#include <chrono>
#include <iomanip>
#include <fstream>
#include <string>
#include <vector>
#include "graph.h"
#include "algorithms.h"

using namespace std;

void run_arbitrage_json(const std::string& rates_file = "");

void run_benchmark_1() {
    cout << "\n--- Scenario 1: Sparse Graph (Erdős-Rényi, p=0.05) ---" << endl;
    int n = 1000;
    auto g = Graph::generate_sparse(n, 0.05);
    cout << "Graph size: " << n << " nodes." << endl;

    auto res_bin = dijkstra_binary(g, 0);
    cout << "Dijkstra (Binary Heap):    " << fixed << setprecision(3) << res_bin.execution_time_ms << " ms" << endl;

    auto res_fib = dijkstra_fibonacci(g, 0);
    cout << "Dijkstra (Fibonacci Heap): " << fixed << setprecision(3) << res_fib.execution_time_ms << " ms" << endl;
    
    bool hc;
    auto res_bf = bellman_ford(g, 0, hc);
    cout << "Bellman-Ford:              " << fixed << setprecision(3) << res_bf.execution_time_ms << " ms" << endl;
}

void run_benchmark_2() {
    cout << "\n--- Scenario 2: Dense Graph (100% connectivity) ---" << endl;
    int n = 500; // Smaller n because V^2 edges
    auto g = Graph::generate_dense(n);
    cout << "Graph size: " << n << " nodes." << endl;

    auto res_bin = dijkstra_binary(g, 0);
    cout << "Dijkstra (Binary Heap):    " << fixed << setprecision(3) << res_bin.execution_time_ms << " ms" << endl;

    auto res_fib = dijkstra_fibonacci(g, 0);
    cout << "Dijkstra (Fibonacci Heap): " << fixed << setprecision(3) << res_fib.execution_time_ms << " ms" << endl;
}

void run_negative_cycle_demo() {
    cout << "\n--- Scenario 3: Negative-Weight Graph ---" << endl;
    int n = 500;
    auto g = Graph::generate_negative_weight(n, 0.1);
    cout << "Graph size: " << n << " nodes." << endl;

    bool hc;
    auto res_bf = bellman_ford(g, 0, hc);
    cout << "Bellman-Ford:              " << fixed << setprecision(3) << res_bf.execution_time_ms << " ms" << endl;
    cout << "Negative Cycle Detected?   " << (hc ? "Yes" : "No") << endl;
}

void run_all_pairs_demo() {
    cout << "\n--- Scenario 4: All-Pairs Shortest Paths ---" << endl;
    int n = 200;
    auto g = Graph::generate_dense(n);
    cout << "Graph size: " << n << " nodes." << endl;

    auto res_fw = floyd_warshall(g);
    cout << "Floyd-Warshall (O(V^3)):   " << fixed << setprecision(3) << res_fw.execution_time_ms << " ms" << endl;
    
    // Compare with V runs of Bellman-Ford
    auto start = std::chrono::high_resolution_clock::now();
    bool hc;
    for (int i = 0; i < n; ++i) {
        bellman_ford(g, i, hc);
    }
    auto end = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double, std::milli> elapsed = end - start;
    cout << "Bellman-Ford (V runs):     " << fixed << setprecision(3) << elapsed.count() << " ms" << endl;
}

void run_benchmark_5() {
    cout << "\n--- Scenario 5: Scaling Tests (Exporting to CSV) ---" << endl;
    ofstream out("results/scaling_results.csv");
    out << "Nodes,Dijkstra_Binary,Dijkstra_Fibonacci,Bellman_Ford\n";
    
    vector<int> sizes = {100, 200, 500, 1000, 2000};
    for (int n : sizes) {
        auto g = Graph::generate_sparse(n, 0.05);
        auto res_bin = dijkstra_binary(g, 0);
        auto res_fib = dijkstra_fibonacci(g, 0);
        bool hc;
        auto res_bf = bellman_ford(g, 0, hc);
        
        out << n << "," << res_bin.execution_time_ms << "," 
            << res_fib.execution_time_ms << "," << res_bf.execution_time_ms << "\n";
        cout << "Completed benchmark for N=" << n << endl;
    }
    out.close();
    cout << "Results saved to results/scaling_results.csv" << endl;
}

int main(int argc, char* argv[]) {
    if (argc > 1 && string(argv[1]) == "--arbitrage-json") {
        std::string rates_file = "";
        if (argc > 3 && string(argv[2]) == "--rates-file") {
            rates_file = argv[3];
        }
        run_arbitrage_json(rates_file);
        return 0;
    }

    system("mkdir -p results");
    int choice = 0;
    while (choice != 6) {
        cout << "\n============================================\n";
        cout << "       Network Routing Analyzer CLI\n";
        cout << "============================================\n";
        cout << "1. Run Benchmark 1: Sparse Graph Performance\n";
        cout << "2. Run Benchmark 2: Dense Graph Performance\n";
        cout << "3. Run Benchmark 3: Negative Weights & Cycles\n";
        cout << "4. Run Benchmark 4: All-Pairs Shortest Paths\n";
        cout << "5. Run Benchmark 5: Scaling Tests (Export CSV)\n";
        cout << "6. Exit\n";
        cout << "Select an option: ";
        
        if (!(cin >> choice)) break;

        switch (choice) {
            case 1: run_benchmark_1(); break;
            case 2: run_benchmark_2(); break;
            case 3: run_negative_cycle_demo(); break;
            case 4: run_all_pairs_demo(); break;
            case 5: run_benchmark_5(); break;
            case 6: cout << "Exiting..." << endl; break;
            default: cout << "Invalid choice." << endl;
        }
    }
    return 0;
}

// Simple helper to read entire file into string
static std::string read_file_contents(const std::string& path) {
    std::ifstream f(path);
    if (!f.is_open()) return "";
    std::string content((std::istreambuf_iterator<char>(f)), std::istreambuf_iterator<char>());
    return content;
}

// Minimal JSON number parser - extracts doubles from a flat array string like "[1.0, 2.0, 3.0]"
static std::vector<double> parse_json_array(const std::string& s) {
    std::vector<double> result;
    std::string num;
    for (char c : s) {
        if (c == '[' || c == ']' || c == ' ' || c == '\n' || c == '\r' || c == '\t') continue;
        if (c == ',') {
            if (!num.empty()) { result.push_back(std::stod(num)); num.clear(); }
        } else {
            num += c;
        }
    }
    if (!num.empty()) result.push_back(std::stod(num));
    return result;
}

// Parse a JSON string array like ["USD", "EUR"]
static std::vector<std::string> parse_json_string_array(const std::string& s) {
    std::vector<std::string> result;
    std::string current;
    bool in_str = false;
    for (char c : s) {
        if (c == '"') {
            if (in_str) { result.push_back(current); current.clear(); }
            in_str = !in_str;
        } else if (in_str) {
            current += c;
        }
    }
    return result;
}

void run_arbitrage_json(const std::string& rates_file) {
    std::vector<std::string> currency_names;
    int V;
    std::vector<std::vector<double>> rates;

    if (!rates_file.empty()) {
        // ---- Read real rates from file ----
        std::string json = read_file_contents(rates_file);
        if (json.empty()) {
            std::cerr << "Error: Cannot read rates file: " << rates_file << std::endl;
            std::cout << "{\"status\": \"error\", \"message\": \"Cannot read rates file\"}\n";
            return;
        }

        // Parse currencies array
        size_t cur_pos = json.find("\"currencies\"");
        if (cur_pos != std::string::npos) {
            size_t arr_start = json.find('[', cur_pos);
            size_t arr_end = json.find(']', arr_start);
            currency_names = parse_json_string_array(json.substr(arr_start, arr_end - arr_start + 1));
        }
        V = currency_names.size();
        rates.assign(V, std::vector<double>(V, 0.0));

        // Parse rates_matrix - it's a 2D array [[...],[...],...]
        size_t mat_pos = json.find("\"rates_matrix\"");
        if (mat_pos != std::string::npos) {
            // Find the outer array
            size_t outer_start = json.find('[', mat_pos);
            int row = 0;
            size_t pos = outer_start + 1;
            while (row < V && pos < json.size()) {
                size_t row_start = json.find('[', pos);
                if (row_start == std::string::npos) break;
                size_t row_end = json.find(']', row_start);
                if (row_end == std::string::npos) break;
                std::vector<double> row_vals = parse_json_array(json.substr(row_start, row_end - row_start + 1));
                for (int j = 0; j < V && j < (int)row_vals.size(); ++j) {
                    rates[row][j] = row_vals[j];
                }
                pos = row_end + 1;
                row++;
            }
        }
    } else {
        // ---- Fallback: hardcoded demo rates ----
        currency_names = {"USD", "EUR", "GBP", "BTC", "ETH", "SOL"};
        V = 6;
        rates.assign(V, std::vector<double>(V, 0.0));
        rates[0][1] = 0.92; rates[1][0] = 1.08;
        rates[0][2] = 0.79; rates[2][0] = 1.26;
        rates[0][3] = 0.000016; rates[3][0] = 62500;
        rates[0][4] = 0.00033;  rates[4][0] = 3030;
        rates[0][5] = 0.0071;   rates[5][0] = 140;
        rates[1][3] = 0.000018; rates[3][1] = 55000;
        rates[2][4] = 0.00041;  rates[4][2] = 2400;
    }

    Graph g = build_arbitrage_graph(rates);
    std::vector<int> cycle = extract_arbitrage_cycle(g, 0);

    if (cycle.empty()) {
        std::cout << "{\"status\": \"no_arbitrage\",\n";
        std::cout << "  \"profit_margin\": 0,\n";
        std::cout << "  \"route\": [],\n";
    } else {
        double profit = 1.0;
        std::vector<std::string> path_names;
        for (size_t i = 0; i < cycle.size() - 1; ++i) {
            int u = cycle[i];
            int v = cycle[i+1];
            profit *= rates[u][v];
            path_names.push_back(currency_names[u]);
        }
        path_names.push_back(currency_names[cycle.back()]);

        std::cout << "{\n";
        std::cout << "  \"status\": \"success\",\n";
        std::cout << "  \"profit_margin\": " << (profit - 1.0) * 100.0 << ",\n";
        std::cout << "  \"route\": [";
        for (size_t i = 0; i < path_names.size(); ++i) {
            std::cout << "\"" << path_names[i] << "\"";
            if (i < path_names.size() - 1) std::cout << ", ";
        }
        std::cout << "],\n";
    }

    // Always output the rates matrix and currencies
    std::cout << "  \"rates_matrix\": [\n";
    for(int i = 0; i < V; ++i) {
        std::cout << "    [";
        for(int j = 0; j < V; ++j) {
            std::cout << rates[i][j];
            if (j < V - 1) std::cout << ", ";
        }
        std::cout << "]";
        if (i < V - 1) std::cout << ",";
        std::cout << "\n";
    }
    std::cout << "  ],\n";
    std::cout << "  \"currencies\": [";
    for(int i = 0; i < V; ++i) {
        std::cout << "\"" << currency_names[i] << "\"";
        if(i < V - 1) std::cout << ", ";
    }
    std::cout << "],\n";
    std::cout << "  \"source\": \"" << (rates_file.empty() ? "demo" : "live") << "\"\n";
    std::cout << "}\n";
}

