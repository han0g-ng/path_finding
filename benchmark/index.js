/**
 * HTML Page for running benchmarks in browser
 */

import { runBenchmark } from './benchmark.js';
import { exportToCSV, generateSummaryCSV, generateAStarComparisonCSV, downloadCSV } from './csvExporter.js';

// Run benchmark when page loads
document.addEventListener('DOMContentLoaded', () => {
  const runButton = document.getElementById('runBenchmark');
  const downloadButton = document.getElementById('downloadResults');
  const downloadSummaryButton = document.getElementById('downloadSummary');
  const downloadComparisonButton = document.getElementById('downloadComparison');
  const progressDiv = document.getElementById('progress');
  const resultsDiv = document.getElementById('results');
  
  let benchmarkResults = null;
  
  runButton.addEventListener('click', async () => {
    runButton.disabled = true;
    downloadButton.disabled = true;
    downloadSummaryButton.disabled = true;
    downloadComparisonButton.disabled = true;
    progressDiv.innerHTML = '<p>🚀 Running benchmark... Please wait.</p>';
    resultsDiv.innerHTML = '';
    
    try {
      // Run benchmark
      benchmarkResults = runBenchmark();
      
      // Display results summary
      const summary = generateResultsSummary(benchmarkResults);
      resultsDiv.innerHTML = summary;
      
      // Enable download buttons
      downloadButton.disabled = false;
      downloadSummaryButton.disabled = false;
      downloadComparisonButton.disabled = false;
      
      progressDiv.innerHTML = '<p style="color: green;">✅ Benchmark completed successfully!</p>';
    } catch (error) {
      progressDiv.innerHTML = `<p style="color: red;">❌ Error: ${error.message}</p>`;
      console.error(error);
    } finally {
      runButton.disabled = false;
    }
  });
  
  downloadButton.addEventListener('click', () => {
    if (!benchmarkResults) return;
    const csv = exportToCSV(benchmarkResults);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    downloadCSV(csv, `benchmark_results_${timestamp}.csv`);
  });
  
  downloadSummaryButton.addEventListener('click', () => {
    if (!benchmarkResults) return;
    const csv = generateSummaryCSV(benchmarkResults);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    downloadCSV(csv, `benchmark_summary_${timestamp}.csv`);
  });
  
  downloadComparisonButton.addEventListener('click', () => {
    if (!benchmarkResults) return;
    const csv = generateAStarComparisonCSV(benchmarkResults);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    downloadCSV(csv, `astar_comparison_${timestamp}.csv`);
  });
});

function generateResultsSummary(results) {
  if (!results || results.length === 0) {
    return '<p>No results available</p>';
  }
  
  const totalTests = results.length;
  const successfulTests = results.filter(r => r.pathFound).length;
  const failedTests = totalTests - successfulTests;
  
  // Group by algorithm
  const algorithmStats = {};
  for (const result of results) {
    if (!algorithmStats[result.algorithmName]) {
      algorithmStats[result.algorithmName] = {
        total: 0,
        success: 0,
        avgPath: 0,
        avgVisited: 0,
        avgMemory: 0,
        avgTime: 0
      };
    }
    const stats = algorithmStats[result.algorithmName];
    stats.total++;
    if (result.pathFound) {
      stats.success++;
      stats.avgPath += result.pathLength;
      stats.avgVisited += result.nodesVisited;
      stats.avgMemory += result.memoryUsage;
      stats.avgTime += result.executionTime;
    }
  }
  
  // Calculate averages
  for (const stats of Object.values(algorithmStats)) {
    if (stats.success > 0) {
      stats.avgPath = (stats.avgPath / stats.success).toFixed(2);
      stats.avgVisited = (stats.avgVisited / stats.success).toFixed(2);
      stats.avgMemory = (stats.avgMemory / stats.success).toFixed(2);
      stats.avgTime = (stats.avgTime / stats.success).toFixed(3);
    }
  }
  
  let html = `
    <h2>📊 Benchmark Summary</h2>
    <div class="summary-stats">
      <p><strong>Total Tests:</strong> ${totalTests}</p>
      <p><strong>Successful:</strong> ${successfulTests} (${(successfulTests/totalTests*100).toFixed(1)}%)</p>
      <p><strong>Failed:</strong> ${failedTests}</p>
    </div>
    
    <h3>Algorithm Performance</h3>
    <table>
      <thead>
        <tr>
          <th>Algorithm</th>
          <th>Success Rate</th>
          <th>Avg Path Length</th>
          <th>Avg Nodes Visited</th>
          <th>Avg Memory Usage</th>
          <th>Avg Time (ms)</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  for (const [name, stats] of Object.entries(algorithmStats)) {
    const successRate = ((stats.success / stats.total) * 100).toFixed(1);
    html += `
      <tr>
        <td>${name}</td>
        <td>${successRate}%</td>
        <td>${stats.avgPath}</td>
        <td>${stats.avgVisited}</td>
        <td>${stats.avgMemory}</td>
        <td>${stats.avgTime}</td>
      </tr>
    `;
  }
  
  html += `
      </tbody>
    </table>
  `;
  
  return html;
}
