import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, Upload, Download, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function GoogleSheetsSync() {
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const extractSpreadsheetId = (url) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : url;
  };

  const handleExport = async () => {
    if (!spreadsheetId.trim()) {
      toast.error('Please enter a spreadsheet ID or URL');
      return;
    }

    setLoading(true);
    try {
      const id = extractSpreadsheetId(spreadsheetId);

      if (response.data.success) {
        toast.success(`Exported ${response.data.candidatesExported} candidates to Google Sheets`);
        setLastSync(new Date().toLocaleString());
      } else {
        toast.error(response.data.error || 'Export failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to export. Make sure Google Sheets is authorized.');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!spreadsheetId.trim()) {
      toast.error('Please enter a spreadsheet ID or URL');
      return;
    }

    setLoading(true);
    try {
      const id = extractSpreadsheetId(spreadsheetId);

      if (response.data.success) {
        toast.success(`Imported ${response.data.imported} candidates from Google Sheets`);
        if (response.data.errors && response.data.errors.length > 0) {
          toast.warning(`${response.data.errors.length} rows had errors`);
        }
        setLastSync(new Date().toLocaleString());
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error(response.data.error || 'Import failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to import. Make sure Google Sheets is authorized.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sheet className="w-4 h-4" />
          Google Sheets
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sync with Google Sheets</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-2">Before you start:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Authorize Google Sheets in your dashboard settings</li>
                    <li>Create a new Google Sheet or use an existing one</li>
                    <li>Copy the spreadsheet ID or full URL</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Spreadsheet Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Spreadsheet ID or URL</label>
            <Input
              placeholder="https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID or just the ID"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Find the ID in your Google Sheets URL between /d/ and /edit
            </p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Download className="w-4 h-4 text-green-600" />
                  Export to Sheets
                </CardTitle>
                <CardDescription className="text-xs">
                  Send all candidates from HireResQ to your spreadsheet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleExport} 
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  Import from Sheets
                </CardTitle>
                <CardDescription className="text-xs">
                  Load candidates from your spreadsheet into HireResQ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleImport} 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Import Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Last Sync */}
          {lastSync && (
            <div className="flex items-center gap-2 text-sm text-gray-600 justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Last synced: {lastSync}
            </div>
          )}

          {/* Sheet Format */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Expected Sheet Format</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-gray-600 space-y-1">
                <p className="font-medium mb-2">Required Columns (A-O):</p>
                <div className="bg-gray-50 p-3 rounded font-mono">
                  Name | Email | Phone | Title | Company | Location | Experience (Years) | Skills | Status | Match Score | Salary Expectation | Availability | Source | LinkedIn | Created Date
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  <strong>Note:</strong> Name and Email are required. Skills should be comma-separated.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}