import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { spreadsheetId, sheetName = 'Candidates' } = await req.json();

    // Get access token for Google Sheets
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlesheets');

    // Fetch data from sheets
    const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}`;
    
    const response = await fetch(sheetsUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error: 'Failed to read from Google Sheets', details: error }, { status: 500 });
    }

    const result = await response.json();
    const rows = result.values || [];

    if (rows.length < 2) {
      return Response.json({ error: 'No data found in spreadsheet' }, { status: 400 });
    }

    // Skip header row
    const dataRows = rows.slice(1);
    const candidatesToImport = [];
    const errors = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      
      // Skip empty rows
      if (!row[0] && !row[1]) continue;

      const candidate = {
        name: row[0] || '',
        email: row[1] || '',
        phone: row[2] || '',
        title: row[3] || '',
        company: row[4] || '',
        location: row[5] || '',
        experience_years: row[6] ? parseInt(row[6]) : undefined,
        skills: row[7] ? row[7].split(',').map(s => s.trim()) : [],
        status: row[8] || 'new',
        match_score: row[9] ? parseFloat(row[9]) : undefined,
        salary_expectation: row[10] || '',
        availability: row[11] || '',
        source: row[12] || 'spreadsheet',
        linkedin_url: row[13] || '',
      };

      // Validate required fields
      if (!candidate.name || !candidate.email) {
        errors.push(`Row ${i + 2}: Missing name or email`);
        continue;
      }

      candidatesToImport.push(candidate);
    }

    // Bulk create candidates
    let imported = 0;
    if (candidatesToImport.length > 0) {
      const results = await base44.asServiceRole.entities.Candidate.bulkCreate(candidatesToImport);
      imported = results.length;
    }

    return Response.json({ 
      success: true,
      imported,
      errors: errors.length > 0 ? errors : undefined,
      skipped: dataRows.length - candidatesToImport.length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});