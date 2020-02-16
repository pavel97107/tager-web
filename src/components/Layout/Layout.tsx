import React from 'react';
import styled from 'styled-components';

import { fonts, fontSize } from '@constants/theme';

import Header from './components/Header';
import Footer from './components/Footer';

type Props = {
  children?: React.ReactNode;
};

function Layout({ children }: Props) {
  return (
    <Container>
      <Header />
      <Main>{children}</Main>
      <Footer />
    </Container>
  );
}

const Container = styled.div`
  background-color: #fff;
  font-size: ${fontSize};
  font-family: ${fonts.Roboto};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Main = styled.main`
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
`;

export default Layout;
