import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import ChatContainer from '../components/layout/ChatContainer';
import PageWrapper from '../components/layout/PageWrapper';
import ProfileSettings from './ProfileSettings'; 
import Button from '../components/ui/Button'; 
import api from '../services/api'; 
import './Home.scss';

const Home = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [chats, setChats] = useState([]); 
  const [activeChatId, setActiveChatId] = useState(null); 

  // 1. INITIAL STATE: "Devansh" hata kar empty strings rakhe hain
  const [user, setUser] = useState({ name: '', status: '', image: null });

  // 2. FETCH INITIAL DATA (Chats + User Profile)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // --- A. Profile Fetch Karo (Asli naam ke liye) ---
        const userRes = await api.get('/user/profile');
        if (userRes.data) {
          setUser({
            name: userRes.data.name,
            status: userRes.data.status,
            image: userRes.data.image
          });
          // LocalStorage sync (Optional backup)
          localStorage.setItem('nova_user_profile', JSON.stringify(userRes.data));
        }

        // --- B. Chats Fetch Karo ---
        const chatRes = await api.get('/chat/all');
        const formattedChats = chatRes.data.chats.map(chat => ({
          ...chat,
          id: chat._id 
        }));
        setChats(formattedChats);
        
      } catch (err) {
        console.error("Neural Sync Error:", err);
      }
    };
    
    fetchInitialData();
  }, []);

  // Responsive Sidebar Logic
  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- HANDLERS ---

  const createNewChat = async () => {
    try {
      const response = await api.post('/chat/create', { title: 'New Broadcast' });
      const newChat = { ...response.data.chat, id: response.data.chat._id };
      setChats([newChat, ...chats]);
      setActiveChatId(newChat.id); 
      if (window.innerWidth < 1024) setSidebarOpen(false);
    } catch (err) {
      alert("Failed to initialize new neural stream.",err);
    }
  };

  const renameChat = async (chatId, newTitle) => {
    try {
      await api.patch(`/chat/rename/${chatId}`, { title: newTitle });
      setChats(prevChats => 
        prevChats.map(chat => chat.id === chatId ? { ...chat, title: newTitle } : chat)
      );
    } catch (err) {
      alert("Rename protocol failed.",err);
    }
  };

  const activeChat = chats.find(c => c.id === activeChatId);

  return (
    <PageWrapper>
      <div className={`obsidian-app-container ${isSidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>

        <Sidebar 
          isOpen={isSidebarOpen} 
          setOpen={setSidebarOpen} 
          user={user}
          chats={chats}
          activeChatId={activeChatId}
          setActiveChatId={setActiveChatId}
          onNewChat={createNewChat}
          onRenameChat={renameChat}
        />

        <div className={`sidebar-mobile-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />

        <main className="chat-viewport">
          <header className="viewport-header">
            <div className="header-left">
              <div className="menu-trigger-zone">
                <Button 
                  variant="ghost" 
                  icon={Menu} 
                  onClick={() => setSidebarOpen(true)}
                  className={`sidebar-toggle-btn ${isSidebarOpen ? 'is-hidden' : 'is-visible'}`}
                />
              </div>
              <div className="breadcrumb-box desktop-only">
                <div className="breadcrumb">
                  <span className="root">NOVA</span>
                  <span className="separator">/</span>
                  <span className="current">{activeChat?.title.toUpperCase() || 'OFFLINE_NODE'}</span>
                </div>
              </div>
            </div>

            <div className="header-right">
              <div className="header-actions">
                <div className="user-block">
                  <div className="user-indicator desktop-only">
                    <div className="status-dot"></div>
                    {/* User name display fixed */}
                    <span className="user-id">{user.name ? user.name.toUpperCase() : 'LOADING...'}</span>
                  </div>
                  <button className="profile-trigger" onClick={() => setIsProfileOpen(true)}>
                    {user.image ? (
                      <img src={user.image} alt="Profile" className="user-avatar" />
                    ) : (
                      <div className="user-initial">{user.name ? user.name.charAt(0).toUpperCase() : '?'}</div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div className="chat-content">
            <ChatContainer 
              key={activeChatId} 
              activeChatId={activeChatId}
              userName={user.name} 
            />
          </div>
        </main>

        <ProfileSettings 
          isOpen={isProfileOpen} 
          onClose={() => setIsProfileOpen(false)} 
          user={user}
          onUpdate={(updatedUser) => setUser(updatedUser)}
        />
      </div>
    </PageWrapper>
  );
};

export default Home;