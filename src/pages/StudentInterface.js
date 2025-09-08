import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import '../App.css';

function StudentInterface() {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [expandedClassId, setExpandedClassId] = useState(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState({ message: '', type: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    
    // Only allow students to access this page
    if (!userData || userData.position !== 'student') {
      navigate('/');
      return;
    }
    
    setUser(userData);
    fetchStudentData(userData.id);
    fetchStudentClasses(userData.id);
    fetchAvailableClasses();
  }, [navigate]);
  
  const fetchStudentData = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/student/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudent(data);
      } else {
        console.error('Error fetching student data');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStudentClasses = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/classes/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      } else {
        console.error('Error fetching student classes');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  const fetchAvailableClasses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/classes/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableClasses(data);
      } else {
        console.error('Error fetching available classes');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  const handleEnroll = async (classId) => {
    if (!student) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/student/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: student.id,
          class_id: classId
        }),
      });
      
      if (response.ok) {
        setEnrollmentStatus({ 
          message: 'Successfully enrolled in class!', 
          type: 'success' 
        });
        // Refresh student classes
        fetchStudentClasses(student.id);
        
        // Clear status after 3 seconds
        setTimeout(() => {
          setEnrollmentStatus({ message: '', type: '' });
        }, 3000);
      } else {
        const errorData = await response.json();
        setEnrollmentStatus({ 
          message: errorData.error || 'Failed to enroll in class', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setEnrollmentStatus({ 
        message: 'An error occurred while enrolling', 
        type: 'error' 
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
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
  
  // Handle dropping a class
  const handleDrop = async (classId) => {
    if (!student) return;
    
    if (!window.confirm('Are you sure you want to drop this class?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/student/drop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: student.id,
          class_id: classId
        }),
      });
      
      if (response.ok) {
        setEnrollmentStatus({ 
          message: 'Successfully dropped class!', 
          type: 'success' 
        });
        // Refresh student classes
        fetchStudentClasses(student.id);
        
        // Clear status after 3 seconds
        setTimeout(() => {
          setEnrollmentStatus({ message: '', type: '' });
        }, 3000);
      } else {
        const errorData = await response.json();
        setEnrollmentStatus({ 
          message: errorData.error || 'Failed to drop class', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setEnrollmentStatus({ 
        message: 'An error occurred while dropping the class', 
        type: 'error' 
      });
    }
  };

  if (!user || loading) return <div className="loading">Loading students...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>
          {student ? `Hello, ${student.name}` : 'Student Portal'}
        </h1>
        <button onClick={handleLogout} className="logout-btn">
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </div>
      
      {student ? (
        <>
          <div className="student-cards">
            <div className="student-card">
              <div className="student-card-header">
                Student Information

              </div>
              <div className="student-card-body">
                <div className="professor-info">
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
                  
                  <hr className="info-divider" />
                  
                  <p>
                    <i className="fas fa-user-graduate"></i>
                    <strong>Current Status:</strong> Active
                  </p>
                  <p>
                    <i className="fas fa-calendar-check"></i>
                    <strong>Enrollment:</strong> Full-time
                  </p>
                  <p>
                    <i className="fas fa-clock"></i>
                    <strong>Expected Graduation:</strong> {2024 + (4 - student.year)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {classes.length > 0 && (
            <>
              <h2 className="section-title">My Classes</h2>
              <div className="class-cards">
                {classes.map(cls => (
                  <div key={cls.class_id} className="class-card">
                    <div className="class-card-header">
                      <h3>{cls.class_name}</h3>
                    </div>
                    <div className="class-card-body">
                      <p><i className="fas fa-chalkboard-teacher"></i> Professor: {cls.professor_name}</p>
                      <p><i className="fas fa-calendar-alt"></i> {new Date(cls.start_date).toLocaleDateString()} - {new Date(cls.end_date).toLocaleDateString()}</p>
                      <p><i className="fas fa-graduation-cap"></i> Units: {cls.units}</p>
                      
                      {cls.schedule && cls.schedule.length > 0 && (
                        <div className="class-schedule">
                          <h4><i className="fas fa-clock"></i> Schedule</h4>
                          <ul>
                            {cls.schedule.map((scheduleItem, index) => (
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
                      
                      <button 
                        className="drop-icon-btn" 
                        onClick={() => {
                          if(window.confirm('Are you sure you want to drop this class?')) {
                            handleDrop(cls.class_id);
                          }
                        }}
                        title="Drop Class"
                      >
                        <i className="fas fa-minus-circle" style={{color: "#e74c3c"}}></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <h2 className="section-title">Weekly Schedule</h2>
              <div className="weekly-schedule-table">
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Monday</th>
                      <th>Tuesday</th>
                      <th>Wednesday</th>
                      <th>Thursday</th>
                      <th>Friday</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 12 }, (_, i) => {
                      const hour = i + 8;
                      const hourLabel = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
                      
                      return (
                        <tr key={hour}>
                          <td className="time-cell">{hourLabel}</td>
                          {['M', 'T', 'W', 'R', 'F'].map(dayCode => {
                            const classesAtThisTime = classes.filter(cls => 
                              cls.schedule && cls.schedule.some(schedule => 
                                schedule.class_day === dayCode && 
                                hour >= parseInt(schedule.start_time.split(':')[0]) && 
                                hour < parseInt(schedule.end_time.split(':')[0])
                              )
                            );
                            
                            return (
                              <td key={dayCode} className="schedule-cell">
                                {classesAtThisTime.map((cls, idx) => (
                                  <div 
                                    key={idx} 
                                    className={`class-block ${selectedClass === cls.class_id ? 'selected' : ''}`}
                                    onClick={() => setSelectedClass(selectedClass === cls.class_id ? null : cls.class_id)}
                                  >
                                    {cls.class_name}
                                  </div>
                                ))}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {selectedClass && (
                <div className="selected-class-details">
                  {classes.filter(c => c.class_id === selectedClass).map(cls => (
                    <div key={cls.class_id} className="class-detail-card">
                      <h3>{cls.class_name}</h3>
                      <p><i className="fas fa-chalkboard-teacher"></i> Professor: {cls.professor_name}</p>
                      <p><i className="fas fa-calendar-alt"></i> {new Date(cls.start_date).toLocaleDateString()} - {new Date(cls.end_date).toLocaleDateString()}</p>
                      <p><i className="fas fa-graduation-cap"></i> Units: {cls.units}</p>
                      
                      {cls.schedule && cls.schedule.length > 0 && (
                        <div className="class-schedule">
                          <h4><i className="fas fa-clock"></i> Schedule</h4>
                          <ul>
                            {cls.schedule.map((scheduleItem, index) => (
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
              
            </>
          )}
          
          <h2 className="section-title">Available Classes</h2>
          {enrollmentStatus.message && (
            <div className={`alert alert-${enrollmentStatus.type}`}>
              {enrollmentStatus.message}
            </div>
          )}
          <div className="available-classes">
                {availableClasses
                  .filter(cls => !classes.some(c => c.class_id === cls.class_id)) // Only show non-enrolled classes
                  .map(cls => {
                    // Check for schedule conflicts
                    const hasScheduleConflict = cls.schedule && classes.some(enrolledClass => {
                      if (!enrolledClass.schedule) return false;
                      
                      return cls.schedule.some(newSchedule => 
                        enrolledClass.schedule.some(existingSchedule => {
                          // Check if same day
                          if (newSchedule.class_day !== existingSchedule.class_day) return false;
                          
                          // Parse times
                          const newStart = parseInt(newSchedule.start_time.split(':')[0]) + parseInt(newSchedule.start_time.split(':')[1])/60;
                          const newEnd = parseInt(newSchedule.end_time.split(':')[0]) + parseInt(newSchedule.end_time.split(':')[1])/60;
                          const existingStart = parseInt(existingSchedule.start_time.split(':')[0]) + parseInt(existingSchedule.start_time.split(':')[1])/60;
                          const existingEnd = parseInt(existingSchedule.end_time.split(':')[0]) + parseInt(existingSchedule.end_time.split(':')[1])/60;
                          
                          // Check for overlap
                          return (newStart < existingEnd && newEnd > existingStart);
                        })
                      );
                    });
                    
                    return (
                      <div key={cls.class_id} className="available-class-card">
                        <div 
                          className={hasScheduleConflict ? "unavailable-class-header" : "available-class-header"}
                          onClick={() => setExpandedClassId(expandedClassId === cls.class_id ? null : cls.class_id)}
                        >
                          <h3>{cls.class_name}</h3>
                          <i className={`fas fa-chevron-${expandedClassId === cls.class_id ? 'up' : 'down'}`}></i>
                        </div>
                        
                        {expandedClassId === cls.class_id && (
                          <div className="available-class-details">
                            <p><i className="fas fa-chalkboard-teacher"></i> Professor: {cls.professor_name || 'TBA'}</p>
                            <p><i className="fas fa-calendar-alt"></i> {new Date(cls.start_date).toLocaleDateString()} - {new Date(cls.end_date).toLocaleDateString()}</p>
                            <p><i className="fas fa-graduation-cap"></i> Units: {cls.units}</p>
                            
                            {cls.schedule && cls.schedule.length > 0 && (
                              <div className="class-schedule">
                                <h4><i className="fas fa-clock"></i> Schedule</h4>
                                <ul>
                                  {cls.schedule.map((scheduleItem, index) => (
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
                            
                            {hasScheduleConflict ? (
                              <div className="enrollment-action">
                                <p style={{color: "#95a5a6"}}><i className="fas fa-exclamation-circle"></i> Schedule conflict with enrolled class</p>
                              </div>
                            ) : (
                              <div className="enrollment-action">
                                <button 
                                  className="enroll-btn" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEnroll(cls.class_id);
                                  }}
                                >
                                  <i className="fas fa-plus"></i> Add Class
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
          </div>
        </>
      ) : (
        <div className="no-results">
          <i className="fas fa-exclamation-circle"></i>
          <p>Unable to load student information.</p>
        </div>
      )}
    </div>
  );
}

export default StudentInterface;