import { useState, useEffect, useRef, useCallback } from 'react'
import './Chat.css'
import * as api from '../services/sfamilyApi'
import { createEchoInstance } from '../services/echo'

const CHATS_DATA_MOCK = {
  Chats: [
    {
      id: 'freelancers',
      name: 'Freelancers India 🇮🇳',
      avatar: 'FI',
      avatarBg: '#5b64a2',
      time: '11:57 PM',
      unread: 23,
      lastMsg: 'Adi: Hiring Alert! Need IT Sales Spe...'
    },
    {
      id: 'inovant',
      name: 'Inovant Solutions',
      subtitle: '44 members',
      avatar: 'IS',
      avatarBg: '#10b981',
      time: '7:48 PM',
      unread: 0,
      lastMsg: 'Thank you everyone for the warm wishe...',
      messages: [
        { id: 1, sender: 'Harshit Goswami', senderColor: '#10b981', avatar: 'HG', avatarBg: '#10b981', text: 'Belated Happy Birthday Abbas Wangde 🎉🎂', time: '7:11 PM', isSelf: false },
        { id: 2, sender: 'Neeraja Joshi', senderColor: '#f97316', avatar: 'NJ', avatarBg: '#f97316', text: 'Belated Happy Birthday Abbas Wangde', time: '7:11 PM', isSelf: false },
        { id: 3, sender: 'Subhajit Naskar', senderColor: '#a855f7', avatar: 'SN', avatarBg: '#a855f7', text: 'Belated Happy Birthday Abbas Wangde Bro 🎉🎂🧁🎈', time: '7:14 PM', isSelf: false },
        { id: 4, sender: 'Harsh Kumbhar', senderColor: '#ef4444', avatar: 'HK', avatarBg: '#ef4444', text: 'Happy Birthday Abbas Wangde brother 👑✨', time: '7:15 PM', isSelf: false },
        {
          id: 5,
          sender: 'MJJ',
          senderColor: '#38bdf8',
          avatar: 'MJ',
          avatarBg: '#06b6d4',
          text: 'AWS DEVOPS Hi I am open to freelance work, let me know if anyone having devops/aws related project or need support... I am having 6+ years of experience in aws, Elastic Cloud, kubernetes, docker, Jenkins, Gitlab, ansible, terraform, Linux, git',
          time: '6:48 AM',
          isSelf: false
        },
        {
          id: 6,
          sender: 'Abbas Wangde',
          text: 'Thank you everyone for the warm wishes! 😊 Really appreciate it! ❤️👑',
          time: '7:48 PM',
          isSelf: true
        },
        {
          id: 7,
          sender: 'Abbas Wangde',
          text: 'hii',
          time: '00:47',
          isSelf: true
        }
      ]
    },
    { id: 'yallaplay', name: 'Project: "Yalla Play" 🗣️', avatar: 'YP', avatarBg: '#f97316', time: '8:02 PM', unread: 32, lastMsg: 'Zeeshan Sange Raj Kotalkar updat...' },
    { id: 'editwithajay', name: 'Editwithajay', avatar: 'EA', avatarBg: '#f97316', time: 'Tue', unread: 0, online: true, lastMsg: 'Need an editor. Like this https://youtu...' },
    { id: 'programmer', name: 'Programmer 🔥', avatar: 'PG', avatarBg: '#8b5cf6', time: '5:20 PM', unread: 0, typing: true, lastMsg: 'typing ...' },
    { id: 'phpteam', name: 'PHP TEAM', avatar: 'PT', avatarBg: '#475569', time: '6:48 PM', unread: 2, lastMsg: 'worked on choice 1) Worked on the ...' },
    { id: 'neeraja', name: 'Neeraja Joshi', avatar: 'NJ', avatarBg: '#10b981', time: '5:51 PM', unread: 0, lastMsg: 'https://web.thewishlist.com/en/user/login' },
    { id: 'cater', name: 'Project: "Cater"', avatar: 'PC', avatarBg: '#eab308', time: '5:31 PM', unread: 2, lastMsg: 'share me live build please' },
    { id: 'frontend', name: 'Frontend | Full Stack We...', avatar: 'FS', avatarBg: '#059669', time: 'Jul 2, 2025', unread: 0, lastMsg: 'That terrifying moment when... • Ctrl...' },
    { id: 'rehan', name: 'Rehan Wangde', avatar: 'RW', avatarBg: '#dc2626', time: '4:36 PM', unread: 0, lastMsg: '← Okay' }
  ],
  'Task chats': [
    {
      id: 'task-1',
      name: 'Task: Grocery Panel Bugfix',
      subtitle: '8 members',
      avatar: 'GP',
      avatarBg: '#ef4444',
      time: '10:15 AM',
      unread: 4,
      lastMsg: 'All orders page filter issue fixed...',
      messages: [
        { id: 1, sender: 'Devvrat', senderColor: '#38bdf8', avatar: 'DV', avatarBg: '#6366f1', text: 'Hey team, please verify the Grocery panel order status query.', time: '10:00 AM', isSelf: true },
        { id: 2, sender: 'PHP Team', senderColor: '#10b981', avatar: 'PT', avatarBg: '#10b981', text: 'Fixed and deployed to staging server!', time: '10:15 AM', isSelf: false }
      ]
    }
  ],
  CoPilot: [],
  Collabs: [],
  Channels: []
}

function Chat() {
  const [activeSideTab, setActiveSideTab] = useState('Messenger')
  const [activeTopTab, setActiveTopTab] = useState('Chats')
  const [activeChatId, setActiveChatId] = useState('inovant')
  const [inputText, setInputText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Real API state
  const [currentUser, setCurrentUser] = useState(null)
  const [apiConversations, setApiConversations] = useState([])
  const [activeMessages, setActiveMessages] = useState([])
  const [unreadCounts, setUnreadCounts] = useState({ unread: 0, threads: 0, requests: 0, archived: 0 })
  const [presentMembers, setPresentMembers] = useState([])
  const [typingUsers, setTypingUsers] = useState(new Set())
  const [isApiConnected, setIsApiConnected] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)

  const echoRef = useRef(null)
  const roomChannelRef = useRef(null)
  const lastTypingSentRef = useRef(0)
  const typingTimersRef = useRef({})
  const messagesEndRef = useRef(null)

  const token = localStorage.getItem('sfamily_token')

  // Auto-scroll to bottom on message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMessages])


  // Helper to format initials & avatar color
  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }

  // 1. Initial Profile & Inbox Load
  useEffect(() => {
    if (!token) return

    async function initChatData() {
      try {
        const profileRes = await api.getProfile()
        if (profileRes.success && profileRes.data?.user) {
          setCurrentUser(profileRes.data.user)
        }

        const convsRes = await api.getConversations({ state: activeTopTab === 'Notifications' ? 'pending' : 'accepted' })
        if (convsRes.success && convsRes.data?.conversations) {
          setApiConversations(convsRes.data.conversations)
          setIsApiConnected(true)
          if (convsRes.data.conversations.length > 0) {
            setActiveChatId(convsRes.data.conversations[0].id)
          }
        }

        const unreadRes = await api.getUnreadCount()
        if (unreadRes.success && unreadRes.data) {
          setUnreadCounts(unreadRes.data)
        }
      } catch (e) {
        console.warn('Backend API not responding or unauthenticated, defaulting to demo view:', e)
      }
    }

    initChatData()
  }, [token, activeTopTab])

  // 2. Presence Ping every 60 seconds
  useEffect(() => {
    if (!token || !isApiConnected) return
    api.pingPresence().catch(() => {})
    const interval = setInterval(() => {
      api.pingPresence().catch(() => {})
    }, 60000)
    return () => clearInterval(interval)
  }, [token, isApiConnected])

  // 3. User Mailbox Echo Subscription
  useEffect(() => {
    if (!token || !currentUser?.id) return
    const echo = createEchoInstance(token)
    echoRef.current = echo

    const userChannel = echo.private(`user.${currentUser.id}`)
      .listen('.inbox.updated', (thread) => {
        setApiConversations(prev => {
          const idx = prev.findIndex(c => c.id === thread.id)
          if (idx >= 0) {
            const updated = [...prev]
            updated[idx] = { ...updated[idx], ...thread }
            return updated
          }
          return [thread, ...prev]
        })
        api.markDelivered(thread.id).catch(() => {})
      })
      .listen('.conversation.closed', ({ conversation_id }) => {
        setApiConversations(prev => prev.filter(c => c.id !== conversation_id))
      })

    return () => {
      echo.leave(`user.${currentUser.id}`)
    }
  }, [token, currentUser?.id])

  // 4. Fetch Active Chat Messages & Subscribe to Conversation + Presence Room Channels
  useEffect(() => {
    if (!token || !activeChatId || !isApiConnected) return

    // Fetch message history
    api.getMessages(activeChatId, { limit: 40 }).then(res => {
      if (res.success && res.data?.messages) {
        // Sort strictly by seq
        const sorted = [...res.data.messages].sort((a, b) => a.seq - b.seq)
        setActiveMessages(sorted)
        // Mark read
        if (sorted.length > 0) {
          const lastMsg = sorted[sorted.length - 1]
          api.markRead(activeChatId, lastMsg.id).catch(() => {})
        }
      }
    }).catch(() => {})

    // Echo channels
    const echo = echoRef.current
    if (!echo) return

    const convChannel = echo.private(`conversation.${activeChatId}`)
      .listen('.message.sent', (newMsg) => {
        setActiveMessages(prev => {
          // Deduplicate on client_id or id
          if (prev.some(m => m.client_id === newMsg.client_id || m.id === newMsg.id)) {
            return prev.map(m => (m.client_id === newMsg.client_id || m.id === newMsg.id) ? newMsg : m)
          }
          return [...prev, newMsg].sort((a, b) => a.seq - b.seq)
        })
        api.markRead(activeChatId, newMsg.id).catch(() => {})
      })
      .listen('.receipts.updated', (receipts) => {
        setApiConversations(prev => prev.map(c => {
          if (c.id === receipts.conversation_id) {
            return {
              ...c,
              me: { ...c.me, last_read_seq: receipts.last_read_seq, last_delivered_seq: receipts.last_delivered_seq },
              other: c.other ? { ...c.other, last_read_seq: receipts.last_read_seq, last_delivered_seq: receipts.last_delivered_seq } : null
            }
          }
          return c
        }))
      })
      .listen('.message.reacted', ({ message_id, reactions }) => {
        setActiveMessages(prev => prev.map(m => m.id === message_id ? { ...m, reactions } : m))
      })
      .listen('.conversation.pinned', ({ conversation_id, pinned_message }) => {
        setApiConversations(prev => prev.map(c => c.id === conversation_id ? { ...c, pinned_message } : c))
      })

    const room = echo.join(`room.${activeChatId}`)
      .here((members) => setPresentMembers(members))
      .joining((m) => setPresentMembers(prev => [...prev, m]))
      .leaving((m) => setPresentMembers(prev => prev.filter(p => p.id !== m.id)))
      .listenForWhisper('typing', ({ state, user_id }) => {
        if (!user_id) return
        setTypingUsers(prev => {
          const next = new Set(prev)
          if (state === 'typing') next.add(user_id)
          else next.delete(user_id)
          return next
        })

        // Auto expire after 6 seconds
        if (typingTimersRef.current[user_id]) clearTimeout(typingTimersRef.current[user_id])
        if (state === 'typing') {
          typingTimersRef.current[user_id] = setTimeout(() => {
            setTypingUsers(prev => {
              const next = new Set(prev)
              next.delete(user_id)
              return next
            })
          }, 6000)
        }
      })

    roomChannelRef.current = room

    return () => {
      echo.leave(`conversation.${activeChatId}`)
      echo.leave(`room.${activeChatId}`)
      roomChannelRef.current = null
    }
  }, [token, activeChatId, isApiConnected])

  // Typing whisper emitter
  const handleTypingInput = (e) => {
    setInputText(e.target.value)

    if (roomChannelRef.current) {
      const now = Date.now()
      if (now - lastTypingSentRef.current > 2000) {
        lastTypingSentRef.current = now
        roomChannelRef.current.whisper('typing', {
          state: 'typing',
          user_id: currentUser?.id
        })
      }
    }
  }

  // Send Message Handler
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const bodyText = inputText.trim()
    setInputText('')

    // Emit stopped typing whisper
    if (roomChannelRef.current && currentUser?.id) {
      roomChannelRef.current.whisper('typing', { state: 'stopped', user_id: currentUser.id })
    }

    if (isApiConnected) {
      const client_uuid = crypto.randomUUID()
      // Optimistic Bubble
      const optimisticMsg = {
        id: client_uuid,
        client_id: client_uuid,
        seq: Date.now(),
        sender_id: currentUser?.id,
        type: 'text',
        body: bodyText,
        created_at: new Date().toISOString(),
        isSelf: true
      }
      setActiveMessages(prev => [...prev, optimisticMsg])

      try {
        const res = await api.sendMessage(activeChatId, {
          client_uuid,
          type: 'text',
          body: bodyText
        })
        if (res.success && res.data) {
          // Replace optimistic message with real server response
          setActiveMessages(prev => prev.map(m => m.client_id === client_uuid ? res.data : m))
        }
      } catch (err) {
        console.error('Failed to send message:', err)
      }
    } else {
      // Demo Fallback
      const activeChat = CHATS_DATA_MOCK['Chats'].find(c => c.id === activeChatId) || CHATS_DATA_MOCK['Chats'][1]
      const newMsg = {
        id: Date.now(),
        sender: currentUser?.name || 'Abbas Wangde',
        text: bodyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSelf: true
      }
      if (!activeChat.messages) activeChat.messages = []
      activeChat.messages.push(newMsg)
    }
  }

  // File Upload Handler
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !isApiConnected) return

    setUploadingFile(true)
    try {
      const uploadRes = await api.uploadMedia(file, 'image')
      if (uploadRes.success && uploadRes.data?.id) {
        const client_uuid = crypto.randomUUID()
        await api.sendMessage(activeChatId, {
          client_uuid,
          type: 'image',
          upload_id: uploadRes.data.id,
          body: file.name
        })
      }
    } catch (err) {
      console.error('File upload failed:', err)
    } finally {
      setUploadingFile(false)
    }
  }

  // Determine current active chat & list
  let currentChatList = []
  let activeChat = null

  if (isApiConnected) {
    currentChatList = apiConversations.map(c => {
      const isGroup = !!c.group
      const title = isGroup ? c.group.title : (c.other?.name || 'Conversation')
      const avatarStr = getInitials(title)
      const lastMsgText = c.last_message?.body || (c.last_message?.type ? `[${c.last_message.type}]` : 'No messages yet')
      const timeStr = c.last_message_at ? new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
      
      return {
        id: c.id,
        name: title,
        subtitle: isGroup ? `${c.group.members_count} members` : (c.other?.online ? 'Online' : 'Offline'),
        avatar: avatarStr,
        avatarBg: isGroup ? '#10b981' : '#0284c7',
        time: timeStr,
        unread: c.unread_count || 0,
        lastMsg: lastMsgText,
        online: c.other?.online,
        isGroup,
        raw: c
      }
    })

    const found = currentChatList.find(c => c.id === activeChatId)
    activeChat = found || currentChatList[0] || { name: 'Chat', subtitle: '' }
  } else {
    currentChatList = CHATS_DATA_MOCK[activeTopTab] || CHATS_DATA_MOCK['Chats']
    activeChat = currentChatList.find(c => c.id === activeChatId) || CHATS_DATA_MOCK['Chats'][1]
  }

  const filteredChats = currentChatList.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="bitrix-app flex">
      {/* 1. FAR-LEFT VERTICAL ICON BAR */}
      <aside className="bitrix-icon-bar">
        <div className="icon-bar__top">
          <div className="brand-logo-btn" title="Famzon">
            <img src="/famzon-logo.jpg" alt="Famzon Logo" className="brand-logo-img" />
          </div>
        </div>

        <nav className="icon-bar__nav">
          <button 
            className={`icon-bar__item ${activeSideTab === 'Messenger' ? 'active' : ''}`}
            onClick={() => { setActiveSideTab('Messenger'); setActiveTopTab('Chats'); }}
          >
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {unreadCounts.unread > 0 && <span className="icon-bar__badge">{unreadCounts.unread}</span>}
            </div>
            <span>Messenger</span>
          </button>

          <button 
            className={`icon-bar__item ${activeSideTab === 'CoPilot' ? 'active' : ''}`}
            onClick={() => { setActiveSideTab('CoPilot'); setActiveTopTab('CoPilot'); }}
          >
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            </div>
            <span>CoPilot</span>
          </button>

          <button 
            className={`icon-bar__item ${activeSideTab === 'Calendar' ? 'active' : ''}`}
            onClick={() => setActiveSideTab('Calendar')}
          >
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <span>Calendar</span>
          </button>

          <button 
            className={`icon-bar__item ${activeSideTab === 'Feed' ? 'active' : ''}`}
            onClick={() => setActiveSideTab('Feed')}
          >
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>
              <span className="icon-bar__badge icon-bar__badge--pink">7</span>
            </div>
            <span>Feed</span>
          </button>

          <button 
            className={`icon-bar__item ${activeSideTab === 'Collabs' ? 'active' : ''}`}
            onClick={() => { setActiveSideTab('Collabs'); setActiveTopTab('Collabs'); }}
          >
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <span>Collabs</span>
          </button>

          <button 
            className={`icon-bar__item ${activeSideTab === 'Docs' ? 'active' : ''}`}
            onClick={() => setActiveSideTab('Docs')}
          >
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <span>Docs</span>
          </button>
        </nav>

        <div className="icon-bar__bottom">
          <div className="user-avatar-initials">{getInitials(currentUser?.name || 'AW')}</div>
        </div>
      </aside>

      {/* RIGHT MAIN WORKSPACE */}
      <div className="bitrix-main-content">
        
        {/* HEADER ROW */}
        <div className="bitrix-header-row">
          <header className="bitrix-top-nav">
            <div className="top-nav__tabs">
              {['Chats', 'Task chats', 'CoPilot', 'Collabs', 'Channels', 'Notifications'].map((tab) => (
                <button
                  key={tab}
                  className={`top-nav__tab ${activeTopTab === tab ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTopTab(tab)
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </header>

          <div className="feed-header">
            <div className="feed-header__left">
              <div className="feed-avatar" style={{ backgroundColor: activeChat?.avatarBg || '#0284c7' }}>
                {activeChat?.avatar || 'SF'}
              </div>
              <div className="feed-title-info">
                <h3>{activeChat?.name || 'SFamily Chat'}</h3>
                <span>
                  {typingUsers.size > 0 
                    ? 'typing...' 
                    : activeChat?.subtitle || 'Direct conversation'}
                </span>
              </div>
            </div>
            <div className="feed-header__right">
              <button className="voice-call-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                Voice call
              </button>
              <button className="icon-btn" title="Search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button>
            </div>
          </div>
        </div>

        {/* 2-COLUMN CHAT CONTAINER */}
        <div className="bitrix-chat-workspace">
          
          {/* CHAT LIST SIDEBAR */}
          <div className="chat-list-panel">
            <div className="search-bar-wrapper">
              <div className="search-input-pill">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  type="text"
                  placeholder="Find employee or chat"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="chat-cards-list">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`chat-card ${activeChatId === chat.id ? 'active' : ''}`}
                  onClick={() => setActiveChatId(chat.id)}
                >
                  <div className="chat-card__avatar-container">
                    <div className="chat-card__avatar" style={{ backgroundColor: chat.avatarBg }}>
                      {chat.avatar}
                    </div>
                    {chat.online && <span className="online-indicator"></span>}
                  </div>

                  <div className="chat-card__content">
                    <div className="chat-card__header">
                      <span className="chat-card__title">{chat.name}</span>
                      <span className="chat-card__time">{chat.time}</span>
                    </div>

                    <div className="chat-card__footer">
                      <span className="chat-card__snippet">{chat.lastMsg}</span>
                      {chat.unread > 0 && <span className="unread-badge">{chat.unread}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVE CHAT FEED PANE */}
          <div className="chat-feed-panel">
            
            {/* MESSAGES SCROLL AREA */}
            <div className="feed-messages">
              {isApiConnected ? (
                activeMessages.map((msg) => {
                  const isSelf = msg.sender_id === currentUser?.id || msg.isSelf
                  const timeStr = msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : msg.time

                  return (
                    <div key={msg.id || msg.client_id} className={`msg-group ${isSelf ? 'msg-group--self' : ''}`}>
                      {!isSelf && (
                        <div className="msg-avatar" style={{ backgroundColor: '#0284c7' }}>
                          {getInitials(msg.sender?.name || 'User')}
                        </div>
                      )}

                      <div className="msg-card">
                        {!isSelf && msg.sender?.name && (
                          <div className="msg-sender" style={{ color: '#38bdf8' }}>
                            {msg.sender.name}
                          </div>
                        )}
                        {msg.deleted ? (
                          <p className="msg-text msg-deleted">This message was deleted</p>
                        ) : (
                          <p className="msg-text">{msg.body || msg.text}</p>
                        )}
                        <div className="msg-time">
                          {timeStr} {isSelf && <span className="check-icon">✓✓</span>}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                activeChat?.messages?.map((msg) => (
                  <div key={msg.id} className={`msg-group ${msg.isSelf ? 'msg-group--self' : ''}`}>
                    {!msg.isSelf && (
                      <div className="msg-avatar" style={{ backgroundColor: msg.avatarBg || '#0284c7' }}>
                        {msg.avatar}
                      </div>
                    )}
                    <div className="msg-card">
                      {!msg.isSelf && msg.sender && (
                        <div className="msg-sender" style={{ color: msg.senderColor || '#38bdf8' }}>
                          {msg.sender}
                        </div>
                      )}
                      <p className="msg-text">{msg.text}</p>
                      <div className="msg-time">{msg.time} {msg.isSelf && <span className="check-icon">✓✓</span>}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>


            {/* COMPOSER BAR */}
            <div className="feed-composer-wrapper">
              <form className="feed-composer" onSubmit={handleSendMessage}>
                <label className="composer-icon-btn" title="Attach file">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                  <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} disabled={uploadingFile} />
                </label>

                <input
                  type="text"
                  placeholder={uploadingFile ? "Uploading attachment..." : "Type @ or + to mention a person, a chat or AI"}
                  value={inputText}
                  onChange={handleTypingInput}
                  disabled={uploadingFile}
                />

                <button type="submit" className="composer-round-btn" title="Send">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>

      <div className="floating-help-badge">?</div>
    </div>
  )
}

export default Chat

