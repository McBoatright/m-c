import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignupForm from './components/SignupForm';
import Calendar from './components/Calendar';
import LoginForm from './components/LoginForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="*" element={<LoginForm />} />
      </Routes>
    </Router>
  );
}

export default App;