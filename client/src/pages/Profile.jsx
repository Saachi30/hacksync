// // import { useState, useEffect } from 'react';
// // import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, } from 'recharts';
// // import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
// // import { Heart, Sun, Moon, Coffee, Activity, Smile, Book, Award, TrendingUp, Calendar, User, PenTool, Settings, Star } from 'lucide-react';
// // // Theme colors
// // const theme = {
// //     primary: '#B5838D',
// //     secondary: '#E5989B',
// //     tertiary: '#FFB4A2',
// //     background: '#FFCDB2',
// //     text: '#6D6875',
// //     white: '#FFFFFF',
// //     success: '#97B6A5',
// //     warning: '#E6B89C',
// //     error: '#E5989B',
// //     pastels: ['#FFB4A2', '#E5989B', '#B5838D', '#FFCDB2', '#97B6A5']
// //   };
  

// //   const Profile = () => {
// //     const [profile, setProfile] = useState({
// //       name: '',
// //       age: '',
// //       height: '',
// //       weight: '',
// //       goals: '',
// //       activityLevel: 'moderate',
// //       preferences: {
// //         notifications: true,
// //         dailyReminders: true,
// //         weeklyReports: true
// //       }
// //     });
  
// //     useEffect(() => {
// //       const savedProfile = localStorage.getItem('userProfile');
// //       if (savedProfile) {
// //         setProfile(JSON.parse(savedProfile));
// //       }
// //     }, []);
  
// //     const handleSubmit = (e) => {
// //       e.preventDefault();
// //       localStorage.setItem('userProfile', JSON.stringify(profile));
      
// //       // Show success message
// //       const message = document.createElement('div');
// //       message.className = 'fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg';
// //       message.style.color = theme.success;
// //       message.innerHTML = '✨ Profile updated successfully!';
// //       document.body.appendChild(message);
// //       setTimeout(() => message.remove(), 3000);
// //     };
  
// //     const inputClass = `
// //       mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3
// //       focus:border-none focus:ring-2 focus:ring-offset-2
// //       transition-all duration-200
// //     `;
  
// //     return (
// //       <div className="max-w-2xl mx-auto p-8">
// //         <div className="flex items-center space-x-4 mb-8">
// //           <div 
// //             className="w-16 h-16 rounded-full flex items-center justify-center"
// //             style={{ backgroundColor: theme.background }}
// //           >
// //             <User size={32} color={theme.primary} />
// //           </div>
// //           <div>
// //             <h1 className="text-4xl font-bold" style={{ color: theme.primary }}>
// //               Your Profile
// //             </h1>
// //             <p style={{ color: theme.text }}>Keep your information up to date</p>
// //           </div>
// //         </div>
        
// //         <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md">
// //           <div className="space-y-6">
// //             {[
// //               { label: 'Name', key: 'name', type: 'text', icon: User },
// //               { label: 'Age', key: 'age', type: 'number', icon: Calendar },
// //               { label: 'Height (cm)', key: 'height', type: 'number', icon: TrendingUp },
// //               { label: 'Weight (kg)', key: 'weight', type: 'number', icon: Activity }
// //             ].map(({ label, key, type, icon: Icon }) => (
// //               <div key={key}>
// //                 <label className="flex items-center text-sm font-medium" style={{ color: theme.text }}>
// //                   <Icon size={16} className="mr-2" />
// //                   {label}
// //                 </label>
// //                 <input
// //                   type={type}
// //                   value={profile[key]}
// //                   onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
// //                   className={inputClass}
// //                   style={{ backgroundColor: theme.background }}
// //                 />
// //               </div>
// //             ))}
            
// //             <div>
// //               <label className="flex items-center text-sm font-medium" style={{ color: theme.text }}>
// //                 <Activity size={16} className="mr-2" />
// //                 Activity Level
// //               </label>
// //               <select
// //                 value={profile.activityLevel}
// //                 onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value })}
// //                 className={inputClass}
// //                 style={{ backgroundColor: theme.background }}
// //               >
// //                 {['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'].map(level => (
// //                   <option key={level.toLowerCase()} value={level.toLowerCase()}>
// //                     {level}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>
            
// //             <div>
// //               <label className="flex items-center text-sm font-medium" style={{ color: theme.text }}>
// //                 <Star size={16} className="mr-2" />
// //                 Wellness Goals
// //               </label>
// //               <textarea
// //                 value={profile.goals}
// //                 onChange={(e) => setProfile({ ...profile, goals: e.target.value })}
// //                 rows="4"
// //                 className={inputClass}
// //                 style={{ backgroundColor: theme.background }}
// //                 placeholder="What are your wellness goals?"
// //               />
// //             </div>
  
// //             {/* Preferences Section */}
// //             <div className="border-t pt-6 mt-6">
// //               <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text }}>
// //                 Preferences
// //               </h3>
// //               {Object.entries(profile.preferences).map(([key, value]) => (
// //                 <div key={key} className="flex items-center justify-between py-2">
// //                   <label className="flex items-center text-sm" style={{ color: theme.text }}>
// //                     <Settings size={16} className="mr-2" />
// //                     {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
// //                   </label>
// //                   <input
// //                     type="checkbox"
// //                     checked={value}
// //                     onChange={(e) => 
// //                       setProfile({
// //                         ...profile,
// //                         preferences: {
// //                           ...profile.preferences,
// //                           [key]: e.target.checked
// //                         }
// //                       })
// //                     }
// //                     className="w-5 h-5 rounded"
// //                     style={{ accentColor: theme.primary }}
// //                   />
// //                 </div>
// //               ))}
// //             </div>
            
// //             <button
// //               type="submit"
// //               className="w-full py-3 px-4 rounded-lg text-white font-medium
// //                        transition-all duration-200 hover:opacity-90 flex items-center justify-center"
// //               style={{ backgroundColor: theme.primary }}
// //             >
// //               <Award size={20} className="mr-2" />
// //               Save Profile
// //             </button>
// //           </div>
// //         </form>
// //       </div>
// //     );
// //   };

// //   export default Profile;


// import { useState, useEffect } from 'react';
// import { Activity, Award, Calendar, Edit2, User, TrendingUp, Settings, Star, Check, Bell, FileText } from 'lucide-react';
// import { Card, CardContent } from '@/components/ui/card';

// // Updated theme with more soothing orange tones
// const theme = {
//   primary: '#FF7D50',    // Bright orange
//   secondary: '#FFA07A',  // Light salmon
//   tertiary: '#FFB88C',   // Peach
//   background: '#FFF3E0', // Soft cream
//   text: '#4A4A4A',       // Dark gray
//   white: '#FFFFFF',
//   success: '#8BC34A',
//   warning: '#FFB74D',
//   error: '#FF5252',
//   accent: '#FF9800'      // Deep orange
// };

// const Profile = () => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [profile, setProfile] = useState({
//     name: '',
//     age: '',
//     height: '',
//     weight: '',
//     goals: '',
//     activityLevel: 'moderate',
//     preferences: {
//       notifications: true,
//       dailyReminders: true,
//       weeklyReports: true
//     }
//   });

//   useEffect(() => {
//     const savedProfile = localStorage.getItem('userProfile');
//     if (savedProfile) {
//       setProfile(JSON.parse(savedProfile));
//     }
//   }, []);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     localStorage.setItem('userProfile', JSON.stringify(profile));
//     setIsEditing(false);
    
//     const message = document.createElement('div');
//     message.className = 'fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 flex items-center';
//     message.style.backgroundColor = theme.success;
//     message.style.color = theme.white;
//     message.innerHTML = '<span class="flex items-center">✨ Profile updated successfully!</span>';
//     document.body.appendChild(message);
//     setTimeout(() => message.remove(), 3000);
//   };

//   const ProfileView = () => (
//     <div className="space-y-8">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-4">
//           <div 
//             className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
//             style={{ backgroundColor: theme.secondary }}
//           >
//             <User size={48} color={theme.white} />
//           </div>
//           <div>
//             <h2 className="text-3xl font-bold" style={{ color: theme.primary }}>
//               {profile.name || 'Your Name'}
//             </h2>
//             <p className="text-lg" style={{ color: theme.text }}>
//               {profile.age ? `${profile.age} years old` : 'Age not set'}
//             </p>
//           </div>
//         </div>
//         <button
//           onClick={() => setIsEditing(true)}
//           className="flex items-center px-4 py-2 rounded-lg text-white transition-all duration-200 hover:opacity-90"
//           style={{ backgroundColor: theme.accent }}
//         >
//           <Edit2 size={18} className="mr-2" />
//           Edit Profile
//         </button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <Card className="shadow-lg">
//           <CardContent className="p-6">
//             <h3 className="text-xl font-semibold mb-4" style={{ color: theme.primary }}>
//               Physical Stats
//             </h3>
//             <div className="space-y-4">
//               <div className="flex items-center">
//                 <TrendingUp size={20} className="mr-3" style={{ color: theme.accent }} />
//                 <span className="text-lg" style={{ color: theme.text }}>
//                   Height: {profile.height ? `${profile.height} cm` : 'Not set'}
//                 </span>
//               </div>
//               <div className="flex items-center">
//                 <Activity size={20} className="mr-3" style={{ color: theme.accent }} />
//                 <span className="text-lg" style={{ color: theme.text }}>
//                   Weight: {profile.weight ? `${profile.weight} kg` : 'Not set'}
//                 </span>
//               </div>
//               <div className="flex items-center">
//                 <Star size={20} className="mr-3" style={{ color: theme.accent }} />
//                 <span className="text-lg" style={{ color: theme.text }}>
//                   Activity Level: {profile.activityLevel.charAt(0).toUpperCase() + profile.activityLevel.slice(1)}
//                 </span>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="shadow-lg">
//           <CardContent className="p-6">
//             <h3 className="text-xl font-semibold mb-4" style={{ color: theme.primary }}>
//               Wellness Goals
//             </h3>
//             <p className="text-lg" style={{ color: theme.text }}>
//               {profile.goals || 'No goals set yet'}
//             </p>
//           </CardContent>
//         </Card>

//         <Card className="shadow-lg md:col-span-2">
//           <CardContent className="p-6">
//             <h3 className="text-xl font-semibold mb-4" style={{ color: theme.primary }}>
//               Preferences
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               {Object.entries(profile.preferences).map(([key, value]) => (
//                 <div key={key} className="flex items-center space-x-3">
//                   {key === 'notifications' && <Bell size={20} style={{ color: theme.accent }} />}
//                   {key === 'dailyReminders' && <Calendar size={20} style={{ color: theme.accent }} />}
//                   {key === 'weeklyReports' && <FileText size={20} style={{ color: theme.accent }} />}
//                   <span className="text-lg" style={{ color: theme.text }}>
//                     {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
//                   </span>
//                   <Check 
//                     size={20} 
//                     style={{ color: value ? theme.success : theme.error }}
//                   />
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );

//   const inputClass = `
//     mt-1 block w-full rounded-lg border-2 border-gray-200 px-4 py-3
//     focus:border-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400
//     transition-all duration-200
//   `;

//   const EditForm = () => (
//     <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg">
//       <div className="space-y-6">
//         {[
//           { label: 'Name', key: 'name', type: 'text', icon: User },
//           { label: 'Age', key: 'age', type: 'number', icon: Calendar },
//           { label: 'Height (cm)', key: 'height', type: 'number', icon: TrendingUp },
//           { label: 'Weight (kg)', key: 'weight', type: 'number', icon: Activity }
//         ].map(({ label, key, type, icon: Icon }) => (
//           <div key={key}>
//             <label className="flex items-center text-sm font-medium" style={{ color: theme.text }}>
//               <Icon size={16} className="mr-2" style={{ color: theme.accent }} />
//               {label}
//             </label>
//             <input
//               type={type}
//               value={profile[key]}
//               onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
//               className={inputClass}
//               style={{ backgroundColor: theme.background }}
//             />
//           </div>
//         ))}
        
//         <div>
//           <label className="flex items-center text-sm font-medium" style={{ color: theme.text }}>
//             <Activity size={16} className="mr-2" style={{ color: theme.accent }} />
//             Activity Level
//           </label>
//           <select
//             value={profile.activityLevel}
//             onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value })}
//             className={inputClass}
//             style={{ backgroundColor: theme.background }}
//           >
//             {['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'].map(level => (
//               <option key={level.toLowerCase()} value={level.toLowerCase()}>
//                 {level}
//               </option>
//             ))}
//           </select>
//         </div>
        
//         <div>
//           <label className="flex items-center text-sm font-medium" style={{ color: theme.text }}>
//             <Star size={16} className="mr-2" style={{ color: theme.accent }} />
//             Wellness Goals
//           </label>
//           <textarea
//             value={profile.goals}
//             onChange={(e) => setProfile({ ...profile, goals: e.target.value })}
//             rows="4"
//             className={inputClass}
//             style={{ backgroundColor: theme.background }}
//             placeholder="What are your wellness goals?"
//           />
//         </div>

//         <div className="border-t pt-6 mt-6">
//           <h3 className="text-lg font-semibold mb-4" style={{ color: theme.primary }}>
//             Preferences
//           </h3>
//           {Object.entries(profile.preferences).map(([key, value]) => (
//             <div key={key} className="flex items-center justify-between py-2">
//               <label className="flex items-center text-sm" style={{ color: theme.text }}>
//                 <Settings size={16} className="mr-2" style={{ color: theme.accent }} />
//                 {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
//               </label>
//               <input
//                 type="checkbox"
//                 checked={value}
//                 onChange={(e) => 
//                   setProfile({
//                     ...profile,
//                     preferences: {
//                       ...profile.preferences,
//                       [key]: e.target.checked
//                     }
//                   })
//                 }
//                 className="w-5 h-5 rounded"
//                 style={{ accentColor: theme.primary }}
//               />
//             </div>
//           ))}
//         </div>
        
//         <div className="flex space-x-4">
//           <button
//             type="submit"
//             className="flex-1 py-3 px-4 rounded-lg text-white font-medium
//                      transition-all duration-200 hover:opacity-90 flex items-center justify-center"
//             style={{ backgroundColor: theme.primary }}
//           >
//             <Check size={20} className="mr-2" />
//             Save Changes
//           </button>
//           <button
//             type="button"
//             onClick={() => setIsEditing(false)}
//             className="flex-1 py-3 px-4 rounded-lg font-medium
//                      transition-all duration-200 hover:opacity-90 flex items-center justify-center"
//             style={{ backgroundColor: theme.background, color: theme.primary }}
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </form>
//   );

//   return (
//     <div className="max-w-4xl mx-auto p-8">
//       <div className="mb-8">
//         <h1 className="text-4xl font-bold" style={{ color: theme.primary }}>
//           {isEditing ? 'Edit Profile' : 'Profile'}
//         </h1>
//         <p style={{ color: theme.text }}>
//           {isEditing ? 'Update your information' : 'Your wellness journey starts here'}
//         </p>
//       </div>
      
//       {isEditing ? <EditForm /> : <ProfileView />}
//     </div>
//   );
// };

// export default Profile;
import { useState, useEffect } from 'react';
import { Heart, Activity, Smile, Calendar, User, Star, Settings, Edit2, Save, X } from 'lucide-react';

// Updated theme with calming colors
const theme = {
  primary: '#7C3AED',  // Deep purple
  secondary: '#A78BFA', // Lighter purple
  accent: '#C4B5FD',   // Very light purple
  background: '#F5F3FF', // Lightest purple
  success: '#34D399',   // Mint green
  text: '#4B5563',     // Slate gray
  lightText: '#6B7280', // Light gray
  white: '#FFFFFF'
};

const ProfileCard = ({ label, value, icon: Icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center mb-2">
      <Icon size={20} className="mr-2" style={{ color: theme.primary }} />
      <h3 className="text-sm font-medium" style={{ color: theme.lightText }}>{label}</h3>
    </div>
    <p className="text-lg font-semibold" style={{ color: theme.text }}>{value || 'Not set'}</p>
  </div>
);

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    goals: '',
    activityLevel: 'moderate',
    preferences: {
      notifications: true,
      dailyReminders: true,
      weeklyReports: true
    }
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('userProfile', JSON.stringify(profile));
    setIsEditing(false);
    
    const message = document.createElement('div');
    message.className = 'fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg transform translate-y-0 opacity-100 transition-all duration-500';
    message.style.color = theme.success;
    message.innerHTML = '✨ Profile updated successfully!';
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.style.transform = 'translateY(100%)';
      message.style.opacity = '0';
      setTimeout(() => message.remove(), 500);
    }, 2500);
  };

  const inputClass = `
    mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3
    focus:border-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400
    transition-all duration-200 bg-white
  `;

  const ViewMode = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProfileCard label="Name" value={profile.name} icon={User} />
        <ProfileCard label="Age" value={profile.age} icon={Calendar} />
        <ProfileCard label="Height" value={profile.height ? `${profile.height} cm` : null} icon={Activity} />
        <ProfileCard label="Weight" value={profile.weight ? `${profile.weight} kg` : null} icon={Activity} />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm mt-6">
        <div className="flex items-center mb-4">
          <Star size={20} className="mr-2" style={{ color: theme.primary }} />
          <h3 className="text-lg font-semibold" style={{ color: theme.text }}>Wellness Goals</h3>
        </div>
        <p className="text-gray-600 whitespace-pre-line">{profile.goals || 'No goals set yet'}</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm mt-6">
        <div className="flex items-center mb-4">
          <Activity size={20} className="mr-2" style={{ color: theme.primary }} />
          <h3 className="text-lg font-semibold" style={{ color: theme.text }}>Activity Level</h3>
        </div>
        <p className="text-gray-600 capitalize">{profile.activityLevel}</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm mt-6">
        <div className="flex items-center mb-4">
          <Settings size={20} className="mr-2" style={{ color: theme.primary }} />
          <h3 className="text-lg font-semibold" style={{ color: theme.text }}>Preferences</h3>
        </div>
        <div className="space-y-3">
          {Object.entries(profile.preferences).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-gray-600">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {value ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.accent }}
            >
              <User size={40} style={{ color: theme.primary }} />
            </div>
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold" style={{ color: theme.primary }}>
                  {isEditing ? 'Edit Profile' : 'Your Profile'}
                </h1>
                <p style={{ color: theme.lightText }}>
                  {isEditing ? 'Update your information' : 'Welcome back!'}
                </p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="ml-4 py-2 px-4 rounded-lg text-white font-medium
                           transition-all duration-200 hover:opacity-90 flex items-center justify-center"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Edit2 size={18} className="mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
          {isEditing && (
            <button
              onClick={() => setIsEditing(false)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={24} style={{ color: theme.text }} />
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg">
            <div className="space-y-6">
              {[
                { label: 'Name', key: 'name', type: 'text', icon: User },
                { label: 'Age', key: 'age', type: 'number', icon: Calendar },
                { label: 'Height (cm)', key: 'height', type: 'number', icon: Activity },
                { label: 'Weight (kg)', key: 'weight', type: 'number', icon: Activity }
              ].map(({ label, key, type, icon: Icon }) => (
                <div key={key}>
                  <label className="flex items-center text-sm font-medium" style={{ color: theme.text }}>
                    <Icon size={16} className="mr-2" />
                    {label}
                  </label>
                  <input
                    type={type}
                    value={profile[key]}
                    onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                    className={inputClass}
                  />
                </div>
              ))}

              <div>
                <label className="flex items-center text-sm font-medium" style={{ color: theme.text }}>
                  <Activity size={16} className="mr-2" />
                  Activity Level
                </label>
                <select
                  value={profile.activityLevel}
                  onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value })}
                  className={inputClass}
                >
                  {['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'].map(level => (
                    <option key={level.toLowerCase()} value={level.toLowerCase()}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center text-sm font-medium" style={{ color: theme.text }}>
                  <Star size={16} className="mr-2" />
                  Wellness Goals
                </label>
                <textarea
                  value={profile.goals}
                  onChange={(e) => setProfile({ ...profile, goals: e.target.value })}
                  rows="4"
                  className={inputClass}
                  placeholder="What are your wellness goals?"
                />
              </div>

              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text }}>
                  Preferences
                </h3>
                {Object.entries(profile.preferences).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-2">
                    <label className="flex items-center text-sm" style={{ color: theme.text }}>
                      <Settings size={16} className="mr-2" />
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </label>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => 
                        setProfile({
                          ...profile,
                          preferences: {
                            ...profile.preferences,
                            [key]: e.target.checked
                          }
                        })
                      }
                      className="w-5 h-5 rounded"
                      style={{ accentColor: theme.primary }}
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-lg text-white font-medium
                         transition-all duration-200 hover:opacity-90 flex items-center justify-center"
                style={{ backgroundColor: theme.primary }}
              >
                <Save size={20} className="mr-2" />
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <ViewMode />
        )}
      </div>
    </div>
  );
};

export default Profile;