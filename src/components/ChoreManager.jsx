import React, { useState, useEffect } from 'react';
import { Trophy, Plus, CheckCircle } from 'lucide-react';

export default function ChoreManager({ familyMembers, setFamilyMembers }) {
  const [chores, setChores] = useState(() => {
    return JSON.parse(localStorage.getItem('chores')) || [];
  });
  
  const [newChore, setNewChore] = useState('');
  const [choreDiff, setChoreDiff] = useState(10);
  const [choreAssignee, setChoreAssignee] = useState('');

  useEffect(() => {
    localStorage.setItem('chores', JSON.stringify(chores));
  }, [chores]);

  // Ensure members have points
  const members = (familyMembers || []).map(m => ({ ...m, points: m.points || 0 }));

  const addChore = () => {
    if (!newChore.trim() || members.length === 0) return;
    
    let assigneeId = choreAssignee;
    if (!assigneeId) {
      // Automatically divide chores fairly if none selected
      const sorted = [...members].sort((a, b) => a.points - b.points);
      assigneeId = sorted[0].id;
    }
    
    setChores([...chores, { 
      id: Date.now().toString(), 
      name: newChore, 
      difficulty: Number(choreDiff), 
      assignee: assigneeId 
    }]);
    setNewChore('');
  };

  const completeChore = (choreId, assigneeId, points) => {
    setChores(chores.filter(c => c.id !== choreId));
    if (setFamilyMembers) {
      setFamilyMembers(members.map(r => {
        if (r.id === assigneeId) {
          return { ...r, points: r.points + points };
        }
        return r;
      }));
    }
    
    // Push Notification Helper
    if (Notification.permission === 'granted') {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification('Chore Completed!', {
            body: `Great job! ${points} points added.`,
            icon: '/logo.png',
            badge: '/logo.png'
          });
        });
      } else {
        new Notification('Chore Completed!', {
          body: `Great job! ${points} points added.`,
          icon: '/logo.png'
        });
      }
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      await Notification.requestPermission();
    }
  };

  const sortedLeaderboard = [...members].sort((a, b) => b.points - a.points);


  if (members.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <h2 className="title" style={{ marginBottom: '1rem' }}>No Family Members</h2>
        <p style={{ color: 'var(--text-muted)' }}>Please add family members from the Family tab first before assigning chores!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 300px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="title" style={{ fontSize: '1.25rem', marginBottom: 0 }}>Chores</h2>
        </div>
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <input 
              className="input-field" 
              placeholder="New chore..." 
              value={newChore}
              onChange={e => setNewChore(e.target.value)}
              style={{ marginBottom: 0, flex: 1, minWidth: '150px' }}
            />
            <select 
              className="input-field" 
              value={choreDiff}
              onChange={e => setChoreDiff(e.target.value)}
              style={{ width: '90px', marginBottom: 0 }}
            >
              <option value={5}>Easy (5)</option>
              <option value={10}>Med (10)</option>
              <option value={20}>Hard (20)</option>
            </select>
            <select
              className="input-field"
              value={choreAssignee}
              onChange={e => setChoreAssignee(e.target.value)}
              style={{ width: '130px', marginBottom: 0 }}
            >
              <option value="">Auto-Assign</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <button className="btn" onClick={addChore} style={{ padding: '0.75rem' }}><Plus size={20}/></button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {chores.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No chores right now! 🎉</p> : null}
            {chores.map(chore => {
              const assignee = members.find(r => r.id === chore.assignee);
              return (
                <div key={chore.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '1rem' }}>{chore.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                      <span style={{ color: 'var(--accent-primary-hover)', display: 'flex', fontSize: '1.2rem' }}>{assignee?.avatar || '👨‍🦱'}</span>
                      <span>Assigned to <strong style={{ color: 'var(--text-main)', fontWeight: 600 }}>{assignee?.name || 'Unassigned'}</strong></span>
                      <span style={{ opacity: 0.5 }}>•</span>
                      <span style={{ color: 'var(--success)' }}>{chore.difficulty} pts</span>
                    </div>
                  </div>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => completeChore(chore.id, chore.assignee, chore.difficulty)}
                    style={{ padding: '0.6rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none' }}
                  >
                    <CheckCircle size={28} color="var(--success)" strokeWidth={2} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ flex: '1 1 300px' }}>
        <h2 className="title" style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={20} color="var(--accent-primary)"/> Leaderboard
        </h2>
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sortedLeaderboard.map((r, i) => {
              const isSlacking = i === sortedLeaderboard.length - 1 && sortedLeaderboard.length > 1 && r.points < 20;
              return (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: isSlacking ? 'rgba(239, 68, 68, 0.05)' : 'rgba(0,0,0,0.1)', border: isSlacking ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--border-color)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontWeight: '700', fontSize: '1rem', color: i === 0 ? 'var(--accent-primary)' : 'var(--text-muted)' }}>#{i+1}</span>
                    <span style={{ color: 'var(--accent-primary-hover)', display: 'flex', padding: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', fontSize: '1.3rem' }}>
                      {r.avatar}
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1.05rem' }}>{r.name}</span>
                  </div>
                  <div style={{ fontWeight: '700', color: 'var(--success)', fontSize: '1.1rem' }}>{r.points} pts</div>
                </div>
              );
            })}
            {sortedLeaderboard.length > 1 && sortedLeaderboard[sortedLeaderboard.length - 1].points < 20 && (
              <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--danger)', textAlign: 'center', fontWeight: 600 }}>
                🚨 {sortedLeaderboard[sortedLeaderboard.length - 1].name} needs to do some chores!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
