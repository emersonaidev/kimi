import { useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, TrendingUp, Moon } from 'lucide-react';
import { ComingSoon } from './ComingSoon';

export function BiometricCharts() {
  const { id } = useParams<{ id: string }>();

  return (
    <ComingSoon
      title="Métricas Biométricas"
      description="Acompanhe dados de saúde como batimento cardíaco, passos e qualidade do sono em gráficos interativos."
    />
  );
}
