import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function StudentInterface() {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
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
  }, [navigate]);
  
  const fetchStudentData = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8080/student/${id}`, {
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user || loading) return <div className="loading">Loading students...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>
          {student ? `Hello, ${student.name}` : 'Student Portal'}
        </h1>
        <button onClick={handleLogout} className="logout-btn">
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
      
      {student ? (
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
              </div>
            </div>
          </div>
          
          <div className="welcome-message">
            <h2>Welcome to Your Student Portal</h2>
            <p>Here you can view your personal information and academic details.</p>
            <p>Use the navigation options to explore your courses, grades, and more.</p>
          </div>
          
          <div className="student-card">
            <div className="student-card-header">
              Academic Status
            </div>
            <div className="student-card-body">
              <div className="professor-info">
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
