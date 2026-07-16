import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/users';
import toast from 'react-hot-toast';
import { Save, User as UserIcon, CreditCard, Globe } from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    defaultCurrency: 'Rs.',
    paymentMethod: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        defaultCurrency: (user as any).defaultCurrency || 'Rs.',
        paymentMethod: (user as any).paymentMethod || ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully');
      // In a real app, we'd also update the AuthContext user state here
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto font-['Plus_Jakarta_Sans',_sans-serif] pb-10">
      
      {/* Header section outside the card to match typical dashboard feeling */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl shadow-sm">
          {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account Settings</h2>
          <p className="text-sm text-slate-500 font-medium">Manage your profile and preferences</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_8px_30px_rgb(15,23,42,0.04)]">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Personal Information */}
          <div className="border-b border-slate-100 pb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
              <UserIcon size={20} className="text-blue-500" /> Personal Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500 cursor-not-allowed"
                  disabled
                />
                <p className="text-xs text-slate-500 mt-1">Email address cannot be changed.</p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="border-b border-slate-100 pb-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CreditCard size={20} className="text-emerald-500" /> Payment Details
              </h3>
              <p className="text-xs text-slate-500 mt-1">Add your payment details (e.g. "EasyPaisa: 0300-1234567" or "IBAN: PK...") so others know how to pay you.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Payment Method</label>
                <input 
                  type="text" 
                  name="paymentMethod" 
                  value={formData.paymentMethod} 
                  onChange={handleChange} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="e.g. EasyPaisa: 0300-0000000"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="pb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
              <Globe size={20} className="text-violet-500" /> Preferences
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Default Currency</label>
                <select 
                  name="defaultCurrency" 
                  value={formData.defaultCurrency} 
                  onChange={handleChange} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="Rs.">PKR (Rs.)</option>
                  <option value="$">USD ($)</option>
                  <option value="€">EUR (€)</option>
                  <option value="£">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-2.5 font-semibold shadow-sm hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-70 disabled:hover:scale-100" 
              disabled={isSaving}
            >
              {isSaving ? (
                'Saving...'
              ) : (
                <>
                  <Save size={18} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
