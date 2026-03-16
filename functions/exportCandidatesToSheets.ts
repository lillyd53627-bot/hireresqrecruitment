import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { spreadsheetId } = await req.json();

    // Get access token for Google Sheets
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlesheets');

    // Fetch all candidates
    const candidates = await base44.entities.Candidate.list();

    // Prepare data for sheets
    const headers = [
      'Name', 'Email', 'Phone', 'Title', 'Company', 'Location',
      'Experience (Years)', 'Skills', 'Status', 'Match Score', 
      'Salary Expectation', 'Availability', 'Source', 'LinkedIn',
      'Created Date'
    ];

    const rows = candidates.map(c => [
      c.name || '',
      c.email || '',
      c.phone || '',
      c.title || '',
      c.company || '',
      c.location || '',
      c.experience_years || '',
      (c.skills || []).join(', '),
      c.status || '',
      c.match_score || '',
      c.salary_expectation || '',
      c.availability || '',
      c.source || '',
      c.linkedin_url || '',
      c.created_date || ''
    ]);

    const data = [headers, ...rows];

    // Create or update sheet
    const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Candidates!A1:O${rows.length + 1}?valueInputOption=RAW`;
    
    const response = await fetch(sheetsUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values: data })
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error: 'Failed to export to Google Sheets', details: error }, { status: 500 });
    }

    const result = await response.json();

    return Response.json({ 
      success: true, 
      updatedCells: result.updatedCells,
      candidatesExported: candidates.length,
      spreadsheetId
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});