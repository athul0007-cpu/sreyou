import { useState, useEffect } from 'react'
import './index.css'
import CategoryGrid from './components/CategoryGrid'
import JobRequestModal from './components/JobRequestModal'
import MatchingScreen from './components/MatchingScreen'
import { HistoryTab, ProfileTab } from './components/Tabs'
import LoginScreen from './components/LoginScreen'
import ServicerDashboard from './components/ServicerDashboard'
import JobChat from './components/JobChat'
import { supabase } from './supabase'
import { API_URL } from './config'
import ThemeToggle from './components/ThemeToggle'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [flowState, setFlowState] = useState('idle') 
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [lastCheckedJobs, setLastCheckedJobs] = useState([])
  const [activeChatJob, setActiveChatJob] = useState(null)
  const [lastLocation, setLastLocation] = useState(null)
  const [activeJobId, setActiveJobId] = useState(null)
  
  const [activeTab, setActiveTab] = useState('Services')
  const [isInitializing, setIsInitializing] = useState(true)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('sreyou-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // 0. Theme effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sreyou-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  
  // 1. Initial hydration and session listener
  useEffect(() => {
    const initSession = async () => {
      try {
        // Set a safety timeout for session restoration
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Session timeout")), 10000)
        );

        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
        
        if (session) {
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error("Session initialization failed:", err);
      } finally {
        setIsInitializing(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await fetchProfile(session.user.id);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${API_URL}/api/users/${userId}`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error("Failed to load profile", err);
    }
  };
  useEffect(() => {
    if (currentUser?.role !== 'customer') return;
    
    // Use a ref to track previous state without triggering effect re-runs
    let previousJobs = lastCheckedJobs;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/${currentUser.id}/jobs?role=customer`);
        if (!res.ok) return;
        const data = await res.json();
        
        // Detect state changes
        if (previousJobs.length > 0) {
          data.forEach(job => {
            const prevState = previousJobs.find(j => String(j.id) === String(job.id));
            if (prevState) {
              // 🟢 Scenario: Job Accepted
              if (prevState.status === 'pending' && job.status === 'accepted') {
                setNotifications(prev => [{
                  id: Date.now(),
                  message: `🎉 ${job.servicer_name} accepted your ${job.category} request!`,
                  read: false
                }, ...prev]);
              }
              // 🔴 Scenario: Professional Withdrawal
              if (prevState.status === 'accepted' && job.status === 'pending') {
                setNotifications(prev => [{
                  id: Date.now(),
                  message: `⚠️ The professional had to withdraw. Your job is back in search. Your funds are secure in escrow 🛡️`,
                  read: false
                }, ...prev]);
              }
            }
          });
        }
        
        previousJobs = data;
        setLastCheckedJobs(data);
      } catch (err) {}
    }, 3000);
    
    return () => clearInterval(interval);
  }, [currentUser?.id]); // Only re-run if the user ID changes

  const handleLogin = (user) => {
    setCurrentUser(user)
  }

  const handleCategoryClick = (category) => {
    setSelectedCategory(category)
    setFlowState('requesting')
  }

  const handleCustomJobRequest = () => {
    setSelectedCategory({ name: 'Custom Service', icon: '📝', desc: 'Describe your unique problem' })
    setFlowState('requesting')
  }

  const handleJobSubmit = async (details) => {
    setFlowState('matching')
    
    // 1. Try to get geolocation
    let lat = null, lng = null;
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
      });
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
      setLastLocation({ lat, lng });
    } catch (err) {
      console.warn("Geolocation failed or denied", err);
      setLastLocation(null);
    }

    try {
      const res = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: currentUser.id,
          customer_name: currentUser.name,
          category: selectedCategory.name,
          title: details.title,
          description: details.description,
          address: details.address,
          lat,
          lng
        })
      })
      const data = await res.json()
      if (data.id) setActiveJobId(data.id)
    } catch (err) {
      console.error('Failed to post job logs', err)
    }
  }

  const handleMatchFound = (status) => {
    if (status === 'cancelled') {
      resetFlow()
      return
    }
    setFlowState('found')
  }

  const handleCancelRequest = async () => {
    if (activeJobId) {
      try {
        await fetch(`${API_URL}/api/jobs/${activeJobId}`, { method: 'DELETE' })
      } catch (err) {
        console.error('Failed to delete job', err)
      }
    }
    resetFlow()
  }

  const resetFlow = () => {
    setFlowState('idle')
    setSelectedCategory(null)
    setActiveJobId(null)
  }

  if (isInitializing) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)' }}>
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="ping" style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '50%', margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Restoring SreYou session...</p>
        </div>
      </div>
    );
  }

  if (currentUser === null) {
    return <LoginScreen onLogin={handleLogin} theme={theme} toggleTheme={toggleTheme} />
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  if (currentUser.role === 'servicer') {
    return <ServicerDashboard currentUser={currentUser} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
  }

  // Customer View
  return (
    <div className="app-wrapper">
      <div className="dashboard-container">
        
        {/* Navigation Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-icon" style={{ background: 'var(--modal-bg)', color: 'var(--primary)', marginBottom: '1rem'}} onClick={() => setActiveTab('Services')}>
            <span>S</span>
          </div>
          <div className={`sidebar-icon ${activeTab === 'Services' ? 'active' : ''}`} onClick={() => setActiveTab('Services')} title="Services"><span>🛠️</span></div>
          <div className={`sidebar-icon ${activeTab === 'History' ? 'active' : ''}`} onClick={() => setActiveTab('History')} title="History"><span>📅</span></div>
          <div className={`sidebar-icon ${activeTab === 'Profile' ? 'active' : ''}`} onClick={() => setActiveTab('Profile')} title="Profile"><span>💼</span></div>
          
          <div style={{marginTop: 'auto'}} className="sidebar-icon" onClick={handleLogout} title="Logout"><span>🚪</span></div>
        </aside>

        {/* Main Content Dashboard */}
        <main className="main-area">
          <header className="top-header">
            <div className="brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0}}>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', lineHeight: 1 }}>SreYou</span>
              <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Service For You</span>
            </div>
            
            <div className="search-bar">
              <select defaultValue="All">
                <option value="All">All</option>
                <option value="Pro">Pros</option>
                <option value="Service">Services</option>
              </select>
              <input 
                type="text" 
                placeholder="Search" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span style={{ color: 'var(--text-secondary)'}}>🔍</span>
            </div>

            <div className="user-profile" style={{ position: 'relative' }}>
              <div 
                style={{ position: 'relative', cursor: 'pointer', marginRight: '0.5rem' }} 
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <span style={{fontSize: '1.2rem'}}>🔔</span>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span style={{ 
                    position: 'absolute', top: '-5px', right: '-8px', 
                    background: 'red', color: 'white', borderRadius: '50%', 
                    padding: '0.1rem 0.35rem', fontSize: '0.65rem', fontWeight: 'bold' 
                  }}>
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </div>

              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

              {showNotifications && (
                <div className="glass-panel" style={{
                  position: 'absolute', top: '55px', right: '0', background: 'var(--modal-bg)', 
                  width: '300px', zIndex: 100, padding: '1.5rem',
                  border: '1px solid var(--glass-border)',
                  boxShadow: 'var(--glass-shadow)'
                }}>
                  <h4 style={{ margin: 0, marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', color: 'var(--text-primary)' }}>Notifications</h4>
                  {notifications.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No new notifications.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {notifications.map(n => (
                        <div key={n.id} style={{ 
                          padding: '0.75rem', background: n.read ? 'transparent' : 'rgba(30, 109, 94, 0.05)', 
                          borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer',
                          color: 'var(--text-primary)'
                        }} onClick={() => {
                          setNotifications(notifications.map(xn => xn.id === n.id ? {...xn, read: true} : xn));
                        }}>
                          {n.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="name-label" style={{textAlign: 'right'}}>
                <div style={{fontWeight: '600'}}>{currentUser.name}</div>
                <div className="role">Customer</div>
              </div>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0
              }}>
                {currentUser.name.charAt(0)}
              </div>
            </div>
          </header>

          <div className="content-container" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            
            {/* Navigational Tabs */}
            <div className="tabs">
              <div className={`tab ${activeTab === 'Services' ? 'active' : ''}`} onClick={() => setActiveTab('Services')}>Services</div>
              <div className={`tab ${activeTab === 'History' ? 'active' : ''}`} onClick={() => setActiveTab('History')}>History</div>
              <div className={`tab ${activeTab === 'Profile' ? 'active' : ''}`} onClick={() => setActiveTab('Profile')}>Profile</div>
            </div>

            {/* View Routing Engine */}
            <div className="view-container" style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
              
              {activeTab === 'Services' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>Available Services</h2>
                    <button className="btn" onClick={handleCustomJobRequest} style={{ fontSize: '0.9rem', padding: '0.6rem 1rem' }} title="Submit a request for a custom service not listed here">+ Custom Job</button>
                  </div>
                  <CategoryGrid onCategoryClick={handleCategoryClick} searchTerm={searchTerm} />
                </>
              )}

              {activeTab === 'History' && <HistoryTab currentUser={currentUser} setActiveChatJob={setActiveChatJob} />}
              {activeTab === 'Profile' && <ProfileTab userProfile={currentUser} onUpdateUser={setCurrentUser} />}

            </div>
          </div>
        </main>
      </div>

      {/* Overlays / Modals */}
      {flowState === 'requesting' && (
        <JobRequestModal 
          category={selectedCategory} 
          onClose={resetFlow} 
          onSubmit={handleJobSubmit} 
        />
      )}

      {flowState === 'matching' && (
        <MatchingScreen 
          category={selectedCategory} 
          onMatchFound={handleMatchFound} 
          onCancel={handleCancelRequest}
          location={lastLocation}
          theme={theme}
        />
      )}

      {flowState === 'found' && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'var(--modal-overlay)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          padding: '1rem'
        }}>
          <div className="glass-panel animate-up" style={{ textAlign: 'center', maxWidth: '400px', width: '100%', background: 'var(--modal-bg)' }}>
            
            <div style={{
              width: '80px', height: '80px',
              borderRadius: '50%',
              margin: '0 auto 1.5rem',
              background: 'var(--primary)',
              color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.5rem'
            }}>
              ✓
            </div>
            
            <h2 style={{color: 'var(--text-primary)', marginBottom: '0.5rem'}}>Request Broadcasted!</h2>
            <p style={{marginBottom: '2rem', color: 'var(--text-secondary)'}}>
              Your request for a {selectedCategory?.name} has been sent to nearby professionals. You'll be notified when someone accepts the job.
            </p>

            <button className="btn" onClick={resetFlow} style={{width: '100%', justifyContent: 'center'}} title="Return to your main dashboard view">
              Return to Dashboard
            </button>
          </div>
        </div>
      )}

      {activeChatJob && (
        <JobChat job={activeChatJob} currentUser={currentUser} onClose={() => setActiveChatJob(null)} />
      )}
    </div>
  )
}

export default App
