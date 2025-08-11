import { HashRouter, Route, Routes } from 'react-router-dom';
import { Home } from '../pages/Home/Home';
import React from 'react';
import { About } from '../pages/About/About';

export const RouteRender: React.FC = () => (
  <HashRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </Routes>
  </HashRouter>
);
