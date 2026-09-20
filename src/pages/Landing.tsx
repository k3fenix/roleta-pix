import { theme } from '../config/theme';
import PremiumLanding from '../components/landings/PremiumLanding';
import GameShowLanding from '../components/landings/GameShowLanding';
import FuturisticLanding from '../components/landings/FuturisticLanding';

export default function Landing() {
  const variant = theme.landingVariant;

  if (variant === 'premium') return <PremiumLanding />;
  if (variant === 'gameshow') return <GameShowLanding />;
  if (variant === 'futuristic') return <FuturisticLanding />;

  return <PremiumLanding />;
}
