import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminPage from './pages/AdminPage';
import StudentPage from './pages/StudentPage';
import ProfessorPage from './pages/ProfessorPage';
import ClassPage from './pages/ClassPage';
import StudentInterface from './pages/StudentInterface';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/student" element={<StudentPage />} />
        <Route path="/professor" element={<ProfessorPage />} />
        <Route path="/class" element={<ClassPage />} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/student-interface" element={<StudentInterface />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;