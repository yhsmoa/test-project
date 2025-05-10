import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Sidebar from "./components/Sidebar";

const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f4f6fa;
`;

const Nav = styled.nav`
  background: #fff;
  padding: 0 32px;
  height: 70px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
`;

const Logo = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: #0078ff;
`;

const ContentWrapper = styled.div`
  display: flex;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 30px;
  margin-top: 70px;
`;

const Content = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  padding: 40px 32px;
  text-align: center;
`;

const UploadButton = styled.button`
  background-color: #0078ff;
  color: white;
  padding: 14px 28px;
  border: none;
  border-radius: 4px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 30px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  &:hover {
    background-color: #0066cc;
    transform: translateY(-2px);
    transition: all 0.2s;
  }
`;

const ButtonContainer = styled.div`
  margin-top: 40px;
`;

const FileInput = styled.input`
  display: none;
`;

const StatusMessage = styled.div`
  margin-top: 20px;
  padding: 10px;
  border-radius: 4px;
  background-color: ${props => props.success ? '#e6f7ea' : '#ffebee'};
  color: ${props => props.success ? '#1e8e3e' : '#d32f2f'};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 40px;
`;
const Th = styled.th`
  background: #f4f6fa;
  padding: 10px;
  border-bottom: 1px solid #ddd;
`;
const Td = styled.td`
  padding: 10px;
  border-bottom: 1px solid #eee;
  text-align: center;
`;
const DeleteButton = styled.button`
  background: #d32f2f;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 15px;
  cursor: pointer;
  margin-top: 10px;
  &:hover {
    background: #b71c1c;
  }
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 22px;
  height: 22px;
  accent-color: #0078ff;
`;

const DeleteButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 8px;
`;

function MainPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const fileInputRef = React.useRef(null);

  // 데이터 불러오기
  const fetchItems = async () => {
    try {
      const res = await fetch('/api/items');
      const data = await res.json();
      setItems(data);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // 체크박스 핸들러
  const handleCheck = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(_id => _id !== id) : [...prev, id]);
  };
  const handleAllCheck = (e) => {
    if (e.target.checked) setSelected(items.map(item => item._id));
    else setSelected([]);
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    if (selected.length === 0) return;
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selected })
      });
      const result = await res.json();
      if (res.ok) {
        setStatus({ success: true, message: result.message });
        setSelected([]);
        fetchItems();
      } else {
        setStatus({ success: false, message: result.message });
      }
    } catch {
      setStatus({ success: false, message: '삭제 중 오류가 발생했습니다.' });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
      setStatus({ success: false, message: 'Excel 파일만 업로드 가능합니다.' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
        setStatus({ success: true, message: '파일이 성공적으로 업로드됐습니다.' });
        fetchItems();
      } else {
        setStatus({ success: false, message: result.message || '업로드 중 오류가 발생했습니다.' });
      }
    } catch (error) {
      setStatus({ success: false, message: '서버 연결 중 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
      e.target.value = null; // 파일 입력 초기화
    }
  };

  return (
    <>
      <Nav>
        <Logo>coupang wing</Logo>
        <div>판매자센터</div>
      </Nav>
      <ContentWrapper>
        <Sidebar />
        <PageContainer>
          <MainContent>
            <h2>엑셀 업로드</h2>
            <Content>
              <p>쿠팡 판매자센터 엑셀 업로드 페이지입니다.<br />
              필요한 기능을 차례로 추가해보세요.</p>
              
              <FileInput
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
              />
              
              <ButtonContainer>
                <UploadButton onClick={handleUploadClick} disabled={loading}>
                  {loading ? '처리 중...' : '엑셀 파일 업로드'}
                </UploadButton>
              </ButtonContainer>
              
              {status && (
                <StatusMessage success={status.success}>
                  {status.message}
                </StatusMessage>
              )}
              {/* 삭제 버튼을 테이블 오른쪽 위에 배치 */}
              <DeleteButtonWrapper>
                <DeleteButton onClick={handleDelete} disabled={selected.length === 0}>
                  선택 삭제
                </DeleteButton>
              </DeleteButtonWrapper>
              {/* 데이터 테이블 */}
              <Table>
                <thead>
                  <tr>
                    <Th><Checkbox onChange={handleAllCheck} checked={selected.length === items.length && items.length > 0} /></Th>
                    <Th>주문명</Th>
                    <Th>상품명</Th>
                    <Th>옵션명</Th>
                    <Th>업로드일</Th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <Td colSpan="5" style={{ textAlign: 'center' }}>데이터가 없습니다.</Td>
                    </tr>
                  ) : (
                    items.map(item => (
                      <tr key={item._id}>
                        <Td>
                          <Checkbox
                            checked={selected.includes(item._id)}
                            onChange={() => handleCheck(item._id)}
                          />
                        </Td>
                        <Td>{item.c_orderName}</Td>
                        <Td>{item.k_productName}</Td>
                        <Td>{item.l_optionName}</Td>
                        <Td>{new Date(item.createdAt).toLocaleDateString()}</Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Content>
          </MainContent>
        </PageContainer>
      </ContentWrapper>
    </>
  );
}

export default MainPage; 