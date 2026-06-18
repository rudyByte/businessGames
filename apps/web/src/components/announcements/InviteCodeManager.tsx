import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, RefreshCw, Users, UserPlus, Download } from 'lucide-react';
import api from '../../lib/api';

interface InviteCode {
  id: string;
  code: string;
  schoolId: string;
  role: string;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  createdAt: string;
}

interface Props {
  school: { id: string; name: string };
}

export default function InviteCodeManager({ school }: Props) {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateRole, setGenerateRole] = useState<'FACULTY' | 'STUDENT'>('STUDENT');
  const [generateMaxUses, setGenerateMaxUses] = useState(50);

  // CSV import state
  const [csvData, setCsvData] = useState('');
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [csvResult, setCsvResult] = useState<{ created: number; failed: number; errors: string[] } | null>(null);

  useEffect(() => {
    fetchCodes();
  }, [school.id]);

  const fetchCodes = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/invites/school/${school.id}`);
      setCodes(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error('Failed to load invite codes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await api.post('/invites/generate', {
        schoolId: school.id,
        role: generateRole,
        maxUses: generateMaxUses,
      });
      fetchCodes();
    } catch (err) {
      console.error('Failed to generate invite code:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCsvImport = async () => {
    setCsvResult(null);
    try {
      const lines = csvData.trim().split('\n').filter(Boolean);
      const students = lines.map((line) => {
        const [name, email, rollNumber] = line.split(',').map((s) => s.trim());
        return { name, email, rollNumber: rollNumber || undefined };
      });

      const res = await api.post('/invites/bulk-import', {
        schoolId: school.id,
        students,
      });
      setCsvResult(res.data.data);
      if (res.data.data.created > 0) fetchCodes();
    } catch (err: any) {
      setCsvResult({ created: 0, failed: 1, errors: [err.message] });
    }
  };

  const downloadCsvTemplate = () => {
    const template = '"name","email","rollNumber"\n"Aarav Sharma","aarav@example.com","101"\n"Priya Patel","priya@example.com","102"\n"Rahul Verma","rahul@example.com","103"';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_import_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Generate Code */}
      <div className="glass-panel border border-slate-700/50 rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-bold text-white">Generate Invite Codes</h4>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-[10px] text-slate-400 font-semibold mb-1">Role</label>
            <select
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs outline-none focus:border-red-500"
              value={generateRole}
              onChange={(e) => setGenerateRole(e.target.value as any)}
            >
              <option value="STUDENT">Student</option>
              <option value="FACULTY">Faculty</option>
            </select>
          </div>
          <div className="w-24">
            <label className="block text-[10px] text-slate-400 font-semibold mb-1">Max Uses</label>
            <input
              type="number"
              min={1}
              max={999}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs outline-none focus:border-red-500"
              value={generateMaxUses}
              onChange={(e) => setGenerateMaxUses(Number(e.target.value))}
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            Generate
          </button>
        </div>
      </div>

      {/* Codes List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">
            Invite Codes ({codes.length})
          </span>
          <button
            onClick={() => setShowCsvImport(!showCsvImport)}
            className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Download className="h-3 w-3" />
            CSV Import
          </button>
        </div>

        {/* CSV Import */}
        {showCsvImport && (
          <div className="glass-panel border border-slate-700/50 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold">Bulk Import Students</span>
              <button
                onClick={downloadCsvTemplate}
                className="text-[10px] text-blue-400 hover:underline"
              >
                Download Template
              </button>
            </div>
            <textarea
              rows={4}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs outline-none focus:border-blue-500 resize-none font-mono"
              placeholder="name,email,rollNumber&#10;Aarav,aarav@test.com,101&#10;Priya,priya@test.com,102"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
            />
            <button
              onClick={handleCsvImport}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-xs transition-colors"
            >
              Import Students
            </button>
            {csvResult && (
              <div className="text-xs space-y-1">
                <p className="text-green-400">✓ {csvResult.created} created</p>
                {csvResult.failed > 0 && (
                  <>
                    <p className="text-red-400">✗ {csvResult.failed} failed</p>
                    {csvResult.errors.slice(0, 3).map((err, i) => (
                      <p key={i} className="text-red-400/70 text-[10px]">{err}</p>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500" />
          </div>
        ) : codes.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No invite codes generated.</p>
        ) : (
          codes.map((code) => (
            <motion.div
              key={code.id}
              layout
              className="flex items-center justify-between bg-slate-900/50 border border-slate-800 rounded-lg px-3.5 py-2.5"
            >
              <div className="flex items-center gap-3">
                {code.role === 'FACULTY' ? (
                  <Users className="h-4 w-4 text-blue-400" />
                ) : (
                  <UserPlus className="h-4 w-4 text-green-400" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono font-bold text-white tracking-wider">{code.code}</code>
                    <span className={`text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded ${
                      code.role === 'FACULTY' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'
                    }`}>
                      {code.role}
                    </span>
                    {!code.isActive && (
                      <span className="text-[9px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">Inactive</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {code.currentUses}/{code.maxUses} used
                    {code.createdAt && ` • ${new Date(code.createdAt).toLocaleDateString()}`}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleCopy(code.code, code.id)}
                className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                title="Copy code"
              >
                {copiedId === code.id ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
