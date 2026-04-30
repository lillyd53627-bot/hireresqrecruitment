  // ============================
  // IMPROVED BULK CV UPLOAD - Version 2
  // ============================
  const handleCVUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;

    try {
      for (const file of files) {
        if (file.type !== "application/pdf") {
          console.warn("Skipping non-PDF file:", file.name);
          continue;
        }

        // Clean file name
        const fileExt = file.name.split('.').pop();
        const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('cvs')
          .upload(cleanFileName, file, { upsert: true });

        if (uploadError) {
          console.error("Upload failed for", file.name, uploadError);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('cvs')
          .getPublicUrl(cleanFileName);

        const cvUrl = urlData.publicUrl;

        console.log("CV uploaded successfully:", cleanFileName);

        // Call parse-cv Edge Function with user_id
        const currentUser = await supabase.auth.getUser();
        const userId = currentUser.data.user?.id;

        const response = await fetch(
          'https://tlzipklqaxiupbhggbnm.supabase.co/functions/v1/parse-cv',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ 
              cv_url: cvUrl, 
              user_id: userId 
            })
          }
        );

        const result = await response.json();

        if (result.success) {
          successCount++;
        } else {
          console.error("Parse failed for", file.name, result.error);
        }
      }

      toast.success(`✅ Successfully processed ${successCount} CV(s)`);
      await loadCandidates();   // Refresh candidate list

    } catch (err) {
      console.error("Bulk upload error:", err);
      toast.error("Bulk CV upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };