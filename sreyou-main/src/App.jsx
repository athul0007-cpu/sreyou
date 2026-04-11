import { useState } from 'react'
import './index.css'
import CategoryGrid from './components/CategoryGrid'
import JobRequestModal from './components/JobRequestModal'
import MatchingScreen from './components/MatchingScreen'
import { HistoryTab, ProfileTab } from './components/Tabs'
import LoginScreen from './components/LoginScreen'
import ServicerDashboard from './components/ServicerDashboard'
import { API_URL } from './config'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [flowState, setFlowState] = useState('idle') 
  
  // Controls the main view
  const [activeTab, setActiveTab] = useState('Services')

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
    try {
      await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: currentUser.id,
          customer_name: currentUser.name,
          category: selectedCategory.name,
          description: details ? `${details.description} (Address: ${details.address})` : ''
        })
      })
    } catch (err) {
      console.error('Failed to post job logs', err)
    }
  }

  const handleMatchFound = () => {
    setFlowState('found')
  }

  const resetFlow = () => {
    setFlowState('idle')
    setSelectedCategory(null)
  }

  if (currentUser === null) {
    return <LoginScreen onLogin={handleLogin} />
  }

  if (currentUser.role === 'servicer') {
    return <ServicerDashboard currentUser={currentUser} onLogout={() => setCurrentUser(null)} />
  }

  // Customer View
  return (
    <div className="app-wrapper">
      <div className="dashboard-container">
        
        {/* Navigation Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-icon" style={{ background: 'white', color: 'var(--primary)', marginBottom: '1rem'}} onClick={() => setActiveTab('Services')}>
            <span>S</span>
          </div>
          <div className={`sidebar-icon ${activeTab === 'Services' ? 'active' : ''}`} onClick={() => setActiveTab('Services')} title="Services"><span>🛠️</span></div>
          <div className={`sidebar-icon ${activeTab === 'History' ? 'active' : ''}`} onClick={() => setActiveTab('History')} title="History"><span>📅</span></div>
          <div className={`sidebar-icon ${activeTab === 'Profile' ? 'active' : ''}`} onClick={() => setActiveTab('Profile')} title="Profile"><span>💼</span></div>
          
          <div style={{marginTop: 'auto'}} className="sidebar-icon" onClick={() => setCurrentUser(null)} title="Logout"><span>🚪</span></div>
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

            <div className="user-profile">
              <span style={{fontSize: '1.2rem', cursor: 'pointer', marginRight: '0.5rem'}}>🔔</span>
              <div style={{textAlign: 'right'}}>
                <div style={{fontWeight: '600'}}>{currentUser.name}</div>
                <div className="role">Customer</div>
              </div>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
              }}>
                {currentUser.name.charAt(0)}
              </div>
            </div>
          </header>

          <div style={{ display: 'flex', flexDirection: 'column', padding: '2rem' }}>
            
            {/* Navigational Tabs */}
            <div className="tabs">
              <div className={`tab ${activeTab === 'Services' ? 'active' : ''}`} onClick={() => setActiveTab('Services')}>Services</div>
              <div className={`tab ${activeTab === 'History' ? 'active' : ''}`} onClick={() => setActiveTab('History')}>History</div>
              <div className={`tab ${activeTab === 'Profile' ? 'active' : ''}`} onClick={() => setActiveTab('Profile')}>Profile</div>
            </div>

            {/* View Routing Engine */}
            <div style={{ padding: '2rem' }}>
              
              {activeTab === 'Services' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Available Services</h2>
                    <button className="btn" onClick={handleCustomJobRequest} title="Submit a request for a custom service not listed here">+ Request Custom Job</button>
                  </div>
                  <CategoryGrid onCategoryClick={handleCategoryClick} />
                </>
              )}

              {activeTab === 'History' && <HistoryTab currentUser={currentUser} />}
              {activeTab === 'Profile' && <ProfileTab userProfile={currentUser} />}

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
        />
      )}

      {flowState === 'found' && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          padding: '1rem'
        }}>
          <div className="glass-panel animate-up" style={{ textAlign: 'center', maxWidth: '400px', width: '100%', background: 'rgba(255,255,255,0.95)' }}>
            
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
    </div>
  )
}

export default App
