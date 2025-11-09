import { useParams } from 'react-router-dom';
import { ComingSoon } from './ComingSoon';

export function Timeline() {
  const { id } = useParams<{ id: string }>();

  return (
    <ComingSoon
      title="Timeline Histórica"
      description="Veja o histórico completo de atividades, eventos e localizações com mini-mapas interativos."
    />
  );
}
