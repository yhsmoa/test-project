import React from "react";
import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";

const SidebarContainer = styled.div`
  width: 250px;
  min-height: calc(100vh - 70px);
  background: #fff;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
  padding: 20px 0;
`;

const MenuItem = styled(Link)`
  display: block;
  padding: 15px 25px;
  color: ${props => props.active ? "#0078ff" : "#333"};
  background: ${props => props.active ? "#f0f7ff" : "transparent"};
  font-weight: ${props => props.active ? "600" : "normal"};
  text-decoration: none;
  border-left: ${props => props.active ? "4px solid #0078ff" : "4px solid transparent"};
  transition: all 0.2s;
  
  &:hover {
    background: #f8f9fa;
    color: #0078ff;
  }
`;

const MenuTitle = styled.div`
  padding: 10px 25px;
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 15px;
`;

function Sidebar() {
  const location = useLocation();
  const path = location.pathname;
  
  return (
    <SidebarContainer>
      <MenuTitle>메뉴</MenuTitle>
      <MenuItem to="/" active={path === "/" ? 1 : 0}>
        엑셀 업로드
      </MenuItem>
      <MenuItem to="/br-order" active={path === "/br-order" ? 1 : 0}>
        BR 주문
      </MenuItem>
    </SidebarContainer>
  );
}

export default Sidebar; 