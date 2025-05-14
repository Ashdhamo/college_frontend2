import React, { useEffect, useState } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';

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
        <button onClick={handleLogout} className="logout-btn">
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
      
      <nav className="admin-nav">
        <ul>
          <li>
            <NavLink to="/student" className={({isActive}) => isActive ? 'active' : ''}>
              <i className="fas fa-user-graduate"></i> Students
            </NavLink>
          </li>
          <li>
            <NavLink to="/professor" className={({isActive}) => isActive ? 'active' : ''}>
              <i className="fas fa-chalkboard-teacher"></i> Professors
            </NavLink>
          </li>
          <li>
            <NavLink to="/class" className={({isActive}) => isActive ? 'active' : ''}>
              <i className="fas fa-book"></i> Classes
            </NavLink>
          </li>
          <li>
            <a href="#" onClick={handleLogout} className="logout">
              <i className="fas fa-sign-out-alt"></i> Logout
            </a>
          </li>
        </ul>
      </nav>
      
      <div className="welcome-message">
        <h2>Hi, {user.user_name}!</h2>
        <p>Welcome to the Admin Dashboard. Please select a section to manage.</p>
      </div>
      
      <div className="admin-cards">
        <Link to="/student" className="admin-card student">
          <div className="admin-card-header">
            <h3>Student Management</h3>
          </div>
          <div className="admin-card-body">
            <div className="admin-card-icon">
              <i className="fas fa-user-graduate"></i>
            </div>
            <p>Manage student records, enrollments, and information</p>
          </div>
        </Link>
        
        <Link to="/professor" className="admin-card professor">
          <div className="admin-card-header">
            <h3>Professor Management</h3>
          </div>
          <div className="admin-card-body">
            <div className="admin-card-icon">
              <i className="fas fa-chalkboard-teacher"></i>
            </div>
            <p>Manage professor profiles, assignments, and schedules</p>
          </div>
        </Link>
        
        <Link to="/class" className="admin-card class">
          <div className="admin-card-header">
            <h3>Class Management</h3>
          </div>
          <div className="admin-card-body">
            <div className="admin-card-icon">
              <i className="fas fa-book"></i>
            </div>
            <p>Manage courses, schedules, and class assignments</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default AdminPage;