const express = require('express');
const cors = require('cors');
const Excel = require('exceljs');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const FILE_PATH = path.join(__dirname, 'Attendance.xlsx');

// ✅ Mark attendance
app.post('/api/mark', async (req, res) => {
  const { id, name } = req.body;
  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();

  let workbook, sheet;

  try {
    if (fs.existsSync(FILE_PATH)) {
      workbook = new Excel.Workbook();
      await workbook.xlsx.readFile(FILE_PATH);
      sheet = workbook.getWorksheet('Attendance');
    } else {
      workbook = new Excel.Workbook();
      sheet = workbook.addWorksheet('Attendance');
      sheet.addRow(['Date', 'Time', 'ID', 'Name']);
    }

    sheet.addRow([date, time, id, name]);
    await workbook.xlsx.writeFile(FILE_PATH);
    res.json({ message: `✅ Attendance saved for ${name}` });
  } catch (err) {
    res.status(500).json({ message: '❌ Error saving attendance' });
  }
});

// ✅ Download Excel file
app.get('/api/download', (req, res) => {
  if (fs.existsSync(FILE_PATH)) {
    res.download(FILE_PATH, 'Attendance.xlsx');
  } else {
    res.status(404).json({ message: '❌ File not found' });
  }
});

// ✅ View Excel file as JSON
app.get('/api/view', async (req, res) => {
  try {
    if (!fs.existsSync(FILE_PATH)) {
      return res.status(404).json({ message: '❌ File not found' });
    }

    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(FILE_PATH);
    const sheet = workbook.getWorksheet('Attendance');

    const data = [];

    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      data.push({
        date: row.getCell(1).value,
        time: row.getCell(2).value,
        id: row.getCell(3).value,
        name: row.getCell(4).value,
      });
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: '❌ Failed to read Excel file' });
  }
});

// ✅ Serve frontend if dist folder exists (optional)
const frontendPath = path.join(__dirname, '../Frontend/dist');
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// ✅ Start server
app.listen(5000, () =>
  console.log('✅ Express server running on http://localhost:5000')
); 