import csv
import matplotlib.pyplot as plt
import os

def load_csv(filename):
    data = []
    if not os.path.exists(filename):
        return None
    with open(filename, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            data.append({k: float(v) for k, v in row.items()})
    return data

def visualize_scaling():
    data = load_csv('results/scaling_results.csv')
    if not data:
        print("Error: results/scaling_results.csv not found.")
        return

    nodes = [row['Nodes'] for row in data]
    binary = [row['Dijkstra_Binary'] for row in data]
    fib = [row['Dijkstra_Fibonacci'] for row in data]
    bf = [row['Bellman_Ford'] for row in data]
    
    plt.figure(figsize=(10, 6))
    plt.plot(nodes, binary, marker='o', label='Dijkstra (Binary Heap)')
    plt.plot(nodes, fib, marker='s', label='Dijkstra (Fibonacci Heap)')
    plt.plot(nodes, bf, marker='^', label='Bellman-Ford')
    
    plt.title('Algorithm Scaling Performance (Sparse Graphs)')
    plt.xlabel('Number of Nodes (V)')
    plt.ylabel('Execution Time (ms)')
    plt.yscale('log')
    plt.grid(True, which="both", ls="--")
    plt.legend()
    
    plt.tight_layout()
    plt.savefig('results/scaling_plot.png')
    print("Saved scaling plot to results/scaling_plot.png")

def visualize_bar_chart():
    data = load_csv('results/scaling_results.csv')
    if not data:
        return
    
    last_row = data[-1]
    algorithms = ['Dijkstra (Binary)', 'Dijkstra (Fibonacci)', 'Bellman-Ford']
    times = [last_row['Dijkstra_Binary'], last_row['Dijkstra_Fibonacci'], last_row['Bellman_Ford']]
    
    plt.figure(figsize=(8, 5))
    bars = plt.bar(algorithms, times, color=['blue', 'orange', 'green'])
    
    plt.title(f'Performance Comparison (N={int(last_row["Nodes"])})')
    plt.ylabel('Execution Time (ms)')
    
    for bar in bars:
        yval = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2, yval, f"{yval:.2f}", ha='center', va='bottom')
        
    plt.tight_layout()
    plt.savefig('results/performance_bar_chart.png')
    print("Saved bar chart to results/performance_bar_chart.png")

if __name__ == "__main__":
    if not os.path.exists('results'):
        os.makedirs('results')
    visualize_scaling()
    visualize_bar_chart()
