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

const MainContent = styled.div`
  flex: 1;
  padding: 30px;
  margin-top: 70px;
`;

const ContentWrapper = styled.div`
  display: flex;
`;

const SearchContainer = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  padding: 24px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SearchInputGroup = styled.div`
  display: flex;
  gap: 10px;
  flex: 1;
`;

const SearchInput = styled.input`
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  flex: 1;
`;

const Button = styled.button`
  background-color: ${props => props.refresh ? "#6c757d" : "#0078ff"};
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  &:hover {
    background-color: ${props => props.refresh ? "#5a6268" : "#0066cc"};
  }
`;

const RefreshButton = styled(Button)`
  margin-left: 10px;
`;

const TableContainer = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  padding: 24px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background: #f4f6fa;
  padding: 12px;
  border-bottom: 1px solid #ddd;
  text-align: left;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #eee;
`;

const StatusMessage = styled.div`
  margin-top: 20px;
  padding: 10px;
  border-radius: 4px;
  background-color: ${props => props.success ? '#e6f7ea' : '#ffebee'};
  color: ${props => props.success ? '#1e8e3e' : '#d32f2f'};
`;

function BrOrderPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  // 데이터 불러오기 함수
  const fetchOrders = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const url = searchTerm 
        ? `/api/br-orders?search=${encodeURIComponent(searchTerm)}` 
        : '/api/br-orders';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('서버 응답이 올바르지 않습니다.');
      }
      
      const data = await response.json();
      setOrders(data);
      
      if (data.length === 0 && searchTerm) {
        setStatus({ success: false, message: '검색 결과가 없습니다.' });
      }
    } catch (error) {
      console.error("주문 데이터를 불러오는 중 오류가 발생했습니다:", error);
      setStatus({ success: false, message: '데이터를 불러오는 중 오류가 발생했습니다.' });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 불러오기
  useEffect(() => {
    fetchOrders();
  }, []);

  // 검색 핸들러
  const handleSearch = () => {
    fetchOrders();
  };

  // 엔터 키 핸들러
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 새로고침 핸들러
  const handleRefresh = () => {
    setSearchTerm('');
    fetchOrders();
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
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
            <h2>BR 주문</h2>
            
            <SearchContainer>
              <SearchInputGroup>
                <SearchInput
                  type="text"
                  placeholder="검색어를 입력하세요"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button onClick={handleSearch}>검색</Button>
              </SearchInputGroup>
              <RefreshButton refresh onClick={handleRefresh}>
                새로고침
              </RefreshButton>
            </SearchContainer>
            
            {status && (
              <StatusMessage success={status.success}>
                {status.message}
              </StatusMessage>
            )}
            
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <Th>주문일</Th>
                    <Th>주문번호</Th>
                    <Th>상품명</Th>
                    <Th>바코드</Th>
                    <Th>개수</Th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <Td colSpan="5" style={{ textAlign: "center" }}>로딩 중...</Td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <Td colSpan="5" style={{ textAlign: "center" }}>데이터가 없습니다</Td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order._id}>
                        <Td>{formatDate(order.date)}</Td>
                        <Td>{order.orderNumber}</Td>
                        <Td>{order.productName}</Td>
                        <Td>{order.barcode}</Td>
                        <Td>{order.quantity}</Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </TableContainer>
          </MainContent>
        </PageContainer>
      </ContentWrapper>
    </>
  );
}

export default BrOrderPage; 