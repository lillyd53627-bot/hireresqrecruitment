import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Linkedin, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function LinkedInProfileViewer({ linkedinUrl }) {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const handleFetchProfile = async () => {
    if (!linkedinUrl) {
      toast.error('No LinkedIn URL provided');
      return;
    }

    setLoading(true);
    try {
      const response = ('getLinkedInProfile', {
        profileUrl: linkedinUrl
      });

      if (response.data.success) {
        setProfileData(response.data.profile);
        toast.success('Profile data fetched');
      } else {
        toast.error(response.data.error || 'Failed to fetch profile');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to fetch. Make sure LinkedIn is authorized.');
    } finally {
      setLoading(false);
    }
  };

  if (!linkedinUrl) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Linkedin className="w-4 h-4 text-blue-600" />
          LinkedIn Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            View LinkedIn Profile
          </a>
        </div>

        <Button
          onClick={handleFetchProfile}
          disabled={loading}
          variant="outline"
          size="sm"
          className="w-full gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Fetching Profile...
            </>
          ) : (
            <>
              <Linkedin className="w-4 h-4" />
              Fetch LinkedIn Data
            </>
          )}
        </Button>

        {profileData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
            <p className="text-sm font-medium">{profileData.name}</p>
            {profileData.email && (
              <p className="text-xs text-gray-600 mt-1">{profileData.email}</p>
            )}
            {profileData.picture && (
              <img
                src={profileData.picture}
                alt={profileData.name}
                className="w-12 h-12 rounded-full mt-2"
              />
            )}
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-800">
            LinkedIn API has restrictions. Only limited public profile data is available without additional permissions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}