
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// /**
//  * Generate and download a PDF
//  * @param {string} title - PDF title
//  * @param {Array} headers - table headers
//  * @param {Array} rows - table body (array of arrays)
//  */
// export function exportToPDF(title, headers, rows) {
//   const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "A4" });

//   // Header
//   doc.setFontSize(18);
//   doc.text(title, 40, 50);

//   // Add date/time
//   doc.setFontSize(10);
//   doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 65);

//   // Table
//   doc.autoTable({
//     startY: 80,
//     head: [headers],
//     body: rows,
//     styles: { fontSize: 10, cellPadding: 5 },
//     headStyles: { fillColor: [37, 99, 235] }, // indigo
//   });

//   // Footer
//   const pageCount = doc.internal.getNumberOfPages();
//   for (let i = 1; i <= pageCount; i++) {
//     doc.setPage(i);
//     doc.text(`Page ${i} of ${pageCount}`, 500, 820, null, null, "right");
//   }

//   // Save file
//   doc.save(`${title.replace(/\s+/g, "_")}_${Date.now()}.pdf`);
// }
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportToPDF(title, headers, rows) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "A4" });

  doc.line(20, 20, 550, 20);

  doc.setFontSize(18);
  doc.text(title, 40, 50);
doc.line(20, 70, 550, 70);


  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 65);

  doc.setFontSize(12);


  autoTable(doc, {
    startY: 260,
    head: [headers],
    body: rows,
    styles: { fontSize: 10, cellPadding: 5 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  // the total of the commission or profit
  const totalCommission = rows.reduce((sum, row) => sum + (row[4] || 0), 0);
  doc.setFontSize(10);
  doc.text(`Total Commission: ${totalCommission}`, 400, 500);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 615);
  doc.text(`Aprofied by ${localStorage.getItem("userName")}  :- `, 40, 660);
    doc.line(120, 660, 250, 660);
   

 const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    // Page number
    doc.text(`Page ${i} of ${pageCount}`, 500, 820, null, null, "right");
    // Custom footer (change this text as you wish)
    doc.text("© MyAgency - All rights reserved", 60, 820);
  }

  // Preview PDF in a new tab
  const pdfBlobUrl = doc.output('bloburl');
  window.open(pdfBlobUrl, '_blank');
}