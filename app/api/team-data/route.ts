import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; 

export async function GET() {
  try {
    // 1. Fetch the first available team for testing
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .limit(1)
      .single();

    if (teamError || !team) {
      console.error("Supabase Team Fetch Error:", teamError);
      return NextResponse.json({ error: 'No teams found in database.' }, { status: 404 });
    }

    // 2. Fetch all players assigned to this specific team
    const { data: playersList, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', team.id)
      .order('created_at', { ascending: false });

    if (playersError) {
      console.error("Supabase Players Fetch Error:", playersError);
      return NextResponse.json({ error: 'Failed to retrieve players from database.' }, { status: 500 });
    }

    // 3. Compute dynamic live stats from our database rows
    const totalRegistered = playersList.length;
    const verifiedCount = playersList.filter(p => p.verification_status === 'verified').length;
    const flaggedCount = playersList.filter(p => p.verification_status !== 'verified').length;

    // 4. Map DB fields (snake_case) safely into frontend format (camelCase)
    const formattedPlayers = playersList.map(player => ({
      id: player.id,
      jerseyNumber: player.jersey_number,
      initials: `${player.first_name[0] || ''}${player.last_name[0] || ''}`.toUpperCase(),
      firstName: player.first_name,
      lastName: player.last_name,
      position: player.position,
      specificPosition: player.specific_position,
      dateAdded: new Date(player.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      verificationStatus: player.verification_status,
      avatarColor: player.avatar_color || 'blue'
    }));

    // 5. Return JSON payload matching your UI requirements
    return NextResponse.json({
      stats: {
        totalRegistered,
        maxAllowed: team.max_allowed ?? 25,
        verifiedCount,
        flaggedCount,
        poolStatus: team.pool_status ?? 'Pending review',
        nextFixture: { 
          opponent: 'Nakuru RFC', 
          date: '28 Jun', 
          time: '09:00' 
        }
      },
      players: formattedPlayers
    });

  } catch (error) {
    console.error("Critical API Route Failure:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}