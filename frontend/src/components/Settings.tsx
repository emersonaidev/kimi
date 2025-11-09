import { Edit2, ChevronRight, ArrowLeft, Check, X, Sun, Moon, Plus, Trash2, Mail, LogOut } from 'lucide-react';
import { Switch } from './ui/switch';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useEffect, useRef } from 'react';
import caregiverPhoto from 'figma:asset/84dbc7b603f81a28ae24f48fac681900f66d0686.png';
import lovedOnePhoto from 'figma:asset/979ef55846c1aa971e8d16a4daf15d3d9ec33cf2.png';
import { supabase } from '../lib/supabase';
import { useToast } from './Toast';

interface SettingsProps {
  onNavigate: (screen: 'dashboard' | 'settings' | 'chat' | 'health') => void;
  onBack?: () => void;
}

interface Caregiver {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  isYou: boolean;
  isPending?: boolean;
}

interface LovedOne {
  id: string;
  name: string;
  age: string;
  condition: string;
  dob: string;
  address: string;
  deviceId: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

export function Settings({ onNavigate, onBack }: SettingsProps) {
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [safeZoneBreaches, setSafeZoneBreaches] = useState(true);
  const [lowBattery, setLowBattery] = useState(true);
  const [deviceOffline, setDeviceOffline] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // Edit states
  const [editingCaregiver, setEditingCaregiver] = useState<string | null>(null);
  const [editingLovedOne, setEditingLovedOne] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState<string | null>(null);

  // Add new states
  const [showAddCaregiver, setShowAddCaregiver] = useState(false);
  const [showAddLovedOne, setShowAddLovedOne] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);

  // Caregivers data
  const [caregivers, setCaregivers] = useState<Caregiver[]>([
    {
      id: '1',
      name: 'Emerson Ferreira',
      role: 'Dad',
      phone: '(555) 123-4567',
      email: 'emersonaidev@gmail.com',
      isYou: true
    }
  ]);
  const [tempCaregiverData, setTempCaregiverData] = useState<Caregiver | null>(null);
  const [newCaregiverInvite, setNewCaregiverInvite] = useState({ name: '', email: '' });

  // Loved ones data
  const [lovedOnes, setLovedOnes] = useState<LovedOne[]>([
    {
      id: '1',
      name: 'Ester Ferreira',
      age: '18',
      condition: 'Autism Spectrum',
      dob: 'November 9, 2007',
      address: '123 Main St, Anytown, ST 12345',
      deviceId: 'KIMI-8472'
    }
  ]);
  const [tempLovedOneData, setTempLovedOneData] = useState<LovedOne | null>(null);
  const [newLovedOne, setNewLovedOne] = useState({
    name: '',
    age: '',
    condition: '',
    dob: '',
    address: '',
    deviceId: ''
  });

  // Emergency contacts data
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { id: '1', name: 'Sarah Johnson (Mother)', phone: '(555) 123-4567' },
    { id: '2', name: 'Dr. Martinez (Therapist)', phone: '(555) 234-5678' },
    { id: '3', name: 'Emergency Services', phone: '911' }
  ]);
  const [tempContactData, setTempContactData] = useState<EmergencyContact | null>(null);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const handleSendCaregiverInvite = () => {
    if (newCaregiverInvite.name && newCaregiverInvite.email) {
      const newCaregiver: Caregiver = {
        id: Date.now().toString(),
        name: newCaregiverInvite.name,
        role: 'Invited',
        phone: '',
        email: newCaregiverInvite.email,
        isYou: false,
        isPending: true
      };
      setCaregivers([...caregivers, newCaregiver]);
      setNewCaregiverInvite({ name: '', email: '' });
      setShowAddCaregiver(false);
    }
  };

  const handleAddLovedOne = () => {
    if (newLovedOne.name && newLovedOne.deviceId) {
      const lovedOne: LovedOne = {
        id: Date.now().toString(),
        ...newLovedOne
      };
      setLovedOnes([...lovedOnes, lovedOne]);
      setNewLovedOne({ name: '', age: '', condition: '', dob: '', address: '', deviceId: '' });
      setShowAddLovedOne(false);
    }
  };

  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
      const contact: EmergencyContact = {
        id: Date.now().toString(),
        ...newContact
      };
      setEmergencyContacts([...emergencyContacts, contact]);
      setNewContact({ name: '', phone: '' });
      setShowAddContact(false);
    }
  };

  const handleDeleteCaregiver = (id: string) => {
    setCaregivers(caregivers.filter(c => c.id !== id));
  };

  const handleDeleteLovedOne = (id: string) => {
    setLovedOnes(lovedOnes.filter(l => l.id !== id));
  };

  const handleDeleteContact = (id: string) => {
    setEmergencyContacts(emergencyContacts.filter(c => c.id !== id));
  };

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const handleScroll = () => {
      setScrolled(main.scrollTop > 10);
    };

    main.addEventListener('scroll', handleScroll);
    return () => main.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Large Title Header with Back Button */}
      <header 
        className="sticky top-0 z-[100] border-b transition-all duration-300"
        style={{
          backgroundColor: scrolled 
            ? theme === 'dark' 
              ? 'rgba(28, 28, 30, 0.8)' 
              : 'rgba(255, 255, 255, 0.8)'
            : theme === 'dark'
              ? 'rgba(28, 28, 30, 1)'
              : 'rgba(255, 255, 255, 1)',
          backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          borderColor: scrolled ? 'var(--border)' : 'transparent',
        }}
      >
        <div className="px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
          <div className="flex items-center gap-3 mb-1">
            <button 
              onClick={handleBack}
              className="p-2 -ml-2 hover:bg-secondary active:scale-95 rounded-[var(--radius)] transition-all"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 text-primary" />
            </button>
            <h1 
              className="transition-all duration-300"
              style={{
                fontSize: scrolled ? 'var(--text-h2)' : 'var(--text-h1)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              Settings
            </h1>
          </div>
          {!scrolled && (
            <p className="text-muted-foreground caption transition-opacity duration-300 ml-14">
              Manage your care settings
            </p>
          )}
        </div>
      </header>

      {/* Main Content - iOS Grouped List Style */}
      <main ref={mainRef} className="flex-1 overflow-y-auto bg-background pb-6">
        <div className="pt-6">
          {/* Caregivers Section */}
          <label 
            className="px-4 mb-2 block uppercase tracking-wide caption" 
            style={{ 
              fontSize: 'var(--text-label)',
              color: 'var(--muted-foreground)',
            }}
          >
            Caregiver
          </label>

          {/* Caregivers List */}
          <div className="space-y-3 mx-4 mb-6">
            {caregivers.map((caregiver) => (
              <div 
                key={caregiver.id}
                className="bg-card rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-elevation-sm)]"
              >
                <div className="flex items-start gap-4">
                  <img 
                    src={caregiverPhoto} 
                    alt={caregiver.name}
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-primary/20"
                  />
                  
                  <div className="flex-1">
                    {editingCaregiver === caregiver.id && caregiver.isYou ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-muted-foreground caption block mb-1">Name</label>
                          <input
                            type="text"
                            value={tempCaregiverData?.name || ''}
                            onChange={(e) => tempCaregiverData && setTempCaregiverData({ ...tempCaregiverData, name: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Name"
                          />
                        </div>
                        <div>
                          <label className="text-muted-foreground caption block mb-1">Role</label>
                          <input
                            type="text"
                            value={tempCaregiverData?.role || ''}
                            onChange={(e) => tempCaregiverData && setTempCaregiverData({ ...tempCaregiverData, role: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-primary caption"
                            placeholder="Role"
                          />
                        </div>
                        <div>
                          <label className="text-muted-foreground caption block mb-1">Phone</label>
                          <input
                            type="tel"
                            value={tempCaregiverData?.phone || ''}
                            onChange={(e) => tempCaregiverData && setTempCaregiverData({ ...tempCaregiverData, phone: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-primary caption"
                            placeholder="Phone"
                          />
                        </div>
                        <div>
                          <label className="text-muted-foreground caption block mb-1">Email</label>
                          <input
                            type="email"
                            value={tempCaregiverData?.email || ''}
                            onChange={(e) => tempCaregiverData && setTempCaregiverData({ ...tempCaregiverData, email: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-primary caption"
                            placeholder="Email"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-0.5">
                          <h3 className="mb-0">{caregiver.name}</h3>
                          {caregiver.isYou && <span className="px-2 py-0.5 bg-primary/10 text-primary caption rounded-full">You</span>}
                        </div>
                        <p className="text-muted-foreground caption mb-3">
                          {caregiver.isPending ? 'Invite pending...' : caregiver.role}
                        </p>
                        
                        {!caregiver.isPending && (
                          <div className="space-y-2">
                            {caregiver.phone && (
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground caption">Phone:</span>
                                <p className="caption">{caregiver.phone}</p>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground caption">Email:</span>
                              <p className="caption">{caregiver.email}</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {editingCaregiver === caregiver.id && caregiver.isYou ? (
                      <>
                        <button
                          onClick={() => {
                            if (tempCaregiverData) {
                              setCaregivers(caregivers.map(c => c.id === caregiver.id ? tempCaregiverData : c));
                              setEditingCaregiver(null);
                            }
                          }}
                          className="p-2 hover:bg-secondary active:scale-95 rounded-[var(--radius)] transition-all"
                          aria-label="Save caregiver profile"
                        >
                          <Check className="w-5 h-5 text-chart-2" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingCaregiver(null);
                            setTempCaregiverData(null);
                          }}
                          className="p-2 hover:bg-secondary active:scale-95 rounded-[var(--radius)] transition-all"
                          aria-label="Cancel editing"
                        >
                          <X className="w-5 h-5 text-destructive" />
                        </button>
                      </>
                    ) : (
                      <>
                        {caregiver.isYou && (
                          <button
                            onClick={() => {
                              setTempCaregiverData(caregiver);
                              setEditingCaregiver(caregiver.id);
                            }}
                            className="p-2 hover:bg-secondary active:scale-95 rounded-[var(--radius)] transition-all"
                            aria-label="Edit caregiver profile"
                          >
                            <Edit2 className="w-5 h-5 text-primary" />
                          </button>
                        )}
                        {!caregiver.isYou && (
                          <button
                            onClick={() => handleDeleteCaregiver(caregiver.id)}
                            className="p-2 hover:bg-destructive/10 active:scale-95 rounded-[var(--radius)] transition-all"
                            aria-label="Remove caregiver"
                          >
                            <Trash2 className="w-5 h-5 text-destructive" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Loved Ones Section */}
          <label 
            className="px-4 mb-2 block uppercase tracking-wide caption" 
            style={{ 
              fontSize: 'var(--text-label)',
              color: 'var(--muted-foreground)',
            }}
          >
            Loved One
          </label>

          {/* Loved Ones List */}
          <div className="space-y-3 mx-4 mb-6">
            {lovedOnes.map((lovedOne) => (
              <div 
                key={lovedOne.id}
                className="bg-card rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-elevation-sm)]"
              >
                <div className="flex items-start gap-4">
                  <img 
                    src={lovedOnePhoto} 
                    alt={lovedOne.name}
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-chart-2/20"
                  />
                  
                  <div className="flex-1">
                    {editingLovedOne === lovedOne.id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-muted-foreground caption block mb-1">Name</label>
                          <input
                            type="text"
                            value={tempLovedOneData?.name || ''}
                            onChange={(e) => tempLovedOneData && setTempLovedOneData({ ...tempLovedOneData, name: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Name"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-muted-foreground caption block mb-1">Age</label>
                            <input
                              type="text"
                              value={tempLovedOneData?.age || ''}
                              onChange={(e) => tempLovedOneData && setTempLovedOneData({ ...tempLovedOneData, age: e.target.value })}
                              className="w-full px-3 py-2 bg-background border border-border rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-primary caption"
                              placeholder="Age"
                            />
                          </div>
                          <div>
                            <label className="text-muted-foreground caption block mb-1">Condition</label>
                            <input
                              type="text"
                              value={tempLovedOneData?.condition || ''}
                              onChange={(e) => tempLovedOneData && setTempLovedOneData({ ...tempLovedOneData, condition: e.target.value })}
                              className="w-full px-3 py-2 bg-background border border-border rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-primary caption"
                              placeholder="Condition"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-muted-foreground caption block mb-1">Date of Birth</label>
                          <input
                            type="text"
                            value={tempLovedOneData?.dob || ''}
                            onChange={(e) => tempLovedOneData && setTempLovedOneData({ ...tempLovedOneData, dob: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-primary caption"
                            placeholder="Date of Birth"
                          />
                        </div>
                        <div>
                          <label className="text-muted-foreground caption block mb-1">Address</label>
                          <input
                            type="text"
                            value={tempLovedOneData?.address || ''}
                            onChange={(e) => tempLovedOneData && setTempLovedOneData({ ...tempLovedOneData, address: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-primary caption"
                            placeholder="Address"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="mb-0.5">{lovedOne.name}</h3>
                        <p className="text-muted-foreground caption mb-3">Age {lovedOne.age} • {lovedOne.condition}</p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground caption">DOB:</span>
                            <p className="caption">{lovedOne.dob}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground caption">Device:</span>
                            <p className="caption">{lovedOne.deviceId}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {editingLovedOne === lovedOne.id ? (
                      <>
                        <button
                          onClick={() => {
                            if (tempLovedOneData) {
                              setLovedOnes(lovedOnes.map(l => l.id === lovedOne.id ? tempLovedOneData : l));
                              setEditingLovedOne(null);
                            }
                          }}
                          className="p-2 hover:bg-secondary active:scale-95 rounded-[var(--radius)] transition-all"
                          aria-label="Save loved one profile"
                        >
                          <Check className="w-5 h-5 text-chart-2" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingLovedOne(null);
                            setTempLovedOneData(null);
                          }}
                          className="p-2 hover:bg-secondary active:scale-95 rounded-[var(--radius)] transition-all"
                          aria-label="Cancel editing"
                        >
                          <X className="w-5 h-5 text-destructive" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setTempLovedOneData(lovedOne);
                          setEditingLovedOne(lovedOne.id);
                        }}
                        className="p-2 hover:bg-secondary active:scale-95 rounded-[var(--radius)] transition-all"
                        aria-label="Edit loved one profile"
                      >
                        <Edit2 className="w-5 h-5 text-primary" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Notification Preferences Section - iOS List with Switches */}
          <label 
            className="px-4 mb-2 block uppercase tracking-wide caption" 
            style={{ 
              fontSize: 'var(--text-label)',
              color: 'var(--muted-foreground)',
            }}
          >
            Notifications
          </label>
          
          <div className="mx-4 bg-card rounded-[var(--radius-card)] shadow-[var(--shadow-elevation-sm)] overflow-hidden mb-6">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <p>Safe zone breaches</p>
              <Switch checked={safeZoneBreaches} onCheckedChange={setSafeZoneBreaches} />
            </div>
            
            <div className="flex items-center justify-between p-4 border-b border-border">
              <p>Low battery alerts</p>
              <Switch checked={lowBattery} onCheckedChange={setLowBattery} />
            </div>
            
            <div className="flex items-center justify-between p-4">
              <p>Device offline</p>
              <Switch checked={deviceOffline} onCheckedChange={setDeviceOffline} />
            </div>
          </div>

          {/* Appearance Section - Improved Theme Toggle */}
          <label 
            className="px-4 mb-2 block uppercase tracking-wide caption" 
            style={{ 
              fontSize: 'var(--text-label)',
              color: 'var(--muted-foreground)',
            }}
          >
            Appearance
          </label>
          
          <div className="mx-4 bg-card rounded-[var(--radius-card)] shadow-[var(--shadow-elevation-sm)] overflow-hidden mb-6">
            <div className="p-4">
              <p className="mb-4">Theme</p>
              <div className="flex gap-3">
                <button
                  onClick={() => theme === 'dark' && toggleTheme()}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-[var(--radius)] transition-all ${
                    theme === 'light' 
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/50 hover:bg-secondary active:bg-secondary'
                  }`}
                  aria-label="Light theme"
                >
                  <Sun className="w-5 h-5" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => theme === 'light' && toggleTheme()}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-[var(--radius)] transition-all ${
                    theme === 'dark' 
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/50 hover:bg-secondary active:bg-secondary'
                  }`}
                  aria-label="Dark theme"
                >
                  <Moon className="w-5 h-5" />
                  <span>Dark</span>
                </button>
              </div>
            </div>
          </div>

          {/* Emergency Contacts Section */}
          <div className="flex items-center justify-between px-4 mb-2">
            <label 
              className="uppercase tracking-wide caption" 
              style={{ 
                fontSize: 'var(--text-label)',
                color: 'var(--muted-foreground)',
              }}
            >
              Emergency Contacts
            </label>
            <button
              onClick={() => setShowAddContact(true)}
              className="p-1.5 hover:bg-secondary active:scale-95 rounded-[var(--radius)] transition-all"
              aria-label="Add emergency contact"
            >
              <Plus className="w-5 h-5 text-primary" />
            </button>
          </div>

          {/* Add Contact Form */}
          {showAddContact && (
            <div className="mx-4 mb-3 bg-card rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-elevation-sm)] border-2 border-primary/20">
              <div className="flex items-center justify-between mb-3">
                <h3>Add Emergency Contact</h3>
                <button
                  onClick={() => {
                    setShowAddContact(false);
                    setNewContact({ name: '', phone: '' });
                  }}
                  className="p-1 hover:bg-secondary active:scale-95 rounded-[var(--radius)] transition-all"
                  aria-label="Cancel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-muted-foreground caption block mb-1">Name</label>
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Contact name"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground caption block mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-primary caption"
                    placeholder="Phone number"
                  />
                </div>
                <button
                  onClick={handleAddContact}
                  className="w-full bg-primary text-primary-foreground px-4 py-2.5 rounded-[var(--radius)] hover:opacity-90 active:scale-98 transition-all"
                >
                  Add Contact
                </button>
              </div>
            </div>
          )}
          
          <div className="mx-4 bg-card rounded-[var(--radius-card)] shadow-[var(--shadow-elevation-sm)] overflow-hidden mb-6">
            {emergencyContacts.map((contact, index) => (
              <div 
                key={contact.id}
                className={`${index !== emergencyContacts.length - 1 ? 'border-b border-border' : ''}`}
              >
                {editingContact === contact.id ? (
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="text-muted-foreground caption block mb-1">Name</label>
                      <input
                        type="text"
                        value={tempContactData?.name || ''}
                        onChange={(e) => tempContactData && setTempContactData({ ...tempContactData, name: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Contact name"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground caption block mb-1">Phone</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="tel"
                          value={tempContactData?.phone || ''}
                          onChange={(e) => tempContactData && setTempContactData({ ...tempContactData, phone: e.target.value })}
                          className="w-full px-3 py-2 bg-background border border-border rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-primary caption"
                          placeholder="Phone number"
                        />
                        <button
                          onClick={() => {
                            if (tempContactData) {
                              setEmergencyContacts(emergencyContacts.map(c => c.id === contact.id ? tempContactData : c));
                              setEditingContact(null);
                            }
                          }}
                          className="p-2 hover:bg-secondary active:scale-95 rounded-[var(--radius)] transition-all flex-shrink-0"
                          aria-label="Save contact"
                        >
                          <Check className="w-5 h-5 text-chart-2" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingContact(null);
                            setTempContactData(null);
                          }}
                          className="p-2 hover:bg-secondary active:scale-95 rounded-[var(--radius)] transition-all flex-shrink-0"
                          aria-label="Cancel editing"
                        >
                          <X className="w-5 h-5 text-destructive" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center p-4 group">
                    <button
                      onClick={() => {
                        setTempContactData(contact);
                        setEditingContact(contact.id);
                      }}
                      className="flex-1 flex items-center justify-between hover:bg-secondary/30 active:bg-secondary/50 transition-colors -m-4 p-4 rounded-[var(--radius-card)]"
                      aria-label={`Edit ${contact.name}`}
                    >
                      <div className="text-left flex-1">
                        <p className="mb-0.5">{contact.name}</p>
                        <p className="text-muted-foreground caption">{contact.phone}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground ml-2" />
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="ml-2 p-2 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 active:scale-95 rounded-[var(--radius)] transition-all"
                      aria-label="Delete contact"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Device Management */}
          <label 
            className="px-4 mb-2 block uppercase tracking-wide caption" 
            style={{ 
              fontSize: 'var(--text-label)',
              color: 'var(--muted-foreground)',
            }}
          >
            Device
          </label>
          
          <div className="mx-4 bg-card rounded-[var(--radius-card)] shadow-[var(--shadow-elevation-sm)] overflow-hidden mb-6">
            <button 
              className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 active:bg-secondary/50 transition-colors"
              aria-label="View KIMI Watch details"
            >
              <div className="text-left flex-1">
                <p className="mb-0.5">KIMI Watch #8472</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-chart-2 rounded-full"></span>
                  <p className="text-muted-foreground caption">Connected • 85% battery</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-2" />
            </button>
          </div>

          {/* Sign Out Button */}
          <div className="mx-4 mb-6">
            <button
              onClick={async () => {
                const { error } = await supabase.auth.signOut();
                if (error) {
                  showToast('error', 'Failed to sign out');
                } else {
                  showToast('info', 'Signed out successfully');
                }
              }}
              className="w-full bg-destructive/10 text-destructive px-4 py-3 rounded-[var(--radius-button)] hover:bg-destructive/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}