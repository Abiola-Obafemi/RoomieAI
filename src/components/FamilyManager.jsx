import React, { useState } from 'react';
import { UserPlus, Trash2, Shield, User } from 'lucide-react';

export default function FamilyManager({ familyMembers, setFamilyMembers }) {
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Member');
  const [newAvatar, setNewAvatar] = useState('👨‍🦱');

  const avatars = ['👨‍🦱', '👩‍🦰', '👧', '👦', '👵', '👴', '🤖', '🐶', '🐱'];

  const handleAddMember = () => {
    if (!newName.trim()) return;
    const member = {
      id: Date.now().toString(),
      name: newName,
      role: newRole,
      avatar: newAvatar
    };
    setFamilyMembers([...familyMembers, member]);
    setNewName('');
  };

  const handleRemoveMember = (id) => {
    setFamilyMembers(familyMembers.filter(m => m.id !== id));
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: 600 }}>Manage Profiles</h3>
      
      {/* Add New Member Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '12px' }}>
        <h4 style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Add Family Member</h4>
        <input 
          className="input-field" 
          placeholder="Name" 
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', flexWrap: 'wrap' }}>
          {avatars.map(avName => (
            <button 
              key={avName} 
              onClick={() => setNewAvatar(avName)}
              style={{
                background: newAvatar === avName ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                border: newAvatar === avName ? '1px solid var(--accent-primary-hover)' : '1px solid var(--border-color)',
                borderRadius: '8px',
                color: newAvatar === avName ? '#fff' : 'var(--text-muted)',
                padding: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '1.4rem'
              }}
            >
              {avName}
            </button>
          ))}
        </div>

        <select 
          className="input-field" 
          value={newRole} 
          onChange={(e) => setNewRole(e.target.value)}
        >
          <option value="Admin">Admin</option>
          <option value="Member">Member</option>
          <option value="Child">Child</option>
        </select>
        
        <button className="btn" onClick={handleAddMember} disabled={!newName.trim()}>
          <UserPlus size={18} /> Add Member
        </button>
      </div>

      {/* Member List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {familyMembers.map(member => (
          <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '50%', color: 'var(--accent-primary-hover)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '46px', height: '46px' }}>
                {member.avatar}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-main)' }}>{member.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  {member.role === 'Admin' ? <Shield size={12} className="text-accent-primary" /> : <User size={12} />}
                  {member.role}
                </div>
              </div>
            </div>
            {familyMembers.length > 1 && (
              <button 
                onClick={() => handleRemoveMember(member.id)}
                style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
