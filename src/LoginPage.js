import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f6fa;
`;
const LoginBox = styled.div`
  background: #fff;
  padding: 40px 32px;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  width: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const Title = styled.h2`
  color: #222;
  margin-bottom: 32px;
  font-weight: 700;
`;
const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 18px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
`;
const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: #0078ff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s;
  &:hover {
    background: #005fcc;
  }
`;

function LoginPage() {
  const navigate = useNavigate();
  const handleLogin = (e) => {
    e.preventDefault();
    // 로그인 기능은 추후 추가
    navigate("/main");
  };
  return (
    <Container>
      <LoginBox>
        <Title>판매자 로그인</Title>
        <form onSubmit={handleLogin} style={{width: '100%'}}>
          <Input type="text" placeholder="아이디" required />
          <Input type="password" placeholder="비밀번호" required />
          <Button type="submit">로그인</Button>
        </form>
      </LoginBox>
    </Container>
  );
}

export default LoginPage; 