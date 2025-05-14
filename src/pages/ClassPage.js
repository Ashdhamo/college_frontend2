import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ClassPage() {
  const [user, setUser] = useState(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  const toggleFilterMenu = () => {
    setShowFilterMenu(!showFilterMenu);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search functionality will be implemented later
    console.log('Searching for:', searchQuery);
  };

  const goBack = () => {
    navigate('/admin');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Class Management</h1>
        <button onClick={handleLogout} className="logout-btn">
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
      
      <nav className="admin-nav">
        <ul>
          <li>
            <a href="/admin">
              <i className="fas fa-tachometer-alt"></i> Dashboard
            </a>
          </li>
          <li>
            <a href="/student">
              <i className="fas fa-user-graduate"></i> Students
            </a>
          </li>
          <li>
            <a href="/professor">
              <i className="fas fa-chalkboard-teacher"></i> Professors
            </a>
          </li>
          <li>
            <a href="/class" className="active">
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
      

      <div className="search-filter-container">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search classes..." 
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
              <li><a href="#">All Classes</a></li>
              <li><a href="#">Undergraduate</a></li>
              <li><a href="#">Graduate</a></li>
              <li><a href="#">Current Semester</a></li>
              <li><a href="#">By Department</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClassPage;