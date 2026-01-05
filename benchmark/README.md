# 🎯 Pathfinding Algorithms Benchmark Tool

Công cụ benchmark toàn diện để đo lường và so sánh hiệu năng các thuật toán tìm đường.

## 📊 Tính năng

### Thuật toán được test:
- **Dijkstra** - Thuật toán tìm đường ngắn nhất có trọng số
- **BFS** (Breadth-First Search) - Tìm kiếm theo chiều rộng
- **DFS** (Depth-First Search) - Tìm kiếm theo chiều sâu
- **A*** với 6 variations:
  - Weight: 0.5, 1.0, 2.0
  - Metric: Manhattan, Euclidean
- **Greedy Best-First Search** với 2 metrics
- **Bidirectional Greedy Search** với 2 metrics

### Các loại Map:
- **Random Maze** - Tường ngẫu nhiên (~33%)
- **Horizontal Maze** - Mê cung ngang
- **Vertical Maze** - Mê cung dọc
- **Recursive Division** - Chia đệ quy

### Metrics thu thập:
1. **Path Length** - Độ dài đường đi
2. **Nodes Visited** - Số lượng nút đã duyệt
3. **Memory Usage** - Sử dụng bộ nhớ (số nodes trong queue/stack)
4. **Execution Time** - Thời gian thực thi (milliseconds)

## 🚀 Cách sử dụng

### Phương án 1: Chạy trong Browser (Đơn giản nhất)

1. **Mở file HTML:**
   ```bash
   # Chỉ cần mở file này bằng browser
   d:\HUST\Project 1\web\benchmark\index.html
   ```

2. **Chạy benchmark:**
   - Click nút "🚀 Run Benchmark"
   - Đợi quá trình chạy hoàn tất (có thể mất 1-2 phút)
   - Xem kết quả trên màn hình

3. **Download kết quả:**
   - **Full Results** - Tất cả dữ liệu chi tiết
   - **Summary** - Thống kê tổng hợp theo thuật toán
   - **A* Comparison** - So sánh chi tiết các biến thể A*

### Phương án 2: Chạy với Web Server

```bash
# Từ thư mục pathding-visualizer
cd d:\HUST\Project 1\web\pathding-visualizer

# Cài đặt dependencies (nếu chưa cài)
npm install

# Chạy development server
npm start

# Sau đó mở browser và truy cập:
# http://localhost:3000/benchmark/index.html
```

### Phương án 3: Chạy với Node.js (Nâng cao)

Tạo file `runBenchmark.js`:

```javascript
import { runBenchmark } from './benchmark.js';
import { exportToCSV, generateSummaryCSV, saveCSVToFile } from './csvExporter.js';

console.log('Starting benchmark...\n');

const results = runBenchmark();

// Save to files
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

const fullCSV = exportToCSV(results);
saveCSVToFile(fullCSV, `benchmark_results_${timestamp}.csv`);

const summaryCSV = generateSummaryCSV(results);
saveCSVToFile(summaryCSV, `benchmark_summary_${timestamp}.csv`);

console.log('\n✅ Done! Check the results folder.');
```

## 📈 Hiểu kết quả CSV

### File 1: benchmark_results_YYYY-MM-DD.csv
Chứa **tất cả** kết quả chi tiết:

| Column | Ý nghĩa |
|--------|---------|
| Map_Type | Loại map (Random, Horizontal, ...) |
| Map_Number | Số thứ tự map (1-5) |
| Algorithm_Name | Tên thuật toán |
| Path_Length | Độ dài đường đi tìm được |
| Nodes_Visited | Số nút đã duyệt qua |
| Memory_Usage_Nodes | Kích thước max của queue/stack |
| Execution_Time_ms | Thời gian chạy (millisecond) |

### File 2: benchmark_summary_YYYY-MM-DD.csv
Thống kê **trung bình** theo thuật toán:

- Avg/Min/Max cho tất cả metrics
- Dễ dàng so sánh giữa các thuật toán

### File 3: astar_comparison_YYYY-MM-DD.csv
So sánh **chi tiết** các biến thể A*:

- Mỗi hàng = 1 map
- Các cột = metrics của từng variation (w=0.5, w=1, w=2 × Manhattan/Euclidean)

## 📊 Phân tích dữ liệu

### Excel/Google Sheets:
1. Import file CSV
2. Tạo Pivot Table
3. Vẽ biểu đồ so sánh

### Python (Pandas):
```python
import pandas as pd
import matplotlib.pyplot as plt

# Đọc dữ liệu
df = pd.read_csv('benchmark_results_2026-01-05.csv')

# Phân tích
avg_by_algorithm = df.groupby('Algorithm_Name')['Nodes_Visited'].mean()

# Vẽ biểu đồ
avg_by_algorithm.plot(kind='bar')
plt.title('Average Nodes Visited by Algorithm')
plt.show()
```

## ⚙️ Cấu hình Benchmark

Chỉnh sửa trong `benchmark.js`:

```javascript
const CONFIG = {
  gridSize: {
    rows: 25,      // Số hàng
    cols: 50       // Số cột
  },
  mapsPerType: 5,  // Số map mỗi loại
  astarWeights: [0.5, 1.0, 2.0],  // Các trọng số A*
  metrics: [METRIC_TYPES.MANHATTAN, METRIC_TYPES.EUCLIDEAN]
};
```

## 🔬 Phương pháp đo lường

### Thời gian thực thi:
- Sử dụng `performance.now()` (độ chính xác microsecond)
- Có **warm-up** 2 lần để tránh JIT compilation overhead
- Đo **chỉ thuật toán**, không bao gồm visualization

### Độ tin cậy:
- Mỗi map được đảm bảo có đường đi (kiểm tra bằng BFS)
- Tự động retry nếu không có đường

### Metrics ổn định:
- **Path Length** và **Nodes Visited** không đổi giữa các lần chạy
- **Execution Time** có thể dao động ±10% (do môi trường JavaScript)

## 📝 Ghi chú quan trọng cho báo cáo

### Khi viết báo cáo:
1. **Nhấn mạnh Nodes Visited** hơn Execution Time
   - Nodes Visited phản ánh độ phức tạp lý thuyết
   - Execution Time bị ảnh hưởng bởi môi trường

2. **Ghi rõ điều kiện test:**
   - Grid size: 25×50
   - Browser/OS sử dụng
   - 5 maps mỗi loại, đảm bảo có đường đi

3. **Kết luận dự kiến:**
   - **Path Length**: Dijkstra = BFS = A*(w≤1) < A*(w>1) ≤ Greedy ≤ DFS
   - **Nodes Visited**: A*(w=2) < A*(w=1) < A*(w=0.5) < Dijkstra ≈ BFS
   - **Memory**: DFS nhỏ nhất, BFS lớn nhất

## 🛠️ Troubleshooting

### Lỗi "Map không có đường đi":
- Script tự động retry, nhưng nếu vẫn lỗi sau 50 lần → giảm tỉ lệ tường trong `randomMaze.js`

### Benchmark chạy quá chậm:
- Giảm `mapsPerType` từ 5 xuống 3
- Giảm kích thước grid

### Browser bị lag:
- Đóng các tab khác
- Chạy trong Chrome Incognito mode

## 📧 Liên hệ

Có câu hỏi? Mở issue trên GitHub hoặc liên hệ qua email.

---

**Good luck với báo cáo! 🎓**
