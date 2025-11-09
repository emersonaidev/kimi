import { Settings, TrendingUp, TrendingDown, Minus, Menu, Share2, MapPin, Navigation, X, Search, Check, Trash2, Plus } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { Map, MapRef, SafeZone } from './Map';
import { BottomSheet } from './BottomSheet';
import { StatusBar } from './StatusBar';
import { useTheme } from '../contexts/ThemeContext';
import { getGlassmorphismBg } from '../utils/theme';
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './Toast';

interface DashboardProps {
  onNavigate: (screen: 'dashboard' | 'settings' | 'chat' | 'health') => void;
}

// Mock data para os últimos 7 dias de checkpoints
const getLastWeekCheckpoints = () => {
  const days = ['Today', 'Yesterday', 'Thursday', 'Wednesday', 'Tuesday', 'Monday', 'Last Sunday'];
  const checkpoints = [
    // Today
    [
      { time: '2:15 PM', action: 'At school', location: 'Oak Elementary', status: 'safe' },
      { time: '12:45 PM', action: '⚠️ High stress detected', location: 'Stress level: 85', status: 'warning' },
      { time: '8:34 AM', action: 'Arrived at school', location: 'Oak Elementary', status: 'safe' },
      { time: '8:12 AM', action: 'Left home', location: 'Safe zone exit', status: 'info' },
      { time: '7:15 AM', action: 'Woke up', location: '8h 12m sleep', status: 'rest' },
    ],
    // Yesterday
    [
      { time: '4:15 PM', action: '⚠️ Left safe zone', location: 'Unknown area - Downtown', status: 'alert' },
      { time: '3:30 PM', action: 'Arrived home', location: 'From school', status: 'safe' },
      { time: '3:10 PM', action: 'Left school', location: 'Oak Elementary', status: 'info' },
      { time: '8:25 AM', action: 'Arrived at school', location: 'Oak Elementary', status: 'safe' },
      { time: '8:05 AM', action: 'Left home', location: 'Safe zone exit', status: 'info' },
    ],
    // Thursday
    [
      { time: '3:25 PM', action: 'Arrived home', location: 'From school', status: 'safe' },
      { time: '3:05 PM', action: 'Left school', location: 'Oak Elementary', status: 'info' },
      { time: '2:30 PM', action: '⚠️ Low battery alert', location: 'Battery: 15%', status: 'warning' },
      { time: '8:30 AM', action: 'Arrived at school', location: 'Oak Elementary', status: 'safe' },
      { time: '8:10 AM', action: 'Left home', location: 'Safe zone exit', status: 'info' },
    ],
    // Wednesday
    [
      { time: '3:35 PM', action: 'Arrived home', location: 'From school', status: 'safe' },
      { time: '3:15 PM', action: 'Left school', location: 'Oak Elementary', status: 'info' },
      { time: '11:20 AM', action: '💚 Calm period detected', location: 'Stress level: 22', status: 'positive' },
      { time: '8:28 AM', action: 'Arrived at school', location: 'Oak Elementary', status: 'safe' },
      { time: '8:08 AM', action: 'Left home', location: 'Safe zone exit', status: 'info' },
    ],
    // Tuesday
    [
      { time: '3:40 PM', action: '⚠️ Unusual inactivity', location: 'No movement for 45 min', status: 'warning' },
      { time: '3:20 PM', action: 'Arrived home', location: 'From school', status: 'safe' },
      { time: '3:00 PM', action: 'Left school', location: 'Oak Elementary', status: 'info' },
      { time: '8:32 AM', action: 'Arrived at school', location: 'Oak Elementary', status: 'safe' },
      { time: '8:12 AM', action: 'Left home', location: 'Safe zone exit', status: 'info' },
    ],
    // Monday
    [
      { time: '3:40 PM', action: 'Arrived home', location: 'From school', status: 'safe' },
      { time: '3:20 PM', action: 'Left school', location: 'Oak Elementary', status: 'info' },
      { time: '1:05 PM', action: '⚠️ Heart rate elevated', location: '125 BPM for 10 minutes', status: 'warning' },
      { time: '8:26 AM', action: 'Arrived at school', location: 'Oak Elementary', status: 'safe' },
      { time: '8:06 AM', action: 'Left home', location: 'Safe zone exit', status: 'info' },
    ],
    // Last Sunday (day off)
    [
      { time: '2:00 PM', action: 'At home', location: 'Playing in backyard', status: 'safe' },
      { time: '9:30 AM', action: 'Woke up', location: '9h 45m sleep', status: 'rest' },
    ],
  ];

  return days.map((day, index) => ({ day, events: checkpoints[index] }));
};

export function Dashboard({ onNavigate }: DashboardProps) {
  // Ester's current location (at Oak Elementary School in Lisbon)
  const esterLocation: [number, number] = [38.7250, -9.1420];
  const { theme } = useTheme();
  const { showToast, ToastComponent } = useToast();
  const [sheetPosition, setSheetPosition] = useState<'collapsed' | 'medium' | 'full'>('medium');
  const mapRef = useRef<MapRef>(null);
  const weekData = getLastWeekCheckpoints();
  
  // Menu states
  const [showMapMenu, setShowMapMenu] = useState(false);
  
  // Share location states
  const [hasActiveLinks, setHasActiveLinks] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [activeShareExpiry, setActiveShareExpiry] = useState<string | null>(null);

  // Safe zone creation states
  const [isCreatingSafeZone, setIsCreatingSafeZone] = useState(false);
  const [safeZoneMode, setSafeZoneMode] = useState<'list' | 'create'>('list');
  const [newSafeZonePin, setNewSafeZonePin] = useState<[number, number] | null>(null);
  const [newSafeZoneRadius, setNewSafeZoneRadius] = useState<number>(200); // meters
  const [newSafeZoneAddress, setNewSafeZoneAddress] = useState<string>('');
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [newSafeZoneName, setNewSafeZoneName] = useState<string>('');
  const [mapCenter, setMapCenter] = useState<[number, number]>(esterLocation);
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [showPreview, setShowPreview] = useState(false); // Explicit preview control

  // Update map center when map moves (only during safe zone creation)
  useEffect(() => {
    if (isCreatingSafeZone && safeZoneMode === 'create' && mapRef.current) {
      const interval = setInterval(() => {
        if (mapRef.current) {
          setMapCenter(mapRef.current.getCenter());
        }
      }, 100); // Update 10 times per second for smooth preview
      return () => clearInterval(interval);
    } else {
      // Reset to Ester's location when not creating
      setMapCenter(esterLocation);
    }
  }, [isCreatingSafeZone, safeZoneMode]);

  // Control preview visibility explicitly
  useEffect(() => {
    setShowPreview(isCreatingSafeZone && safeZoneMode === 'create');
  }, [isCreatingSafeZone, safeZoneMode]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-chart-2';
      case 'info': return 'bg-chart-1';
      case 'rest': return 'bg-muted-foreground';
      case 'warning': return 'bg-chart-3';
      case 'alert': return 'bg-chart-4';
      case 'positive': return 'bg-chart-5';
      default: return 'bg-muted-foreground';
    }
  };

  const handleCenterOnEster = () => {
    setShowMapMenu(false);
    if (mapRef.current) {
      mapRef.current.recenter();
      showToast('info', 'Centered on Ester');
    }
  };

  const handleAddSafeZone = () => {
    setShowMapMenu(false);
    
    // Decidir qual modo mostrar
    if (safeZones.length > 0) {
      // Se existirem zonas, mostrar lista
      setSafeZoneMode('list');
    } else {
      // Se não existirem zonas, ir direto para criação
      setSafeZoneMode('create');
    }
    
    setIsCreatingSafeZone(true);
    setNewSafeZonePin(null);
    setNewSafeZoneRadius(200);
    setNewSafeZoneAddress('');
    setAddressSuggestions([]);
    setSheetPosition('collapsed'); // Collapse sheet to show more map
  };

  const handleCancelSafeZone = () => {
    setIsCreatingSafeZone(false);
    setNewSafeZonePin(null);
    setNewSafeZoneRadius(200);
    setNewSafeZoneAddress('');
    setAddressSuggestions([]);
    
    // Reset mode to list if there are zones
    if (safeZones.length > 0) {
      setSafeZoneMode('list');
    } else {
      setSafeZoneMode('create');
    }
    
    setSheetPosition('medium'); // Return to medium position
    
    // Voltar para a Ester
    if (mapRef.current) {
      mapRef.current.flyTo(esterLocation, 15);
    }
  };

  const handleConfirmSafeZone = () => {
    if (newSafeZoneAddress.trim()) {
      // Show dialog to ask for zone name
      setShowNameDialog(true);
    } else {
      showToast('warning', 'Please search for an address');
    }
  };

  const handleSaveSafeZone = () => {
    if (mapRef.current && newSafeZoneName.trim()) {
      const center = mapRef.current.getCenter();
      
      // Create new safe zone with green color (chart-2)
      const getColor = (varName: string) => {
        const value = getComputedStyle(document.documentElement)
          .getPropertyValue(varName)
          .trim();
        return value;
      };
      
      const newZone: SafeZone = {
        id: `zone-${Date.now()}`,
        name: newSafeZoneName,
        center: center,
        radius: newSafeZoneRadius,
        color: getColor('--chart-2'), // Green color
      };
      
      // Add to safe zones array
      setSafeZones(prev => [...prev, newZone]);
      
      showToast('success', `"${newSafeZoneName}" created!`);
      
      // Reset all states
      setIsCreatingSafeZone(false);
      setNewSafeZonePin(null);
      setNewSafeZoneRadius(200);
      setNewSafeZoneAddress('');
      setNewSafeZoneName('');
      setShowNameDialog(false);
      setSheetPosition('medium');
      
      // Fly back to Ester after a short delay
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.flyTo(esterLocation, 15);
        }
      }, 500);
    } else if (!newSafeZoneName.trim()) {
      showToast('warning', 'Please enter a zone name');
    }
  };

  const handleCancelNameDialog = () => {
    setShowNameDialog(false);
    setNewSafeZoneName('');
  };

  // Fetch address suggestions as user types
  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewSafeZoneAddress(value);

    if (value.trim().length > 2) {
      try {
        const response = await fetch(
          `https://api.maptiler.com/geocoding/${encodeURIComponent(value)}.json?key=NBG4jfeqgblK0EpbS7Jp&limit=5`
        );
        const data = await response.json();
        if (data.features) {
          setAddressSuggestions(data.features);
        }
      } catch (error) {
        console.error('Autocomplete error:', error);
      }
    } else {
      setAddressSuggestions([]);
    }
  };

  // Select a suggestion
  const handleSelectSuggestion = (suggestion: any) => {
    const [lng, lat] = suggestion.center;
    console.log('🗺️ Selected suggestion:', suggestion.place_name);
    console.log('📍 Coordinates from API (GeoJSON):', 'lng:', lng, 'lat:', lat);
    console.log('🎯 Will call flyTo with [lat, lng]:', [lat, lng]);
    
    setNewSafeZoneAddress(suggestion.place_name);
    setAddressSuggestions([]);
    
    console.log('⏰ mapRef.current exists?', !!mapRef.current);
    if (mapRef.current) {
      console.log('✅ Calling flyTo...');
      mapRef.current.flyTo([lat, lng], 16);
    } else {
      console.log('❌ mapRef.current is null!');
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    console.log('Map clicked:', lat, lng, 'isCreatingSafeZone:', isCreatingSafeZone);
    if (isCreatingSafeZone) {
      // New click replaces previous pin
      setNewSafeZonePin([lat, lng]);
      showToast('info', `Pin placed at ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const handleOpenShareMenu = () => {
    setShowMapMenu(false);
    setShowShareMenu(true);
  };

  const handleShareOption = (duration: string) => {
    setHasActiveLinks(true);
    setActiveShareExpiry(duration);
    setShowShareMenu(false);
    showToast('success', `Location link created (${duration})`);
  };

  const handleStopSharing = () => {
    setHasActiveLinks(false);
    setActiveShareExpiry(null);
    setShowShareMenu(false);
    showToast('info', 'Stopped sharing location');
  };

  const handleSwitchToCreateMode = () => {
    setSafeZoneMode('create');
  };

  const handleGoToSafeZoneFromPopup = (zone: SafeZone) => {
    if (mapRef.current) {
      mapRef.current.flyTo(zone.center, 16);
      showToast('info', `Viewing ${zone.name}`);
    }
  };

  const handleDeleteSafeZoneFromPopup = (zoneId: string) => {
    const zone = safeZones.find(z => z.id === zoneId);
    setSafeZones(prev => prev.filter(z => z.id !== zoneId));
    if (zone) {
      showToast('info', `"${zone.name}" deleted`);
    }
    
    // Se não restarem zonas, mudar para modo de criação
    if (safeZones.length === 1) {
      setSafeZoneMode('create');
    }
  };

  // Memoize preview object to prevent unnecessary Map re-renders
  const previewSafeZone = useMemo(() => {
    if (showPreview) {
      return { center: mapCenter, radius: newSafeZoneRadius };
    }
    return null;
  }, [showPreview, mapCenter, newSafeZoneRadius]);

  return (
    <div className="flex flex-col h-full relative">
      {/* iOS Status Bar */}
      <StatusBar />
      
      {/* Map View - Edge to edge, no safe area top */}
      <div className="absolute inset-0">
        <Map 
          center={esterLocation} 
          zoom={15} 
          className="w-full h-full" 
          ref={mapRef} 
          onClick={handleMapClick}
          safeZones={safeZones}
          previewSafeZone={previewSafeZone}
        />
        
        {/* Fixed Center Pin for Safe Zone Creation */}
        {isCreatingSafeZone && safeZoneMode === 'create' && (
          <div className="absolute top-1/2 left-1/2 z-[90] pointer-events-none"
            style={{
              transform: 'translate(-50%, calc(-50% - 20px))', // Offset to point at bottom of pin
            }}
          >
            <motion.div
              initial={{ scale: 0, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: -50 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <MapPin 
                className="w-10 h-10 drop-shadow-lg" 
                style={{ 
                  color: 'var(--primary)',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                  fill: 'var(--primary)',
                }}
              />
            </motion.div>
          </div>
        )}

        {/* Safe Zone Creation UI */}
        {isCreatingSafeZone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute left-0 right-0 z-[90] px-3"
            style={{
              bottom: 'calc(env(safe-area-inset-bottom) + 110px)',
            }}
          >
            <div
              className="relative mx-auto max-w-sm"
            >
              {/* Address Suggestions - Above main popup */}
              {addressSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-0 right-0 max-h-48 overflow-y-auto mb-2 rounded-[var(--radius-card)] shadow-[var(--shadow-elevation-lg)]"
                  style={{
                    bottom: '100%',
                    backgroundColor: theme === 'dark' 
                      ? 'rgba(44, 44, 46, 0.95)' 
                      : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(30px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(30px) saturate(180%)',
                  }}
                >
                  {addressSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-secondary transition-colors flex items-start gap-2"
                    >
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="caption text-foreground line-clamp-2">{suggestion.place_name}</span>
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Main Popup */}
              <div 
                className="rounded-[var(--radius-card)] shadow-[var(--shadow-elevation-lg)] p-3"
                style={{
                  backgroundColor: theme === 'dark' 
                    ? 'rgba(44, 44, 46, 0.95)' 
                    : 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(30px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(30px) saturate(180%)',
                }}
              >
                {/* MODE: LIST - Show saved zones */}
                {safeZoneMode === 'list' && (
                  <>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <button
                        onClick={handleCancelSafeZone}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary active:scale-95 transition-all shrink-0"
                        aria-label="Cancel"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                      
                      <p className="flex-1 text-center">Safe Zones</p>
                      
                      <button
                        onClick={handleSwitchToCreateMode}
                        className="w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-all shrink-0"
                        style={{ backgroundColor: 'var(--primary)' }}
                        aria-label="Add new zone"
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    {/* Zones List */}
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {safeZones.map((zone) => (
                        <div
                          key={zone.id}
                          className="flex items-center gap-2 px-2.5 py-2.5 rounded-[var(--radius-button)] hover:bg-secondary transition-colors group"
                        >
                          <button
                            onClick={() => handleGoToSafeZoneFromPopup(zone)}
                            className="flex-1 flex items-center gap-2.5 text-left min-w-0"
                          >
                            <div 
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: 'var(--chart-2)' }}
                            ></div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate">{zone.name}</p>
                            </div>
                            <span className="caption text-muted-foreground shrink-0" style={{ fontSize: '11px' }}>
                              {zone.radius}m
                            </span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSafeZoneFromPopup(zone.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-destructive/10 rounded-full shrink-0"
                            aria-label="Delete zone"
                          >
                            <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--chart-4)' }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* MODE: CREATE - Create new zone */}
                {safeZoneMode === 'create' && (
                  <div className="space-y-2">
                    {/* Header - X (Cancel) + ✓ (Confirm) */}
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={handleCancelSafeZone}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary active:scale-95 transition-all shrink-0"
                        aria-label="Cancel"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                      
                      <button
                        onClick={handleConfirmSafeZone}
                        disabled={!newSafeZoneAddress.trim()}
                        className="w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-all shrink-0 disabled:opacity-40"
                        style={{ 
                          backgroundColor: newSafeZoneAddress.trim() ? 'var(--primary)' : 'var(--secondary)'
                        }}
                        aria-label="Confirm"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    {/* Address Input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                      <input
                        type="text"
                        value={newSafeZoneAddress}
                        onChange={handleAddressChange}
                        placeholder="Search address"
                        className="w-full pl-9 pr-3 py-2.5 rounded-[var(--radius-input)] bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        autoFocus
                      />
                    </div>

                    {/* Radius Slider - Inline */}
                    <div className="flex items-center gap-3 px-1">
                      <label className="caption text-muted-foreground whitespace-nowrap shrink-0">
                        Radius
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="1000"
                        step="50"
                        value={newSafeZoneRadius}
                        onChange={(e) => setNewSafeZoneRadius(Number(e.target.value))}
                        className="flex-1 h-2 bg-secondary rounded-full appearance-none cursor-pointer"
                        style={{
                          accentColor: 'var(--primary)',
                        }}
                      />
                      <span className="caption text-foreground whitespace-nowrap shrink-0 min-w-[50px] text-right">
                        {newSafeZoneRadius}m
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Settings Button - Top Right with safe area */}
        <div 
          className="absolute right-4 z-[50]"
          style={{
            top: 'calc(env(safe-area-inset-top) + 56px)',
          }}
        >
          <button 
            onClick={() => onNavigate('settings')}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-[var(--shadow-elevation-md)] hover:bg-secondary active:scale-95 transition-all"
            style={{
              backgroundColor: theme === 'dark' 
                ? 'rgba(44, 44, 46, 0.9)' 
                : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            }}
            aria-label="Open settings"
          >
            <Settings className="w-5 h-5 text-foreground" />
          </button>
        </div>
        
        {/* Floating Action Buttons with Glassmorphism */}
        {sheetPosition !== 'full' && (
          <div 
            className="absolute right-4 z-[50] transition-all duration-300"
            style={{
              bottom: sheetPosition === 'collapsed' 
                ? 'calc(12% + 45px)' 
                : 'calc(26% + 45px)',
            }}
          >
            {/* Map Actions Menu - Floating Bubbles */}
            <div className="relative flex flex-col items-end gap-3">
              {/* Action Buttons - Slide up from main button */}
              <AnimatePresence>
                {showMapMenu && !showShareMenu && (
                  <>
                    {/* Button 3: Add Safe Zone */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      onClick={handleAddSafeZone}
                      className="w-12 h-12 rounded-full flex items-center justify-center shadow-[var(--shadow-elevation-md)] active:scale-95 transition-all relative"
                      style={{
                        backgroundColor: theme === 'dark' 
                          ? 'rgba(44, 44, 46, 0.9)' 
                          : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                      }}
                      aria-label="Add safe zone"
                    >
                      <MapPin className="w-5 h-5 text-white" />
                      {safeZones.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-chart-2 text-white rounded-full border-2 border-white flex items-center justify-center" style={{ fontSize: '10px' }}>
                          {safeZones.length}
                        </span>
                      )}
                    </motion.button>

                    {/* Button 2: Share Location */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      onClick={handleOpenShareMenu}
                      className="w-12 h-12 rounded-full flex items-center justify-center shadow-[var(--shadow-elevation-md)] active:scale-95 transition-all relative"
                      style={{
                        backgroundColor: theme === 'dark' 
                          ? 'rgba(44, 44, 46, 0.9)' 
                          : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                      }}
                      aria-label="Share location"
                    >
                      <Share2 className="w-5 h-5 text-white" />
                      {hasActiveLinks && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-chart-3 rounded-full border-2 border-white"></span>
                      )}
                    </motion.button>

                    {/* Button 1: Center on Emma */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      onClick={handleCenterOnEster}
                      className="w-12 h-12 rounded-full flex items-center justify-center shadow-[var(--shadow-elevation-md)] active:scale-95 transition-all"
                      style={{
                        backgroundColor: theme === 'dark' 
                          ? 'rgba(44, 44, 46, 0.9)' 
                          : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                      }}
                      aria-label="Center on Emma"
                    >
                      <Navigation className="w-5 h-5 text-white" />
                    </motion.button>
                  </>
                )}
              </AnimatePresence>

              {/* Share Duration Submenu */}
              <AnimatePresence>
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-[var(--radius-card)] shadow-[var(--shadow-elevation-lg)] overflow-hidden min-w-[200px]"
                    style={{
                      backgroundColor: theme === 'dark' 
                        ? 'rgba(44, 44, 46, 0.95)' 
                        : 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(30px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(30px) saturate(180%)',
                    }}
                  >
                    <div className="px-4 py-2 border-b border-border">
                      <p className="caption text-muted-foreground">Share duration</p>
                    </div>

                    <button
                      onClick={() => handleShareOption('1 hour')}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors"
                    >
                      <span>1 hour</span>
                    </button>

                    <button
                      onClick={() => handleShareOption('4 hours')}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors"
                    >
                      <span>4 hours</span>
                    </button>

                    <button
                      onClick={() => handleShareOption('8 hours')}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors"
                    >
                      <span>8 hours</span>
                    </button>

                    <button
                      onClick={() => handleShareOption('No expiry')}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors"
                    >
                      <span>No expiry (∞)</span>
                    </button>

                    {hasActiveLinks && (
                      <>
                        <div className="h-px bg-border"></div>
                        <button
                          onClick={handleStopSharing}
                          className="w-full flex items-center gap-3 px-4 py-3 transition-colors"
                          style={{
                            backgroundColor: theme === 'dark' 
                              ? 'rgba(255, 69, 58, 0.15)' 
                              : 'rgba(255, 59, 48, 0.1)',
                            color: 'var(--chart-4)',
                          }}
                        >
                          <X className="w-5 h-5" />
                          <span>Stop Sharing</span>
                        </button>
                      </>
                    )}

                    <div className="h-px bg-border"></div>
                    
                    <button
                      onClick={() => setShowShareMenu(false)}
                      className="w-full px-4 py-2 hover:bg-secondary transition-colors caption text-muted-foreground"
                    >
                      Back
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Menu Toggle Button */}
              <button 
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-[var(--shadow-elevation-md)] hover:bg-secondary active:scale-95 transition-all relative"
                style={{
                  backgroundColor: (showMapMenu || showShareMenu || hasActiveLinks)
                    ? 'var(--primary)'
                    : (theme === 'dark' 
                        ? 'rgba(44, 44, 46, 0.9)' 
                        : 'rgba(255, 255, 255, 0.9)'),
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                }}
                aria-label="Map actions menu"
                onClick={() => {
                  if (showShareMenu) {
                    setShowShareMenu(false);
                  } else {
                    setShowMapMenu(!showMapMenu);
                  }
                }}
              >
                <Menu 
                  className="w-5 h-5" 
                  style={{
                    color: (showMapMenu || showShareMenu || hasActiveLinks) 
                      ? 'white' 
                      : 'var(--foreground)'
                  }}
                />
                {hasActiveLinks && !showMapMenu && !showShareMenu && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-chart-3 rounded-full border-2 border-white"></span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sheet with Waze-style behavior */}
      <BottomSheet 
        position={sheetPosition} 
        onPositionChange={setSheetPosition}
        isDragDisabled={isCreatingSafeZone} // Disable drag during safe zone creation
      >
        <div className="flex flex-col h-full">
          {/* Location Card - Always visible and sticky */}
          <div className="px-4 pt-0 pb-4 shrink-0">
            <div className="bg-card rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-elevation-sm)]">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="mb-1">Ester is at school</p>
                  <p className="text-muted-foreground">Oak Elementary School</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="px-3 py-1.5 bg-chart-2 text-white rounded-[var(--radius-button)] caption flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                      SAFE
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-chart-2 rounded opacity-80"></div>
                  <span className="caption text-muted-foreground">Battery: 85%</span>
                </div>
                <span className="caption text-muted-foreground">2 minutes ago</span>
              </div>
            </div>
          </div>

          {/* Timeline - Scrollable area */}
          {sheetPosition === 'full' && (
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto px-4">
                <div className="space-y-6 pb-20">
                  {weekData.map((dayData, dayIndex) => (
                    <div key={dayIndex}>
                      <label 
                        className="block mb-3 uppercase tracking-wide caption" 
                        style={{ 
                          fontSize: 'var(--text-label)',
                          color: 'var(--muted-foreground)',
                        }}
                      >
                        {dayData.day}
                      </label>
                      
                      <div className="space-y-3">
                        {dayData.events.map((event, eventIndex) => {
                          const isLast = eventIndex === dayData.events.length - 1;

                          return (
                            <div key={eventIndex} className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div className={`w-2 h-2 ${getStatusColor(event.status)} rounded-full`}></div>
                                {!isLast && <div className="w-0.5 h-full bg-border"></div>}
                              </div>
                              <div className={`flex-1 ${!isLast ? 'pb-4' : ''}`}>
                                <p className="mb-1">{event.action}</p>
                                <p className="text-muted-foreground caption">{event.time} • {event.location}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Extra spacing at bottom for scroll */}
                  {sheetPosition === 'full' && <div className="h-20"></div>}
                </div>
              </div>
            </div>
          )}
        </div>
      </BottomSheet>

      {/* Bottom Navigation - Fixed at bottom, always visible */}
      <BottomNav active="dashboard" onNavigate={onNavigate} />
      
      {/* Name Dialog Modal - Shown after confirming safe zone */}
      <AnimatePresence>
        {showNameDialog && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[100]"
              onClick={handleCancelNameDialog}
            />
            
            {/* Dialog */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="w-full max-w-sm rounded-[var(--radius-card)] shadow-[var(--shadow-elevation-lg)] p-5"
                style={{
                  backgroundColor: theme === 'dark' 
                    ? 'rgba(44, 44, 46, 0.98)' 
                    : 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(40px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                }}
              >
                {/* Header with close and confirm buttons */}
                <div className="flex items-start justify-between mb-2 -mt-1">
                  <div className="flex-1">
                    <h3>Name this safe zone</h3>
                  </div>
                  <div className="flex gap-2 -mt-1 -mr-1">
                    <button
                      onClick={handleCancelNameDialog}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary active:scale-95 transition-all"
                      aria-label="Cancel"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleSaveSafeZone}
                      disabled={!newSafeZoneName.trim()}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white active:scale-95 transition-all disabled:opacity-40"
                      style={{ 
                        backgroundColor: newSafeZoneName.trim() ? 'var(--primary)' : 'var(--secondary)'
                      }}
                      aria-label="Create"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <p className="text-muted-foreground caption mb-4">
                  {newSafeZoneAddress}
                </p>
                
                <input
                  type="text"
                  value={newSafeZoneName}
                  onChange={(e) => setNewSafeZoneName(e.target.value)}
                  placeholder="e.g. Home, School, Grandma's house"
                  className="w-full px-3 py-2.5 rounded-[var(--radius-input)] bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newSafeZoneName.trim()) {
                      handleSaveSafeZone();
                    }
                  }}
                />
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
      
      {ToastComponent}
    </div>
  );
}