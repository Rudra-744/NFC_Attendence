const express = require('express');
const cors = require('cors');
const Excel = require('exceljs');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const FILE_PATH = path.join(__dirname, 'Attendance.xlsx');

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

app.listen(5000, () => console.log('✅ Express server running on http://localhost:5000'));
