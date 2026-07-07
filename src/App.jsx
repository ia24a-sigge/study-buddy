import { useEffect, useState } from 'react'
import {
  badges,
  buddies,
  chats,
  currentUser,
  goals,
  notifications,
  reviews,
  sessions,
} from './data/mockData'
import './App.css'

const navGroups = [
  {
    label: 'Discover',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'DB' },
      { id: 'match', label: 'Find buddies', icon: 'FB' },
      { id: 'sessions', label: 'Sessions', icon: 'SS' },
      { id: 'calendar', label: 'Calendar', icon: 'CA' },
    ],
  },
  {
    label: 'Account',
    items: [
      { id: 'chat', label: 'Messages', icon: 'MS' },
      { id: 'profile', label: 'Profile', icon: 'PR' },
      { id: 'settings', label: 'Settings', icon: 'ST' },
    ],
  },
]

const pageTitles = {
  dashboard: 'Dashboard',
  match: 'Find a study buddy',
  search: 'Search students',
  sessions: 'Study sessions',
  chat: 'Messages',
  calendar: 'Calendar',
  profile: 'Profile',
  ratings: 'Ratings',
  settings: 'Settings',
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${dateString}T12:00:00`))
}

function App() {
  const [theme, setTheme] = useState('light')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [activePage, setActivePage] = useState('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [toasts, setToasts] = useState([])
  const [profile, setProfile] = useState(currentUser)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [sessionsState, setSessionsState] = useState(sessions)
  const [joinedSessionIds, setJoinedSessionIds] = useState(new Set(['s1', 's3']))
  const [sessionModalOpen, setSessionModalOpen] = useState(false)
  const [selectedBuddy, setSelectedBuddy] = useState(null)
  const [chatsState, setChatsState] = useState(chats)
  const [activeChatId, setActiveChatId] = useState('c1')
  const [globalSearch, setGlobalSearch] = useState('')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  function pushToast(title, message = '', type = 'info') {
    const id = Date.now() + Math.random()
    setToasts((current) => [...current, { id, title, message, type }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 3800)
  }

  function handleAuthSuccess(name) {
    setIsAuthenticated(true)
    setActivePage('dashboard')
    pushToast('Signed in', `${name || profile.name} is ready to find study partners.`, 'success')
  }

  function handleNavigate(page) {
    setActivePage(page)
    setMobileMenuOpen(false)
  }

  function handleContactBuddy(buddy) {
    const existingChat = chatsState.find((chat) => chat.buddyId === buddy.id)
    if (existingChat) {
      setActiveChatId(existingChat.id)
    } else {
      const chat = {
        id: `c-${buddy.id}`,
        buddyId: buddy.id,
        name: buddy.name,
        subject: buddy.subjects[0],
        online: buddy.online,
        avatarGradient: buddy.avatarGradient,
        lastMessage: 'Start a new study plan together.',
        unread: 0,
        typing: false,
        messages: [
          {
            id: `m-${buddy.id}`,
            from: 'them',
            text: `Hi Maya, I am interested in ${buddy.subjects[0]} too. Want to compare goals?`,
            time: 'Now',
          },
        ],
      }
      setChatsState((current) => [chat, ...current])
      setActiveChatId(chat.id)
    }
    setActivePage('chat')
    pushToast('Conversation opened', `${buddy.name} is ready to plan a session.`, 'message')
  }

  function handleJoinSession(sessionId) {
    const alreadyJoined = joinedSessionIds.has(sessionId)
    setJoinedSessionIds((current) => {
      const next = new Set(current)
      if (alreadyJoined) {
        next.delete(sessionId)
      } else {
        next.add(sessionId)
      }
      return next
    })
    setSessionsState((current) =>
      current.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              participants: alreadyJoined
                ? Math.max(0, session.participants - 1)
                : Math.min(session.maxParticipants, session.participants + 1),
            }
          : session,
      ),
    )
    const session = sessionsState.find((item) => item.id === sessionId)
    pushToast(
      alreadyJoined ? 'Session left' : 'Session joined',
      session ? session.topic : 'Your sessions were updated.',
      alreadyJoined ? 'info' : 'success',
    )
  }

  function handleCreateSession(newSession) {
    setSessionsState((current) => [newSession, ...current])
    setJoinedSessionIds((current) => new Set([...current, newSession.id]))
    setSessionModalOpen(false)
    pushToast('Session created', `${newSession.topic} is now open for collaborators.`, 'success')
  }

  function handleSendMessage(chatId, text) {
    const trimmed = text.trim()
    if (!trimmed) return
    setChatsState((current) =>
      current.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              lastMessage: trimmed,
              messages: [
                ...chat.messages,
                {
                  id: `m-${Date.now()}`,
                  from: 'me',
                  text: trimmed,
                  time: 'Now',
                },
              ],
            }
          : chat,
      ),
    )
  }

  function renderPage() {
    switch (activePage) {
      case 'match':
        return (
          <MatchingPage
            buddies={buddies}
            onContact={handleContactBuddy}
            onViewProfile={setSelectedBuddy}
          />
        )
      case 'search':
        return (
          <SearchPage
            buddies={buddies}
            onContact={handleContactBuddy}
            onViewProfile={setSelectedBuddy}
          />
        )
      case 'sessions':
        return (
          <SessionsPage
            sessions={sessionsState}
            joinedSessionIds={joinedSessionIds}
            onJoin={handleJoinSession}
            onCreate={() => setSessionModalOpen(true)}
          />
        )
      case 'chat':
        return (
          <ChatPage
            chats={chatsState}
            activeChatId={activeChatId}
            onSelectChat={setActiveChatId}
            onSendMessage={handleSendMessage}
          />
        )
      case 'calendar':
        return (
          <CalendarPage
            sessions={sessionsState}
            joinedSessionIds={joinedSessionIds}
            onCreate={() => setSessionModalOpen(true)}
          />
        )
      case 'profile':
        return (
          <ProfilePage
            profile={profile}
            badges={badges}
            reviews={reviews}
            onEdit={() => setProfileModalOpen(true)}
          />
        )
      case 'ratings':
        return <RatingsPage reviews={reviews} buddies={buddies} pushToast={pushToast} />
      case 'settings':
        return (
          <SettingsPage
            profile={profile}
            theme={theme}
            setTheme={setTheme}
            pushToast={pushToast}
          />
        )
      default:
        return (
          <DashboardPage
            profile={profile}
            buddies={buddies}
            sessions={sessionsState}
            joinedSessionIds={joinedSessionIds}
            onNavigate={handleNavigate}
            onCreateSession={() => setSessionModalOpen(true)}
            onContact={handleContactBuddy}
          />
        )
    }
  }

  if (!isAuthenticated) {
    return (
      <>
        <AuthPage
          mode={authMode}
          setMode={setAuthMode}
          onSuccess={handleAuthSuccess}
          theme={theme}
          setTheme={setTheme}
        />
        <ToastStack toasts={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
      </>
    )
  }

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        navGroups={navGroups}
        profile={profile}
        isOpen={mobileMenuOpen}
        onNavigate={handleNavigate}
        onClose={() => setMobileMenuOpen(false)}
      />
      <div className="workspace">
        <Topbar
          title={pageTitles[activePage]}
          profile={profile}
          theme={theme}
          setTheme={setTheme}
          notifications={notifications}
          notificationOpen={notificationOpen}
          setNotificationOpen={setNotificationOpen}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          onMenu={() => setMobileMenuOpen(true)}
          onCreate={() => setSessionModalOpen(true)}
        />
        <main className="page-stage">{renderPage()}</main>
      </div>
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
      {profileModalOpen && (
        <ProfileModal
          profile={profile}
          onClose={() => setProfileModalOpen(false)}
          onSave={(nextProfile) => {
            setProfile(nextProfile)
            setProfileModalOpen(false)
            pushToast('Profile updated', 'Your matching profile is sharper now.', 'success')
          }}
        />
      )}
      {sessionModalOpen && (
        <CreateSessionModal
          profile={profile}
          onClose={() => setSessionModalOpen(false)}
          onCreate={handleCreateSession}
        />
      )}
      {selectedBuddy && (
        <BuddyModal
          buddy={selectedBuddy}
          onClose={() => setSelectedBuddy(null)}
          onContact={() => {
            handleContactBuddy(selectedBuddy)
            setSelectedBuddy(null)
          }}
        />
      )}
    </div>
  )
}

function AuthPage({ mode, setMode, onSuccess, theme, setTheme }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    school: '',
    remember: true,
  })
  const [errors, setErrors] = useState({})

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function validate() {
    const nextErrors = {}
    if (mode === 'register' && form.name.trim().length < 2) {
      nextErrors.name = 'Enter your full name.'
    }
    if (!form.email.includes('@') || !form.email.includes('.')) {
      nextErrors.email = 'Use a valid student email.'
    }
    if (form.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.'
    }
    if (mode === 'register' && form.school.trim().length < 2) {
      nextErrors.school = 'Add your school or university.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    onSuccess(form.name || 'Maya')
  }

  return (
    <main className="auth-page">
      <section className="auth-showcase">
        <div className="brand-mark large">SB</div>
        <p className="eyebrow">Study Buddy Finder</p>
        <h1>Find the right people to study with.</h1>
        <p>
          Create a learning profile with your subjects and goals, then find and
          contact study partners who are working towards the same things.
        </p>
        <ul className="auth-steps">
          <li>
            <span>1</span>
            <div>
              <strong>Create your profile</strong>
              <small>Add your subjects, goals and availability.</small>
            </div>
          </li>
          <li>
            <span>2</span>
            <div>
              <strong>Find a match</strong>
              <small>Browse partners ranked by shared subjects and goals.</small>
            </div>
          </li>
          <li>
            <span>3</span>
            <div>
              <strong>Get in touch</strong>
              <small>View a profile and start a conversation directly.</small>
            </div>
          </li>
        </ul>
      </section>

      <section className="auth-card glass-card">
        <div className="auth-card-header">
          <div>
            <p className="eyebrow">{mode === 'login' ? 'Welcome back' : 'Create account'}</p>
            <h2>{mode === 'login' ? 'Log in' : 'Register'}</h2>
          </div>
          <button className="icon-button" type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>

        <div className="auth-switch" role="tablist" aria-label="Authentication mode">
          <button
            className={classNames(mode === 'login' && 'is-active')}
            type="button"
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            className={classNames(mode === 'register' && 'is-active')}
            type="button"
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <Field label="Name" error={errors.name}>
              <input
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                placeholder="Maya Chen"
              />
            </Field>
          )}
          <Field label="Email" error={errors.email}>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="maya.chen@campus.edu"
            />
          </Field>
          <Field label="Password" error={errors.password}>
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              placeholder="Minimum 6 characters"
            />
          </Field>
          {mode === 'register' && (
            <Field label="School or University" error={errors.school}>
              <input
                value={form.school}
                onChange={(event) => updateField('school', event.target.value)}
                placeholder="Zurich University of Applied Sciences"
              />
            </Field>
          )}

          {mode === 'login' && (
            <div className="form-row between">
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(event) => updateField('remember', event.target.checked)}
                />
                Remember me
              </label>
              <button className="text-button" type="button">
                Forgot password?
              </button>
            </div>
          )}

          <button className="primary-button wide" type="submit">
            {mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        <div className="divider">
          <span>or continue with</span>
        </div>
        <div className="social-grid">
          <button type="button" onClick={() => onSuccess('Google student')}>
            <span className="social-dot google" />
            Google
          </button>
          <button type="button" onClick={() => onSuccess('Microsoft student')}>
            <span className="social-dot microsoft" />
            Microsoft
          </button>
        </div>
      </section>
    </main>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error && <small className="field-error">{error}</small>}
    </label>
  )
}

function Sidebar({ activePage, navGroups, profile, isOpen, onNavigate, onClose }) {
  return (
    <>
      <aside className={classNames('sidebar', isOpen && 'is-open')}>
        <div className="sidebar-brand">
          <div className="brand-mark">SB</div>
          <div>
            <strong>Study Buddy</strong>
            <span>Finder</span>
          </div>
        </div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <p className="nav-group-label">{group.label}</p>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  className={classNames(activePage === item.id && 'is-active')}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-user">
          <Avatar name={profile.name} gradient={profile.avatarGradient} status="online" />
          <div>
            <strong>{profile.name}</strong>
            <span>{profile.school}</span>
          </div>
        </div>
      </aside>
      {isOpen && <button className="mobile-scrim" type="button" aria-label="Close menu" onClick={onClose} />}
    </>
  )
}

function Topbar({
  title,
  profile,
  theme,
  setTheme,
  notifications,
  notificationOpen,
  setNotificationOpen,
  globalSearch,
  setGlobalSearch,
  onMenu,
  onCreate,
}) {
  return (
    <header className="topbar">
      <button className="icon-button menu-button" type="button" onClick={onMenu}>
        Menu
      </button>
      <div className="topbar-title">
        <p className="eyebrow">Workspace</p>
        <h1>{title}</h1>
      </div>
      <label className="global-search">
        <span>Search</span>
        <input
          value={globalSearch}
          onChange={(event) => setGlobalSearch(event.target.value)}
          placeholder="Search buddies, sessions, subjects..."
        />
      </label>
      <div className="topbar-actions">
        <button className="secondary-button hide-mobile" type="button" onClick={onCreate}>
          New session
        </button>
        <button className="icon-button" type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
        <div className="notification-wrap">
          <button
            className="icon-button notification-button"
            type="button"
            onClick={() => setNotificationOpen(!notificationOpen)}
          >
            Alerts
            <span>{notifications.length}</span>
          </button>
          {notificationOpen && <NotificationCenter notifications={notifications} />}
        </div>
        <Avatar name={profile.name} gradient={profile.avatarGradient} status="online" />
      </div>
    </header>
  )
}

function DashboardPage({
  profile,
  buddies,
  sessions,
  joinedSessionIds,
  onNavigate,
  onCreateSession,
  onContact,
}) {
  const upcomingSessions = sessions
    .filter((session) => joinedSessionIds.has(session.id))
    .slice(0, 3)
  const recommended = buddies.slice(0, 3)

  return (
    <div className="page dashboard-grid animate-in">
      <section className="hero-panel glass-card">
        <div>
          <p className="eyebrow">Good afternoon, {profile.name.split(' ')[0]}</p>
          <h2>Build momentum with the right study crew.</h2>
          <p>
            Your next best move is a focused Algorithms sprint, then a quick review
            with Sofia. Small sessions, compounding confidence.
          </p>
          <div className="hero-actions">
            <button className="primary-button" type="button" onClick={onCreateSession}>
              Create session
            </button>
            <button className="secondary-button" type="button" onClick={() => onNavigate('match')}>
              Find buddies
            </button>
          </div>
        </div>
        <div className="ai-card">
          <span className="ai-pulse" />
          <p className="eyebrow">Recommended plan</p>
          <strong>Study plan for tonight</strong>
          <span>45 min dynamic programming, 15 min recall, 20 min buddy review.</span>
          <div className="confidence-meter">
            <i style={{ width: '87%' }} />
          </div>
        </div>
      </section>

      <section className="panel-card span-2">
        <SectionHeader
          eyebrow="Upcoming"
          title="Study sessions"
          actionLabel="View all"
          onAction={() => onNavigate('sessions')}
        />
        {upcomingSessions.length > 0 ? (
          <div className="session-list compact">
            {upcomingSessions.map((session) => (
              <SessionCard key={session.id} session={session} joined compact />
            ))}
          </div>
        ) : (
          <p className="dashboard-empty">
            You have not joined any sessions yet. Discover one to get started.
          </p>
        )}
      </section>

      <section className="panel-card">
        <SectionHeader
          eyebrow="Recommended"
          title="Study buddies"
          actionLabel="Match"
          onAction={() => onNavigate('match')}
        />
        <div className="buddy-mini-list">
          {recommended.map((buddy) => (
            <button key={buddy.id} type="button" onClick={() => onContact(buddy)}>
              <Avatar name={buddy.name} gradient={buddy.avatarGradient} status={buddy.online ? 'online' : 'offline'} />
              <span>
                <strong>{buddy.name}</strong>
                <small>{buddy.match}% match - {buddy.subjects[0]}</small>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel-card">
        <SectionHeader eyebrow="Goals" title="Personal study goals" />
        <div className="goal-stack">
          {goals.map((goal) => (
            <ProgressItem key={goal.label} label={goal.label} current={goal.current} target={goal.target} />
          ))}
        </div>
      </section>
    </div>
  )
}

function MatchingPage({ buddies, onContact, onViewProfile }) {
  const topMatch = Math.max(...buddies.map((buddy) => buddy.match))

  return (
    <div className="page animate-in">
      <section className="match-hero glass-card">
        <div>
          <p className="eyebrow">Matching</p>
          <h2>Study partners matched to your subjects, goals and availability.</h2>
          <p>
            Ranked by what actually matters for studying together: shared subjects,
            similar learning goals and overlapping free time.
          </p>
        </div>
        <div className="match-summary">
          <strong>{buddies.length}</strong>
          <span>partners found</span>
          <small>Best match {topMatch}%</small>
        </div>
      </section>

      <div className="buddy-grid">
        {buddies.map((buddy, index) => (
          <BuddyCard
            key={buddy.id}
            buddy={buddy}
            style={{ animationDelay: `${index * 70}ms` }}
            onContact={() => onContact(buddy)}
            onViewProfile={() => onViewProfile(buddy)}
          />
        ))}
      </div>
    </div>
  )
}

function SearchPage({ buddies, onContact, onViewProfile }) {
  const [filters, setFilters] = useState({
    subject: '',
    goal: '',
    availability: 'Any',
    skill: 'Any',
    status: 'Any',
    language: 'Any',
    sort: 'Best match',
  })

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  const filteredBuddies = buddies
    .filter((buddy) => {
      const subjectMatch =
        !filters.subject ||
        buddy.subjects.some((subject) => subject.toLowerCase().includes(filters.subject.toLowerCase()))
      const goalMatch =
        !filters.goal ||
        buddy.goals.some((goal) => goal.toLowerCase().includes(filters.goal.toLowerCase()))
      const availabilityMatch =
        filters.availability === 'Any' ||
        buddy.availability.some((slot) => slot.includes(filters.availability))
      const skillMatch = filters.skill === 'Any' || buddy.skillLevel === filters.skill
      const statusMatch =
        filters.status === 'Any' ||
        (filters.status === 'Online' ? buddy.online : !buddy.online)
      const languageMatch = filters.language === 'Any' || buddy.languages.includes(filters.language)
      return subjectMatch && goalMatch && availabilityMatch && skillMatch && statusMatch && languageMatch
    })
    .sort((a, b) => {
      if (filters.sort === 'Most active') return b.activeScore - a.activeScore
      if (filters.sort === 'Newest') return new Date(b.joinedAt) - new Date(a.joinedAt)
      if (filters.sort === 'Highest rated') return b.rating - a.rating
      return b.match - a.match
    })

  return (
    <div className="page search-layout animate-in">
      <section className="search-panel glass-card">
        <p className="eyebrow">Power search</p>
        <h2>Find exactly the kind of learner you need.</h2>
        <div className="filter-grid">
          <Field label="Subject">
            <input
              value={filters.subject}
              onChange={(event) => updateFilter('subject', event.target.value)}
              placeholder="Algorithms, UX, Statistics..."
            />
          </Field>
          <Field label="Goal">
            <input
              value={filters.goal}
              onChange={(event) => updateFilter('goal', event.target.value)}
              placeholder="Final exams, portfolio..."
            />
          </Field>
          <SelectField label="Availability" value={filters.availability} onChange={(value) => updateFilter('availability', value)}>
            {['Any', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </SelectField>
          <SelectField label="Skill level" value={filters.skill} onChange={(value) => updateFilter('skill', value)}>
            {['Any', 'Beginner', 'Intermediate', 'Advanced'].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </SelectField>
          <SelectField label="Online status" value={filters.status} onChange={(value) => updateFilter('status', value)}>
            {['Any', 'Online', 'Offline'].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </SelectField>
          <SelectField label="Language" value={filters.language} onChange={(value) => updateFilter('language', value)}>
            {['Any', 'English', 'German', 'French', 'Italian'].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </SelectField>
          <SelectField label="Sort by" value={filters.sort} onChange={(value) => updateFilter('sort', value)}>
            {['Best match', 'Most active', 'Newest', 'Highest rated'].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </SelectField>
        </div>
      </section>

      <section>
        <div className="results-header">
          <div>
            <p className="eyebrow">Results</p>
            <h2>{filteredBuddies.length} compatible students</h2>
          </div>
          <div className="skeleton-row" aria-label="Loading skeleton mockup">
            <span />
            <span />
            <span />
          </div>
        </div>
        {filteredBuddies.length > 0 ? (
          <div className="buddy-grid compact-grid">
            {filteredBuddies.map((buddy) => (
              <BuddyCard
                key={buddy.id}
                buddy={buddy}
                onContact={() => onContact(buddy)}
                onViewProfile={() => onViewProfile(buddy)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No perfect match yet"
            text="Try widening your availability or language filters. The right study gremlin is probably one checkbox away."
          />
        )}
      </section>
    </div>
  )
}

function SessionsPage({ sessions, joinedSessionIds, onJoin, onCreate }) {
  const [tab, setTab] = useState('Discover')
  const visibleSessions = sessions.filter((session) => {
    if (tab === 'My sessions') return joinedSessionIds.has(session.id)
    if (tab === 'Upcoming') return new Date(`${session.date}T${session.time}`) >= new Date('2026-05-26T00:00:00')
    return true
  })

  return (
    <div className="page animate-in">
      <section className="section-toolbar glass-card">
        <div>
          <p className="eyebrow">Study rooms</p>
          <h2>Create, discover, join, and manage sessions.</h2>
        </div>
        <button className="primary-button" type="button" onClick={onCreate}>
          Create study session
        </button>
      </section>
      <div className="tabs">
        {['Discover', 'Upcoming', 'My sessions'].map((item) => (
          <button
            key={item}
            className={classNames(tab === item && 'is-active')}
            type="button"
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="session-grid">
        {visibleSessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            joined={joinedSessionIds.has(session.id)}
            onJoin={() => onJoin(session.id)}
          />
        ))}
      </div>
    </div>
  )
}

function ChatPage({ chats, activeChatId, onSelectChat, onSendMessage }) {
  const [draft, setDraft] = useState('')
  const activeChat = chats.find((chat) => chat.id === activeChatId) || chats[0]

  function submitMessage(event) {
    event.preventDefault()
    onSendMessage(activeChat.id, draft)
    setDraft('')
  }

  return (
    <div className="page chat-layout animate-in">
      <aside className="conversation-panel glass-card">
        <div className="panel-search">
          <input placeholder="Search conversations" />
        </div>
        <div className="conversation-list">
          {chats.map((chat) => (
            <button
              key={chat.id}
              className={classNames('conversation-item', activeChat.id === chat.id && 'is-active')}
              type="button"
              onClick={() => onSelectChat(chat.id)}
            >
              <Avatar name={chat.name} gradient={chat.avatarGradient} status={chat.online ? 'online' : 'offline'} />
              <span>
                <strong>{chat.name}</strong>
                <small>{chat.lastMessage}</small>
              </span>
              {chat.unread > 0 && <b>{chat.unread}</b>}
            </button>
          ))}
        </div>
      </aside>
      <section className="chat-window glass-card">
        <header className="chat-header">
          <div>
            <Avatar name={activeChat.name} gradient={activeChat.avatarGradient} status={activeChat.online ? 'online' : 'offline'} />
            <span>
              <strong>{activeChat.name}</strong>
              <small>{activeChat.online ? 'Online now' : 'Offline'} - {activeChat.subject}</small>
            </span>
          </div>
          <button className="secondary-button" type="button">
            Invite to session
          </button>
        </header>
        <div className="message-stream">
          {activeChat.messages.map((message) => (
            <div key={message.id} className={classNames('message', message.from === 'me' && 'is-me')}>
              <p>{message.text}</p>
              <span>{message.time}</span>
            </div>
          ))}
          {activeChat.typing && (
            <div className="typing-indicator">
              <span />
              <span />
              <span />
              {activeChat.name.split(' ')[0]} is typing
            </div>
          )}
        </div>
        <form className="message-composer" onSubmit={submitMessage}>
          <button type="button" aria-label="Attach file">
            Attach
          </button>
          <button type="button" aria-label="Open emoji picker" onClick={() => setDraft((current) => `${current} :)`)}>
            Emoji
          </button>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={`Message ${activeChat.name.split(' ')[0]}...`}
          />
          <button className="primary-button" type="submit">
            Send
          </button>
        </form>
      </section>
    </div>
  )
}

function CalendarPage({ sessions, joinedSessionIds, onCreate }) {
  const [view, setView] = useState('Month')
  const days = Array.from({ length: 35 }).map((_, index) => {
    const day = index - 3
    return day > 0 && day <= 31 ? day : null
  })

  return (
    <div className="page animate-in">
      <section className="section-toolbar glass-card">
        <div>
          <p className="eyebrow">May 2026</p>
          <h2>Plan meetings and protect your focus blocks.</h2>
        </div>
        <div className="toolbar-actions">
          <div className="segmented">
            {['Month', 'Week'].map((item) => (
              <button
                key={item}
                className={classNames(view === item && 'is-active')}
                type="button"
                onClick={() => setView(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <button className="primary-button" type="button" onClick={onCreate}>
            Plan meeting
          </button>
        </div>
      </section>

      {view === 'Month' ? (
        <div className="calendar-grid glass-card">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <strong key={day}>{day}</strong>
          ))}
          {days.map((day, index) => {
            const daySessions = sessions.filter((session) => Number(session.date.split('-')[2]) === day)
            return (
              <div key={`${day || 'empty'}-${index}`} className={classNames(!day && 'is-muted', day === 26 && 'is-today')}>
                <span>{day}</span>
                {daySessions.slice(0, 2).map((session) => (
                  <small key={session.id} className={joinedSessionIds.has(session.id) ? 'is-joined' : ''}>
                    {session.time} {session.subject}
                  </small>
                ))}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="week-view">
          {sessions.slice(0, 5).map((session) => (
            <div className="week-event glass-card" key={session.id}>
              <span>{formatDate(session.date)}</span>
              <div>
                <strong>{session.topic}</strong>
                <p>{session.time} - {session.duration} - {session.location}</p>
              </div>
              <b>{session.participants}/{session.maxParticipants}</b>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProfilePage({ profile, badges, reviews, onEdit }) {
  return (
    <div className="page profile-layout animate-in">
      <section className="profile-hero glass-card">
        <Avatar name={profile.name} gradient={profile.avatarGradient} size="xl" status="online" />
        <div>
          <p className="eyebrow">{profile.school}</p>
          <h2>{profile.name}</h2>
          <p>{profile.headline}</p>
          <div className="tag-row">
            {profile.subjects.map((subject) => (
              <span key={subject}>{subject}</span>
            ))}
          </div>
        </div>
        <button className="primary-button" type="button" onClick={onEdit}>
          Edit profile
        </button>
      </section>

      <section className="panel-card span-2">
        <SectionHeader eyebrow="About" title="Learning profile" />
        <p className="large-copy">{profile.bio}</p>
        <div className="profile-detail-grid">
          <InfoBlock label="Skill level" value={profile.skillLevel} />
          <InfoBlock label="Learning style" value={profile.learningStyle} />
          <InfoBlock label="Availability" value={profile.availability.join(', ')} />
          <InfoBlock label="Languages" value={profile.languages.join(', ')} />
          <InfoBlock label="Goals" value={profile.goals.join(', ')} />
          <InfoBlock label="Interests" value={profile.interests.join(', ')} />
        </div>
      </section>

      <section className="panel-card">
        <SectionHeader eyebrow="Gamification" title="Badges" />
        <div className="badge-grid">
          {badges.map((badge) => (
            <div className="badge-card" key={badge.title}>
              <span>{badge.title.slice(0, 2).toUpperCase()}</span>
              <strong>{badge.title}</strong>
              <p>{badge.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel-card">
        <SectionHeader eyebrow="Reviews" title={`Average ${profile.rating}`} />
        <div className="review-list">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </section>
    </div>
  )
}

function RatingsPage({ reviews, buddies, pushToast }) {
  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState('')
  const [selectedBuddy, setSelectedBuddy] = useState(buddies[0].name)

  function submitRating(event) {
    event.preventDefault()
    pushToast('Rating submitted', `Your ${rating}-star feedback for ${selectedBuddy} was saved.`, 'success')
    setFeedback('')
  }

  return (
    <div className="page ratings-layout animate-in">
      <section className="rating-card glass-card">
        <p className="eyebrow">After session</p>
        <h2>Rate your study partner</h2>
        <form onSubmit={submitRating}>
          <SelectField label="Study buddy" value={selectedBuddy} onChange={setSelectedBuddy}>
            {buddies.map((buddy) => (
              <option key={buddy.id}>{buddy.name}</option>
            ))}
          </SelectField>
          <div className="star-picker" aria-label="Choose a 1 to 5 star rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={classNames(star <= rating && 'is-filled')}
                type="button"
                onClick={() => setRating(star)}
              >
                &#9733;
              </button>
            ))}
          </div>
          <Field label="Optional feedback">
            <textarea
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              placeholder="What worked well? What should they know for next time?"
            />
          </Field>
          <button className="primary-button wide" type="submit">
            Submit rating
          </button>
        </form>
      </section>
      <section className="panel-card">
        <SectionHeader eyebrow="Profile reviews" title="What partners say" />
        <div className="review-list">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </section>
    </div>
  )
}

function SettingsPage({ profile, theme, setTheme, pushToast }) {
  const [preferences, setPreferences] = useState({
    messages: true,
    matches: true,
    reminders: true,
    visibleOnline: true,
    allowInvites: true,
  })

  function toggle(key) {
    setPreferences((current) => ({ ...current, [key]: !current[key] }))
  }

  return (
    <div className="page settings-layout animate-in">
      <section className="panel-card">
        <SectionHeader eyebrow="Account" title="Account settings" />
        <div className="settings-list">
          <InfoBlock label="Name" value={profile.name} />
          <InfoBlock label="Email" value={profile.email} />
          <InfoBlock label="School" value={profile.school} />
        </div>
      </section>
      <section className="panel-card">
        <SectionHeader eyebrow="Privacy" title="Privacy settings" />
        <ToggleRow label="Show online status" checked={preferences.visibleOnline} onChange={() => toggle('visibleOnline')} />
        <ToggleRow label="Allow session invitations" checked={preferences.allowInvites} onChange={() => toggle('allowInvites')} />
      </section>
      <section className="panel-card">
        <SectionHeader eyebrow="Notifications" title="Preferences" />
        <ToggleRow label="New messages" checked={preferences.messages} onChange={() => toggle('messages')} />
        <ToggleRow label="New matches" checked={preferences.matches} onChange={() => toggle('matches')} />
        <ToggleRow label="Session reminders" checked={preferences.reminders} onChange={() => toggle('reminders')} />
      </section>
      <section className="panel-card">
        <SectionHeader eyebrow="Appearance" title="Theme selection" />
        <div className="theme-options">
          {['dark', 'light'].map((item) => (
            <button
              key={item}
              className={classNames(theme === item && 'is-active')}
              type="button"
              onClick={() => setTheme(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>
      <section className="danger-card">
        <div>
          <p className="eyebrow">Danger zone</p>
          <h2>Delete account</h2>
          <p>This demo keeps your data local, but the UI shows how a real destructive action would be handled.</p>
        </div>
        <button type="button" onClick={() => pushToast('Delete account mockup', 'No account was deleted in this demo.', 'warning')}>
          Delete account
        </button>
      </section>
    </div>
  )
}

function SelectField({ label, value, onChange, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  )
}

function SectionHeader({ eyebrow, title, actionLabel, onAction }) {
  return (
    <div className="section-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {actionLabel && (
        <button className="text-button" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

function Avatar({ name, gradient, status, size = 'md' }) {
  return (
    <div className={classNames('avatar', `avatar-${size}`)} style={{ background: gradient }} aria-label={name}>
      <span>{initials(name)}</span>
      {status && <i className={classNames('status-dot', status)} />}
    </div>
  )
}

function BuddyCard({ buddy, onContact, onViewProfile, style }) {
  return (
    <article className="buddy-card glass-card" style={style}>
      <div className="buddy-card-top">
        <Avatar name={buddy.name} gradient={buddy.avatarGradient} status={buddy.online ? 'online' : 'offline'} size="lg" />
        <div className="match-score">
          <strong>{buddy.match}%</strong>
          <span>match</span>
        </div>
      </div>
      <h3>{buddy.name}</h3>
      <p>{buddy.bio}</p>
      <div className="tag-row">
        {buddy.subjects.slice(0, 3).map((subject) => (
          <span key={subject}>{subject}</span>
        ))}
      </div>
      <div className="buddy-meta">
        <span>{buddy.skillLevel}</span>
        <span>{buddy.languages.join(', ')}</span>
        <span>{buddy.rating} avg rating</span>
      </div>
      <div className="card-actions">
        <button className="primary-button" type="button" onClick={onContact}>
          Contact
        </button>
        <button className="secondary-button" type="button" onClick={onViewProfile}>
          View profile
        </button>
      </div>
    </article>
  )
}

function SessionCard({ session, joined, onJoin, compact = false }) {
  return (
    <article className={classNames('session-card', compact && 'is-compact')}>
      <div className="session-date">
        <strong>{formatDate(session.date)}</strong>
        <span>{session.time}</span>
      </div>
      <div className="session-body">
        <div className="session-title-row">
          <span>{session.subject}</span>
          <b>{session.mode}</b>
        </div>
        <h3>{session.topic}</h3>
        {!compact && <p>{session.description}</p>}
        <div className="session-meta">
          <span>{session.duration}</span>
          <span>{session.location}</span>
          <span>{session.participants}/{session.maxParticipants} joined</span>
        </div>
      </div>
      {onJoin && (
        <button className={joined ? 'secondary-button' : 'primary-button'} type="button" onClick={onJoin}>
          {joined ? 'Leave' : 'Join'}
        </button>
      )}
    </article>
  )
}

function NotificationCenter({ notifications }) {
  return (
    <div className="notification-center glass-card">
      <SectionHeader eyebrow="Center" title="Notifications" />
      <div className="notification-list">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  )
}

function NotificationItem({ notification }) {
  return (
    <article className="notification-item">
      <i style={{ background: notification.accent }} />
      <div>
        <strong>{notification.title}</strong>
        <p>{notification.message}</p>
        <span>{notification.time}</span>
      </div>
    </article>
  )
}

function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="toast-stack">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          className={classNames('toast', `toast-${toast.type}`)}
          type="button"
          onClick={() => onDismiss(toast.id)}
        >
          <strong>{toast.title}</strong>
          {toast.message && <span>{toast.message}</span>}
        </button>
      ))}
    </div>
  )
}

function EmptyState({ title, text }) {
  return (
    <div className="empty-state glass-card">
      <div className="empty-illustration">
        <span />
        <i />
        <b />
      </div>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  )
}

function InfoBlock({ label, value }) {
  return (
    <div className="info-block">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function ProgressItem({ label, current, target }) {
  const percent = Math.min(100, Math.round((current / target) * 100))
  return (
    <div className="progress-item">
      <div>
        <strong>{label}</strong>
        <span>{current}/{target}</span>
      </div>
      <div className="progress-track">
        <i style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function ReviewCard({ review }) {
  return (
    <article className="review-card">
      <div>
        <strong>{review.author}</strong>
        <span>{'&#9733;'.repeat(0)}{review.rating}/5</span>
      </div>
      <p>{review.text}</p>
    </article>
  )
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <button className="toggle-row" type="button" onClick={onChange}>
      <span>{label}</span>
      <i className={classNames(checked && 'is-on')}>
        <b />
      </i>
    </button>
  )
}

function ProfileModal({ profile, onClose, onSave }) {
  const [draft, setDraft] = useState(profile)

  function updateDraft(key, value) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function updateList(key, value) {
    updateDraft(
      key,
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    )
  }

  return (
    <Modal title="Edit profile" onClose={onClose}>
      <div className="modal-profile-head">
        <Avatar name={draft.name} gradient={draft.avatarGradient} status="online" size="xl" />
        <div>
          <p className="eyebrow">Profile picture</p>
          <strong>Gradient avatar mockup</strong>
          <span>Real uploads can connect to storage later.</span>
        </div>
      </div>
      <div className="modal-grid">
        <Field label="Name">
          <input value={draft.name} onChange={(event) => updateDraft('name', event.target.value)} />
        </Field>
        <Field label="School">
          <input value={draft.school} onChange={(event) => updateDraft('school', event.target.value)} />
        </Field>
        <Field label="Headline">
          <input value={draft.headline} onChange={(event) => updateDraft('headline', event.target.value)} />
        </Field>
        <Field label="Skill level">
          <select value={draft.skillLevel} onChange={(event) => updateDraft('skillLevel', event.target.value)}>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </Field>
        <Field label="About me">
          <textarea value={draft.bio} onChange={(event) => updateDraft('bio', event.target.value)} />
        </Field>
        <Field label="Subjects">
          <input value={draft.subjects.join(', ')} onChange={(event) => updateList('subjects', event.target.value)} />
        </Field>
        <Field label="Learning goals">
          <input value={draft.goals.join(', ')} onChange={(event) => updateList('goals', event.target.value)} />
        </Field>
        <Field label="Availability">
          <input value={draft.availability.join(', ')} onChange={(event) => updateList('availability', event.target.value)} />
        </Field>
        <Field label="Preferred learning style">
          <input value={draft.learningStyle} onChange={(event) => updateDraft('learningStyle', event.target.value)} />
        </Field>
        <Field label="Languages">
          <input value={draft.languages.join(', ')} onChange={(event) => updateList('languages', event.target.value)} />
        </Field>
        <Field label="Study interests">
          <input value={draft.interests.join(', ')} onChange={(event) => updateList('interests', event.target.value)} />
        </Field>
      </div>
      <div className="modal-actions">
        <button className="secondary-button" type="button" onClick={onClose}>
          Cancel
        </button>
        <button className="primary-button" type="button" onClick={() => onSave(draft)}>
          Save profile
        </button>
      </div>
    </Modal>
  )
}

function CreateSessionModal({ profile, onClose, onCreate }) {
  const [form, setForm] = useState({
    subject: profile.subjects[0],
    topic: '',
    description: '',
    date: '2026-06-03',
    time: '18:00',
    duration: '60 min',
    mode: 'Online',
    location: 'Study Buddy video room',
    maxParticipants: 6,
  })
  const [error, setError] = useState('')

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function submit(event) {
    event.preventDefault()
    if (!form.subject || !form.topic || !form.date || !form.time) {
      setError('Subject, topic, date, and time are required.')
      return
    }
    onCreate({
      id: `s-${Date.now()}`,
      ...form,
      maxParticipants: Number(form.maxParticipants),
      participants: 1,
      organizer: profile.name,
      level: profile.skillLevel,
      rating: profile.rating,
      tags: [form.subject, form.mode, 'New'],
    })
  }

  return (
    <Modal title="Create study session" onClose={onClose}>
      <form className="modal-grid" onSubmit={submit}>
        <Field label="Subject">
          <input value={form.subject} onChange={(event) => updateForm('subject', event.target.value)} />
        </Field>
        <Field label="Topic">
          <input value={form.topic} onChange={(event) => updateForm('topic', event.target.value)} placeholder="Exam sprint, lab review..." />
        </Field>
        <Field label="Description">
          <textarea value={form.description} onChange={(event) => updateForm('description', event.target.value)} />
        </Field>
        <Field label="Date">
          <input type="date" value={form.date} onChange={(event) => updateForm('date', event.target.value)} />
        </Field>
        <Field label="Time">
          <input type="time" value={form.time} onChange={(event) => updateForm('time', event.target.value)} />
        </Field>
        <Field label="Duration">
          <select value={form.duration} onChange={(event) => updateForm('duration', event.target.value)}>
            <option>45 min</option>
            <option>60 min</option>
            <option>75 min</option>
            <option>90 min</option>
            <option>120 min</option>
          </select>
        </Field>
        <Field label="Online or physical">
          <select value={form.mode} onChange={(event) => updateForm('mode', event.target.value)}>
            <option>Online</option>
            <option>Physical</option>
          </select>
        </Field>
        <Field label="Location">
          <input value={form.location} onChange={(event) => updateForm('location', event.target.value)} />
        </Field>
        <Field label="Maximum participants">
          <input
            type="number"
            min="2"
            max="20"
            value={form.maxParticipants}
            onChange={(event) => updateForm('maxParticipants', event.target.value)}
          />
        </Field>
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions full">
          <button className="secondary-button" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button" type="submit">
            Publish session
          </button>
        </div>
      </form>
    </Modal>
  )
}

function BuddyModal({ buddy, onClose, onContact }) {
  return (
    <Modal title={buddy.name} onClose={onClose}>
      <div className="modal-profile-head">
        <Avatar name={buddy.name} gradient={buddy.avatarGradient} status={buddy.online ? 'online' : 'offline'} size="xl" />
        <div>
          <p className="eyebrow">{buddy.school}</p>
          <strong>{buddy.match}% match</strong>
          <span>{buddy.bio}</span>
        </div>
      </div>
      <div className="profile-detail-grid">
        <InfoBlock label="Subjects" value={buddy.subjects.join(', ')} />
        <InfoBlock label="Goals" value={buddy.goals.join(', ')} />
        <InfoBlock label="Availability" value={buddy.availability.join(', ')} />
        <InfoBlock label="Skill level" value={buddy.skillLevel} />
        <InfoBlock label="Learning style" value={buddy.learningStyle} />
        <InfoBlock label="Languages" value={buddy.languages.join(', ')} />
      </div>
      <div className="modal-actions">
        <button className="secondary-button" type="button" onClick={onClose}>
          Close
        </button>
        <button className="primary-button" type="button" onClick={onContact}>
          Contact
        </button>
      </div>
    </Modal>
  )
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card glass-card" role="dialog" aria-modal="true" aria-label={title}>
        <header>
          <h2>{title}</h2>
          <button className="icon-button" type="button" onClick={onClose}>
            Close
          </button>
        </header>
        {children}
      </section>
    </div>
  )
}

export default App
