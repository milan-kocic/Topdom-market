// Utility function to convert data to CSV format and trigger download
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV rows
  const csvRows = [
    // Headers row
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]?.toString() || '';
        // Escape commas and quotes
        return `"${value.replace(/"/g, '""')}"`;
      }).join(',')
    )
  ];

  // Create blob and download
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}