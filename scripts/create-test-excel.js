const XLSX = require('xlsx');
const path = require('path');

// Test verileri - Tüm password'lar dolu
const testUsers = [
  { firstName: 'Ali', lastName: 'Yılmaz', email: 'ali.yilmaz@test.com', age: 25, password: 'test123456' },
  { firstName: 'Ayşe', lastName: 'Kaya', email: 'ayse.kaya@test.com', age: 30, password: 'test123456' },
  { firstName: 'Mehmet', lastName: 'Demir', email: 'mehmet.demir@test.com', age: 28, password: 'demir12345' },
  { firstName: 'Fatma', lastName: 'Çelik', email: 'fatma.celik@test.com', age: 35, password: 'secure7890' },
  { firstName: 'Ahmet', lastName: 'Şahin', email: 'ahmet.sahin@test.com', age: 22, password: 'sahin12345' },
  { firstName: 'Zeynep', lastName: 'Arslan', email: 'zeynep.arslan@test.com', age: 27, password: 'mypass1234' },
  { firstName: 'Emre', lastName: 'Öztürk', email: 'emre.ozturk@test.com', age: 33, password: 'emre123456' },
  { firstName: 'Elif', lastName: 'Aydın', email: 'elif.aydin@test.com', age: 29, password: 'pass456789' },
  { firstName: 'Burak', lastName: 'Koç', email: 'burak.koc@test.com', age: 31, password: 'burak12345' },
  { firstName: 'Selin', lastName: 'Yıldız', email: 'selin.yildiz@test.com', age: 26, password: 'secret1234' },
];

// Worksheet oluştur
const worksheet = XLSX.utils.json_to_sheet(testUsers);

// Workbook oluştur
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

// Sütun genişliklerini ayarla
worksheet['!cols'] = [
  { wch: 12 }, // firstName
  { wch: 12 }, // lastName
  { wch: 25 }, // email
  { wch: 6 },  // age
  { wch: 15 }, // password
];

// Dosyayı kaydet
const outputPath = path.join(__dirname, '..', 'public', 'test-users.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log('✅ Test Excel dosyası oluşturuldu!');
console.log(`📁 Konum: ${outputPath}`);
console.log(`👥 ${testUsers.length} test kullanıcısı eklendi`);
console.log('\n📋 Kullanıcılar:');
testUsers.forEach((u, i) => {
  console.log(`   ${i + 1}. ${u.firstName} ${u.lastName} (${u.email})`);
});
