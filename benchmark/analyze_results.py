"""
Phân tích và vẽ biểu đồ so sánh các thuật toán pathfinding
"""

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from pathlib import Path

# Thiết lập style
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")
plt.rcParams['figure.figsize'] = (14, 8)
plt.rcParams['font.size'] = 10

# Đọc dữ liệu với Python engine để xử lý JSON trong quotes
csv_file = 'results/benchmark_FULL_results_2026-01-05T14-17-56.csv'
df = pd.read_csv(csv_file, engine='python', quoting=1)  # QUOTE_ALL = 1

# Lọc chỉ lấy các test thành công
df_success = df[df['Path_Found'] == 'Yes'].copy()

# Tạo thư mục cho charts
charts_dir = Path('charts')
charts_dir.mkdir(exist_ok=True)

print(f"📊 Đọc được {len(df)} tests, {len(df_success)} tests thành công")
print(f"🎯 Các thuật toán: {df_success['Algorithm_Name'].unique()}")
print(f"🗺️  Các loại map: {df_success['Map_Type'].unique()}")

# ============================================================================
# BIỂU ĐỒ 1: So sánh Nodes Visited - Trung bình theo thuật toán
# ============================================================================
def plot_average_nodes_visited():
    plt.figure(figsize=(16, 8))
    
    # Tính trung bình nodes visited cho mỗi thuật toán
    avg_nodes = df_success.groupby('Algorithm_Name')['Nodes_Visited'].agg(['mean', 'std']).reset_index()
    avg_nodes = avg_nodes.sort_values('mean', ascending=True)
    
    # Vẽ bar chart
    colors = sns.color_palette("rocket_r", len(avg_nodes))
    bars = plt.barh(avg_nodes['Algorithm_Name'], avg_nodes['mean'], 
                     xerr=avg_nodes['std'], color=colors, alpha=0.8)
    
    # Thêm giá trị lên bar
    for i, (bar, val) in enumerate(zip(bars, avg_nodes['mean'])):
        plt.text(val + 10, bar.get_y() + bar.get_height()/2, 
                f'{val:.0f}', va='center', fontsize=9, fontweight='bold')
    
    plt.xlabel('Nodes Visited (Average)', fontsize=12, fontweight='bold')
    plt.ylabel('Algorithm', fontsize=12, fontweight='bold')
    plt.title('So sánh Hiệu quả: Số nodes đã thăm (càng ít càng tốt)', 
              fontsize=14, fontweight='bold', pad=20)
    plt.grid(axis='x', alpha=0.3)
    plt.tight_layout()
    plt.savefig(charts_dir / '01_nodes_visited_comparison.png', dpi=300, bbox_inches='tight')
    print("✅ Saved: 01_nodes_visited_comparison.png")
    plt.close()

# ============================================================================
# BIỂU ĐỒ 2: So sánh Execution Time
# ============================================================================
def plot_execution_time():
    plt.figure(figsize=(16, 8))
    
    avg_time = df_success.groupby('Algorithm_Name')['Execution_Time_ms'].agg(['mean', 'std']).reset_index()
    avg_time = avg_time.sort_values('mean', ascending=True)
    
    colors = sns.color_palette("viridis", len(avg_time))
    bars = plt.barh(avg_time['Algorithm_Name'], avg_time['mean'], 
                     xerr=avg_time['std'], color=colors, alpha=0.8)
    
    for i, (bar, val) in enumerate(zip(bars, avg_time['mean'])):
        plt.text(val + 0.005, bar.get_y() + bar.get_height()/2, 
                f'{val:.3f}ms', va='center', fontsize=9, fontweight='bold')
    
    plt.xlabel('Execution Time (ms, Average)', fontsize=12, fontweight='bold')
    plt.ylabel('Algorithm', fontsize=12, fontweight='bold')
    plt.title('So sánh Tốc độ: Thời gian thực thi (càng ít càng nhanh)', 
              fontsize=14, fontweight='bold', pad=20)
    plt.grid(axis='x', alpha=0.3)
    plt.tight_layout()
    plt.savefig(charts_dir / '02_execution_time_comparison.png', dpi=300, bbox_inches='tight')
    print("✅ Saved: 02_execution_time_comparison.png")
    plt.close()

# ============================================================================
# BIỂU ĐỒ 3: So sánh Path Length (Optimal)
# ============================================================================
def plot_path_optimality():
    plt.figure(figsize=(16, 8))
    
    # Tính path length trung bình
    avg_path = df_success.groupby('Algorithm_Name')['Path_Length'].agg(['mean', 'std']).reset_index()
    avg_path = avg_path.sort_values('mean', ascending=True)
    
    colors = sns.color_palette("coolwarm", len(avg_path))
    bars = plt.barh(avg_path['Algorithm_Name'], avg_path['mean'], 
                     xerr=avg_path['std'], color=colors, alpha=0.8)
    
    for i, (bar, val) in enumerate(zip(bars, avg_path['mean'])):
        plt.text(val + 2, bar.get_y() + bar.get_height()/2, 
                f'{val:.1f}', va='center', fontsize=9, fontweight='bold')
    
    plt.xlabel('Path Length (Average)', fontsize=12, fontweight='bold')
    plt.ylabel('Algorithm', fontsize=12, fontweight='bold')
    plt.title('So sánh Độ tối ưu: Độ dài đường đi (càng ngắn càng optimal)', 
              fontsize=14, fontweight='bold', pad=20)
    plt.grid(axis='x', alpha=0.3)
    plt.tight_layout()
    plt.savefig(charts_dir / '03_path_length_comparison.png', dpi=300, bbox_inches='tight')
    print("✅ Saved: 03_path_length_comparison.png")
    plt.close()

# ============================================================================
# BIỂU ĐỒ 4: So sánh Memory Usage
# ============================================================================
def plot_memory_usage():
    plt.figure(figsize=(16, 8))
    
    avg_memory = df_success.groupby('Algorithm_Name')['Memory_Usage_Nodes'].agg(['mean', 'std']).reset_index()
    avg_memory = avg_memory.sort_values('mean', ascending=True)
    
    colors = sns.color_palette("mako", len(avg_memory))
    bars = plt.barh(avg_memory['Algorithm_Name'], avg_memory['mean'], 
                     xerr=avg_memory['std'], color=colors, alpha=0.8)
    
    for i, (bar, val) in enumerate(zip(bars, avg_memory['mean'])):
        plt.text(val + 0.5, bar.get_y() + bar.get_height()/2, 
                f'{val:.1f}', va='center', fontsize=9, fontweight='bold')
    
    plt.xlabel('Memory Usage (Nodes in Queue, Average)', fontsize=12, fontweight='bold')
    plt.ylabel('Algorithm', fontsize=12, fontweight='bold')
    plt.title('So sánh Bộ nhớ: Số nodes trong queue (càng ít càng tiết kiệm)', 
              fontsize=14, fontweight='bold', pad=20)
    plt.grid(axis='x', alpha=0.3)
    plt.tight_layout()
    plt.savefig(charts_dir / '04_memory_usage_comparison.png', dpi=300, bbox_inches='tight')
    print("✅ Saved: 04_memory_usage_comparison.png")
    plt.close()

# ============================================================================
# BIỂU ĐỒ 5: Phân tích A* theo Weight và Metric
# ============================================================================
def plot_astar_analysis():
    # Lọc chỉ các thuật toán A*
    astar_df = df_success[df_success['Algorithm_Name'].str.contains('A\\*', regex=True)].copy()
    
    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    fig.suptitle('Phân tích chi tiết A* - Ảnh hưởng của Weight và Metric', 
                 fontsize=16, fontweight='bold')
    
    # Chart 1: Nodes Visited by Weight
    ax1 = axes[0, 0]
    astar_weight = astar_df.groupby('Algorithm_Name')['Nodes_Visited'].mean().sort_values()
    colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DFE6E9']
    astar_weight.plot(kind='bar', ax=ax1, color=colors, alpha=0.8)
    ax1.set_title('Nodes Visited theo Weight', fontsize=12, fontweight='bold')
    ax1.set_ylabel('Nodes Visited (Avg)', fontsize=11)
    ax1.set_xlabel('A* Variant', fontsize=11)
    ax1.grid(axis='y', alpha=0.3)
    ax1.tick_params(axis='x', rotation=45)
    
    # Chart 2: Execution Time by Weight
    ax2 = axes[0, 1]
    astar_time = astar_df.groupby('Algorithm_Name')['Execution_Time_ms'].mean().sort_values()
    astar_time.plot(kind='bar', ax=ax2, color=colors, alpha=0.8)
    ax2.set_title('Execution Time theo Weight', fontsize=12, fontweight='bold')
    ax2.set_ylabel('Time (ms, Avg)', fontsize=11)
    ax2.set_xlabel('A* Variant', fontsize=11)
    ax2.grid(axis='y', alpha=0.3)
    ax2.tick_params(axis='x', rotation=45)
    
    # Chart 3: Path Length by Weight
    ax3 = axes[1, 0]
    astar_path = astar_df.groupby('Algorithm_Name')['Path_Length'].mean().sort_values()
    astar_path.plot(kind='bar', ax=ax3, color=colors, alpha=0.8)
    ax3.set_title('Path Length (Optimality)', fontsize=12, fontweight='bold')
    ax3.set_ylabel('Path Length (Avg)', fontsize=11)
    ax3.set_xlabel('A* Variant', fontsize=11)
    ax3.grid(axis='y', alpha=0.3)
    ax3.tick_params(axis='x', rotation=45)
    
    # Chart 4: Memory Usage by Weight
    ax4 = axes[1, 1]
    astar_memory = astar_df.groupby('Algorithm_Name')['Memory_Usage_Nodes'].mean().sort_values()
    astar_memory.plot(kind='bar', ax=ax4, color=colors, alpha=0.8)
    ax4.set_title('Memory Usage', fontsize=12, fontweight='bold')
    ax4.set_ylabel('Memory (Nodes, Avg)', fontsize=11)
    ax4.set_xlabel('A* Variant', fontsize=11)
    ax4.grid(axis='y', alpha=0.3)
    ax4.tick_params(axis='x', rotation=45)
    
    plt.tight_layout()
    plt.savefig(charts_dir / '05_astar_detailed_analysis.png', dpi=300, bbox_inches='tight')
    print("✅ Saved: 05_astar_detailed_analysis.png")
    plt.close()

# ============================================================================
# BIỂU ĐỒ 6: So sánh theo loại Map
# ============================================================================
def plot_map_type_analysis():
    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    fig.suptitle('Phân tích theo Loại Map', fontsize=16, fontweight='bold')
    
    # Lấy top 5 thuật toán tốt nhất (ít nodes visited nhất)
    top_algos = df_success.groupby('Algorithm_Name')['Nodes_Visited'].mean().nsmallest(8).index
    df_top = df_success[df_success['Algorithm_Name'].isin(top_algos)]
    
    # Chart 1: Nodes Visited by Map Type
    ax1 = axes[0, 0]
    pivot1 = df_top.pivot_table(values='Nodes_Visited', 
                                  index='Map_Type', 
                                  columns='Algorithm_Name', 
                                  aggfunc='mean')
    pivot1.plot(kind='bar', ax=ax1, width=0.8)
    ax1.set_title('Nodes Visited theo Map Type', fontsize=12, fontweight='bold')
    ax1.set_ylabel('Nodes Visited (Avg)', fontsize=11)
    ax1.set_xlabel('Map Type', fontsize=11)
    ax1.legend(bbox_to_anchor=(1.05, 1), loc='upper left', fontsize=8)
    ax1.grid(axis='y', alpha=0.3)
    ax1.tick_params(axis='x', rotation=0)
    
    # Chart 2: Execution Time by Map Type
    ax2 = axes[0, 1]
    pivot2 = df_top.pivot_table(values='Execution_Time_ms', 
                                  index='Map_Type', 
                                  columns='Algorithm_Name', 
                                  aggfunc='mean')
    pivot2.plot(kind='bar', ax=ax2, width=0.8)
    ax2.set_title('Execution Time theo Map Type', fontsize=12, fontweight='bold')
    ax2.set_ylabel('Time (ms, Avg)', fontsize=11)
    ax2.set_xlabel('Map Type', fontsize=11)
    ax2.legend(bbox_to_anchor=(1.05, 1), loc='upper left', fontsize=8)
    ax2.grid(axis='y', alpha=0.3)
    ax2.tick_params(axis='x', rotation=0)
    
    # Chart 3: Path Length by Map Type
    ax3 = axes[1, 0]
    pivot3 = df_top.pivot_table(values='Path_Length', 
                                  index='Map_Type', 
                                  columns='Algorithm_Name', 
                                  aggfunc='mean')
    pivot3.plot(kind='bar', ax=ax3, width=0.8)
    ax3.set_title('Path Length theo Map Type', fontsize=12, fontweight='bold')
    ax3.set_ylabel('Path Length (Avg)', fontsize=11)
    ax3.set_xlabel('Map Type', fontsize=11)
    ax3.legend(bbox_to_anchor=(1.05, 1), loc='upper left', fontsize=8)
    ax3.grid(axis='y', alpha=0.3)
    ax3.tick_params(axis='x', rotation=0)
    
    # Chart 4: Success Rate by Algorithm
    ax4 = axes[1, 1]
    success_rate = df.groupby('Algorithm_Name')['Path_Found'].apply(
        lambda x: (x == 'Yes').sum() / len(x) * 100
    ).sort_values(ascending=False)
    success_rate.plot(kind='barh', ax=ax4, color='green', alpha=0.7)
    ax4.set_title('Success Rate (%)', fontsize=12, fontweight='bold')
    ax4.set_xlabel('Success Rate (%)', fontsize=11)
    ax4.set_ylabel('Algorithm', fontsize=11)
    ax4.grid(axis='x', alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(charts_dir / '06_map_type_analysis.png', dpi=300, bbox_inches='tight')
    print("✅ Saved: 06_map_type_analysis.png")
    plt.close()

# ============================================================================
# BIỂU ĐỒ 7: Scatter Plot - Nodes Visited vs Execution Time
# ============================================================================
def plot_efficiency_scatter():
    plt.figure(figsize=(14, 10))
    
    # Lấy các thuật toán chính (không bao gồm Bidirectional Greedy vì failed)
    main_algos = ['Dijkstra', 'BFS', 'DFS', 
                  'A* (w=1, manhattan)', 'A* (w=2, manhattan)',
                  'Greedy BFS (manhattan)']
    
    df_main = df_success[df_success['Algorithm_Name'].isin(main_algos)]
    
    # Vẽ scatter plot
    for algo in main_algos:
        algo_data = df_main[df_main['Algorithm_Name'] == algo]
        plt.scatter(algo_data['Nodes_Visited'], 
                   algo_data['Execution_Time_ms'],
                   label=algo, alpha=0.6, s=100)
    
    plt.xlabel('Nodes Visited', fontsize=12, fontweight='bold')
    plt.ylabel('Execution Time (ms)', fontsize=12, fontweight='bold')
    plt.title('Hiệu quả: Nodes Visited vs Execution Time\n(Gần góc dưới trái = hiệu quả cao)', 
              fontsize=14, fontweight='bold', pad=20)
    plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(charts_dir / '07_efficiency_scatter.png', dpi=300, bbox_inches='tight')
    print("✅ Saved: 07_efficiency_scatter.png")
    plt.close()

# ============================================================================
# BIỂU ĐỒ 8: Heatmap - Performance across Map Types
# ============================================================================
def plot_performance_heatmap():
    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    fig.suptitle('Heatmap: Performance theo Map Type và Algorithm', 
                 fontsize=16, fontweight='bold')
    
    # Lấy top algorithms
    top_algos = ['Dijkstra', 'BFS', 'DFS', 
                 'A* (w=0.5, manhattan)', 'A* (w=1, manhattan)', 'A* (w=2, manhattan)',
                 'Greedy BFS (manhattan)']
    df_top = df_success[df_success['Algorithm_Name'].isin(top_algos)]
    
    # Heatmap 1: Nodes Visited
    ax1 = axes[0, 0]
    pivot1 = df_top.pivot_table(values='Nodes_Visited', 
                                  index='Algorithm_Name', 
                                  columns='Map_Type', 
                                  aggfunc='mean')
    sns.heatmap(pivot1, annot=True, fmt='.0f', cmap='YlOrRd', ax=ax1, cbar_kws={'label': 'Nodes'})
    ax1.set_title('Nodes Visited', fontsize=12, fontweight='bold')
    ax1.set_ylabel('Algorithm', fontsize=10)
    ax1.set_xlabel('Map Type', fontsize=10)
    
    # Heatmap 2: Execution Time
    ax2 = axes[0, 1]
    pivot2 = df_top.pivot_table(values='Execution_Time_ms', 
                                  index='Algorithm_Name', 
                                  columns='Map_Type', 
                                  aggfunc='mean')
    sns.heatmap(pivot2, annot=True, fmt='.3f', cmap='viridis', ax=ax2, cbar_kws={'label': 'ms'})
    ax2.set_title('Execution Time (ms)', fontsize=12, fontweight='bold')
    ax2.set_ylabel('Algorithm', fontsize=10)
    ax2.set_xlabel('Map Type', fontsize=10)
    
    # Heatmap 3: Path Length
    ax3 = axes[1, 0]
    pivot3 = df_top.pivot_table(values='Path_Length', 
                                  index='Algorithm_Name', 
                                  columns='Map_Type', 
                                  aggfunc='mean')
    sns.heatmap(pivot3, annot=True, fmt='.1f', cmap='coolwarm', ax=ax3, cbar_kws={'label': 'Path'})
    ax3.set_title('Path Length', fontsize=12, fontweight='bold')
    ax3.set_ylabel('Algorithm', fontsize=10)
    ax3.set_xlabel('Map Type', fontsize=10)
    
    # Heatmap 4: Memory Usage
    ax4 = axes[1, 1]
    pivot4 = df_top.pivot_table(values='Memory_Usage_Nodes', 
                                  index='Algorithm_Name', 
                                  columns='Map_Type', 
                                  aggfunc='mean')
    sns.heatmap(pivot4, annot=True, fmt='.1f', cmap='mako', ax=ax4, cbar_kws={'label': 'Nodes'})
    ax4.set_title('Memory Usage', fontsize=12, fontweight='bold')
    ax4.set_ylabel('Algorithm', fontsize=10)
    ax4.set_xlabel('Map Type', fontsize=10)
    
    plt.tight_layout()
    plt.savefig(charts_dir / '08_performance_heatmap.png', dpi=300, bbox_inches='tight')
    print("✅ Saved: 08_performance_heatmap.png")
    plt.close()

# ============================================================================
# BIỂU ĐỒ 9: Tổng quan - Radar Chart
# ============================================================================
def plot_radar_comparison():
    from math import pi
    
    # Lấy top 5 thuật toán
    top_algos = ['Dijkstra', 'BFS', 
                 'A* (w=1, manhattan)', 'A* (w=2, manhattan)',
                 'Greedy BFS (manhattan)']
    
    df_top = df_success[df_success['Algorithm_Name'].isin(top_algos)]
    
    # Chuẩn hóa metrics (0-1, inverse cho các metric "càng thấp càng tốt")
    metrics = ['Nodes_Visited', 'Execution_Time_ms', 'Path_Length', 'Memory_Usage_Nodes']
    
    fig, ax = plt.subplots(figsize=(10, 10), subplot_kw=dict(projection='polar'))
    
    categories = ['Speed\n(low time)', 'Efficiency\n(low nodes)', 
                  'Optimality\n(short path)', 'Memory\n(low usage)']
    N = len(categories)
    angles = [n / float(N) * 2 * pi for n in range(N)]
    angles += angles[:1]
    
    ax.set_theta_offset(pi / 2)
    ax.set_theta_direction(-1)
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(categories, size=11)
    
    colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
    
    for i, algo in enumerate(top_algos):
        algo_data = df_top[df_top['Algorithm_Name'] == algo]
        
        # Tính điểm cho mỗi metric (inverse normalization)
        time_score = 1 - (algo_data['Execution_Time_ms'].mean() / df_top['Execution_Time_ms'].max())
        nodes_score = 1 - (algo_data['Nodes_Visited'].mean() / df_top['Nodes_Visited'].max())
        path_score = 1 - (algo_data['Path_Length'].mean() / df_top['Path_Length'].max())
        memory_score = 1 - (algo_data['Memory_Usage_Nodes'].mean() / df_top['Memory_Usage_Nodes'].max())
        
        values = [time_score, nodes_score, path_score, memory_score]
        values += values[:1]
        
        ax.plot(angles, values, 'o-', linewidth=2, label=algo, color=colors[i])
        ax.fill(angles, values, alpha=0.15, color=colors[i])
    
    ax.set_ylim(0, 1)
    ax.set_title('Tổng quan Performance - Radar Chart\n(Diện tích lớn hơn = tốt hơn)', 
                 size=14, fontweight='bold', pad=30)
    ax.legend(loc='upper right', bbox_to_anchor=(1.3, 1.1))
    ax.grid(True)
    
    plt.tight_layout()
    plt.savefig(charts_dir / '09_radar_comparison.png', dpi=300, bbox_inches='tight')
    print("✅ Saved: 09_radar_comparison.png")
    plt.close()

# ============================================================================
# BẢNG THỐNG KÊ
# ============================================================================
def generate_summary_table():
    # Tính toán thống kê tổng hợp
    summary = df_success.groupby('Algorithm_Name').agg({
        'Nodes_Visited': ['mean', 'std', 'min', 'max'],
        'Execution_Time_ms': ['mean', 'std'],
        'Path_Length': ['mean', 'std'],
        'Memory_Usage_Nodes': ['mean', 'std']
    }).round(2)
    
    # Lưu ra CSV
    summary.to_csv(charts_dir / 'summary_statistics.csv')
    print("✅ Saved: summary_statistics.csv")
    
    # In ra console
    print("\n" + "="*80)
    print("📊 BẢNG THỐNG KÊ TỔNG HỢP")
    print("="*80)
    print(summary.to_string())
    print("="*80 + "\n")

# ============================================================================
# MAIN - Chạy tất cả các biểu đồ
# ============================================================================
def main():
    print("\n" + "="*80)
    print("🎨 BẮT ĐẦU TẠO BIỂU ĐỒ SO SÁNH")
    print("="*80 + "\n")
    
    plot_average_nodes_visited()
    plot_execution_time()
    plot_path_optimality()
    plot_memory_usage()
    plot_astar_analysis()
    plot_map_type_analysis()
    plot_efficiency_scatter()
    plot_performance_heatmap()
    plot_radar_comparison()
    generate_summary_table()
    
    print("\n" + "="*80)
    print("🎉 HOÀN THÀNH! Tất cả biểu đồ đã được lưu trong thư mục 'charts/'")
    print("="*80 + "\n")
    
    print("📁 Danh sách file đã tạo:")
    for file in sorted(charts_dir.glob('*.png')):
        print(f"   - {file.name}")
    print(f"   - summary_statistics.csv")

if __name__ == "__main__":
    main()
