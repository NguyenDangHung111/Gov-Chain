import sequelize from '../config/database';
import User from '../models/User';
import '../models/Transaction'; // Import to ensure table is created
import '../models/StatusLog'; // Import to ensure table is created

const seedData = [
  {
    citizenId: '001090000001',
    password: 'password123',
    fullName: 'Nguyễn Văn An',
    dob: '1990-01-01',
    address: '123 Đường Láng, Hà Nội',
    job: 'Kỹ sư phần mềm',
    role: 'citizen',
  },
  {
    citizenId: '001090000002',
    password: 'password123',
    fullName: 'Trần Thị Bích',
    dob: '1992-05-15',
    address: '456 Nguyễn Trãi, Hà Nội',
    job: 'Giáo viên',
    role: 'citizen',
  },
  {
    citizenId: '001090000003',
    password: 'password123',
    fullName: 'Lê Văn Cường',
    dob: '1985-08-20',
    address: '789 Cầu Giấy, Hà Nội',
    job: 'Bác sĩ',
    role: 'citizen',
  },
  {
    citizenId: '001090000004',
    password: 'password123',
    fullName: 'Phạm Thị Dung',
    dob: '1995-12-10',
    address: '321 Kim Mã, Hà Nội',
    job: 'Kế toán',
    role: 'citizen',
  },
  {
    citizenId: '001090000005',
    password: 'password123',
    fullName: 'Hoàng Văn Em',
    dob: '1998-03-25',
    address: '654 Đê La Thành, Hà Nội',
    job: 'Sinh viên',
    role: 'citizen',
  },
  {
    citizenId: '001090000006',
    password: 'password123',
    fullName: 'Vũ Thị Phương',
    dob: '1988-07-07',
    address: '987 Xuân Thủy, Hà Nội',
    job: 'Kinh doanh',
    role: 'citizen',
  },
  {
    citizenId: '001090000007',
    password: 'password123',
    fullName: 'Đặng Văn Giang',
    dob: '1980-11-11',
    address: '159 Tây Sơn, Hà Nội',
    job: 'Luật sư',
    role: 'citizen',
  },
  {
    citizenId: '001090000008',
    password: 'admin123',
    fullName: 'Nguyễn Văn Hùng',
    dob: '1975-09-09',
    address: 'UBND Quận Cầu Giấy',
    job: 'Cán bộ hộ tịch',
    role: 'officer',
  },
  {
    citizenId: '001090000009',
    password: 'admin123',
    fullName: 'Trần Thị Lan',
    dob: '1982-04-04',
    address: 'UBND Phường Dịch Vọng',
    job: 'Cán bộ tư pháp',
    role: 'officer',
  },
  {
    citizenId: '001090000010',
    password: 'admin123',
    fullName: 'Lê Văn Minh',
    dob: '1978-02-02',
    address: 'Sở Tư Pháp Hà Nội',
    job: 'Trưởng phòng',
    role: 'officer',
  },
];

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true }); // Reset database
    console.log('Database synced!');

    for (const user of seedData) {
      await User.create(user as any);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
