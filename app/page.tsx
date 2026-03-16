import { calculateOmniMarkets } from '@/lib/engine';
import { QUANT_PARAMS } from '@/lib/constants';

export default function Dashboard() {
  // Beispiel-Berechnung für ein Spiel (das würde später aus deiner API kommen)
  const params = QUANT_PARAMS.bundesliga;
  const probs = calculateOmniMarkets(1.5, 1.2, params.rho); // lh, la basierend auf ELO

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">🔥 Top Value Picks</h1>
      <div className="grid gap-4">
        <div className="p-4 border rounded shadow">
          <p className="font-bold">Beispiel Match</p>
          <p>Heimsieg Wahrscheinlichkeit: {(probs.FT_1 * 100).toFixed(1)}%</p>
          <p className="text-green-600">Empfohlener Markt: Asian Handicap</p>
        </div>
      </div>
    </div>
  );
}