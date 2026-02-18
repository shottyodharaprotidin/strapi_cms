import React from 'react';
import styled from 'styled-components';

const LoginWrapper = styled.div`
  text-align: center;
  padding: 3rem;
`;

const LoginTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #333;
`;

const LoginSubtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
`;

const Login = ({ children, ...props }) => {
  return (
    <LoginWrapper>
      <LoginTitle>Welcome to Admin Portal</LoginTitle>
      <LoginSubtitle>Log in to your Account</LoginSubtitle>
      {children}
    </LoginWrapper>
  );
};

export default Login;
