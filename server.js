console.log('============= 서버 시작 =============');
console.log('서버 시작 시간:', new Date().toISOString());
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('======================================');

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

// 정적 파일 제공 설정 (React 앱)
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB 연결
const MONGO_URI = 'mongodb+srv://immongorder1:djajskek1@cluster0.wo05sle.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'immongRK';
const COLLECTION_NAME = 'macBook';
const BR_COLLECTION_NAME = 'brOrders';

mongoose.connect(MONGO_URI, {
  dbName: DB_NAME,
})
.then(() => console.log('MongoDB에 연결되었습니다.'))
.catch(err => console.error('MongoDB 연결 에러:', err));

// 임시 스토리지 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.xlsx' && ext !== '.xls') {
      return cb(new Error('엑셀 파일만 업로드할 수 있습니다.'));
    }
    cb(null, true);
  }
});

// 스키마 및 모델 정의
const DataSchema = new mongoose.Schema({
  c_orderName: String,
  k_productName: String,
  l_optionName: String
}, { timestamps: true });

const DataModel = mongoose.model(COLLECTION_NAME, DataSchema);

// BR 주문 스키마 및 모델 정의
const BrOrderSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  orderNumber: { type: String, required: true },
  productName: { type: String, required: true },
  barcode: { type: String, required: true },
  quantity: { type: Number, default: 1 }
}, { timestamps: true });

const BrOrderModel = mongoose.model(BR_COLLECTION_NAME, BrOrderSchema);

// 열 문자를 인덱스로 변환하는 헬퍼 함수
function columnToIndex(column) {
  let index = 0;
  for (let i = 0; i < column.length; i++) {
    index = index * 26 + column.charCodeAt(i) - 64; // 'A'는 65, 'A'는 인덱스 1이 되어야 함
  }
  return index - 1; // 0-기반 인덱스로 변환
}

// 인덱스를 열 문자로 변환하는 헬퍼 함수
function indexToColumn(index) {
  let column = '';
  index += 1; // 1-기반 인덱스로 변환
  
  while (index > 0) {
    const remainder = (index - 1) % 26;
    column = String.fromCharCode(65 + remainder) + column;
    index = Math.floor((index - 1) / 26);
  }
  
  return column;
}

// 서버 상태 확인용 엔드포인트
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// 엑셀 파일 업로드 API
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('파일 업로드 요청 받음');
    if (!req.file) {
      return res.status(400).json({ message: '파일이 없습니다.' });
    }

    const filePath = req.file.path;
    console.log(`파일 경로: ${filePath}`);
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // 엑셀 데이터를 배열 형식으로 변환
    const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(`엑셀 데이터 행 수: ${rawData.length}`);
    
    if (rawData.length <= 1) { // 헤더만 있거나 데이터가 없는 경우
      fs.unlinkSync(filePath); // 임시 파일 삭제
      return res.status(400).json({ message: '엑셀 파일에 충분한 데이터가 없습니다.' });
    }
    
    // C, K, L 열의 인덱스
    const cColumnIndex = columnToIndex('C');
    const kColumnIndex = columnToIndex('K');
    const lColumnIndex = columnToIndex('L');
    
    console.log(`열 인덱스: C=${cColumnIndex}, K=${kColumnIndex}, L=${lColumnIndex}`);
    
    // 첫 번째 행은 헤더로 간주하고 건너뜀
    const documents = [];
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      
      // 행이 충분히 길고 필요한 데이터가 있는지 확인
      if (row && row.length > lColumnIndex && 
          row[cColumnIndex] !== undefined && 
          row[kColumnIndex] !== undefined && 
          row[lColumnIndex] !== undefined) {
        documents.push({
          c_orderName: String(row[cColumnIndex]),
          k_productName: String(row[kColumnIndex]),
          l_optionName: String(row[lColumnIndex])
        });
      }
    }

    console.log(`저장할 문서 수: ${documents.length}`);
    if (documents.length === 0) {
      fs.unlinkSync(filePath); // 임시 파일 삭제
      return res.status(400).json({ message: 'C, K, L 열에서 유효한 데이터를 찾을 수 없습니다.' });
    }

    // MongoDB에 데이터 저장
    await DataModel.insertMany(documents);
    console.log(`MongoDB에 ${documents.length}개 문서 저장 완료`);
    
    // 임시 파일 삭제
    fs.unlinkSync(filePath);
    
    res.status(200).json({ 
      message: '데이터가 성공적으로 저장되었습니다.', 
      count: documents.length 
    });
  } catch (error) {
    console.error('파일 처리 중 오류:', error);
    // 임시 파일이 있으면 삭제 시도
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('임시 파일 삭제 중 오류:', unlinkError);
      }
    }
    res.status(500).json({ message: '파일 처리 중 오류가 발생했습니다.' });
  }
});

// 업로드된 데이터 조회 API
app.get('/api/items', async (req, res) => {
  try {
    const items = await DataModel.find({}).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: '데이터 조회 중 오류가 발생했습니다.' });
  }
});

// 체크한 상품 삭제 API
app.post('/api/delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: '삭제할 항목이 없습니다.' });
    }
    await DataModel.deleteMany({ _id: { $in: ids } });
    res.json({ message: '삭제가 완료되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '삭제 중 오류가 발생했습니다.' });
  }
});

// BR 주문 데이터 조회 API
app.get('/api/br-orders', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search) {
      // 검색어가 있는 경우 주문번호, 상품명, 바코드에서 검색
      query = {
        $or: [
          { orderNumber: { $regex: search, $options: 'i' } },
          { productName: { $regex: search, $options: 'i' } },
          { barcode: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const orders = await BrOrderModel.find(query).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    console.error('BR 주문 조회 중 오류:', err);
    res.status(500).json({ message: '데이터 조회 중 오류가 발생했습니다.' });
  }
});

// BR 주문 데이터 추가 API (테스트용)
app.post('/api/br-orders', async (req, res) => {
  try {
    const { orderNumber, productName, barcode, quantity, date } = req.body;
    
    if (!orderNumber || !productName || !barcode) {
      return res.status(400).json({ message: '필수 필드가 누락되었습니다.' });
    }
    
    const newOrder = new BrOrderModel({
      orderNumber,
      productName,
      barcode,
      quantity: quantity || 1,
      date: date || new Date()
    });
    
    await newOrder.save();
    res.status(201).json({ message: '주문이 성공적으로 추가되었습니다.', order: newOrder });
  } catch (err) {
    console.error('BR 주문 추가 중 오류:', err);
    res.status(500).json({ message: '주문 추가 중 오류가 발생했습니다.' });
  }
});

// React 라우팅을 위한 폴백 핸들러
// 모든 GET 요청을 React 앱으로 전달
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
  console.log(`정적 파일 경로: ${path.join(__dirname, 'build')}`);
  console.log(`현재 작업 디렉토리: ${process.cwd()}`);
}); 