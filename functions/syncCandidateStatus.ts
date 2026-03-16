import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { spreadsheetId, candidateId, status } = await req.json();

    // Get candidate
    const candidates = await base44.entities.Candidate.filter({ id: candidateId });
    if (candidates.length === 0) {
      return Response.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const candidate = candidates[0];

    // Get access token for Google Sheets
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlesheets');

    // Find candidate row in sheet by email
    const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Candidates`;
    
    const response = await fetch(sheetsUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      return Response.json({ error: 'Failed to read from Google Sheets' }, { status: 500 });
    }

    const result = await response.json();
    const rows = result.values || [];

    // Find row by email (column B, index 1)
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][1] === candidate.email) {
        rowIndex = i + 1; // +1 for 1-based indexing
        break;
      }
    }

    if (rowIndex === -1) {
      return Response.json({ error: 'Candidate not found in spreadsheet' }, { status: 404 });
    }

    // Update status column (column I, index 8)
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Candidates!I${rowIndex}?valueInputOption=RAW`;
    
    const updateResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values: [[status]] })
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      return Response.json({ error: 'Failed to update Google Sheets', details: error }, { status: 500 });
    }

    // Also update in database
    await base44.entities.Candidate.update(candidateId, { status });

    return Response.json({ 
      success: true,
      candidateName: candidate.name,
      newStatus: status,
      rowUpdated: rowIndex
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});