import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { 
  Plus, 
  MessageSquare, 
  Settings, 
  LogOut, 
  PanelLeftClose, 
  Search,
  Clock,
  Edit2,
  Check,
  X 
} from 'lucide-react';
import Button from '../ui/Button';
import './Sidebar.scss';

const Sidebar = ({ isOpen, setOpen, onNewChat, chats = [], activeChatId, setActiveChatId, onRenameChat }) => {
  const navigate = useNavigate(); 
  const [editingId, setEditingId] = useState(null);
  const [tempTitle, setTempTitle] = useState('');

  // 1. Strict Logout Logic
  const handleLogout = () => {
    localStorage.removeItem('nova_auth_token'); 
    navigate('/login', { replace: true }); 
  };

  // 2. Rename Start (State Setup)
  const startEditing = (e, chat) => {
    e.stopPropagation(); 
    setEditingId(chat.id);
    setTempTitle(chat.title || '');
  };

  // 3. Rename Save (Backend Handshake)
  const saveRename = async (chatId) => {
    if (tempTitle.trim()) {
      await onRenameChat(chatId, tempTitle);
    }
    setEditingId(null);
  };

  // 4. Rename Cancel
  const cancelRename = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <>
      <div 
        className={`sidebar-mobile-overlay ${isOpen ? 'is-visible' : ''}`} 
        onClick={() => setOpen(false)} 
      />

      <aside className={`editorial-sidebar ${isOpen ? 'expanded' : 'collapsed'}`}>
        <div className="sidebar-inner">
          
          <div className="sidebar-header">
            <div className="brand">
              <div className="logo-mark"></div>
              <span className="brand-name">NOVA_CORE</span>
            </div>
            <Button 
              variant="ghost" 
              icon={PanelLeftClose} 
              onClick={() => setOpen(false)}
              className="sidebar-close-btn"
            />
          </div>

          <div className="action-stack">
            <Button 
              variant="primary" 
              icon={Plus} 
              onClick={onNewChat}
              className="broadcast-btn"
            >
              New Broadcast
            </Button>
            
            <div className="search-field">
              <Search size={14} />
              <input type="text" placeholder="Search Stream..." />
              <div className="shortcut">/</div>
            </div>
          </div>

          <div className="history-viewport custom-scroll">
            <div className="history-label">
              <Clock size={12} />
              <span>Recent Activity</span>
            </div>
            
            <nav className="history-list">
              {chats.map((chat) => (
                <div 
                  key={chat.id} 
                  className={`nav-item ${activeChatId === chat.id ? 'active' : ''}`}
                  onClick={() => setActiveChatId(chat.id)}
                >
                  <MessageSquare size={14} className="msg-icon" />
                  
                  {editingId === chat.id ? (
                    <div className="edit-container" onClick={(e) => e.stopPropagation()}>
                      <input 
                        autoFocus
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRename(chat.id);
                          if (e.key === 'Escape') cancelRename(e);
                        }}
                        className="rename-input"
                      />
                      <div className="edit-actions">
                        <Check size={12} onClick={() => saveRename(chat.id)} className="save-icon" />
                        <X size={12} onClick={cancelRename} className="cancel-icon" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="title">{chat.title || 'Untitled Stream'}</span>
                      <Edit2 
                        size={12} 
                        className="edit-trigger" 
                        onClick={(e) => startEditing(e, chat)} 
                      />
                    </>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="sidebar-footer">
            <div className="persistence-links">
              
              <Button 
                variant="secondary" 
                icon={LogOut} 
                className="footer-btn logout"
                onClick={handleLogout}
              >
                Terminate Session
              </Button>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;