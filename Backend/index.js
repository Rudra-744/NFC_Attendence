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

    // ✅ Check if already marked today
    let alreadyMarked = false;
    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      const rowDate = row.getCell(1).value;
      const rowId = row.getCell(3).value;

      if (rowDate === date && rowId == id) {
        alreadyMarked = true;
      }
    });

    if (alreadyMarked) {
      return res.json({ message: `⚠️ Attendance already marked for ${name}` });
    }

    // ✅ If not marked, then add new entry
    sheet.addRow([date, time, id, name]);
    await workbook.xlsx.writeFile(FILE_PATH);

    res.json({ message: `✅ Attendance saved for ${name}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Error saving attendance' });
  }
});
