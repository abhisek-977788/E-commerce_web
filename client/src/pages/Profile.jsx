import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, logout, changePassword, addAddress, deleteAddress } from '../store/slices/authSlice';
import { User, Mail, Phone, Settings, LogOut, Package, MapPin, Plus, Trash2, KeyRound, X } from 'lucide-react';

const EMPTY_ADDRESS = {
  name: '', phone: '', addressLine1: '', addressLine2: '',
  city: '', state: '', pincode: '', country: 'India', isDefault: false,
};

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, passwordLoading } = useSelector(state => state.auth);
  const { orders } = useSelector(state => state.orders);

  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [activeTab, setActiveTab] = useState('overview');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS);

  useEffect(() => {
    if (user) setFormData({ name: user.name || '', phone: user.phone || '' });
  }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProfile(formData));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setPasswordError('New passwords do not match');
    }
    if (passwordForm.newPassword.length < 6) {
      return setPasswordError('New password must be at least 6 characters');
    }
    dispatch(changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }))
      .unwrap()
      .then(() => setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }))
      .catch(() => {});
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    dispatch(addAddress(addressForm)).unwrap().then(() => {
      setShowAddressModal(false);
      setAddressForm(EMPTY_ADDRESS);
    }).catch(() => {});
  };

  const handleDeleteAddress = (addressId) => {
    if (window.confirm('Remove this address?')) dispatch(deleteAddress(addressId));
  };

  if (!user) return null;

  return (
    <div className="pt-24 pb-20 page-container">
      <div className="flex flex-col lg:flex-row gap-8">

        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="glass-card overflow-hidden">
            <div className="p-6 text-center border-b border-white/10 bg-dark-900/50">
              <div className="w-24 h-24 mx-auto rounded-full bg-primary-600/20 text-primary-400 flex items-center justify-center text-3xl font-bold mb-4 border-2 border-primary-500/50 shadow-glow">
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  : user.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
              <p className="text-sm text-gray-400">{user.email}</p>
              {user.role === 'admin' && <span className="inline-block mt-3 badge-primary">Admin Account</span>}
            </div>

            <div className="p-4 space-y-1">
              {[
                { id: 'overview',   label: 'Account Overview', icon: <User className="w-5 h-5" /> },
                { id: 'addresses',  label: 'Saved Addresses',  icon: <MapPin className="w-5 h-5" /> },
                { id: 'settings',   label: 'Security',         icon: <Settings className="w-5 h-5" /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                    activeTab === tab.id
                      ? 'bg-primary-600/20 text-primary-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
              <hr className="border-white/10 my-2" />
              <button
                onClick={() => dispatch(logout())}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">

          {/* ─── Overview ─── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="stat-card">
                  <Package className="w-8 h-8 text-primary-400 mb-4" />
                  <p className="text-gray-400 text-sm mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-white">{orders?.length || 0}</p>
                </div>
                <div className="stat-card border-accent-500/30">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <User className="w-24 h-24 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-4">Member Since</h3>
                  <p className="text-2xl text-primary-400">
                    {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="glass-card p-6 md:p-8">
                <h3 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Edit Profile</h3>
                <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Full Name</label>
                    <div className="relative">
                      <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field pl-10" />
                      <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Email Address (Read Only)</label>
                    <div className="relative opacity-70">
                      <input type="email" value={user.email} disabled className="input-field pl-10 cursor-not-allowed" />
                      <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Phone Number</label>
                    <div className="relative">
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field pl-10" placeholder="Add phone number" />
                      <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary mt-4">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ─── Addresses ─── */}
          {activeTab === 'addresses' && (
            <div className="glass-card p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <h3 className="text-xl font-bold">Saved Addresses</h3>
                <button onClick={() => setShowAddressModal(true)} className="btn-primary py-2 text-sm flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Address
                </button>
              </div>

              {user.addresses?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.addresses.map((address) => (
                    <div key={address._id} className="p-4 rounded-xl border border-white/10 bg-white/5 relative group">
                      {address.isDefault && <span className="absolute top-4 right-4 badge-primary text-[10px]">Default</span>}
                      <p className="font-bold text-white mb-1">{address.name}</p>
                      <p className="text-sm text-gray-400 mb-2">{address.phone}</p>
                      <p className="text-sm text-gray-300 mb-4">
                        {address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}, {address.city}, {address.state} – {address.pincode}
                      </p>
                      <button onClick={() => handleDeleteAddress(address._id)} className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No addresses saved yet.</p>
                </div>
              )}
            </div>
          )}

          {/* ─── Settings / Change Password ─── */}
          {activeTab === 'settings' && (
            <div className="glass-card p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary-400" /> Change Password
              </h3>
              <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-xl">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">New Password</label>
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
                <button type="submit" disabled={passwordLoading} className="btn-primary mt-4">
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ─── Add Address Modal ─── */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6 md:p-8 relative">
            <button onClick={() => setShowAddressModal(false)} className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-6">Add New Address</h3>
            <form onSubmit={handleAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Full Name *</label>
                <input type="text" required value={addressForm.name} onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })} className="input-field" placeholder="John Doe" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Phone *</label>
                <input type="tel" required value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} className="input-field" placeholder="9876543210" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm text-gray-400">Address Line 1 *</label>
                <input type="text" required value={addressForm.addressLine1} onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })} className="input-field" placeholder="House/Flat No, Building Name" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm text-gray-400">Address Line 2</label>
                <input type="text" value={addressForm.addressLine2} onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })} className="input-field" placeholder="Street, Area, Landmark" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">City *</label>
                <input type="text" required value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} className="input-field" placeholder="Mumbai" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">State *</label>
                <input type="text" required value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} className="input-field" placeholder="Maharashtra" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Pincode *</label>
                <input type="text" required value={addressForm.pincode} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })} className="input-field" placeholder="400001" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Country</label>
                <input type="text" value={addressForm.country} disabled className="input-field opacity-50 cursor-not-allowed" />
              </div>
              <div className="md:col-span-2 flex items-center gap-2">
                <input type="checkbox" id="isDefault" checked={addressForm.isDefault} onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} className="w-4 h-4 accent-indigo-500" />
                <label htmlFor="isDefault" className="text-sm text-gray-300">Set as default address</label>
              </div>
              <div className="md:col-span-2 flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddressModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Save Address</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
