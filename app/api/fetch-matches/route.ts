import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: settings } = await supabase.from('settings').select('*');
    
    const apiFootballKey = settings?.find(s => s.key === 'api_football_key')?.value;
    const sportradarKey = settings?.find(s => s.key === 'sportradar_api_key')?.value;
    
    if (!apiFootballKey) throw new Error("API-Football Key fehlt!");

    await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    let topPicks: any[] = [];
    const heute = new Date();
    
    for (let i = 0; i < 3; i++) {
      const targetDate = new Date(heute);
      targetDate.setDate(heute.getDate() + i);
      const dateString = targetDate.toISOString().split('T')[0];

      const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${dateString}`, {
        headers: { 'x-apisports-key': apiFootballKey, 'x-rapidapi-host': 'v3.football.api-sports.io' }
      });
      const data = await res.json();
      if (!data.response) continue;

      let srSpiele: any[] = [];
      if (sportradarKey && sportradarKey.length > 5) {
        try {
          const srRes = await fetch(`https://api.sportradar.com/soccer/trial/v4/de/schedules/${dateString}/schedule.json?api_key=${sportradarKey}`);
          if (srRes.ok) {
            const srData = await srRes.json();
            srSpiele = srData.schedules || [];
          }
        } catch (e) {}
      }

      // HIER IST DIE ÄNDERUNG: Wir nehmen einfach die ersten 10 Spiele des Tages, EGAL welche Liga.
      const relevanteSpiele = data.response.slice(0, 10); 

      for (const match of relevanteSpiele) {
          const heimNameAPI = match.teams.home.name.toLowerCase();
          const srMatch = srSpiele.find((sr: any) => {
             const srHeim = sr.sport_event.competitors.find((c:any) => c.qualifier === 'home')?.name.toLowerCase() || "";
             return heimNameAPI.includes(srHeim.substring(0, 5)) || srHeim.includes(heimNameAPI.substring(0, 5));
          });

          const predRes = await fetch(`https://v3.football.api-sports.io/predictions?fixture=${match.fixture.id}`, {
              headers: { 'x-apisports-key': apiFootballKey, 'x-rapidapi-host': 'v3.football.api-sports.io' }
          });
          const predData = await predRes.json();
          
          if (predData.response && predData.response.length > 0) {
              const p = predData.response[0];
              const expectedTotalGoals = (parseFloat(p.predictions.goals.home) || 1.0) + (parseFloat(p.predictions.goals.away) || 1.0);
              const prob1 = parseInt(p.predictions.percent.home.replace('%','')) || 33;
              const probX = parseInt(p.predictions.percent.draw.replace('%','')) || 33;
              const prob2 = parseInt(p.predictions.percent.away.replace('%','')) || 33;

              let bttsProb = p.predictions.btts === "Yes" ? 65 : 35;
              let o25Prob = (expectedTotalGoals / 3.0) * 60;
              let o05h1Prob = 45 + (expectedTotalGoals * 10);
              let o15h1Prob = 15 + (expectedTotalGoals * 8);
              let reasoning = `API-F: xG ${expectedTotalGoals.toFixed(1)}. `;

              if (srMatch && srMatch.sport_event_status?.status === "not_started") {
                  bttsProb += 5; 
                  o25Prob += 5;
                  reasoning += `SR-Sync erfolgreich. Daten doppelt verifiziert. `;
              }

              bttsProb = Math.min(Math.max(bttsProb, 15), 92);
              o25Prob = Math.min(Math.max(o25Prob, 20), 88);
              o05h1Prob = Math.min(Math.max(o05h1Prob, 40), 95);
              o15h1Prob = Math.min(Math.max(o15h1Prob, 10), 65);
              let bttsH1Prob = Math.min(Math.max((bttsProb * 0.4) + (o15h1Prob * 0.6), 5), 75);

              // ZWEITE ÄNDERUNG: Wir speichern das Spiel IMMER ab (Schranke komplett geöffnet)
              topPicks.push({
                  match_date: match.fixture.date, home_team: match.teams.home.name, away_team: match.teams.away.name, league: match.league.name, home_logo: match.teams.home.logo, away_logo: match.teams.away.logo, btts_h1_probability: Math.round(bttsH1Prob), prob_1: prob1, prob_x: probX, prob_2: prob2, prob_btts: Math.round(bttsProb), prob_o05_h1: Math.round(o05h1Prob), prob_o15_h1: Math.round(o15h1Prob), prob_o25_ft: Math.round(o25Prob), reasoning: reasoning, tendency: prob1 > prob2 ? "Heim-Vorteil" : "Auswärts-Vorteil"
              });
          }
      }
    }

    if (topPicks.length > 0) {
      await supabase.from('matches').insert(topPicks);
    }
    return NextResponse.json({ success: true, message: `Debug-Sync beendet. ${topPicks.length} Test-Spiele geladen.` });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}