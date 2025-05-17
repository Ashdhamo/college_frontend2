import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ProfessorPage() {
  const [user, setUser] = useState(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentQuery, setDepartmentQuery] = useState('');
  const [professors, setProfessors] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tenureFilter, setTenureFilter] = useState(null); // null, 0, or 1
  const [salaryFilter, setSalaryFilter] = useState({
    type: null, // null, "greater", or "less"
    value: ""
  });
  const [selectedClass, setSelectedClass] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentProfessor, setCurrentProfessor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    tenure: 0,
    salary: '',
    years_worked: 1
  });
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    
    // Allow both admin and professor to access this page
    if (!userData || (userData.position !== 'professor' && userData.position !== 'admin')) {
      navigate('/');
      return;
    }
    
    setUser(userData);
    
    // Fetch all classes data
    fetchAllClasses();
    
    // If user is a professor, fetch their specific data
    if (userData.position === 'professor') {
      fetchProfessorData(userData.id);
    } else {
      // Load all professors for admin
      searchProfessors('', '', null, null, '');
    }
  }, [navigate]);
  
  const fetchAllClasses = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8080/classes/');
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };
  
  const fetchProfessorData = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8080/professor/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfessors([data]); // Set the professor's own data
      } else {
        console.error('Error fetching professor data');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const toggleFilterMenu = () => {
    setShowFilterMenu(!showFilterMenu);
  };

  const searchProfessors = async (name, department, tenure, salary, salaryValue) => {
    setLoading(true);
    try {
      const requestBody = { name };
      
      if (department) requestBody.department = department;
      if (tenure !== null) requestBody.tenure = tenure;
      if (salary) {
        requestBody.salary = salary;
        requestBody.salaryValue = salaryValue;
      }
      
      const response = await fetch('http://127.0.0.1:8080/professor/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfessors(data);
      } else {
        console.error('Error searching professors');
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
    searchProfessors(
      query, 
      departmentQuery, 
      tenureFilter, 
      salaryFilter.type, 
      salaryFilter.value
    );
  };

  const handleDepartmentChange = (e) => {
    const query = e.target.value;
    setDepartmentQuery(query);
    searchProfessors(
      searchQuery, 
      query, 
      tenureFilter, 
      salaryFilter.type, 
      salaryFilter.value
    );
  };

  const handleTenureChange = (value) => {
    const newValue = tenureFilter === value ? null : value;
    setTenureFilter(newValue);
    searchProfessors(
      searchQuery, 
      departmentQuery, 
      newValue, 
      salaryFilter.type, 
      salaryFilter.value
    );
  };

  const handleSalaryFilterChange = (type) => {
    const newType = salaryFilter.type === type ? null : type;
    setSalaryFilter({
      ...salaryFilter,
      type: newType
    });
    
    if (newType && salaryFilter.value) {
      searchProfessors(
        searchQuery, 
        departmentQuery, 
        tenureFilter, 
        newType, 
        salaryFilter.value
      );
    }
  };

  const handleSalaryValueChange = (e) => {
    const value = e.target.value;
    setSalaryFilter({
      ...salaryFilter,
      value
    });
    
    if (salaryFilter.type && value) {
      searchProfessors(
        searchQuery, 
        departmentQuery, 
        tenureFilter, 
        salaryFilter.type, 
        value
      );
    }
  };

  const clearFilters = () => {
    setDepartmentQuery('');
    setTenureFilter(null);
    setSalaryFilter({ type: null, value: '' });
    searchProfessors(searchQuery, '', null, null, '');
    setShowFilterMenu(false);
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: '',
      tenure: 0,
      salary: '',
      years_worked: 1
    });
    setModalMode('add');
    setCurrentProfessor(null);
    setShowModal(true);
  };

  const openEditModal = (professor) => {
    setFormData({
      name: professor.name,
      email: professor.email,
      phone: professor.phone,
      department: professor.department,
      tenure: professor.tenure,
      salary: professor.salary,
      years_worked: professor.years_worked
    });
    setModalMode('edit');
    setCurrentProfessor(professor);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentProfessor(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'tenure' ? parseInt(value) : 
              (name === 'years_worked' || name === 'salary') ? parseFloat(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let response;
      
      if (modalMode === 'add') {
        response = await fetch('http://127.0.0.1:8080/professor/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch(`http://127.0.0.1:8080/professor/${currentProfessor.id}`, {
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
          message: modalMode === 'add' ? 'Professor added successfully' : 'Professor updated successfully'
        });
        closeModal();
        searchProfessors(searchQuery, departmentQuery, tenureFilter, salaryFilter.type, salaryFilter.value);
        
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
    if (!window.confirm('Are you sure you want to delete this professor?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://127.0.0.1:8080/professor/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setAlert({
          type: 'success',
          message: 'Professor deleted successfully'
        });
        searchProfessors(searchQuery, departmentQuery, tenureFilter, salaryFilter.type, salaryFilter.value);
        
        // Clear alert after 3 seconds
        setTimeout(() => {
          setAlert(null);
        }, 3000);
      } else {
        const data = await response.json();
        setAlert({
          type: 'danger',
          message: data.error || 'An error occurred while deleting the professor'
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

  const hasActiveFilters = departmentQuery || tenureFilter !== null || salaryFilter.type;

  // Format time from 24-hour to 12-hour format
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Convert day code to full day name
  const getDayName = (dayCode) => {
    const days = {
      'M': 'Monday',
      'T': 'Tuesday',
      'W': 'Wednesday',
      'R': 'Thursday',
      'F': 'Friday',
      'SAT': 'Saturday',
      'SUN': 'Sunday'
    };
    return days[dayCode] || dayCode;
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>
          {user.position === 'professor' && professors.length > 0
            ? `Hello, Professor ${professors[0].name}` 
            : 'Professor Management'}
        </h1>
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
              <a href="/student">
                <i className="fas fa-user-graduate"></i> Students
              </a>
            </li>
            <li>
              <a href="/professor" className="active">
                <i className="fas fa-chalkboard-teacher"></i> Professors
              </a>
            </li>
            <li>
              <a href="/class">
                <i className="fas fa-book"></i> Classes
              </a>
            </li>
            <li>
              <button onClick={handleLogout} className="logout">
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </li>
          </ul>
        </nav>
      )}
      

      
      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}
      
      {user.position === 'admin' && (
        <div className="search-filter-container">
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search professors..." 
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
                <h4>Department</h4>
                <div className="filter-search">
                  <input 
                    type="text" 
                    placeholder="Search department..." 
                    value={departmentQuery}
                    onChange={handleDepartmentChange}
                  />
                </div>
              </div>
              
              <div className="filter-section">
                <h4>Tenure Status</h4>
                <div className="checkbox-group">
                  <div className="checkbox-item">
                    <input 
                      type="checkbox" 
                      id="tenured" 
                      checked={tenureFilter === 1} 
                      onChange={() => handleTenureChange(1)} 
                    />
                    <label htmlFor="tenured">Tenured</label>
                  </div>
                  <div className="checkbox-item">
                    <input 
                      type="checkbox" 
                      id="nonTenured" 
                      checked={tenureFilter === 0} 
                      onChange={() => handleTenureChange(0)} 
                    />
                    <label htmlFor="nonTenured">Non-Tenured</label>
                  </div>
                </div>
              </div>
              
              <div className="filter-section">
                <h4>Salary</h4>
                <div className="checkbox-group">
                  <div className="checkbox-item">
                    <input 
                      type="checkbox" 
                      id="greaterThan" 
                      checked={salaryFilter.type === 'greater'} 
                      onChange={() => handleSalaryFilterChange('greater')} 
                    />
                    <label htmlFor="greaterThan">Greater than</label>
                  </div>
                  <div className="checkbox-item">
                    <input 
                      type="checkbox" 
                      id="lessThan" 
                      checked={salaryFilter.type === 'less'} 
                      onChange={() => handleSalaryFilterChange('less')} 
                    />
                    <label htmlFor="lessThan">Less than</label>
                  </div>
                  {salaryFilter.type && (
                    <div className="filter-search">
                      <input 
                        type="number" 
                        placeholder="Enter amount..." 
                        value={salaryFilter.value}
                        onChange={handleSalaryValueChange}
                      />
                    </div>
                  )}
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
      )}
      
      {loading ? (
        <div className="loading">Loading professors...</div>
      ) : (
        <>
          {professors.length > 0 ? (
            <>
              <div className="professor-cards">
                {professors.map(professor => (
                  <div key={professor.id} className="professor-card">
                    <div className="professor-card-body">
                      <div className="professor-info">
                        <p>
                          <i className="fas fa-building"></i>
                          {professor.department}
                          <span className={`tenure-badge tenure-${professor.tenure ? 'yes' : 'no'}`}>
                            {professor.tenure ? 'Tenured' : 'Non-Tenured'}
                          </span>
                        </p>
                        <p>
                          <i className="fas fa-envelope"></i>
                          {professor.email}
                        </p>
                        <p>
                          <i className="fas fa-phone"></i>
                          {professor.phone}
                        </p>
                        <p>
                          <i className="fas fa-dollar-sign"></i>
                          ${parseFloat(professor.salary).toLocaleString()}
                        </p>
                        <p>
                          <i className="fas fa-calendar-alt"></i>
                          {professor.years_worked} {professor.years_worked === 1 ? 'year' : 'years'} of service
                        </p>
                      </div>
                      
                      {user.position === 'admin' && (
                        <div className="professor-card-actions">
                          <button 
                            className="action-btn edit-btn" 
                            onClick={() => openEditModal(professor)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="action-btn delete-btn" 
                            onClick={() => handleDelete(professor.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {professors[0].classes && professors[0].classes.length > 0 && classes.length > 0 && (
                <>
                  <h2 className="section-title">Weekly Schedule</h2>
                  <div className="weekly-schedule-container">
                    <div className="weekly-schedule">
                      <div className="schedule-grid">
                        <div className="time-column">
                          <div className="time-header">Time</div>
                          {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => (
                            <div key={hour} className="time-slot-label">
                              {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? 'PM' : 'AM'}
                            </div>
                          ))}
                        </div>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                          const dayCode = day.charAt(0) === 'T' ? (day === 'Tuesday' ? 'T' : 'R') : day.charAt(0);
                          return (
                            <div key={day} className="day-column">
                              <div className="day-header">{day}</div>
                              <div className="day-slots">
                                {Array.from({ length: 12 }, (_, i) => {
                                  const hour = i + 8;
                                  const classesAtThisTime = [];
                                  
                                  if (classes && classes.length > 0) {
                                    professors[0].classes.forEach(cls => {
                                      const fullClass = classes.find(c => c.class_id === cls.class_id);
                                      if (fullClass && fullClass.schedule) {
                                        fullClass.schedule.forEach(schedule => {
                                          if (schedule.class_day === dayCode) {
                                            const startHour = parseInt(schedule.start_time.split(':')[0]);
                                            const endHour = parseInt(schedule.end_time.split(':')[0]);
                                            
                                            if (hour >= startHour && hour < endHour) {
                                              classesAtThisTime.push({
                                                id: fullClass.class_id,
                                                name: fullClass.class_name,
                                                start: schedule.start_time,
                                                end: schedule.end_time
                                              });
                                            }
                                          }
                                        });
                                      }
                                    });
                                  }
                                  
                                  return (
                                    <div key={hour} className="schedule-slot">
                                      {classesAtThisTime.map((cls, idx) => (
                                        <div 
                                          key={idx} 
                                          className={`scheduled-class ${selectedClass === cls.id ? 'selected' : ''}`}
                                          onClick={() => setSelectedClass(selectedClass === cls.id ? null : cls.id)}
                                        >
                                          {cls.name}
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {selectedClass && (
                      <div className="selected-class-details">
                        {classes.filter(c => c.class_id === selectedClass).map(fullClass => (
                          <div key={fullClass.class_id} className="class-detail-card">
                            <h3>{fullClass.class_name}</h3>
                            <p><i className="fas fa-calendar-alt"></i> {new Date(fullClass.start_date).toLocaleDateString()} - {new Date(fullClass.end_date).toLocaleDateString()}</p>
                            <p><i className="fas fa-graduation-cap"></i> Units: {fullClass.units}</p>
                            <p><i className="fas fa-users"></i> Seats: {fullClass.seats}</p>
                            
                            {fullClass.schedule && fullClass.schedule.length > 0 && (
                              <div className="class-schedule">
                                <h4><i className="fas fa-clock"></i> Schedule</h4>
                                <ul>
                                  {fullClass.schedule.map((scheduleItem, index) => (
                                    <li key={index} className="schedule-item">
                                      <div className="day-badge">{getDayName(scheduleItem.class_day)}</div>
                                      <div className="time-slot">
                                        {formatTime(scheduleItem.start_time)} - {formatTime(scheduleItem.end_time)}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <h2 className="section-title">Classes</h2>
                  <div className="class-cards">
                    {professors[0].classes.map(cls => {
                      // Fetch the full class details
                      const fullClass = classes.find(c => c.class_id === cls.class_id);
                      return fullClass ? (
                        <div key={cls.class_id} className="class-card">
                          <div className="class-card-header">
                            <h3>{cls.class_name}</h3>
                          </div>
                          <div className="class-card-body">
                            <p><i className="fas fa-calendar-alt"></i> {new Date(fullClass.start_date).toLocaleDateString()} - {new Date(fullClass.end_date).toLocaleDateString()}</p>
                            <p><i className="fas fa-graduation-cap"></i> Units: {fullClass.units}</p>
                            <p><i className="fas fa-users"></i> Seats: {fullClass.seats}</p>
                            
                            {fullClass.schedule && fullClass.schedule.length > 0 && (
                              <div className="class-schedule">
                                <h4><i className="fas fa-clock"></i> Schedule</h4>
                                <ul>
                                  {fullClass.schedule.map((scheduleItem, index) => (
                                    <li key={index} className="schedule-item">
                                      <div className="day-badge">{getDayName(scheduleItem.class_day)}</div>
                                      <div className="time-slot">
                                        {formatTime(scheduleItem.start_time)} - {formatTime(scheduleItem.end_time)}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div key={cls.class_id} className="class-card">
                          <div className="class-card-header">
                            <h3>{cls.class_name}</h3>
                          </div>
                          <div className="class-card-body">
                            <p><i className="fas fa-book"></i> Class ID: {cls.class_id}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="no-results">
              <i className="fas fa-search"></i>
              <p>No professors found matching your search criteria.</p>
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
              <h3>{modalMode === 'add' ? 'Add New Professor' : 'Edit Professor'}</h3>
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
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="tenure">Tenure Status</label>
                  <select
                    id="tenure"
                    name="tenure"
                    value={formData.tenure}
                    onChange={handleInputChange}
                    required
                  >
                    <option value={0}>Non-Tenured</option>
                    <option value={1}>Tenured</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="salary">Salary</label>
                  <input
                    type="number"
                    id="salary"
                    name="salary"
                    step="0.01"
                    min="0"
                    value={formData.salary}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="years_worked">Years Worked</label>
                  <input
                    type="number"
                    id="years_worked"
                    name="years_worked"
                    min="0"
                    value={formData.years_worked}
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
                  {modalMode === 'add' ? 'Add Professor' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfessorPage;