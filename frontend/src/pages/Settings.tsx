import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/users';
import toast from 'react-hot-toast';
import { Save, User as UserIcon, CreditCard, Globe } from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    defaultCurrency: 'Rs.',
    paymentMethod: ''
  });

  const [paymentProvider, setPaymentProvider] = useState('EasyPaisa');
  const [accountTitle, setAccountTitle] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const pm = (user as any).paymentMethod || '';
      setFormData({
        name: user.name || '',
        defaultCurrency: (user as any).defaultCurrency || 'Rs.',
        paymentMethod: pm
      });

      // Try to parse existing structured payment method (e.g. "EasyPaisa: 0300-1234567 (Hamza Tariq)")
      if (pm.includes(':')) {
        const [prov, rest] = pm.split(':');
        setPaymentProvider(prov.trim());
        if (rest.includes('(') && rest.includes(')')) {
          const num = rest.substring(0, rest.indexOf('(')).trim();
          const title = rest.substring(rest.indexOf('(') + 1, rest.indexOf(')')).trim();
          setAccountNumber(num);
          setAccountTitle(title);
        } else {
          setAccountNumber(rest.trim());
        }
      } else if (pm) {
        setAccountNumber(pm);
      }
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

    // Format structured payment method if provided
    let finalPaymentMethod = formData.paymentMethod;
    if (accountNumber.trim()) {
      finalPaymentMethod = `${paymentProvider}: ${accountNumber.trim()}${accountTitle.trim() ? ` (${accountTitle.trim()})` : ''}`;
    }
    
    const payload = {
      ...formData,
      paymentMethod: finalPaymentMethod
    };

    try {
      const updated = await updateProfile(payload);
      updateUser(updated.data || payload);
      setFormData(prev => ({ ...prev, paymentMethod: finalPaymentMethod }));
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to update profile');
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
                  maxLength={35}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                  placeholder="Your full name"
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
                <CreditCard size={20} className="text-emerald-500" /> Payment & Receiving Details
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Configure your verified payment method. When group members settle debts with you, your details will be displayed for 1-click copying.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Provider / Bank
                  </label>
                  <select
                    value={paymentProvider}
                    onChange={e => setPaymentProvider(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="EasyPaisa">EasyPaisa</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="Raast">Raast ID</option>
                    <option value="Nayapay">Nayapay</option>
                    <option value="Sadapay">Sadapay</option>
                    <option value="Bank Transfer">Bank Transfer (IBAN)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Account Number / IBAN / Phone
                  </label>
                  <input 
                    type="text" 
                    value={accountNumber} 
                    onChange={e => setAccountNumber(e.target.value)} 
                    placeholder="0300-1234567 or PK36..."
                    maxLength={50}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Account Title (Name)
                  </label>
                  <input 
                    type="text" 
                    value={accountTitle} 
                    onChange={e => setAccountTitle(e.target.value)} 
                    placeholder="e.g. Hamza Tariq"
                    maxLength={50}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {accountNumber.trim() && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Preview (As seen by payees)</span>
                    <p className="text-xs font-mono font-bold text-slate-900 mt-0.5">
                      {paymentProvider}: {accountNumber.trim()} {accountTitle.trim() ? `(${accountTitle.trim()})` : ''}
                    </p>
                  </div>
                </div>
              )}
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
