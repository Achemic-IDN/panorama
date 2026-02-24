/**
 * Data export utility for generating CSV and JSON reports
 */

export const exportToCSV = (data, filename = "export.csv") => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  let csv = headers.join(",") + "\n";
  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header];
      // Handle special characters and commas
      if (typeof value === "string" && value.includes(",")) {
        return `"${value}"`;
      }
      return value || "";
    });
    csv += values.join(",") + "\n";
  });

  // Download file
  downloadFile(csv, filename, "text/csv");
};

export const exportToJSON = (data, filename = "export.json") => {
  if (!data) {
    alert("No data to export");
    return;
  }

  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, "application/json");
};

const downloadFile = (content, filename, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default { exportToCSV, exportToJSON };
