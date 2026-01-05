# 🚀 HƯỚNG DẪN NHANH - CHẠY BENCHMARK

## Bước 1: Kiểm tra hệ thống

Mở file này bằng browser:
```
d:\HUST\Project 1\web\benchmark\test.html
```

Click nút "Run Quick Test" để kiểm tra xem mọi thứ hoạt động hay không.

✅ Nếu thấy cả Dijkstra và A* đều tìm được đường → OK, chuyển Bước 2
❌ Nếu có lỗi → Báo lại để khắc phục

---

## Bước 2: Chạy Benchmark đầy đủ

Mở file này bằng browser:
```
d:\HUST\Project 1\web\benchmark\index.html
```

### Các bước:

1. **Click "🚀 Run Benchmark"**
   - Đợi 1-2 phút (sẽ chạy ~280 tests)
   - Console sẽ hiện tiến trình

2. **Xem kết quả trên màn hình**
   - Bảng tóm tắt hiệu năng
   - Success rate của từng thuật toán

3. **Download CSV files:**
   - **📥 Download Full Results** - Tất cả dữ liệu chi tiết
   - **📊 Download Summary** - Thống kê tổng hợp
   - **🔬 Download A* Comparison** - So sánh A* variations

---

## Bước 3: Phân tích dữ liệu

### Import vào Excel/Google Sheets:

1. Mở Excel/Google Sheets
2. File → Import → chọn file CSV vừa download
3. Tạo Pivot Table để phân tích
4. Vẽ biểu đồ

### Hoặc dùng Python:

```python
import pandas as pd
import matplotlib.pyplot as plt

# Đọc dữ liệu
df = pd.read_csv('benchmark_results_2026-01-05.csv')

# Tính trung bình nodes visited theo thuật toán
avg_nodes = df.groupby('Algorithm_Name')['Nodes_Visited'].mean()

# Vẽ biểu đồ
avg_nodes.plot(kind='bar', figsize=(12, 6))
plt.title('Average Nodes Visited by Algorithm')
plt.xlabel('Algorithm')
plt.ylabel('Nodes Visited')
plt.xticks(rotation=45, ha='right')
plt.tight_layout()
plt.savefig('nodes_visited_comparison.png', dpi=300)
plt.show()
```

---

## 🎯 Các chỉ số quan trọng trong báo cáo

### 1. Path Length (Độ dài đường đi)
- Dijkstra, BFS, A*(w≤1): Phải BẰNG NHAU (tối ưu)
- A*(w>1), Greedy: Có thể dài hơn

### 2. Nodes Visited (Số nút đã duyệt) ⭐ QUAN TRỌNG NHẤT
- Phản ánh "độ thông minh" của thuật toán
- A*(w=2) < A*(w=1) < A*(w=0.5) < Dijkstra

### 3. Memory Usage (Bộ nhớ)
- Kích thước queue/stack tối đa
- DFS nhỏ nhất, BFS lớn nhất

### 4. Execution Time (Thời gian)
- Chỉ tham khảo (có thể dao động)
- Ưu tiên phân tích Nodes Visited

---

## ⚠️ Lưu ý

### Nếu benchmark chạy quá lâu:
- Mở file `benchmark.js`
- Đổi `mapsPerType: 5` thành `mapsPerType: 3`
- Giảm grid size xuống 20×40

### Nếu có map không tìm thấy đường:
- Script tự động retry 50 lần
- Nếu vẫn fail → sinh map khác

### Đảm bảo browser không bị lag:
- Đóng tất cả tab khác
- Dùng Chrome hoặc Edge (hiệu năng tốt nhất)

---

## 📊 Cấu trúc file CSV

### Full Results:
```
Map_Type, Map_Number, Algorithm_Name, Path_Length, Nodes_Visited, Memory_Usage, Time
Random, 1, Dijkstra, 85, 420, 150, 5.234
Random, 1, A* (w=1, manhattan), 85, 280, 95, 3.456
...
```

### Summary:
```
Algorithm, Avg_Path_Length, Avg_Nodes_Visited, Avg_Memory, Avg_Time
Dijkstra, 87.5, 425.3, 152.1, 5.123
A* (w=1, manhattan), 87.5, 285.7, 98.4, 3.567
...
```

---

## 🎓 Tips cho báo cáo

1. **So sánh Path Length** để chứng minh tính tối ưu
2. **So sánh Nodes Visited** để thấy hiệu quả của heuristic
3. **Vẽ biểu đồ** cho mỗi metric
4. **Phân tích trade-off**: A*(w=2) nhanh nhưng không tối ưu

---

**Chúc bạn thành công! 🎉**

Nếu có vấn đề, check lại README.md để biết thêm chi tiết.
