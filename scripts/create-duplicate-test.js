const XLSX = require('xlsx');
const path = require('path');

// Duplicate email testi - aynı email iki kez
const duplicateUsers = [
  { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', age: 25, password: '123456' },
  { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', age: 30, password: '123456' },
  { firstName: 'John', lastName: 'Duplicate', email: 'john.doe@example.com', age: 35, password: '123456' },  // Row 4: DUPLICATE!
  { firstName: 'Mike', lastName: 'Wilson', email: 'mike.wilson@example.com', age: 28, password: '123456' },
];

const worksheet = XLSX.utils.json_to_sheet(duplicateUsers);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

worksheet['!cols'] = [
  { wch: 15 },
  { wch: 15 },
  { wch: 28 },
  { wch: 6 },
  { wch: 15 },
];

const outputPath = path.join(__dirname, '..', 'public', 'test-duplicate.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log('✅ test-duplicate.xlsx oluşturuldu!');
console.log('📁 Konum: public/test-duplicate.xlsx');
console.log('');
console.log('📋 İçerik:');
console.log('   Row 2: John Doe - john.doe@example.com');
console.log('   Row 3: Jane Smith - jane.smith@example.com');
console.log('   Row 4: John Duplicate - john.doe@example.com ← DUPLICATE!');
console.log('   Row 5: Mike Wilson - mike.wilson@example.com');
console.log('');
console.log('🔴 Beklenen: Row 2 ve Row 4 aynı email - duplicate hatası!');
