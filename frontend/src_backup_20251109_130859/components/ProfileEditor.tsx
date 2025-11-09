import { useParams } from 'react-router-dom';
import { ComingSoon } from './ComingSoon';

export function ProfileEditor() {
  const { id } = useParams<{ id: string }>();

  return (
    <ComingSoon
      title="Perfil"
      description="Edite informações pessoais, condições médicas, notas de emergência e gerencie contactos."
    />
  );
}
