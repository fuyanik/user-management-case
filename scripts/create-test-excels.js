const XLSX = require('xlsx');
const path = require('path');

// ============================================
// 1. DÜZGÜN EXCEL - Tüm veriler doğru
// ============================================
const validUsers = [
  { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', age: 25, password: '123456' },
  { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', age: 30, password: 'password123' },
  { firstName: 'Michael', lastName: 'Johnson', email: 'michael.j@example.com', age: 28, password: 'secure789' },
  { firstName: 'Emily', lastName: 'Brown', email: 'emily.brown@example.com', age: 35, password: 'mypass456' },
  { firstName: 'David', lastName: 'Wilson', email: 'david.wilson@example.com', age: 22, password: 'david12345' },
];

// ============================================
// 2. SORUNLU EXCEL #1 - Boş alanlar ve validation hataları
// ============================================
const errorUsers1 = [
  { firstName: 'Valid', lastName: 'User', email: 'valid@example.com', age: 25, password: '123456' },       // Row 2: OK
  { firstName: '', lastName: 'NoFirstName', email: 'no.first@example.com', age: 30, password: '123456' },  // Row 3: firstName boş
  { firstName: 'NoLast', lastName: '', email: 'no.last@example.com', age: 28, password: '123456' },        // Row 4: lastName boş
  { firstName: 'BadEmail', lastName: 'User', email: 'invalid-email', age: 25, password: '123456' },        // Row 5: Geçersiz email
  { firstName: 'BadAge', lastName: 'User', email: 'bad.age@example.com', age: 200, password: '123456' },   // Row 6: Yaş 150'den büyük
  { firstName: 'NoAge', lastName: 'User', email: 'no.age@example.com', age: '', password: '123456' },      // Row 7: Yaş boş
  { firstName: 'NegativeAge', lastName: 'User', email: 'neg.age@example.com', age: -5, password: '123456' }, // Row 8: Negatif yaş
];

// ============================================
// 3. SORUNLU EXCEL #2 - Duplicate email ve kısa password
// ============================================
const errorUsers2 = [
  { firstName: 'First', lastName: 'User', email: 'duplicate@example.com', age: 25, password: '123456' },   // Row 2: OK
  { firstName: 'Second', lastName: 'User', email: 'duplicate@example.com', age: 30, password: '123456' },  // Row 3: Duplicate email (Row 2 ile aynı)
  { firstName: 'Short', lastName: 'Pass', email: 'short.pass@example.com', age: 28, password: '123' },     // Row 4: Password çok kısa (3 karakter)
  { firstName: 'NoPass', lastName: 'User', email: 'no.pass@example.com', age: 25, password: '' },          // Row 5: Password boş
  { firstName: 'Another', lastName: 'Dup', email: 'duplicate@example.com', age: 35, password: '123456' },  // Row 6: Yine duplicate email
  { firstName: 'Valid', lastName: 'AtEnd', email: 'valid.end@example.com', age: 22, password: 'validpass' }, // Row 7: OK ama önceki hatalar var
];

function createExcelFile(data, filename, description) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

  // Sütun genişlikleri
  worksheet['!cols'] = [
    { wch: 15 }, // firstName
    { wch: 15 }, // lastName
    { wch: 28 }, // email
    { wch: 6 },  // age
    { wch: 15 }, // password
  ];

  const outputPath = path.join(__dirname, '..', 'public', filename);
  XLSX.writeFile(workbook, outputPath);

  console.log(`\n✅ ${filename} oluşturuldu`);
  console.log(`   📁 Konum: public/${filename}`);
  console.log(`   📋 ${description}`);
  console.log(`   👥 ${data.length} satır`);
}

console.log('🔧 Test Excel dosyaları oluşturuluyor...\n');
console.log('=' .repeat(60));

// 1. Düzgün Excel
createExcelFile(
  validUsers,
  'test-valid.xlsx',
  'Tüm veriler doğru - başarıyla import edilmeli'
);

// 2. Sorunlu Excel #1
createExcelFile(
  errorUsers1,
  'test-errors-1.xlsx',
  'Boş alanlar ve validation hataları içeriyor'
);

console.log('\n   🔴 Beklenen hatalar:');
console.log('      - Row 3: firstName boş');
console.log('      - Row 4: lastName boş');
console.log('      - Row 5: Geçersiz email formatı');
console.log('      - Row 6: Yaş 150\'den büyük');
console.log('      - Row 7: Yaş boş/geçersiz');
console.log('      - Row 8: Negatif yaş');

// 3. Sorunlu Excel #2
createExcelFile(
  errorUsers2,
  'test-errors-2.xlsx',
  'Duplicate email ve kısa password içeriyor'
);

console.log('\n   🔴 Beklenen hatalar:');
console.log('      - Row 3: Duplicate email (Row 2 ile aynı)');
console.log('      - Row 4: Password çok kısa (min 6 karakter)');
console.log('      - Row 5: Password boş');
console.log('      - Row 6: Duplicate email (Row 2 ile aynı)');

console.log('\n' + '='.repeat(60));
console.log('\n🎉 Tüm test dosyaları hazır!\n');
console.log('📂 Dosyalar public/ klasöründe:');
console.log('   1. test-valid.xlsx     → Hatasız, import edilmeli');
console.log('   2. test-errors-1.xlsx  → Validation hataları');
console.log('   3. test-errors-2.xlsx  → Duplicate + password hataları');
console.log('');
