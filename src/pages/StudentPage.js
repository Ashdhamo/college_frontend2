import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import '../App.css';

function StudentPage() {
  const [user, setUser] = useState(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [majorQuery, setMajorQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYears, setSelectedYears] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentStudent, setCurrentStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    year: 1,
    major: ''
  });
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    
    // Allow both admin and student to access this page
    if (!userData || (userData.position !== 'student' && userData.position !== 'admin')) {
      navigate('/');
      return;
    }
    
    setUser(userData);
    
    // Load all students initially
    searchStudents('', [], '');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const toggleFilterMenu = () => {
    setShowFilterMenu(!showFilterMenu);
  };

  const searchStudents = async (query, years, major) => {
    setLoading(true);
    try {
      const requestBody = { 
        name: query 
      };
      
      if (years && years.length > 0) requestBody.year = years;
      if (major) requestBody.major = major;
      
      const response = await fetch(`${API_BASE_URL}/student/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        console.error('Error searching students');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchStudents(query, selectedYears, majorQuery);
  };

  const handleMajorChange = (e) => {
    const query = e.target.value;
    setMajorQuery(query);
    searchStudents(searchQuery, selectedYears, query);
  };

  const handleYearChange = (year) => {
    let newSelectedYears;
    
    if (selectedYears.includes(year)) {
      newSelectedYears = selectedYears.filter(y => y !== year);
    } else {
      newSelectedYears = [...selectedYears, year];
    }
    
    setSelectedYears(newSelectedYears);
    searchStudents(searchQuery, newSelectedYears, majorQuery);
  };

  const clearFilters = () => {
    setSelectedYears([]);
    setMajorQuery('');
    searchStudents(searchQuery, [], '');
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      email: '',
      year: 1,
      major: ''
    });
    setModalMode('add');
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setFormData({
      name: student.name,
      email: student.email,
      year: student.year,
      major: student.major
    });
    setCurrentStudent(student);
    setModalMode('edit');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentStudent(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'year' ? parseInt(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let response;
      
      if (modalMode === 'add') {
        response = await fetch(`${API_BASE_URL}/student/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/student/${currentStudent.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }
      
      const data = await response.json();
      
      if (response.ok) {
        setAlert({
          type: 'success',
          message: modalMode === 'add' ? 'Student added successfully' : 'Student updated successfully'
        });
        closeModal();
        searchStudents(searchQuery, selectedYears, majorQuery);
        
        // Clear alert after 3 seconds
        setTimeout(() => {
          setAlert(null);
        }, 3000);
      } else {
        setAlert({
          type: 'danger',
          message: data.error || 'An error occurred'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setAlert({
        type: 'danger',
        message: 'An error occurred while processing your request'
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/student/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setAlert({
          type: 'success',
          message: 'Student deleted successfully'
        });
        searchStudents(searchQuery, selectedYears, majorQuery);
        
        // Clear alert after 3 seconds
        setTimeout(() => {
          setAlert(null);
        }, 3000);
      } else {
        const data = await response.json();
        setAlert({
          type: 'danger',
          message: data.error || 'An error occurred while deleting the student'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setAlert({
        type: 'danger',
        message: 'An error occurred while processing your request'
      });
    }
  };

  const hasActiveFilters = selectedYears.length > 0 || majorQuery.length > 0;

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

      
      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}
      
      <div className="search-filter-container">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search students..." 
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="filter-dropdown">
          <button 
            className={`filter-button ${showFilterMenu ? 'active' : ''}`} 
            onClick={toggleFilterMenu}
          >
            <span>Filter</span>
            {hasActiveFilters && <span className="filter-badge"></span>}
            <i className="fas fa-chevron-down"></i>
          </button>
          
          <div className={`filter-menu ${showFilterMenu ? 'show' : ''}`}>
            <div className="filter-section">
              <h4>Year</h4>
              <div className="checkbox-group">
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="year1" 
                    checked={selectedYears.includes(1)} 
                    onChange={() => handleYearChange(1)} 
                  />
                  <label htmlFor="year1">Year 1</label>
                </div>
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="year2" 
                    checked={selectedYears.includes(2)} 
                    onChange={() => handleYearChange(2)} 
                  />
                  <label htmlFor="year2">Year 2</label>
                </div>
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="year3" 
                    checked={selectedYears.includes(3)} 
                    onChange={() => handleYearChange(3)} 
                  />
                  <label htmlFor="year3">Year 3</label>
                </div>
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="year4" 
                    checked={selectedYears.includes(4)} 
                    onChange={() => handleYearChange(4)} 
                  />
                  <label htmlFor="year4">Year 4</label>
                </div>
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="year5" 
                    checked={selectedYears.includes(5)} 
                    onChange={() => handleYearChange(5)} 
                  />
                  <label htmlFor="year5">Year 5</label>
                </div>
              </div>
            </div>
            
            <div className="filter-section">
              <h4>Major</h4>
              <div className="filter-search">
                <input 
                  type="text" 
                  placeholder="Search major..." 
                  value={majorQuery}
                  onChange={handleMajorChange}
                />
              </div>
            </div>
            
            {hasActiveFilters && (
              <div className="filter-actions">
                <button onClick={clearFilters} className="clear-filters">
                  <i className="fas fa-times"></i> Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading students...</div>
      ) : (
        <>
          {students.length > 0 ? (
            <div className="student-cards">
              {students.map(student => (
                <div key={student.id} className="student-card">
                  <div className="student-card-header">
                    {student.name}
                  </div>
                  <div className="student-card-body">
                    <p>
                      <i className="fas fa-graduation-cap"></i>
                      {student.major}
                      <span className={`student-card-year year-${student.year}`}>
                        Year {student.year}
                      </span>
                    </p>
                    <p>
                      <i className="fas fa-envelope"></i>
                      {student.email}
                    </p>
                    <p>
                      <i className="fas fa-id-card"></i>
                      ID: {student.id}
                    </p>
                    
                    {user.position === 'admin' && (
                      <div className="student-card-actions">
                        <button 
                          className="action-btn edit-btn" 
                          onClick={() => openEditModal(student)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="action-btn delete-btn" 
                          onClick={() => handleDelete(student.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <i className="fas fa-search"></i>
              <p>No students found matching your search criteria.</p>
            </div>
          )}
        </>
      )}
      
      {user.position === 'admin' && (
        <div className="add-button" onClick={openAddModal}>
          <i className="fas fa-plus"></i>
        </div>
      )}
      
      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalMode === 'add' ? 'Add New Student' : 'Edit Student'}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="year">Year</label>
                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                  >
                    <option value={1}>Year 1</option>
                    <option value={2}>Year 2</option>
                    <option value={3}>Year 3</option>
                    <option value={4}>Year 4</option>
                    <option value={5}>Year 5</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="major">Major</label>
                  <input
                    type="text"
                    id="major"
                    name="major"
                    value={formData.major}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'add' ? 'Add Student' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentPage;