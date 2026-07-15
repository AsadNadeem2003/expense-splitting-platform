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
    <div className="settings-container">
      <div className="settings-header">
        <div className="settings-avatar">
          {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <h2>Account Settings</h2>
          <p className="text-muted">Manage your profile and preferences</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        
        <div className="settings-section">
          <h3 className="section-title"><UserIcon size={20} /> Personal Information</h3>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={user?.email || ''} 
              className="form-control"
              disabled
            />
            <small className="help-text">Email address cannot be changed.</small>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="section-title"><CreditCard size={20} /> Payment Details</h3>
          <p className="section-desc">Add your payment details (e.g. "EasyPaisa: 0300-1234567" or "IBAN: PK...") so others know how to pay you.</p>
          <div className="form-group">
            <label>Payment Method</label>
            <input 
              type="text" 
              name="paymentMethod" 
              value={formData.paymentMethod} 
              onChange={handleChange} 
              className="form-control"
              placeholder="e.g. EasyPaisa: 0300-0000000"
            />
          </div>
        </div>

        <div className="settings-section">
          <h3 className="section-title"><Globe size={20} /> Preferences</h3>
          <div className="form-group">
            <label>Default Currency</label>
            <select 
              name="defaultCurrency" 
              value={formData.defaultCurrency} 
              onChange={handleChange} 
              className="form-control"
            >
              <option value="Rs.">PKR (Rs.)</option>
              <option value="$">USD ($)</option>
              <option value="€">EUR (€)</option>
              <option value="£">GBP (£)</option>
            </select>
          </div>
        </div>

        <div className="settings-actions">
          <button type="submit" className="btn btn-primary btn-large" disabled={isSaving}>
            {isSaving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
