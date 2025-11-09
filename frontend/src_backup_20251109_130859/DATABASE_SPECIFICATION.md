# 📊 KIMI Database Specification - Supabase Cloud

## 🎯 OBJECTIVE

Create the complete database schema for the KIMI application on Supabase Cloud (KIMI-DEV environment), including all tables, relationships, constraints, Row Level Security (RLS) policies, indexes, triggers, and initial seed data. This database will support the entire KIMI ecosystem: caregivers monitoring loved ones through wearable devices with GPS tracking and biometric sensors.

---

## 📋 DATABASE REQUIREMENTS ANALYSIS

Based on comprehensive frontend code analysis, the KIMI application requires storage for:

### **Core Entities**
1. **Caregivers** - Users who monitor loved ones (linked to Supabase Auth)
2. **Loved Ones** - Individuals being monitored (wear KIMI device)
3. **GPS Location History** - Real-time and historical location tracking
4. **Health Metrics** - Biometric data from wearable sensors
5. **Safe Zones** - Geographic boundaries with alert capabilities
6. **Activities & Events** - Timeline of significant events and checkpoints
7. **Alerts & Notifications** - System-generated alerts for caregivers
8. **Chat Messages** - Conversations with KIMI AI assistant
9. **Emergency Contacts** - Quick access contact list
10. **User Preferences** - Settings and notification preferences
11. **Location Sharing** - Temporary location sharing links

---

## 🗂️ DETAILED SCHEMA DESIGN

### **1. TABLE: `caregivers`**

Stores caregiver profiles, linked 1:1 with Supabase Auth users.

```sql
CREATE TABLE caregivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  full_name TEXT NOT NULL,
  role TEXT, -- e.g., "Dad", "Mom", "Nurse", "Professional Caregiver"
  phone TEXT,
  email TEXT NOT NULL,
  avatar_url TEXT,
  
  -- Account Status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_caregivers_user_id ON caregivers(user_id);
CREATE INDEX idx_caregivers_email ON caregivers(email);

-- RLS Policies
ALTER TABLE caregivers ENABLE ROW LEVEL SECURITY;

-- Caregivers can view and edit their own profile
CREATE POLICY "Caregivers can view own profile"
  ON caregivers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Caregivers can update own profile"
  ON caregivers FOR UPDATE
  USING (user_id = auth.uid());

-- Automatically create caregiver profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO caregivers (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**Frontend Usage:**
- Settings screen displays caregiver profile with edit functionality
- Used for authentication and authorization throughout the app

---

### **2. TABLE: `loved_ones`**

Stores profiles of individuals being monitored.

```sql
CREATE TABLE loved_ones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caregiver_id UUID NOT NULL REFERENCES caregivers(id) ON DELETE CASCADE,
  
  -- Personal Information
  full_name TEXT NOT NULL,
  age INTEGER,
  date_of_birth DATE,
  condition TEXT, -- e.g., "Autism Spectrum", "Dementia", "Alzheimer's"
  address TEXT,
  avatar_url TEXT,
  
  -- Device Information
  device_id TEXT UNIQUE NOT NULL, -- KIMI wearable device identifier (e.g., "KIMI-8472")
  device_status TEXT DEFAULT 'active' CHECK (device_status IN ('active', 'offline', 'maintenance')),
  last_seen_at TIMESTAMPTZ,
  
  -- Settings
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_loved_ones_caregiver_id ON loved_ones(caregiver_id);
CREATE INDEX idx_loved_ones_device_id ON loved_ones(device_id);
CREATE INDEX idx_loved_ones_device_status ON loved_ones(device_status);

-- RLS Policies
ALTER TABLE loved_ones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers can view their loved ones"
  ON loved_ones FOR SELECT
  USING (
    caregiver_id IN (
      SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Caregivers can manage their loved ones"
  ON loved_ones FOR ALL
  USING (
    caregiver_id IN (
      SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
  );
```

**Frontend Usage:**
- Settings screen shows loved one profile with edit functionality
- Dashboard header shows loved one's name and current status
- Multiple loved ones per caregiver support (future expansion)

---

### **3. TABLE: `gps_locations`**

Stores GPS location history from the wearable device.

```sql
CREATE TABLE gps_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loved_one_id UUID NOT NULL REFERENCES loved_ones(id) ON DELETE CASCADE,
  
  -- Location Data
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy FLOAT, -- GPS accuracy in meters
  altitude FLOAT, -- Altitude in meters (optional)
  
  -- Movement Data
  speed FLOAT, -- Speed in km/h
  heading FLOAT, -- Direction of movement (0-360 degrees)
  
  -- Device Status
  battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
  
  -- Timestamp
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_gps_locations_loved_one_id ON gps_locations(loved_one_id);
CREATE INDEX idx_gps_locations_recorded_at ON gps_locations(recorded_at DESC);
CREATE INDEX idx_gps_locations_loved_one_recorded ON gps_locations(loved_one_id, recorded_at DESC);

-- GiST index for geospatial queries (safe zone detection)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE INDEX idx_gps_locations_coordinates ON gps_locations USING GIST (
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
);

-- RLS Policies
ALTER TABLE gps_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers can view loved ones locations"
  ON gps_locations FOR SELECT
  USING (
    loved_one_id IN (
      SELECT lo.id FROM loved_ones lo
      JOIN caregivers c ON lo.caregiver_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- Wearable devices can insert location data (via service role)
-- Frontend cannot insert directly
```

**Frontend Usage:**
- Dashboard map shows current location (latest GPS point)
- Historical location tracking for movement patterns
- Battery level display in UI

---

### **4. TABLE: `health_metrics`**

Stores biometric sensor data from the wearable device.

```sql
CREATE TABLE health_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loved_one_id UUID NOT NULL REFERENCES loved_ones(id) ON DELETE CASCADE,
  
  -- Cardiovascular Metrics
  heart_rate INTEGER, -- beats per minute
  resting_heart_rate INTEGER, -- resting BPM
  hrv_index TEXT CHECK (hrv_index IN ('Low', 'Normal', 'High')), -- Heart Rate Variability
  
  -- Stress & Wellness
  stress_score INTEGER CHECK (stress_score >= 0 AND stress_score <= 100), -- 0=worst, 100=best
  wellness_load INTEGER CHECK (wellness_load >= 0 AND wellness_load <= 100), -- Composite score
  
  -- Respiration
  breathing_stability TEXT CHECK (breathing_stability IN ('Stable', 'Variable', 'Elevated')),
  respiratory_rate INTEGER, -- breaths per minute
  
  -- Skin Response
  gsr_reactivity TEXT CHECK (gsr_reactivity IN ('Normal', 'Elevated', 'High Reactivity')), -- Galvanic Skin Response
  
  -- Body Temperature
  temperature FLOAT, -- in Celsius
  
  -- Activity Metrics
  steps INTEGER DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  active_minutes INTEGER DEFAULT 0,
  
  -- Sleep Metrics
  sleep_hours FLOAT, -- total sleep in hours
  sleep_quality TEXT CHECK (sleep_quality IN ('Poor', 'Fair', 'Good', 'Excellent')),
  
  -- Recovery Window
  peak_recovery_start TIME,
  peak_recovery_end TIME,
  
  -- Timestamp
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_health_metrics_loved_one_id ON health_metrics(loved_one_id);
CREATE INDEX idx_health_metrics_recorded_at ON health_metrics(recorded_at DESC);
CREATE INDEX idx_health_metrics_loved_one_recorded ON health_metrics(loved_one_id, recorded_at DESC);

-- RLS Policies
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers can view loved ones health metrics"
  ON health_metrics FOR SELECT
  USING (
    loved_one_id IN (
      SELECT lo.id FROM loved_ones lo
      JOIN caregivers c ON lo.caregiver_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );
```

**Frontend Usage:**
- Health screen displays all biometric metrics with charts
- Stress circle component shows stress_score
- Vital signs grid shows HRV, resting HR, breathing, GSR
- Daily wellness load composite score
- Stress trend chart (last 24 hours)

---

### **5. TABLE: `safe_zones`**

Stores geographic safe zones with alert capabilities.

```sql
CREATE TABLE safe_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loved_one_id UUID NOT NULL REFERENCES loved_ones(id) ON DELETE CASCADE,
  caregiver_id UUID NOT NULL REFERENCES caregivers(id) ON DELETE CASCADE,
  
  -- Zone Information
  name TEXT NOT NULL, -- e.g., "Home", "School", "Park"
  latitude DOUBLE PRECISION NOT NULL, -- Center point
  longitude DOUBLE PRECISION NOT NULL,
  radius INTEGER NOT NULL CHECK (radius >= 50 AND radius <= 10000), -- in meters (50m to 10km)
  
  -- Visual Settings
  color TEXT DEFAULT '#34C759', -- Hex color for map visualization
  
  -- Alert Settings
  notifications_enabled BOOLEAN DEFAULT true,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_safe_zones_loved_one_id ON safe_zones(loved_one_id);
CREATE INDEX idx_safe_zones_caregiver_id ON safe_zones(caregiver_id);
CREATE INDEX idx_safe_zones_is_active ON safe_zones(is_active) WHERE is_active = true;

-- GiST index for geospatial queries
CREATE INDEX idx_safe_zones_coordinates ON safe_zones USING GIST (
  ST_Buffer(
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
    radius
  )::geometry
);

-- RLS Policies
ALTER TABLE safe_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers can manage their loved ones safe zones"
  ON safe_zones FOR ALL
  USING (
    caregiver_id IN (
      SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
  );
```

**Frontend Usage:**
- Dashboard map displays safe zones as colored circles
- Map menu allows creation, editing, deletion of safe zones
- Address search with autocomplete for safe zone creation
- Radius slider (50m - 1000m)
- Safe zones list in popup with "go to" and "delete" actions

---

### **6. TABLE: `activities`**

Stores timeline events and significant activities detected by the system.

```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loved_one_id UUID NOT NULL REFERENCES loved_ones(id) ON DELETE CASCADE,
  
  -- Activity Type
  type TEXT NOT NULL CHECK (type IN (
    'walking', 'running', 'resting', 'sleeping',
    'high_stress', 'calm_period',
    'zone_entry', 'zone_exit',
    'arrived_at', 'left_from',
    'unusual_inactivity', 'elevated_heart_rate',
    'low_battery', 'device_offline',
    'custom'
  )),
  
  -- Activity Details
  title TEXT NOT NULL, -- e.g., "Arrived at school", "High stress detected"
  description TEXT, -- e.g., "Oak Elementary", "Stress level: 85"
  
  -- Status/Severity
  status TEXT NOT NULL DEFAULT 'info' CHECK (status IN (
    'safe', 'info', 'rest', 'warning', 'alert', 'positive'
  )),
  
  -- Location Context (optional)
  location_name TEXT, -- e.g., "Oak Elementary", "Downtown"
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  
  -- Related Safe Zone (if applicable)
  safe_zone_id UUID REFERENCES safe_zones(id) ON DELETE SET NULL,
  
  -- Additional Data (flexible JSON for future extensibility)
  metadata JSONB DEFAULT '{}',
  
  -- Timestamp
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activities_loved_one_id ON activities(loved_one_id);
CREATE INDEX idx_activities_occurred_at ON activities(occurred_at DESC);
CREATE INDEX idx_activities_loved_one_occurred ON activities(loved_one_id, occurred_at DESC);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_status ON activities(status);

-- RLS Policies
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers can view loved ones activities"
  ON activities FOR SELECT
  USING (
    loved_one_id IN (
      SELECT lo.id FROM loved_ones lo
      JOIN caregivers c ON lo.caregiver_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );
```

**Frontend Usage:**
- Dashboard bottom sheet shows "Today's Activity" timeline
- Checkpoints with time, action, location, and status indicators
- Color-coded status (safe=green, warning=yellow, alert=red, etc.)
- Last 7 days of activity grouped by day
- Expandable to show historical checkpoints

---

### **7. TABLE: `alerts`**

Stores system-generated alerts and notifications for caregivers.

```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caregiver_id UUID NOT NULL REFERENCES caregivers(id) ON DELETE CASCADE,
  loved_one_id UUID NOT NULL REFERENCES loved_ones(id) ON DELETE CASCADE,
  
  -- Alert Type
  type TEXT NOT NULL CHECK (type IN (
    'safe_zone_breach',
    'safe_zone_exit',
    'safe_zone_entry',
    'high_stress',
    'elevated_heart_rate',
    'low_battery',
    'device_offline',
    'unusual_inactivity',
    'fall_detected',
    'custom'
  )),
  
  -- Severity
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Alert Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Related Activity (optional)
  activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  
  -- Alert Status
  is_read BOOLEAN DEFAULT false,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  
  -- Timestamp
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_alerts_caregiver_id ON alerts(caregiver_id);
CREATE INDEX idx_alerts_loved_one_id ON alerts(loved_one_id);
CREATE INDEX idx_alerts_triggered_at ON alerts(triggered_at DESC);
CREATE INDEX idx_alerts_is_read ON alerts(is_read) WHERE is_read = false;
CREATE INDEX idx_alerts_severity ON alerts(severity);

-- RLS Policies
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers can view their alerts"
  ON alerts FOR SELECT
  USING (
    caregiver_id IN (
      SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Caregivers can update their alerts"
  ON alerts FOR UPDATE
  USING (
    caregiver_id IN (
      SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
  );
```

**Frontend Usage:**
- Push notifications to caregiver mobile device
- Alert badge indicators in UI
- Notification settings in Settings screen control which alerts are enabled
- Toast notifications for real-time alerts

---

### **8. TABLE: `chat_messages`**

Stores conversation history with the KIMI AI assistant.

```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caregiver_id UUID NOT NULL REFERENCES caregivers(id) ON DELETE CASCADE,
  
  -- Message Content
  text TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  
  -- AI Context (for improving responses over time)
  ai_context JSONB, -- Stores what data the AI used to generate response
  
  -- Timestamp
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_chat_messages_caregiver_id ON chat_messages(caregiver_id);
CREATE INDEX idx_chat_messages_sent_at ON chat_messages(sent_at DESC);
CREATE INDEX idx_chat_messages_caregiver_sent ON chat_messages(caregiver_id, sent_at DESC);

-- RLS Policies
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers can view their chat messages"
  ON chat_messages FOR SELECT
  USING (
    caregiver_id IN (
      SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Caregivers can insert their chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    caregiver_id IN (
      SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
  );
```

**Frontend Usage:**
- ChatAssistant screen displays conversation history
- User messages and AI responses with timestamps
- AI provides insights about stress, location, health patterns
- Context stored for improving future AI responses

---

### **9. TABLE: `emergency_contacts`**

Stores quick-access emergency contact information.

```sql
CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caregiver_id UUID NOT NULL REFERENCES caregivers(id) ON DELETE CASCADE,
  loved_one_id UUID REFERENCES loved_ones(id) ON DELETE CASCADE, -- Optional: specific to loved one
  
  -- Contact Information
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT, -- e.g., "Mother", "Therapist", "Emergency Services"
  
  -- Priority
  priority INTEGER DEFAULT 0, -- Higher number = higher priority
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_emergency_contacts_caregiver_id ON emergency_contacts(caregiver_id);
CREATE INDEX idx_emergency_contacts_loved_one_id ON emergency_contacts(loved_one_id);
CREATE INDEX idx_emergency_contacts_priority ON emergency_contacts(priority DESC);

-- RLS Policies
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers can manage their emergency contacts"
  ON emergency_contacts FOR ALL
  USING (
    caregiver_id IN (
      SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
  );
```

**Frontend Usage:**
- Settings screen displays emergency contacts list
- Add, edit, delete functionality
- Quick dial from alerts or emergency situations

---

### **10. TABLE: `caregiver_preferences`**

Stores user preferences and settings.

```sql
CREATE TABLE caregiver_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caregiver_id UUID NOT NULL UNIQUE REFERENCES caregivers(id) ON DELETE CASCADE,
  
  -- Notification Preferences
  notify_safe_zone_breaches BOOLEAN DEFAULT true,
  notify_low_battery BOOLEAN DEFAULT true,
  notify_device_offline BOOLEAN DEFAULT false,
  notify_high_stress BOOLEAN DEFAULT true,
  notify_elevated_heart_rate BOOLEAN DEFAULT true,
  notify_unusual_inactivity BOOLEAN DEFAULT true,
  
  -- Display Preferences
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'en',
  
  -- Map Preferences
  default_map_zoom INTEGER DEFAULT 15,
  show_location_history BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_caregiver_preferences_caregiver_id ON caregiver_preferences(caregiver_id);

-- RLS Policies
ALTER TABLE caregiver_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers can manage their preferences"
  ON caregiver_preferences FOR ALL
  USING (
    caregiver_id IN (
      SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
  );

-- Automatically create preferences when caregiver is created
CREATE OR REPLACE FUNCTION handle_new_caregiver()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO caregiver_preferences (caregiver_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_caregiver_created
  AFTER INSERT ON caregivers
  FOR EACH ROW EXECUTE FUNCTION handle_new_caregiver();
```

**Frontend Usage:**
- Settings screen notification toggles
- Theme preference (light/dark mode)
- Future: language selection, map customization

---

### **11. TABLE: `location_shares`**

Stores temporary location sharing links for external users.

```sql
CREATE TABLE location_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caregiver_id UUID NOT NULL REFERENCES caregivers(id) ON DELETE CASCADE,
  loved_one_id UUID NOT NULL REFERENCES loved_ones(id) ON DELETE CASCADE,
  
  -- Share Link
  share_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  
  -- Expiry
  duration TEXT NOT NULL, -- e.g., "1 hour", "4 hours", "8 hours", "No expiry"
  expires_at TIMESTAMPTZ, -- NULL for no expiry
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_location_shares_caregiver_id ON location_shares(caregiver_id);
CREATE INDEX idx_location_shares_loved_one_id ON location_shares(loved_one_id);
CREATE INDEX idx_location_shares_share_token ON location_shares(share_token);
CREATE INDEX idx_location_shares_expires_at ON location_shares(expires_at) WHERE expires_at IS NOT NULL;

-- RLS Policies
ALTER TABLE location_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers can manage their location shares"
  ON location_shares FOR ALL
  USING (
    caregiver_id IN (
      SELECT id FROM caregivers WHERE user_id = auth.uid()
    )
  );

-- Public access for valid share links (via Edge Function)
```

**Frontend Usage:**
- Dashboard map menu "Share Location" option
- Duration selection (1h, 4h, 8h, no expiry)
- Stop sharing button when active
- Visual indicator of active share link

---

## 🔧 ADDITIONAL DATABASE FEATURES

### **Updated_at Trigger Function**

Automatically update `updated_at` timestamp on row updates.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER update_caregivers_updated_at BEFORE UPDATE ON caregivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loved_ones_updated_at BEFORE UPDATE ON loved_ones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_safe_zones_updated_at BEFORE UPDATE ON safe_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_caregiver_preferences_updated_at BEFORE UPDATE ON caregiver_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **Safe Zone Breach Detection Function**

Automatically create alerts when loved one exits safe zone.

```sql
CREATE OR REPLACE FUNCTION check_safe_zone_breach()
RETURNS TRIGGER AS $$
DECLARE
  zone RECORD;
  caregiver_id_var UUID;
  distance_meters FLOAT;
BEGIN
  -- Get caregiver_id for this loved one
  SELECT caregiver_id INTO caregiver_id_var
  FROM loved_ones WHERE id = NEW.loved_one_id;

  -- Check all active safe zones for this loved one
  FOR zone IN
    SELECT * FROM safe_zones
    WHERE loved_one_id = NEW.loved_one_id
      AND is_active = true
      AND notifications_enabled = true
  LOOP
    -- Calculate distance from zone center
    distance_meters := ST_Distance(
      ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography,
      ST_SetSRID(ST_MakePoint(zone.longitude, zone.latitude), 4326)::geography
    );

    -- If outside safe zone radius, create alert
    IF distance_meters > zone.radius THEN
      INSERT INTO alerts (
        caregiver_id,
        loved_one_id,
        type,
        severity,
        title,
        message,
        triggered_at
      ) VALUES (
        caregiver_id_var,
        NEW.loved_one_id,
        'safe_zone_breach',
        'high',
        'Left Safe Zone',
        'Left "' || zone.name || '" safe zone',
        NEW.recorded_at
      )
      ON CONFLICT DO NOTHING; -- Prevent duplicate alerts
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_gps_location_inserted
  AFTER INSERT ON gps_locations
  FOR EACH ROW EXECUTE FUNCTION check_safe_zone_breach();
```

---

## 🌱 SEED DATA

Initial data for development and testing.

```sql
-- 1. Insert Caregiver (Emerson Ferreira)
-- Note: This will be automatically created when Emerson signs up via Supabase Auth
-- Manual insert for DEV environment (replace with actual auth user_id after signup):

-- Assuming auth user created with email: emersonaidev@gmail.com
-- Get the user_id from Supabase Auth dashboard and use it here

INSERT INTO caregivers (user_id, full_name, role, phone, email, is_verified)
VALUES (
  '00000000-0000-0000-0000-000000000001', -- Replace with actual auth.users.id
  'Emerson Ferreira',
  'Dad',
  '(555) 123-4567',
  'emersonaidev@gmail.com',
  true
);

-- 2. Insert Loved One (Ester Ferreira)
INSERT INTO loved_ones (caregiver_id, full_name, age, date_of_birth, condition, address, device_id, device_status)
VALUES (
  (SELECT id FROM caregivers WHERE email = 'emersonaidev@gmail.com'),
  'Ester Ferreira',
  18,
  '2007-11-09',
  'Autism Spectrum',
  '123 Main St, Lisbon, Portugal',
  'KIMI-8472',
  'active'
);

-- 3. Insert Safe Zones
INSERT INTO safe_zones (loved_one_id, caregiver_id, name, latitude, longitude, radius, color, notifications_enabled)
VALUES
  (
    (SELECT id FROM loved_ones WHERE device_id = 'KIMI-8472'),
    (SELECT id FROM caregivers WHERE email = 'emersonaidev@gmail.com'),
    'Home',
    38.7223,
    -9.1393,
    200,
    '#34C759',
    true
  ),
  (
    (SELECT id FROM loved_ones WHERE device_id = 'KIMI-8472'),
    (SELECT id FROM caregivers WHERE email = 'emersonaidev@gmail.com'),
    'School',
    38.7250,
    -9.1420,
    150,
    '#34C759',
    true
  ),
  (
    (SELECT id FROM loved_ones WHERE device_id = 'KIMI-8472'),
    (SELECT id FROM caregivers WHERE email = 'emersonaidev@gmail.com'),
    'Park',
    38.7280,
    -9.1450,
    300,
    '#34C759',
    true
  );

-- 4. Insert Emergency Contacts
INSERT INTO emergency_contacts (caregiver_id, loved_one_id, name, phone, relationship, priority)
VALUES
  (
    (SELECT id FROM caregivers WHERE email = 'emersonaidev@gmail.com'),
    (SELECT id FROM loved_ones WHERE device_id = 'KIMI-8472'),
    'Sarah Johnson (Mother)',
    '(555) 123-4567',
    'Mother',
    3
  ),
  (
    (SELECT id FROM caregivers WHERE email = 'emersonaidev@gmail.com'),
    (SELECT id FROM loved_ones WHERE device_id = 'KIMI-8472'),
    'Dr. Martinez (Therapist)',
    '(555) 234-5678',
    'Therapist',
    2
  ),
  (
    (SELECT id FROM caregivers WHERE email = 'emersonaidev@gmail.com'),
    (SELECT id FROM loved_ones WHERE device_id = 'KIMI-8472'),
    'Emergency Services',
    '112',
    'Emergency',
    1
  );

-- 5. Insert GPS Location History (Last 24 Hours - Sample Data)
-- Current location: At school (Oak Elementary, Lisbon)
INSERT INTO gps_locations (loved_one_id, latitude, longitude, accuracy, speed, battery_level, recorded_at)
SELECT
  (SELECT id FROM loved_ones WHERE device_id = 'KIMI-8472'),
  38.7250 + (random() * 0.001 - 0.0005), -- Small variations around school
  -9.1420 + (random() * 0.001 - 0.0005),
  5 + random() * 10, -- 5-15m accuracy
  0, -- stationary at school
  85 - (extract(hour from NOW() - interval '1 hour' * generate_series) * 2), -- Battery drains ~2% per hour
  NOW() - interval '1 hour' * generate_series
FROM generate_series(0, 23) -- Last 24 hours, one point per hour
WHERE extract(hour from NOW() - interval '1 hour' * generate_series) >= 8 -- Only during waking hours
   OR extract(hour from NOW() - interval '1 hour' * generate_series) <= 22;

-- 6. Insert Health Metrics (Last 24 Hours - Sample Data)
INSERT INTO health_metrics (
  loved_one_id,
  heart_rate,
  resting_heart_rate,
  hrv_index,
  stress_score,
  wellness_load,
  breathing_stability,
  gsr_reactivity,
  temperature,
  steps,
  calories_burned,
  active_minutes,
  sleep_hours,
  sleep_quality,
  recorded_at
)
SELECT
  (SELECT id FROM loved_ones WHERE device_id = 'KIMI-8472'),
  65 + (random() * 30)::INTEGER, -- 65-95 BPM
  68,
  'Normal',
  CASE
    WHEN extract(hour from NOW() - interval '1 hour' * generate_series) = 16 THEN 25 -- High stress at 4 PM
    WHEN extract(hour from NOW() - interval '1 hour' * generate_series) BETWEEN 12 AND 14 THEN 55
    ELSE 70 + (random() * 20)::INTEGER -- Normal: 70-90
  END,
  42,
  'Stable',
  'Normal',
  36.6 + (random() * 0.4), -- 36.6-37.0°C
  (extract(hour from NOW() - interval '1 hour' * generate_series) * 500)::INTEGER, -- Steps accumulate
  (extract(hour from NOW() - interval '1 hour' * generate_series) * 40)::INTEGER, -- Calories
  (CASE WHEN extract(hour from NOW() - interval '1 hour' * generate_series) BETWEEN 8 AND 17 THEN 45 ELSE 5 END),
  8.2, -- Last night's sleep
  'Good',
  NOW() - interval '1 hour' * generate_series
FROM generate_series(0, 23);

-- 7. Insert Activities (Last 7 Days - Sample Checkpoints)
INSERT INTO activities (loved_one_id, type, title, description, status, location_name, occurred_at)
VALUES
  -- Today
  ((SELECT id FROM loved_ones WHERE device_id = 'KIMI-8472'), 'arrived_at', 'At school', 'Oak Elementary', 'safe', 'Oak Elementary', NOW() - interval '2 hours 15 minutes'),
  ((SELECT id FROM loved_ones WHERE device_id = 'KIMI-8472'), 'high_stress', '⚠️ High stress detected', 'Stress level: 85', 'warning', NULL, NOW() - interval '4 hours 45 minutes'),
  ((SELECT id FROM loved_ones WHERE device_id = 'KIMI-8472'), 'arrived_at', 'Arrived at school', 'Oak Elementary', 'safe', 'Oak Elementary', NOW() - interval '8 hours 34 minutes'),
  ((SELECT id FROM loved_ones WHERE device_id = 'KIMI-8472'), 'zone_exit', 'Left home', 'Safe zone exit', 'info', NULL, NOW() - interval '8 hours 56 minutes'),
  ((SELECT id FROM loved_ones WHERE device_id = 'KIMI-8472'), 'sleeping', 'Woke up', '8h 12m sleep', 'rest', NULL, NOW() - interval '9 hours 53 minutes'),
  
  -- Yesterday
  ((SELECT id FROM loved_ones WHERE device_id = 'KIMI-8472'), 'zone_exit', '⚠️ Left safe zone', 'Unknown area - Downtown', 'alert', 'Downtown', NOW() - interval '1 day 4 hours 15 minutes'),
  ((SELECT id FROM loved_ones WHERE device_id = 'KIMI-8472'), 'arrived_at', 'Arrived home', 'From school', 'safe', 'Home', NOW() - interval '1 day 5 hours 30 minutes'),
  ((SELECT id FROM loved_ones WHERE device_id = 'KIMI-8472'), 'left_from', 'Left school', 'Oak Elementary', 'info', 'Oak Elementary', NOW() - interval '1 day 5 hours 50 minutes');

-- 8. Insert Chat Messages (Initial AI Greeting)
INSERT INTO chat_messages (caregiver_id, text, sender, sent_at)
VALUES (
  (SELECT id FROM caregivers WHERE email = 'emersonaidev@gmail.com'),
  E'Hi! I''m KIMI, your AI assistant. I''m here to help you understand Ester''s daily patterns, activities, and well-being.\n\nI can provide insights about:\n• Movement and location history\n• Heart rate and stress patterns\n• Sleep quality and routines\n• Activity levels throughout the day\n\nHow can I help you today?',
  'ai',
  NOW() - interval '1 day'
);
```

---

## 🔐 SECURITY CONSIDERATIONS

1. **Row Level Security (RLS)** - Enabled on all tables with strict policies
2. **Cascade Deletions** - Properly configured to maintain referential integrity
3. **Data Isolation** - Each caregiver can only access their own data
4. **Service Role Access** - Wearable devices use service role for data insertion
5. **Encrypted Columns** - Consider encrypting sensitive health data at rest
6. **API Rate Limiting** - Implement in Edge Functions for public endpoints
7. **Audit Logging** - Future: Track all data modifications for compliance

---

## 📊 PERFORMANCE OPTIMIZATION

1. **Indexes** - Created on all foreign keys and frequently queried columns
2. **GiST Indexes** - Geospatial indexes for location queries and safe zone detection
3. **Partial Indexes** - For active records only (e.g., unread alerts)
4. **Query Optimization** - Use `EXPLAIN ANALYZE` to optimize slow queries
5. **Data Retention** - Future: Archive old location/health data (>90 days)
6. **Connection Pooling** - Use Supabase's built-in pgBouncer

---

## 🧪 TESTING QUERIES

```sql
-- Verify caregiver and loved one relationship
SELECT c.full_name as caregiver, lo.full_name as loved_one, lo.device_id
FROM caregivers c
JOIN loved_ones lo ON lo.caregiver_id = c.id;

-- Get latest location for loved one
SELECT lo.full_name, gps.latitude, gps.longitude, gps.battery_level, gps.recorded_at
FROM loved_ones lo
JOIN gps_locations gps ON gps.loved_one_id = lo.id
WHERE lo.device_id = 'KIMI-8472'
ORDER BY gps.recorded_at DESC
LIMIT 1;

-- Get today's activities
SELECT type, title, description, status, occurred_at
FROM activities
WHERE loved_one_id = (SELECT id FROM loved_ones WHERE device_id = 'KIMI-8472')
  AND occurred_at > CURRENT_DATE
ORDER BY occurred_at DESC;

-- Get safe zones for loved one
SELECT name, radius, latitude, longitude, notifications_enabled
FROM safe_zones
WHERE loved_one_id = (SELECT id FROM loved_ones WHERE device_id = 'KIMI-8472')
  AND is_active = true;

-- Get latest health metrics
SELECT stress_score, heart_rate, temperature, steps, recorded_at
FROM health_metrics
WHERE loved_one_id = (SELECT id FROM loved_ones WHERE device_id = 'KIMI-8472')
ORDER BY recorded_at DESC
LIMIT 1;

-- Count unread alerts
SELECT COUNT(*) as unread_alerts
FROM alerts
WHERE caregiver_id = (SELECT id FROM caregivers WHERE email = 'emersonaidev@gmail.com')
  AND is_read = false;
```

---

## ✅ IMPLEMENTATION CHECKLIST

- [ ] Create all 11 tables with proper constraints
- [ ] Enable PostGIS extension for geospatial queries
- [ ] Create all indexes (standard + GiST)
- [ ] Implement RLS policies on all tables
- [ ] Create trigger functions (updated_at, new_user, safe_zone_breach)
- [ ] Insert seed data for Emerson and Ester
- [ ] Insert sample GPS location history (24 hours)
- [ ] Insert sample health metrics (24 hours)
- [ ] Insert sample activities (7 days)
- [ ] Insert safe zones (Home, School, Park)
- [ ] Insert emergency contacts
- [ ] Test all RLS policies with test user
- [ ] Test geospatial queries for safe zone detection
- [ ] Verify triggers are working correctly
- [ ] Run performance tests on large datasets
- [ ] Document API endpoints for frontend integration

---

## 🚀 NEXT STEPS AFTER DATABASE SETUP

1. **Backend Development**
   - Create Supabase Edge Functions for complex logic
   - Implement real-time subscriptions for live updates
   - Build API endpoints for wearable device data ingestion

2. **Wearable Simulator**
   - Create Node.js script to simulate KIMI device
   - Generate realistic GPS movement patterns
   - Simulate biometric sensor data

3. **Frontend Integration**
   - Replace mock data with Supabase queries
   - Implement real-time listeners for location updates
   - Add authentication flow with Supabase Auth

4. **Testing & Validation**
   - End-to-end testing with simulated data
   - Performance testing under load
   - Security audit of RLS policies

---

**END OF DATABASE SPECIFICATION**
