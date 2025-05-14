import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function StudentPage() {
  const [user, setUser] = useState(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    
    // Allow both admin and student to access this page
    if (!userData || (userData.position !== 'student' && userData.position !== 'admin')) {
      navigate('/');
      return;
    }
    
    setUser(userData);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const goBack = () => {
    if (user.position === 'admin') {
      navigate('/admin');
    }
  };

  const toggleFilterMenu = () => {
    setShowFilterMenu(!showFilterMenu);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search functionality will be implemented later
    console.log('Searching for:', searchQuery);
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Student Management</h1>
        <button onClick={handleLogout} className="logout-btn">
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
      
      {user.position === 'admin' && (
        <nav className="admin-nav">
          <ul>
            <li>
              <a href="/admin">
                <i className="fas fa-tachometer-alt"></i> Dashboard
              </a>
            </li>
            <li>
              <a href="/student" className="active">
                <i className="fas fa-user-graduate"></i> Students
              </a>
            </li>
            <li>
              <a href="/professor">
                <i className="fas fa-chalkboard-teacher"></i> Professors
              </a>
            </li>
            <li>
              <a href="/class">
                <i className="fas fa-book"></i> Classes
              </a>
            </li>
            <li>
              <a href="#" onClick={handleLogout} className="logout">
                <i className="fas fa-sign-out-alt"></i> Logout
              </a>
            </li>
          </ul>
        </nav>
      )}
      
      
      <div className="search-filter-container">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search students..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-dropdown">
          <button 
            className={`filter-button ${showFilterMenu ? 'active' : ''}`} 
            onClick={toggleFilterMenu}
          >
            <span>Filter</span>
            <i className="fas fa-chevron-down"></i>
          </button>
          
          <div className={`filter-menu ${showFilterMenu ? 'show' : ''}`}>
            <ul>
              <li><a href="#">All Students</a></li>
              <li><a href="#">Undergraduate</a></li>
              <li><a href="#">Graduate</a></li>
              <li><a href="#">Active</a></li>
              <li><a href="#">Inactive</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentPage;