import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminPage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    
    if (!userData || userData.position !== 'admin') {
      navigate('/');
      return;
    }
    
    setUser(userData);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
      <div className="welcome-message">
        <h2>Hi, {user.user_name}!</h2>
        <p>Welcome to the Admin Dashboard</p>
      </div>
    </div>
  );
}

export default AdminPage;