import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, Phone, User, Home, Bike, Settings, LogOut, Cloud, FileText, Bell, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function MotoLogBDApp() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
    bikeName: '',
    bikeModel: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpData, setOtpData] = useState(null);
  const [otpTimer, setOtpTimer] = useState(0);
  const [selectedBike, setSelectedBike] = useState(null);

  // Load users from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('motolog_users');
    if (saved) {
      setUsers(JSON.parse(saved));
    }
    const savedUser = localStorage.getItem('motolog_current_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setCurrentScreen('dashboard');
    }
  }, []);

  // OTP Timer
  useEffect(() => {
    let timer;
    if (otpTimer > 0) {
      timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpTimer]);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^(\+880|0)[1-9]\d{9}$/.test(phone.replace(/\s/g, ''));
  };

  const validatePassword = (password) => {
    if (password.length < 8) return 'কমপক্ষে ৮ ক্যারেক্টার হতে হবে';
    if (!/[A-Z]/.test(password)) return 'কমপক্ষে একটি বড় হাতের অক্ষর প্রয়োজন';
    if (!/[a-z]/.test(password)) return 'কমপক্ষে একটি ছোট হাতের অক্ষর প্রয়োজন';
    if (!/[0-9]/.test(password)) return 'কমপক্ষে একটি সংখ্যা প্রয়োজন';
    if (!/[!@#$%^&*]/.test(password)) return 'কমপক্ষে একটি বিশেষ চিহ্ন প্রয়োজন (!@#$%^&*)';
    return null;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSignUp = async () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'নাম প্রয়োজন';
    else if (formData.name.length < 3) newErrors.name = 'নাম কমপক্ষে ৩ ক্যারেক্টার হতে হবে';
    
    if (!formData.phone) newErrors.phone = 'মোবাইল নম্বর প্রয়োজন';
    else if (!validatePhone(formData.phone)) newErrors.phone = 'বৈধ মোবাইল নম্বর নয়';
    else if (users.some(u => u.phone === formData.phone)) newErrors.phone = 'এই নম্বর ইতিমধ্যে ব্যবহৃত';
    
    if (!formData.email) newErrors.email = 'ইমেইল প্রয়োজন';
    else if (!validateEmail(formData.email)) newErrors.email = 'বৈধ ইমেইল নয়';
    else if (users.some(u => u.email === formData.email)) newErrors.email = 'এই ইমেইল ইতিমধ্যে ব্যবহৃত';
    
    const passError = validatePassword(formData.password);
    if (passError) newErrors.password = passError;
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'পাসওয়ার্ড মেলে না';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpData({
        phone: formData.phone,
        otp: generatedOtp,
        attempts: 0
      });
      setOtpTimer(30);
      setSuccess(`OTP পাঠানো হয়েছে: ${generatedOtp}`);
      setCurrentScreen('otp');
      setLoading(false);
    }, 1500);
  };

  const handleVerifyOtp = () => {
    if (!formData.otp) {
      setErrors({ otp: '6-digit OTP প্রয়োজন' });
      return;
    }

    if (formData.otp !== otpData.otp) {
      const newAttempts = otpData.attempts + 1;
      if (newAttempts >= 3) {
        setErrors({ otp: 'সর্বোচ্চ প্রচেষ্টা শেষ। আবার চেষ্টা করুন' });
        setCurrentScreen('signup');
      } else {
        setErrors({ otp: `ভুল OTP। ${3 - newAttempts} প্রচেষ্টা বাকি` });
        setOtpData(prev => ({ ...prev, attempts: newAttempts }));
      }
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newUser = {
        id: Date.now(),
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password, // ⚠️ Demo only - never store plaintext!
        bikes: [],
        createdAt: new Date().toLocaleString('bn-BD'),
        avatar: '👤'
      };

      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      localStorage.setItem('motolog_users', JSON.stringify(updatedUsers));
      
      setCurrentUser(newUser);
      localStorage.setItem('motolog_current_user', JSON.stringify(newUser));
      
      setSuccess('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!');
      setFormData({ name: '', phone: '', email: '', password: '', confirmPassword: '', otp: '' });
      setErrors({});
      setLoading(false);
      
      setTimeout(() => {
        setSuccess('');
        setCurrentScreen('dashboard');
      }, 1000);
    }, 1500);
  };

  const handleLogin = () => {
    const newErrors = {};

    if (!formData.phone) newErrors.phone = 'মোবাইল নম্বর বা ইমেইল প্রয়োজন';
    if (!formData.password) newErrors.password = 'পাসওয়ার্ড প্রয়োজন';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const user = users.find(u => 
        (u.phone === formData.phone || u.email === formData.phone) && 
        u.password === formData.password
      );

      if (!user) {
        setErrors({ login: 'ভুল মোবাইল নম্বর বা পাসওয়ার্ড' });
        setLoading(false);
        return;
      }

      setCurrentUser(user);
      localStorage.setItem('motolog_current_user', JSON.stringify(user));
      setSuccess('সফলভাবে লগইন হয়েছেন!');
      setFormData({ name: '', phone: '', email: '', password: '', confirmPassword: '', otp: '' });
      setErrors({});
      
      setTimeout(() => {
        setSuccess('');
        setCurrentScreen('dashboard');
        setLoading(false);
      }, 1000);
    }, 1500);
  };

  const handleAddBike = () => {
    if (!formData.bikeName) {
      setErrors({ bikeName: 'বাইক নাম প্রয়োজন' });
      return;
    }

    const newBike = {
      id: Date.now(),
      name: formData.bikeName,
      model: formData.bikeModel,
      avatar: '🏍️',
      mileage: '42.5 km/l',
      fuel: 0,
      totalCost: 0
    };

    const updatedUser = {
      ...currentUser,
      bikes: [...currentUser.bikes, newBike]
    };

    setCurrentUser(updatedUser);
    localStorage.setItem('motolog_current_user', JSON.stringify(updatedUser));

    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    localStorage.setItem('motolog_users', JSON.stringify(updatedUsers));

    setSuccess('বাইক যোগ করা হয়েছে!');
    setFormData({ ...formData, bikeName: '', bikeModel: '' });
    setErrors({});

    setTimeout(() => setSuccess(''), 2000);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('motolog_current_user');
    setFormData({ name: '', phone: '', email: '', password: '', confirmPassword: '', otp: '' });
    setErrors({});
    setSuccess('');
    setCurrentScreen('welcome');
  };

  const handleResendOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpData(prev => ({ ...prev, otp: newOtp }));
    setFormData(prev => ({ ...prev, otp: '' }));
    setOtpTimer(30);
    setSuccess(`নতুন OTP পাঠানো হয়েছে: ${newOtp}`);
    setTimeout(() => setSuccess(''), 3000);
  };

  // Welcome Screen
  const WelcomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-4xl">🏍️</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">MotoLog <span className="text-green-400">BD</span></h1>
        <p className="text-gray-400 text-lg mb-2">আপনার মোটরবাইক, আপনার লগবুক</p>
        <p className="text-gray-500">সবকিছু এক জায়গায়</p>
      </div>

      <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-2xl p-8 max-w-sm w-full mb-6">
        <p className="text-gray-300 text-center mb-8">আপনার রাইডের প্রতিটি মুহূর্ত ট্র্যাক করুন</p>
        
        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-3 p-3 bg-gray-700 bg-opacity-50 rounded-lg">
            <span className="text-green-400">⛽</span>
            <span className="text-gray-300">Fuel Log ট্র্যাকিং</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-700 bg-opacity-50 rounded-lg">
            <span className="text-green-400">🔧</span>
            <span className="text-gray-300">Service ম্যানেজমেন্ট</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-700 bg-opacity-50 rounded-lg">
            <span className="text-green-400">💰</span>
            <span className="text-gray-300">Expense রিপোর্ট</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => { setCurrentScreen('login'); setErrors({}); setFormData({ name: '', phone: '', email: '', password: '', confirmPassword: '', otp: '' }); }}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg mb-3 transition transform hover:scale-105 active:scale-95"
      >
        Login করুন
      </button>
      <button
        onClick={() => { setCurrentScreen('signup'); setErrors({}); setFormData({ name: '', phone: '', email: '', password: '', confirmPassword: '', otp: '' }); }}
        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition border border-gray-600"
      >
        একাউন্ট তৈরি করুন
      </button>

      <div className="mt-8 p-4 bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 rounded-lg max-w-sm w-full">
        <p className="text-green-300 text-sm text-center">
          ডেমো অ্যাকাউন্ট: phone: +880171234567, password: Demo@123
        </p>
      </div>

      <p className="text-gray-600 text-xs mt-6">design by mijaN_ahmed</p>
    </div>
  );

  // Login Screen
  const LoginScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black flex flex-col items-center justify-center px-4 py-6">
      <div className="max-w-sm w-full">
        <button
          onClick={() => setCurrentScreen('welcome')}
          className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
        >
          ← ফিরে যান
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">স্বাগতম!</h1>
          <p className="text-gray-400">আপনার অ্যাকাউন্টে লগইন করুন</p>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-500 bg-opacity-20 border border-green-500 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} className="text-green-400" />
            <p className="text-green-300 text-sm">{success}</p>
          </div>
        )}

        {errors.login && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} className="text-red-400" />
            <p className="text-red-300 text-sm">{errors.login}</p>
          </div>
        )}

        <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-2xl p-6 mb-6">
          <div className="mb-5">
            <label className="block text-gray-300 text-sm font-medium mb-2">মোবাইল নম্বর বা ইমেইল</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+880 17X XXXX XXXX"
              className={`w-full bg-gray-700 bg-opacity-50 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-20 transition ${
                errors.phone ? 'border-red-500' : 'border-gray-600 focus:border-green-500'
              }`}
            />
            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-2">পাসওয়ার্ড</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={`w-full bg-gray-700 bg-opacity-50 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-20 transition ${
                  errors.password ? 'border-red-500' : 'border-gray-600 focus:border-green-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-500 disabled:to-gray-500 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={20} className="animate-spin" />
                লোডিং...
              </>
            ) : (
              'Login করুন'
            )}
          </button>
        </div>

        <div className="text-center">
          <span className="text-gray-400">নতুন ইউজার? </span>
          <button
            onClick={() => { setCurrentScreen('signup'); setErrors({}); setFormData({ name: '', phone: '', email: '', password: '', confirmPassword: '', otp: '' }); }}
            className="text-green-400 hover:text-green-300 font-semibold"
          >
            একাউন্ট তৈরি করুন
          </button>
        </div>
      </div>
    </div>
  );

  // Sign Up Screen
  const SignUpScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black flex flex-col items-center justify-center px-4 py-6 overflow-y-auto">
      <div className="max-w-sm w-full">
        <button
          onClick={() => setCurrentScreen('welcome')}
          className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
        >
          ← ফিরে যান
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">নতুন অ্যাকাউন্ট</h1>
          <p className="text-gray-400">MotoLog BD-তে যোগ দিন</p>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-500 bg-opacity-20 border border-green-500 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} className="text-green-400" />
            <p className="text-green-300 text-sm">{success}</p>
          </div>
        )}

        <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-2xl p-6 mb-6">
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2">পুরো নাম</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="আপনার নাম"
              className={`w-full bg-gray-700 bg-opacity-50 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-20 transition ${
                errors.name ? 'border-red-500' : 'border-gray-600 focus:border-green-500'
              }`}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2">মোবাইল নম্বর</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+880 17X XXXX XXXX"
              className={`w-full bg-gray-700 bg-opacity-50 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-20 transition ${
                errors.phone ? 'border-red-500' : 'border-gray-600 focus:border-green-500'
              }`}
            />
            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2">ইমেইল</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="example@email.com"
              className={`w-full bg-gray-700 bg-opacity-50 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-20 transition ${
                errors.email ? 'border-red-500' : 'border-gray-600 focus:border-green-500'
              }`}
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2">পাসওয়ার্ড</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="কমপক্ষে ৮ ক্যারেক্টার"
                className={`w-full bg-gray-700 bg-opacity-50 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-20 transition ${
                  errors.password ? 'border-red-500' : 'border-gray-600 focus:border-green-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-2">পাসওয়ার্ড নিশ্চিত করুন</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="একই পাসওয়ার্ড"
              className={`w-full bg-gray-700 bg-opacity-50 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-20 transition ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-600 focus:border-green-500'
              }`}
            />
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            onClick={handleSignUp}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-500 disabled:to-gray-500 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={20} className="animate-spin" />
                প্রসেসিং...
              </>
            ) : (
              'একাউন্ট তৈরি করুন'
            )}
          </button>
        </div>

        <div className="text-center">
          <span className="text-gray-400">ইতিমধ্যে অ্যাকাউন্ট আছে? </span>
          <button
            onClick={() => { setCurrentScreen('login'); setErrors({}); setFormData({ name: '', phone: '', email: '', password: '', confirmPassword: '', otp: '' }); }}
            className="text-green-400 hover:text-green-300 font-semibold"
          >
            Login করুন
          </button>
        </div>
      </div>
    </div>
  );

  // OTP Screen
  const OTPScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black flex flex-col items-center justify-center px-4 py-6">
      <div className="max-w-sm w-full">
        <button
          onClick={() => setCurrentScreen('signup')}
          className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
        >
          ← ফিরে যান
        </button>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">OTP নিশ্চিতকরণ</h1>
          <p className="text-gray-400">আমরা একটি OTP পাঠিয়েছি</p>
          <p className="text-green-400 font-medium mt-2">{otpData?.phone}</p>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-500 bg-opacity-20 border border-green-500 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} className="text-green-400" />
            <p className="text-green-300 text-sm">{success}</p>
          </div>
        )}

        {errors.otp && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} className="text-red-400" />
            <p className="text-red-300 text-sm">{errors.otp}</p>
          </div>
        )}

        <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-2xl p-6 mb-6">
          <label className="block text-gray-300 text-sm font-medium mb-4">6-digit OTP লিখুন</label>
          <input
            type="text"
            name="otp"
            value={formData.otp}
            onChange={handleInputChange}
            placeholder="000000"
            maxLength="6"
            className={`w-full bg-gray-700 bg-opacity-50 border rounded-lg px-4 py-4 text-white text-center text-2xl tracking-widest placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-20 transition ${
              errors.otp ? 'border-red-500' : 'border-gray-600 focus:border-green-500'
            }`}
          />

          <div className="mt-6 flex items-center justify-between">
            <span className="text-gray-400 text-sm">OTP পাননি?</span>
            <button
              onClick={handleResendOtp}
              disabled={otpTimer > 0}
              className="text-green-400 hover:text-green-300 text-sm font-medium disabled:text-gray-500"
            >
              Resend ({otpTimer > 0 ? otpTimer : 'এখন'})
            </button>
          </div>

          <button
            onClick={handleVerifyOtp}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-500 disabled:to-gray-500 text-white font-semibold py-3 rounded-lg mt-8 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={20} className="animate-spin" />
                ভেরিফাই হচ্ছে...
              </>
            ) : (
              'নিশ্চিত করুন'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Dashboard/Profile Screen
  const DashboardScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black pb-20">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="bg-gray-800 bg-opacity-50 border-b border-gray-700 p-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-white font-bold text-lg">Profile</h1>
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 text-sm font-medium"
          >
            Logout
          </button>
        </div>

        {success && (
          <div className="m-4 p-3 bg-green-500 bg-opacity-20 border border-green-500 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} className="text-green-400" />
            <p className="text-green-300 text-sm">{success}</p>
          </div>
        )}

        {/* Profile Info */}
        <div className="p-4 border-b border-gray-700">
          <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-2xl p-4 flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-3xl">
              👤
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">{currentUser?.name}</h2>
              <p className="text-gray-400 text-sm">{currentUser?.phone}</p>
              <p className="text-gray-500 text-sm">{currentUser?.email}</p>
            </div>
          </div>
        </div>

        {/* My Bikes */}
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Bike size={20} className="text-green-400" />
            আমার বাইক
          </h3>
          
          <div className="space-y-2 mb-4">
            {currentUser?.bikes?.length > 0 ? (
              currentUser.bikes.map((bike) => (
                <div
                  key={bike.id}
                  className="p-3 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700 hover:border-green-500 transition flex items-center gap-3"
                >
                  <span className="text-2xl">{bike.avatar}</span>
                  <div className="text-left flex-1">
                    <p className="text-white font-medium">{bike.name}</p>
                    <p className="text-gray-400 text-xs">{bike.mileage}</p>
                  </div>
                  <span className="text-green-400">✓</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">এখনও কোনো বাইক যোগ করা হয়নি</p>
            )}
          </div>

          {/* Add Bike Form */}
          <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-xl p-4">
            <h4 className="text-white font-semibold text-sm mb-3">নতুন বাইক যোগ করুন</h4>
            <div className="space-y-3">
              <input
                type="text"
                name="bikeName"
                value={formData.bikeName}
                onChange={handleInputChange}
                placeholder="বাইক নাম (যেমন: Yamaha R15)"
                className={`w-full bg-gray-700 bg-opacity-50 border rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-20 text-sm ${
                  errors.bikeName ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              <input
                type="text"
                name="bikeModel"
                value={formData.bikeModel}
                onChange={handleInputChange}
                placeholder="মডেল (ঐচ্ছিক)"
                className="w-full bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-20 text-sm"
              />
              <button
                onClick={handleAddBike}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 rounded-lg transition text-sm"
              >
                + যোগ করুন
              </button>
              {errors.bikeName && <p className="text-red-400 text-xs">{errors.bikeName}</p>}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Settings size={20} className="text-green-400" />
            সেটিংস
          </h3>
          <div className="space-y-2">
            <button className="w-full p-3 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700 hover:border-gray-600 text-left transition">
              <span className="text-gray-300 font-medium text-sm">পাসওয়ার্ড পরিবর্তন করুন</span>
              <p className="text-gray-500 text-xs">আপনার অ্যাকাউন্ট সুরক্ষিত রাখুন</p>
            </button>
            <button className="w-full p-3 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700 hover:border-gray-600 text-left transition">
              <span className="text-gray-300 font-medium text-sm">বিজ্ঞপ্তি সেটিংস</span>
              <p className="text-gray-500 text-xs">আপনার পছন্দ অনুযায়ী</p>
            </button>
          </div>
        </div>

        {/* Backup & Data */}
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Cloud size={20} className="text-green-400" />
            ক্লাউড ও ডেটা
          </h3>
          <div className="space-y-2">
            <button className="w-full p-3 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700 hover:border-gray-600 text-left transition flex items-center justify-between">
              <span>
                <p className="text-gray-300 font-medium text-sm">Cloud Backup</p>
                <p className="text-gray-500 text-xs">শেষ ব্যাকআপ: এখন</p>
              </span>
              <span className="text-green-400">✓</span>
            </button>
          </div>
        </div>

        {/* Account Info */}
        <div className="p-4">
          <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm mb-2">অ্যাকাউন্ট তৈরি:</p>
            <p className="text-gray-300 text-sm">{currentUser?.createdAt}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="font-sans bg-black min-h-screen">
      {!currentUser && currentScreen === 'welcome' && <WelcomeScreen />}
      {!currentUser && currentScreen === 'login' && <LoginScreen />}
      {!currentUser && currentScreen === 'signup' && <SignUpScreen />}
      {!currentUser && currentScreen === 'otp' && <OTPScreen />}
      {currentUser && <DashboardScreen />}
    </div>
  );
}