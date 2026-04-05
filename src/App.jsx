import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ListTodo, Utensils, Scale, Zap, Settings, Users, Bell } from 'lucide-react';
import './index.css';
import ChoreManager from './components/ChoreManager';
import MealSuggester from './components/MealSuggester';
import ArgumentSettler from './components/ArgumentSettler';
import VibeCheck from './components/VibeCheck';
import FamilyManager from './components/FamilyManager';
import { db, ref, onValue, set, messaging, getToken } from './firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apiKey, setApiKey] = useState(localStorage.getItem('geminiApiKey') || '');
  const [showSettings, setShowSettings] = useState(!localStorage.getItem('geminiApiKey'));
  const [announcement, setAnnouncement] = useState('Welcome to RoomieAI! Set your Gemini API key in settings to start.');
  
  const [inputRoomId, setInputRoomId] = useState('');
  const [roomId, setRoomId] = useState(() => {
    let savedRoomId = localStorage.getItem('roomId');
    if (!savedRoomId) {
      savedRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      localStorage.setItem('roomId', savedRoomId);
    }
    return savedRoomId;
  });

  const [familyMembers, setFamilyMembers] = useState([]);

  useEffect(() => {
    if (!roomId) return;
    
    const familyRef = ref(db, `rooms/${roomId}/familyMembers`);
    const unsubFamily = onValue(familyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setFamilyMembers(data);
      } else {
        const initialMembers = [{ id: '1', name: 'User', role: 'Admin', avatar: '👨‍🦱', points: 0 }];
        set(familyRef, initialMembers);
      }
    });

    const announcementRef = ref(db, `rooms/${roomId}/announcement`);
    const unsubAnnouncement = onValue(announcementRef, (snapshot) => {
      const data = snapshot.val();
      if (data !== null) {
        setAnnouncement(data);
      }
    });

    return () => {
      unsubFamily();
      unsubAnnouncement();
    };
  }, [roomId]);

  const updateFamilyMembers = (newMembers) => {
    setFamilyMembers(newMembers);
    set(ref(db, `rooms/${roomId}/familyMembers`), newMembers);
  };

  const updateAnnouncement = (val) => {
    setAnnouncement(val);
    set(ref(db, `rooms/${roomId}/announcement`), val);
  };

  const joinRoom = () => {
    if (inputRoomId.trim()) {
      localStorage.setItem('roomId', inputRoomId.trim().toUpperCase());
      setRoomId(inputRoomId.trim().toUpperCase());
      setInputRoomId('');
      setShowSettings(false);
    }
  };

  const saveApiKey = (key) => {
    localStorage.setItem('geminiApiKey', key);
    setApiKey(key);
    setShowSettings(false);
  };

  const testNotification = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      try {
        const currentToken = await getToken(messaging, { vapidKey: 'BGBWoY1AUed2RWu2Cs-UhUz7prNYdWBEqKABi0bKKilMa0jz6XA_2IeNzlObktU0y_qVo9QspQYrtVDQ5NUAwPU' });
        if (currentToken) {
          console.log('FCM Token:', currentToken);
          // Here you would normally send the token to your server / DB to target this device
          await set(ref(db, `rooms/${roomId}/fcmTokens/${currentToken}`), true);
        } else {
          console.log('No registration token available. Request permission to generate one.');
        }
      } catch (err) {
        console.log('An error occurred while retrieving token. ', err);
      }

      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification('RoomieAI Sync Active', {
            body: 'You will now receive automatic synced pushes!',
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png'
          });
        });
      } else {
        new Notification('RoomieAI Sync Active', {
          body: 'You will now receive automatic synced pushes!',
          icon: '/icon-192x192.png'
        });
      }
    }
  };

  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'family', icon: Users, label: 'Family' },
    { id: 'chores', icon: ListTodo, label: 'Chores' },
    { id: 'meals', icon: Utensils, label: 'Meals' },
    { id: 'argument', icon: Scale, label: 'Settle' },
    { id: 'vibe', icon: Zap, label: 'Vibe' },
  ];

  return (
    <div className="app-container">
      {/* Announcement Marquee */}
      {announcement && (
        <div className="marquee-container">
          <div className="marquee-content">{announcement}</div>
        </div>
      )}

      {/* Mobile Top Header */}
      <div className="mobile-header" style={{ paddingTop: announcement ? '3.5rem' : '1rem' }}>
        <img src="/logo.png" alt="RoomieAI" style={{ width: '28px', height: '28px' }} />
        <h1 style={{ flex: 1, fontSize: '1.2rem', margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>RoomieAI</h1>
        <button onClick={() => setShowSettings(true)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)' }}>
          <Settings size={22} className="text-muted" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="app-sidebar" style={{ paddingTop: announcement ? '4rem' : '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '3rem' }}>
          <img src="/logo.png" alt="RoomieAI Logo" style={{ width: '38px', height: '38px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }} />
          <h1 className="title" style={{ fontSize: '1.4rem', marginBottom: 0, background: 'none', WebkitTextFillColor: 'var(--text-main)' }}>RoomieAI</h1>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 14px',
                background: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--text-main)',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: 600,
                fontSize: '0.95rem',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'
              }}
            >
              <tab.icon size={20} style={{ opacity: activeTab === tab.id ? 1 : 0.7 }} />
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowSettings(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '12px 14px',
            background: 'rgba(255,255,255,0.03)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            cursor: 'pointer',
            textAlign: 'left',
            fontWeight: 600,
            fontSize: '0.95rem',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
        >
          <Settings size={20} />
          Settings
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content" style={{ paddingTop: announcement ? '4.5rem' : '2.5rem' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.15 }}
            style={{ height: '100%', maxWidth: '1000px', margin: '0 auto' }}
          >
            {activeTab === 'dashboard' && (
              <div>
                <h2 className="title">Dashboard</h2>
                <div className="card">
                  <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>Home Announcement</h3>
                  <input 
                    className="input-field" 
                    placeholder="Type an announcement to scroll at the top..." 
                    value={announcement}
                    onChange={(e) => updateAnnouncement(e.target.value)}
                  />
                  <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                    Type something to show the marquee across the home. Syncs instantly with all family members.
                  </p>
                </div>
              </div>
            )}
            {activeTab === 'family'}
            {activeTab === 'family' && <FamilyManager familyMembers={familyMembers} setFamilyMembers={updateFamilyMembers} />}
            {activeTab === 'chores' && <ChoreManager roomId={roomId} familyMembers={familyMembers} setFamilyMembers={updateFamilyMembers} />}
            {activeTab === 'meals' && <MealSuggester />}
            {activeTab === 'argument' && <ArgumentSettler />}
            {activeTab === 'vibe' && <VibeCheck />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Nav for Mobile */}
      <div className="bottom-nav" style={{ position: 'fixed', bottom: 0, width: '100%', background: 'rgba(19, 27, 47, 0.85)', backdropFilter: 'blur(15px)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '10px 8px',
              background: 'transparent',
              color: activeTab === tab.id ? 'var(--accent-primary-hover)' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            <tab.icon size={22} style={{ marginBottom: '2px', filter: activeTab === tab.id ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))' : 'none' }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(11, 15, 25, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="card" style={{ width: '90%', maxWidth: '450px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 className="title" style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>Settings</h2>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Family Sync (Room)</h4>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                Your current Room ID is <strong style={{ color: 'var(--accent-primary-hover)', fontSize: '1.1rem', letterSpacing: '1px' }}>{roomId}</strong>. Share this code with your family members to sync your home!
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  className="input-field" 
                  placeholder="Enter a Room ID to join..." 
                  value={inputRoomId}
                  onChange={(e) => setInputRoomId(e.target.value)}
                  style={{ marginBottom: 0 }}
                />
                <button className="btn btn-secondary" onClick={joinRoom} disabled={!inputRoomId.trim()}>Join</button>
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Notifications</h4>
              <button className="btn btn-secondary" onClick={testNotification} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <Bell size={18} /> Enable & Test Notifications
              </button>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>API Configuration</h4>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.85rem' }}>Enter your Gemini API Key. It will be stored securely in your browser.</p>
              <input 
                type="password" 
                className="input-field" 
                placeholder="AIza..." 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                style={{ marginBottom: '1rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              {localStorage.getItem('geminiApiKey') && (
                <button className="btn btn-secondary" onClick={() => setShowSettings(false)}>Cancel</button>
              )}
              <button className="btn" onClick={() => saveApiKey(apiKey)}>Save Settings</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
