#ifndef GRAPH_H
#define GRAPH_H

#include <vector>
#include <string>
#include <unordered_map>
#include <fstream>
#include <sstream>
#include <iostream>
#include <random>
#include <algorithm>

struct Node {
    int id;
    std::string label;
    double latitude;
    double longitude;
};

struct Edge {
    int src;
    int dst;
    double weight;
};

class Graph {
private:
    int num_vertices;
    std::vector<Node> nodes;
    std::vector<std::vector<Edge>> adj;
    static constexpr double INF = 1e18; // Infinity for matrix initialization
    std::vector<std::vector<double>> matrix; // Adjacency Matrix for dense graphs

public:
    Graph(int n) : num_vertices(n), adj(n), matrix(n, std::vector<double>(n, INF)) {
        for (int i = 0; i < n; ++i) matrix[i][i] = 0;
    }
    
    void add_node(int id, const std::string& label, double lat = 0, double lon = 0) {
        nodes.push_back({id, label, lat, lon});
    }
    
    void add_edge(int src, int dst, double weight) {
        if (src >= 0 && src < num_vertices && dst >= 0 && dst < num_vertices) {
            adj[src].push_back({src, dst, weight});
            matrix[src][dst] = weight;
        }
    }
    
    int node_count() const { return num_vertices; }
    const std::vector<Edge>& get_adjacency(int u) const { return adj[u]; }
    double get_matrix_weight(int u, int v) const { return matrix[u][v]; }

    static Graph load_from_csv(const std::string& node_file, const std::string& edge_file) {
        // First pass to count nodes if not provided, or just read nodes
        std::ifstream nf(node_file);
        std::string line;
        int count = 0;
        if (nf.is_open()) {
            std::getline(nf, line); // Skip header
            while (std::getline(nf, line)) count++;
        }
        
        Graph g(count);
        nf.clear();
        nf.seekg(0);
        std::getline(nf, line); // Skip header
        while (std::getline(nf, line)) {
            std::stringstream ss(line);
            std::string id_str, label, lat_str, lon_str;
            std::getline(ss, id_str, ',');
            std::getline(ss, label, ',');
            std::getline(ss, lat_str, ',');
            std::getline(ss, lon_str, ',');
            g.add_node(std::stoi(id_str), label, std::stod(lat_str), std::stod(lon_str));
        }

        std::ifstream ef(edge_file);
        if (ef.is_open()) {
            std::getline(ef, line); // Skip header
            while (std::getline(ef, line)) {
                std::stringstream ss(line);
                std::string src_str, dst_str, weight_str;
                std::getline(ss, src_str, ',');
                std::getline(ss, dst_str, ',');
                std::getline(ss, weight_str, ',');
                g.add_edge(std::stoi(src_str), std::stoi(dst_str), std::stod(weight_str));
            }
        }
        return g;
    }

    static Graph generate_sparse(int n, double edge_prob) {
        Graph g(n);
        std::mt19937 rng(std::random_device{}());
        std::uniform_real_distribution<double> dist(0.0, 1.0);
        std::uniform_real_distribution<double> weight_dist(1.0, 100.0);

        for (int i = 0; i < n; ++i) {
            for (int j = 0; j < n; ++j) {
                if (i != j && dist(rng) < edge_prob) {
                    g.add_edge(i, j, weight_dist(rng));
                }
            }
        }
        return g;
    }

    static Graph generate_dense(int n) {
        return generate_sparse(n, 1.0); // 100% probability for all edges
    }

    static Graph generate_negative_weight(int n, double neg_prob) {
        Graph g(n);
        std::mt19937 rng(std::random_device{}());
        std::uniform_real_distribution<double> dist(0.0, 1.0);
        std::uniform_real_distribution<double> weight_dist(-10.0, 100.0);

        for (int i = 0; i < n; ++i) {
            for (int j = 0; j < n; ++j) {
                if (i != j && dist(rng) < 0.1) { // 10% edge density
                    double w = weight_dist(rng);
                    g.add_edge(i, j, w);
                }
            }
        }
        return g;
    }
};

#endif // GRAPH_H
