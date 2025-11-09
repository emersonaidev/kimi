import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Loader2, AlertCircle, Plus } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { supabase } from '@/lib/supabase';
import { useRealtimeLocation } from '@/hooks/useRealtimeLocation';
import { useGeofenceAlerts } from '@/hooks/useGeofenceAlerts';
import {
  initializeMap,
  addCurrentLocationMarker,
  updateMarkerPosition,
  drawTrailLine,
  drawSafeZones,
  fitMapToLocations,
} from '@/lib/mapUtils';
import type { GPSLocation, SafeZone } from '@/types/app.types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function Map() {
  const { id: lovedOneId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const { toast } = useToast();

  const [trail, setTrail] = useState<GPSLocation[]>([]);
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [loadingTrail, setLoadingTrail] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [zoneName, setZoneName] = useState('');
  const [zoneLatitude, setZoneLatitude] = useState('');
  const [zoneLongitude, setZoneLongitude] = useState('');
  const [zoneRadius, setZoneRadius] = useState([500]);
  const [creating, setCreating] = useState(false);

  const { currentLocation, loading: loadingLocation } = useRealtimeLocation(lovedOneId);

  // Integrate geofence checking with toast notifications
  useGeofenceAlerts({
    lovedOneId,
    currentLocation,
    onViolation: (zoneName) => {
      toast({
        title: 'Alerta de Geofence',
        description: 'Ente querido saiu da safe zone: ' + zoneName,
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = initializeMap(mapContainer.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!lovedOneId) return;

    async function fetchTrailAndSafeZones() {
      try {
        setLoadingTrail(true);
        setError(null);

        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const [trailResult, safeZonesResult] = await Promise.all([
          supabase
            .from('gps_locations')
            .select('*')
            .eq('loved_one_id', lovedOneId)
            .gte('recorded_at', twentyFourHoursAgo)
            .order('recorded_at', { ascending: true })
            .limit(50),
          supabase.from('safe_zones').select('*').eq('loved_one_id', lovedOneId),
        ]);

        if (trailResult.error) throw trailResult.error;
        if (safeZonesResult.error) throw safeZonesResult.error;

        setTrail(trailResult.data || []);
        setSafeZones(safeZonesResult.data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch map data'));
        console.error('Error fetching map data:', err);
      } finally {
        setLoadingTrail(false);
      }
    }

    fetchTrailAndSafeZones();
  }, [lovedOneId]);

  useEffect(() => {
    if (!map.current || !currentLocation) return;

    if (marker.current) {
      updateMarkerPosition(marker.current, currentLocation);
    } else {
      marker.current = addCurrentLocationMarker(map.current, currentLocation);
    }

    map.current.flyTo({
      center: [currentLocation.longitude, currentLocation.latitude],
      zoom: 14,
      duration: 1000,
    });
  }, [currentLocation]);

  useEffect(() => {
    if (!map.current || trail.length === 0) return;

    drawTrailLine(map.current, trail);
    fitMapToLocations(map.current, trail);
  }, [trail]);

  useEffect(() => {
    if (!map.current || safeZones.length === 0) return;

    drawSafeZones(map.current, safeZones);
  }, [safeZones]);

  // Subscribe to realtime safe zone changes conforme contracts/ linha 466-494
  useEffect(() => {
    if (!lovedOneId) return;

    const channel = supabase
      .channel('safe-zones:' + lovedOneId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'safe_zones',
          filter: 'loved_one_id=eq.' + lovedOneId,
        },
        (payload) => {
          console.log('Safe zone change:', payload);

          if (payload.eventType === 'INSERT') {
            setSafeZones((prev) => [...prev, payload.new as SafeZone]);
          } else if (payload.eventType === 'UPDATE') {
            setSafeZones((prev) =>
              prev.map((zone) => (zone.id === payload.new.id ? (payload.new as SafeZone) : zone))
            );
          } else if (payload.eventType === 'DELETE') {
            setSafeZones((prev) => prev.filter((zone) => zone.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('Safe zones subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lovedOneId]);

  const handleCreateSafeZone = async () => {
    if (!lovedOneId) return;

    // Validations conforme data-model.md linha 624-645
    if (!zoneName.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome da zona não pode estar vazio',
        variant: 'destructive',
      });
      return;
    }

    const lat = parseFloat(zoneLatitude);
    const lng = parseFloat(zoneLongitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      toast({
        title: 'Erro',
        description: 'Latitude inválida (deve estar entre -90 e 90)',
        variant: 'destructive',
      });
      return;
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      toast({
        title: 'Erro',
        description: 'Longitude inválida (deve estar entre -180 e 180)',
        variant: 'destructive',
      });
      return;
    }

    const radius = zoneRadius[0];
    if (radius < 10 || radius > 5000) {
      toast({
        title: 'Erro',
        description: 'Raio deve estar entre 10 e 5000 metros',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreating(true);

      // POST para safe_zones conforme contracts/ linha 500-531
      const { data, error: insertError } = await supabase
        .from('safe_zones')
        .insert({
          loved_one_id: lovedOneId,
          name: zoneName.trim(),
          latitude: lat,
          longitude: lng,
          radius_meters: radius,
          is_active: true,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Optimistic update - add to safe zones immediately
      setSafeZones((prev) => [...prev, data as SafeZone]);

      toast({
        title: 'Zona criada',
        description: 'Safe zone "' + zoneName + '" foi criada com sucesso',
      });

      // Reset form
      setZoneName('');
      setZoneLatitude('');
      setZoneLongitude('');
      setZoneRadius([500]);
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Error creating safe zone:', err);
      toast({
        title: 'Erro',
        description: 'Falha ao criar safe zone',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const isLoading = loadingLocation || loadingTrail;

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--background)',
          padding: '20px',
        }}
      >
        <AlertCircle
          style={{
            width: '48px',
            height: '48px',
            color: 'var(--destructive)',
            marginBottom: '16px',
          }}
        />
        <p
          style={{
            fontSize: 'var(--text-h3)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--foreground)',
            marginBottom: '8px',
          }}
        >
          Erro ao carregar mapa
        </p>
        <p
          style={{
            fontSize: 'var(--text-base)',
            color: 'var(--muted-foreground)',
            textAlign: 'center',
            marginBottom: '24px',
          }}
        >
          {error.message}
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '12px 24px',
            borderRadius: 'var(--radius-button)',
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-medium)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          className="active:scale-[0.98]"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        backgroundColor: 'var(--background)',
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1,
        }}
      >
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-button)',
            backgroundColor: 'var(--card)',
            color: 'var(--foreground)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-medium)',
            border: 'none',
            cursor: 'pointer',
            boxShadow: 'var(--elevation-sm)',
            transition: 'all 0.2s',
          }}
          className="active:scale-[0.98]"
        >
          <ArrowLeft style={{ width: '20px', height: '20px' }} />
          Voltar
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1,
        }}
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-button)',
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: 'var(--elevation-sm)',
                transition: 'all 0.2s',
              }}
              className="active:scale-[0.98]"
            >
              <Plus style={{ width: '20px', height: '20px' }} />
              Criar Safe Zone
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Safe Zone</DialogTitle>
              <DialogDescription>
                Defina uma zona segura para receber alertas quando o ente querido sair dela.
              </DialogDescription>
            </DialogHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div>
                <Label htmlFor="zoneName">Nome da Zona</Label>
                <Input
                  id="zoneName"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  placeholder="Ex: Casa, Escola, Hospital"
                  style={{ marginTop: '8px' }}
                />
              </div>
              <div>
                <Label htmlFor="zoneLatitude">Latitude</Label>
                <Input
                  id="zoneLatitude"
                  type="number"
                  value={zoneLatitude}
                  onChange={(e) => setZoneLatitude(e.target.value)}
                  placeholder="Ex: 38.7223"
                  step="0.000001"
                  style={{ marginTop: '8px' }}
                />
              </div>
              <div>
                <Label htmlFor="zoneLongitude">Longitude</Label>
                <Input
                  id="zoneLongitude"
                  type="number"
                  value={zoneLongitude}
                  onChange={(e) => setZoneLongitude(e.target.value)}
                  placeholder="Ex: -9.1393"
                  step="0.000001"
                  style={{ marginTop: '8px' }}
                />
              </div>
              <div>
                <Label htmlFor="zoneRadius">Raio (metros): {zoneRadius[0]}m</Label>
                <Slider
                  id="zoneRadius"
                  min={10}
                  max={5000}
                  step={10}
                  value={zoneRadius}
                  onValueChange={setZoneRadius}
                  style={{ marginTop: '8px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  style={{ flex: 1 }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateSafeZone}
                  disabled={creating}
                  style={{ flex: 1 }}
                >
                  {creating ? 'A criar...' : 'Criar Zona'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            padding: '24px',
            borderRadius: 'var(--radius-card)',
            backgroundColor: 'var(--card)',
            boxShadow: 'var(--elevation-md)',
          }}
        >
          <Loader2
            className="animate-spin"
            style={{
              width: '48px',
              height: '48px',
              color: 'var(--primary)',
            }}
          />
          <p
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--muted-foreground)',
            }}
          >
            A carregar mapa...
          </p>
        </motion.div>
      )}

      <div
        ref={mapContainer}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}
