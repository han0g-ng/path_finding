/**
 * Export results to CSV format
 */

/**
 * Convert benchmark results to CSV
 */
export function exportToCSV(results) {
  if (!results || results.length === 0) {
    return 'No results to export';
  }
  
  // CSV Headers
  const headers = [
    'Map_Type',
    'Map_Number',
    'Map_ID',
    'Algorithm_Name',
    'Parameters',
    'Path_Found',
    'Path_Length',
    'Nodes_Visited',
    'Memory_Usage_Nodes',
    'Execution_Time_ms',
    'Error'
  ];
  
  // Create CSV rows
  const rows = results.map(result => [
    result.mapType || '',
    result.mapNumber || '',
    result.mapId || '',
    result.algorithmName || '',
    result.params || '{}',
    result.pathFound ? 'Yes' : 'No',
    result.pathLength || 0,
    result.nodesVisited || 0,
    result.memoryUsage || 0,
    result.executionTime || 0,
    result.error || ''
  ]);
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  return csvContent;
}

/**
 * Generate summary statistics by algorithm
 */
export function generateSummaryCSV(results) {
  if (!results || results.length === 0) {
    return 'No results to summarize';
  }
  
  // Group by algorithm
  const grouped = {};
  for (const result of results) {
    const key = result.algorithmName;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(result);
  }
  
  // Calculate statistics for each algorithm
  const summaryRows = [];
  
  for (const [algorithmName, algorithmResults] of Object.entries(grouped)) {
    const validResults = algorithmResults.filter(r => r.pathFound);
    
    if (validResults.length === 0) continue;
    
    const pathLengths = validResults.map(r => r.pathLength);
    const nodesVisited = validResults.map(r => r.nodesVisited);
    const memoryUsage = validResults.map(r => r.memoryUsage);
    const executionTimes = validResults.map(r => r.executionTime);
    
    summaryRows.push({
      Algorithm: algorithmName,
      Tests_Run: validResults.length,
      Avg_Path_Length: average(pathLengths).toFixed(2),
      Min_Path_Length: Math.min(...pathLengths),
      Max_Path_Length: Math.max(...pathLengths),
      Avg_Nodes_Visited: average(nodesVisited).toFixed(2),
      Min_Nodes_Visited: Math.min(...nodesVisited),
      Max_Nodes_Visited: Math.max(...nodesVisited),
      Avg_Memory_Usage: average(memoryUsage).toFixed(2),
      Min_Memory_Usage: Math.min(...memoryUsage),
      Max_Memory_Usage: Math.max(...memoryUsage),
      Avg_Execution_Time: average(executionTimes).toFixed(3),
      Min_Execution_Time: Math.min(...executionTimes).toFixed(3),
      Max_Execution_Time: Math.max(...executionTimes).toFixed(3)
    });
  }
  
  // Create CSV
  if (summaryRows.length === 0) return 'No valid results to summarize';
  
  const headers = Object.keys(summaryRows[0]);
  const csvContent = [
    headers.join(','),
    ...summaryRows.map(row => 
      headers.map(h => `"${row[h]}"`).join(',')
    )
  ].join('\n');
  
  return csvContent;
}

/**
 * Generate comparison CSV for A* variations
 */
export function generateAStarComparisonCSV(results) {
  const astarResults = results.filter(r => 
    r.algorithmName.startsWith('A*') && r.pathFound
  );
  
  if (astarResults.length === 0) {
    return 'No A* results to compare';
  }
  
  // Group by map and algorithm
  const grouped = {};
  for (const result of astarResults) {
    const mapKey = result.mapId;
    if (!grouped[mapKey]) {
      grouped[mapKey] = {};
    }
    grouped[mapKey][result.algorithmName] = result;
  }
  
  // Create comparison rows
  const rows = [];
  for (const [mapId, algorithms] of Object.entries(grouped)) {
    const row = { Map_ID: mapId };
    
    for (const [algName, result] of Object.entries(algorithms)) {
      const prefix = algName.replace('A* ', '').replace(/[()]/g, '').replace(/, /g, '_');
      row[`${prefix}_Path`] = result.pathLength;
      row[`${prefix}_Visited`] = result.nodesVisited;
      row[`${prefix}_Memory`] = result.memoryUsage;
      row[`${prefix}_Time`] = result.executionTime;
    }
    
    rows.push(row);
  }
  
  if (rows.length === 0) return 'No comparison data available';
  
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      headers.map(h => `"${row[h] || ''}"`).join(',')
    )
  ].join('\n');
  
  return csvContent;
}

/**
 * Save CSV to file (Node.js environment)
 */
export function saveCSVToFile(csvContent, filename) {
  try {
    // For Node.js
    if (typeof require !== 'undefined') {
      const fs = require('fs');
      const path = require('path');
      
      const outputDir = path.join(__dirname, 'results');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const filepath = path.join(outputDir, filename);
      fs.writeFileSync(filepath, csvContent, 'utf8');
      console.log(`✓ Saved to: ${filepath}`);
      return filepath;
    }
  } catch (error) {
    console.error(`Error saving file: ${error.message}`);
  }
  
  return null;
}

/**
 * Download CSV in browser environment
 */
export function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log(`✓ Downloaded: ${filename}`);
  }
}

// Helper function
function average(arr) {
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}
