import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Eye, Star } from "lucide-react";

export default function AIAssistant() {
  const [query, setQuery] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [selectedCV, setSelectedCV] = useState(null);
  const [file, setFile] = useState(null);

  // =============================
  // 🔍 SEARCH (FIXED)
  // =============================
  const searchCandidates = async () => {
    const { data, error } = await supabase.functions.invoke("ai-assistant", {
      body: { message: query },
    });

    if (error) {
      console.error(error);
      alert("Search failed");
      return;
    }

    setCandidates(data.candidates || []);
  };

  // =============================
  // 🤖 AI MATCHING
  // =============================
  const runAIScoring = async () => {
    const { data, error } = await supabase.functions.invoke("score-candidates", {
      body: {
        job_description: jobDescription,
        candidates,
      },
    });

    if (error) {
      console.error(error);
      alert("AI scoring failed");
      return;
    }

    setCandidates(data.scoredCandidates || []);
  };

  // =============================
  // 📄 CV UPLOAD
  // =============================
  const uploadCV = async () => {
    if (!file) return alert("Select a file");

    const filePath = `cvs/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("cvs")
      .upload(filePath, file);

    if (uploadError) {
      console.error(uploadError);
      alert("Upload failed");
      return;
    }

    const { data: publicUrl } = supabase.storage
      .from("cvs")
      .getPublicUrl(filePath);

    await supabase.from("candidates").insert([
      {
        name: file.name,
        title: "Unknown",
        location: "South Africa",
        skills: "Not parsed yet",
        cv_file_path: publicUrl.publicUrl,
      },
    ]);

    alert("CV uploaded successfully");
  };

  // =============================
  // ⭐ SHORTLIST
  // =============================
  const toggleShortlist = async (c) => {
    const updated = !c.shortlisted;

    await supabase
      .from("candidates")
      .update({ shortlisted: updated })
      .eq("id", c.id);

    setCandidates((prev) =>
      prev.map((x) => (x.id === c.id ? { ...x, shortlisted: updated } : x))
    );
  };

  return (
    <div className="p-6 space-y-6">

      {/* 🔍 SEARCH */}
      <div>
        <Input
          placeholder="Search candidates (e.g. Sales Manager Johannesburg)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button onClick={searchCandidates} className="mt-2">
          Search Candidates
        </Button>
      </div>

      {/* 📄 CV UPLOAD */}
      <div>
        <Input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <Button onClick={uploadCV} className="mt-2">
          Upload CV
        </Button>
      </div>

      {/* 🤖 JOB DESCRIPTION */}
      <div>
        <Textarea
          placeholder="Paste job description..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
        <Button onClick={runAIScoring} className="mt-2 bg-purple-600">
          Run AI Matching
        </Button>
      </div>

      {/* 👥 CANDIDATES */}
      {candidates.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold">Candidates</h2>

          {candidates.map((c, i) => (
            <div
              key={c.id}
              className="p-4 border rounded-xl mt-3 bg-white"
            >
              {/* TOP 3 BADGE */}
              {i < 3 && (
                <div className="text-xs text-yellow-600 font-bold">
                  ⭐ Top Candidate
                </div>
              )}

              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm">{c.title}</p>
                  <p className="text-xs text-gray-500">{c.location}</p>
                </div>

                <div className="text-green-600 font-semibold">
                  {c.match_score || 0}% match
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 mt-3">

                {c.cv_file_path && (
                  <Button
                    size="sm"
                    onClick={() => setSelectedCV(c.cv_file_path)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View CV
                  </Button>
                )}

                <Button
                  size="sm"
                  onClick={() => toggleShortlist(c)}
                >
                  <Star className="w-4 h-4 mr-1" />
                  {c.shortlisted ? "Shortlisted" : "Shortlist"}
                </Button>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* 📄 CV MODAL */}
      {selectedCV && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center">
          <div className="bg-white w-4/5 h-4/5">
            <iframe src={selectedCV} className="w-full h-full" />
            <Button onClick={() => setSelectedCV(null)}>Close</Button>
          </div>
        </div>
      )}

    </div>
  );
}