import os
import subprocess

def create_dot_file():
    # We'll visualize the small graph from test_dijkstra.cpp
    # A(0), B(1), C(2), D(3), E(4)
    # Shortest path A -> E is A -> B -> D -> E
    
    dot_content = """digraph G {
    rankdir=LR;
    node [shape=circle, style=filled, fillcolor=lightblue, fontname="Arial"];
    edge [fontname="Arial"];

    A [label="0 (A)"];
    B [label="1 (B)"];
    C [label="2 (C)"];
    D [label="3 (D)"];
    E [label="4 (E)"];

    // Highlighted Shortest Path
    A -> B [label="4", color="red", penwidth=3, fontcolor="red"];
    B -> D [label="5", color="red", penwidth=3, fontcolor="red"];
    D -> E [label="2", color="red", penwidth=3, fontcolor="red"];

    // Other Edges
    A -> C [label="2"];
    B -> C [label="1"];
    C -> D [label="8"];
    C -> E [label="10"];
}
"""
    
    if not os.path.exists('results'):
        os.makedirs('results')
        
    dot_path = 'results/shortest_path.dot'
    with open(dot_path, 'w') as f:
        f.write(dot_content)
    print(f"Generated Graphviz dot file at {dot_path}")
    
    # Try to render it if dot is installed
    try:
        subprocess.run(['dot', '-Tpng', dot_path, '-o', 'results/shortest_path.png'], check=True)
        print("Successfully rendered Graphviz image to results/shortest_path.png")
    except Exception as e:
        print("Note: 'dot' command not found or failed. Ensure Graphviz is installed on your system to render the image.")
        print(f"Error: {e}")

if __name__ == "__main__":
    create_dot_file()
