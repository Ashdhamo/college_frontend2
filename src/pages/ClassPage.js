import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ClassPage() {
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [alert, setAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentClass, setCurrentClass] = useState(null);
  const [professors, setProfessors] = useState([]);
  const [formData, setFormData] = useState({
    class_name: '',
    professorID: '',
    units: 3,
    seats: 30,
    start_date: '',
    end_date: '',
    schedule: [{ class_day: 'M', start_time: '10:00:00', end_time: '11:30:00' }]
  });
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    
    if (!userData || userData.position !== 'admin') {
      navigate('/');
      return;
    }
    
    setUser(userData);
    searchClasses('');
    fetchProfessors();
  }, [navigate]);

  const fetchProfessors = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8080/professor/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: '' }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfessors(data);
      }
    } catch (error) {
      console.error('Error fetching professors:', error);
    }
  };

  const searchClasses = async (query) => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8080/classes/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ class_name: query }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }
      
      const data = await response.json();
      setClasses(data);
      setLoading(false);
    } catch (error) {
      console.error('Error searching classes:', error);
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

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchClasses(query);
  };

  const openAddModal = () => {
    setFormData({
      class_name: '',
      professorID: professors.length > 0 ? professors[0].id : '',
      units: 3,
      seats: 30,
      start_date: '',
      end_date: '',
      schedule: [{ class_day: 'M', start_time: '10:00:00', end_time: '11:30:00' }]
    });
    setModalMode('add');
    setCurrentClass(null);
    setShowModal(true);
  };
  
  const openEditModal = (classItem) => {
    // Format dates for the date input (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };
    
    setFormData({
      class_name: classItem.class_name,
      professorID: classItem.professorID || professors.find(p => p.name === classItem.professor_name)?.id || '',
      units: classItem.units,
      seats: classItem.seats,
      start_date: formatDateForInput(classItem.start_date),
      end_date: formatDateForInput(classItem.end_date),
      schedule: classItem.schedule
    });
    setModalMode('edit');
    setCurrentClass(classItem);
    setShowModal(true);
  };
  
  const handleDelete = async (classId) => {
    if (!window.confirm('Are you sure you want to delete this class?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://127.0.0.1:8080/classes/${classId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setAlert({
          type: 'success',
          message: 'Class deleted successfully'
        });
        searchClasses(searchQuery);
        
        // Clear alert after 3 seconds
        setTimeout(() => {
          setAlert(null);
        }, 3000);
      } else {
        const data = await response.json();
        setAlert({
          type: 'danger',
          message: data.error || 'An error occurred while deleting the class'
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

  const closeModal = () => {
    setShowModal(false);
    setCurrentClass(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'units' || name === 'seats' || name === 'professorID' 
        ? parseInt(value) 
        : value
    });
  };

  const handleScheduleChange = (index, field, value) => {
    const updatedSchedule = [...formData.schedule];
    updatedSchedule[index] = {
      ...updatedSchedule[index],
      [field]: value
    };
    setFormData({
      ...formData,
      schedule: updatedSchedule
    });
  };

  const addScheduleItem = () => {
    setFormData({
      ...formData,
      schedule: [
        ...formData.schedule,
        { class_day: 'M', start_time: '10:00:00', end_time: '11:30:00' }
      ]
    });
  };

  const removeScheduleItem = (index) => {
    if (formData.schedule.length > 1) {
      const updatedSchedule = formData.schedule.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        schedule: updatedSchedule
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let response;
      
      if (modalMode === 'add') {
        response = await fetch('http://127.0.0.1:8080/classes/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch(`http://127.0.0.1:8080/classes/${currentClass.class_id}`, {
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
          message: modalMode === 'add' ? 'Class added successfully' : 'Class updated successfully'
        });
        closeModal();
        searchClasses(searchQuery);
        
        // Clear alert after 3 seconds
        setTimeout(() => {
          setAlert(null);
        }, 3000);
      } else {
        if (response.status === 409) {
          setAlert({
            type: 'danger',
            message: 'The professor is teaching another class at that time'
          });
        } else {
          setAlert({
            type: 'danger',
            message: data.error || 'An error occurred'
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setAlert({
        type: 'danger',
        message: 'An error occurred while processing your request'
      });
    }
  };

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
      
      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}
      
      <div className="search-filter-container">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search classes..." 
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="filter-dropdown">

          
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading classes...</p>
        </div>
      ) : (
        <div className="class-cards">
          {classes.length === 0 ? (
            <div className="no-results">
              <i className="fas fa-search"></i>
              <p>No classes found</p>
            </div>
          ) : (
            classes.map((classItem) => (
              <div key={classItem.class_id} className="class-card">
                <div className="class-card-header">
                  <h3>{classItem.class_name}</h3>
                </div>
                <div className="class-card-body">
                  <div className="class-info">
                    <p>
                      <i className="fas fa-user-tie"></i>
                      <span>Professor: {classItem.professor_name}</span>
                    </p>
                    <p>
                      <i className="fas fa-calendar-alt"></i>
                      <span>Period: {new Date(classItem.start_date).toLocaleDateString()} - {new Date(classItem.end_date).toLocaleDateString()}</span>
                    </p>
                    <p>
                      <i className="fas fa-graduation-cap"></i>
                      <span>Units: {classItem.units}</span>
                    </p>
                    <p>
                      <i className="fas fa-users"></i>
                      <span>Seats: {classItem.seats}</span>
                    </p>
                  </div>
                  
                  <div className="class-schedule">
                    <h4><i className="fas fa-clock"></i> Schedule</h4>
                    <ul>
                      {classItem.schedule.map((scheduleItem, index) => (
                        <li key={index} className="schedule-item">
                          <div className="day-badge">{getDayName(scheduleItem.class_day)}</div>
                          <div className="time-slot">
                            {formatTime(scheduleItem.start_time)} - {formatTime(scheduleItem.end_time)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="class-card-actions">
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => openEditModal(classItem)}
                    >
                      <i className="fas fa-edit"></i> Edit
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(classItem.class_id)}
                    >
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <button className="add-button" title="Add New Class" onClick={openAddModal}>
        <i className="fas fa-plus"></i>
      </button>

      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalMode === 'add' ? 'Add New Class' : 'Edit Class'}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="class_name">Class Name</label>
                  <input
                    type="text"
                    id="class_name"
                    name="class_name"
                    value={formData.class_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="professorID">Professor</label>
                  <select
                    id="professorID"
                    name="professorID"
                    value={formData.professorID}
                    onChange={handleInputChange}
                    required
                  >
                    {professors.map(professor => (
                      <option key={professor.id} value={professor.id}>
                        {professor.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="units">Units</label>
                  <input
                    type="number"
                    id="units"
                    name="units"
                    min="1"
                    max="6"
                    value={formData.units}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="seats">Available Seats</label>
                  <input
                    type="number"
                    id="seats"
                    name="seats"
                    min="1"
                    value={formData.seats}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="start_date">Start Date</label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="end_date">End Date</label>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="schedule-section">
                  <h4>Class Schedule</h4>
                  {formData.schedule.map((scheduleItem, index) => (
                    <div key={index} className="schedule-form-item">
                      <div className="form-group">
                        <label>Day</label>
                        <select
                          value={scheduleItem.class_day}
                          onChange={(e) => handleScheduleChange(index, 'class_day', e.target.value)}
                          required
                        >
                          <option value="M">Monday</option>
                          <option value="T">Tuesday</option>
                          <option value="W">Wednesday</option>
                          <option value="R">Thursday</option>
                          <option value="F">Friday</option>
                          <option value="SAT">Saturday</option>
                          <option value="SUN">Sunday</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Start Time</label>
                        <input
                          type="time"
                          value={scheduleItem.start_time.substring(0, 5)}
                          onChange={(e) => handleScheduleChange(index, 'start_time', e.target.value + ':00')}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>End Time</label>
                        <input
                          type="time"
                          value={scheduleItem.end_time.substring(0, 5)}
                          onChange={(e) => handleScheduleChange(index, 'end_time', e.target.value + ':00')}
                          required
                        />
                      </div>
                      {formData.schedule.length > 1 && (
                        <button 
                          type="button" 
                          className="remove-schedule-btn"
                          onClick={() => removeScheduleItem(index)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    type="button" 
                    className="add-schedule-btn"
                    onClick={addScheduleItem}
                  >
                    <i className="fas fa-plus"></i> Add Another Time
                  </button>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'add' ? 'Add Class' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClassPage;