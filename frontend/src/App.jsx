import React, { useState, useEffect } from 'react';
import { User, Vote, LogOut, Lock, CheckCircle, ShieldCheck, Trophy, UserCircle2 } from 'lucide-react';

const API_BASE = 'http://localhost:3000';

const PARTY_STYLES = {
  default: [
    { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-50', ring: 'ring-blue-500' },
    { bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-50', ring: 'ring-orange-500' },
    { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-50', ring: 'ring-green-500' },
    { bg: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-50', ring: 'ring-purple-500' },
    { bg: 'bg-pink-500', text: 'text-pink-700', light: 'bg-pink-50', ring: 'ring-pink-500' },
    { bg: 'bg-teal-500', text: 'text-teal-700', light: 'bg-teal-50', ring: 'ring-teal-500' },
  ],
};

function getInitials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
}

function getPartyStyle(index) {
  return PARTY_STYLES.default[index % PARTY_STYLES.default.length];
}

export default function VotingApp() {
  const [token, setToken] = useState('');
  const [page, setPage] = useState('login'); // login | signup | candidates | results | profile
  const [profile, setProfile] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const authHeader = () => ({ Authorization: `Bearer ${token}` });

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // ---- API calls ----
  const apiCall = async (path, options = {}) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Something went wrong');
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (tok) => {
    try {
      const data = await apiCall('/user/profile', {
        headers: { Authorization: `Bearer ${tok}` },
      });
      setProfile(data.user);
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  const fetchCandidates = async () => {
    try {
      const data = await apiCall('/candidate');
      setCandidates(data);
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  const fetchResults = async () => {
    try {
      const data = await apiCall('/candidate/vote/count');
      setResults(data);
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile(token);
      fetchCandidates();
      setPage('candidates');
    }
  }, [token]);

  useEffect(() => {
    if (page === 'results') fetchResults();
    if (page === 'candidates' && token) fetchCandidates();
  }, [page]);

  // ---- Auth forms ----
  const SignupForm = () => {
    const [form, setForm] = useState({
      name: '', age: '', address: '', aadharCardNumber: '', password: '',
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const data = await apiCall('/user/signup', {
          method: 'POST',
          body: JSON.stringify({ ...form, age: Number(form.age) }),
        });
        setToken(data.token);
        showMessage('Account created successfully!', 'success');
      } catch (err) {
        showMessage(err.message, 'error');
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Full name"
          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Age" type="number"
          value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required />
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Address"
          value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Aadhar card number (12 digits)"
          value={form.aadharCardNumber} onChange={(e) => setForm({ ...form, aadharCardNumber: e.target.value })} required />
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Password" type="password"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-2 text-sm font-medium transition">
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
    );
  };

  const LoginForm = () => {
    const [form, setForm] = useState({ aadharCardNumber: '', password: '' });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const data = await apiCall('/user/login', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        setToken(data.token);
        showMessage('Logged in successfully!', 'success');
      } catch (err) {
        showMessage(err.message, 'error');
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Aadhar card number"
          value={form.aadharCardNumber} onChange={(e) => setForm({ ...form, aadharCardNumber: e.target.value })} required />
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Password" type="password"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 text-sm font-medium transition">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    );
  };

  // ---- Candidates / Voting page ----
  const CandidatesPage = () => {
    const handleVote = async (id) => {
      try {
        const data = await apiCall(`/candidate/vote/${id}`, {
          method: 'GET',
          headers: authHeader(),
        });
        showMessage(data.message, 'success');
        fetchProfile(token);
        fetchCandidates();
      } catch (err) {
        showMessage(err.message, 'error');
      }
    };

    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Vote size={20} /> Candidates
        </h2>
        {candidates.length === 0 && (
          <p className="text-sm text-gray-500">No candidates available yet.</p>
        )}
        <div className="grid gap-3">
          {candidates.map((c, i) => {
            const style = getPartyStyle(i);
            return (
              <div key={c._id || i} className="flex items-center justify-between bg-white border rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${style.bg} text-white flex items-center justify-center font-bold text-sm`}>
                    {getInitials(c.party || c.name)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{c.name}</p>
                    <p className={`text-xs font-medium ${style.text}`}>{c.party}</p>
                  </div>
                </div>
                {profile?.role !== 'admin' && c._id && (
                  <button
                    onClick={() => handleVote(c._id)}
                    disabled={profile?.isVoted || loading}
                    className={`text-sm font-medium px-4 py-2 rounded-lg transition ${
                      profile?.isVoted
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : `${style.bg} text-white hover:opacity-90`
                    }`}
                  >
                    {profile?.isVoted ? 'Voted' : 'Vote'}
                  </button>
                )}
                {!c._id && (
                  <span className="text-xs text-gray-400">id hidden</span>
                )}
              </div>
            );
          })}
        </div>
        {profile?.isVoted && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-3 py-2 text-sm">
            <CheckCircle size={16} /> You've already cast your vote. Thank you!
          </div>
        )}
      </div>
    );
  };

  // ---- Results page ----
  const ResultsPage = () => {
    const maxCount = Math.max(...results.map((r) => r.count), 1);
    const sorted = [...results].sort((a, b) => b.count - a.count);

    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Trophy size={20} /> Live results
        </h2>
        <div className="space-y-2">
          {sorted.map((r, i) => {
            const style = getPartyStyle(candidates.findIndex((c) => c.party === r.party) >= 0
              ? candidates.findIndex((c) => c.party === r.party)
              : i);
            const pct = maxCount > 0 ? (r.count / maxCount) * 100 : 0;
            return (
              <div key={i} className="bg-white border rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full ${style.bg} text-white flex items-center justify-center text-xs font-bold`}>
                      {getInitials(r.party)}
                    </div>
                    <span className="font-medium text-gray-800 text-sm">{r.party}</span>
                  </div>
                  <span className="font-semibold text-gray-700 text-sm">{r.count} votes</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`${style.bg} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          {sorted.length === 0 && <p className="text-sm text-gray-500">No results yet.</p>}
        </div>
      </div>
    );
  };

  // ---- Profile page ----
  const ProfilePage = () => {
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });

    const handlePasswordChange = async (e) => {
      e.preventDefault();
      try {
        await apiCall('/user/profile/password', {
          method: 'PUT',
          headers: authHeader(),
          body: JSON.stringify(pwForm),
        });
        showMessage('Password updated successfully', 'success');
        setPwForm({ currentPassword: '', newPassword: '' });
      } catch (err) {
        showMessage(err.message, 'error');
      }
    };

    if (!profile) return <p className="text-sm text-gray-500">Loading profile...</p>;

    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <UserCircle2 size={20} /> Profile
        </h2>
        <div className="bg-white border rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">{profile.name}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Age</span><span className="font-medium">{profile.age}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Address</span><span className="font-medium">{profile.address}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Aadhar number</span><span className="font-medium">{profile.aadharCardNumber}</span></div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Role</span>
            <span className={`flex items-center gap-1 font-medium ${profile.role === 'admin' ? 'text-purple-700' : 'text-blue-700'}`}>
              {profile.role === 'admin' && <ShieldCheck size={14} />} {profile.role}
            </span>
          </div>
          <div className="flex justify-between"><span className="text-gray-500">Voted</span><span className="font-medium">{profile.isVoted ? 'Yes' : 'No'}</span></div>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
            <Lock size={16} /> Change password
          </h3>
          <form onSubmit={handlePasswordChange} className="space-y-2">
            <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Current password" type="password"
              value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
            <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="New password" type="password"
              value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} required />
            <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium transition">
              Update password
            </button>
          </form>
        </div>
      </div>
    );
  };

  const handleLogout = () => {
    setToken('');
    setProfile(null);
    setPage('login');
  };

  // ---- Render ----
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 via-white to-green-500 border mb-2">
            <Vote className="text-gray-700" size={26} />
          </div>
          <h1 className="text-xl font-bold text-gray-800">VoteSecure</h1>
          <p className="text-xs text-gray-500">Aadhar-verified online voting</p>
        </div>

        {message && (
          <div className={`mb-4 text-sm rounded-lg px-3 py-2 ${
            message.type === 'error' ? 'bg-red-50 text-red-700' :
            message.type === 'success' ? 'bg-green-50 text-green-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            {message.text}
          </div>
        )}

        {!token ? (
          <div className="bg-white border rounded-2xl shadow-sm p-6">
            <div className="flex mb-4 border rounded-lg overflow-hidden text-sm">
              <button
                className={`flex-1 py-2 font-medium ${page === 'login' ? 'bg-green-600 text-white' : 'bg-gray-50 text-gray-600'}`}
                onClick={() => setPage('login')}
              >
                Login
              </button>
              <button
                className={`flex-1 py-2 font-medium ${page === 'signup' ? 'bg-orange-500 text-white' : 'bg-gray-50 text-gray-600'}`}
                onClick={() => setPage('signup')}
              >
                Sign up
              </button>
            </div>
            {page === 'login' ? <LoginForm /> : <SignupForm />}
          </div>
        ) : (
          <div>
            <div className="bg-white border rounded-2xl shadow-sm p-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User size={18} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{profile?.name || '...'}</span>
                {profile?.role === 'admin' && (
                  <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck size={12} /> Admin
                  </span>
                )}
              </div>
              <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition">
                <LogOut size={18} />
              </button>
            </div>

            <div className="flex mb-4 bg-white border rounded-lg overflow-hidden text-sm">
              {['candidates', 'results', 'profile'].map((p) => (
                <button
                  key={p}
                  className={`flex-1 py-2 font-medium capitalize ${page === p ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="bg-gray-50">
              {page === 'candidates' && <CandidatesPage />}
              {page === 'results' && <ResultsPage />}
              {page === 'profile' && <ProfilePage />}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          Connects to backend at {API_BASE}
        </p>
      </div>
    </div>
  );
}
