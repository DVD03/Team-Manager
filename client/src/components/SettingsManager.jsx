import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Type, CheckCircle2, Upload, Trash2, Image as ImageIcon, Shield } from 'lucide-react';
import axios from 'axios';

export default function SettingsManager({ settings = {}, onSaveSettings, darkMode = true }) {
  const [formData, setFormData] = useState({
    systemName: settings.systemName || 'Team Manager',
    companyName: settings.companyName || 'Team Manager',
    accentColor: settings.accentColor || 'indigo',
    showEmojis: settings.showEmojis || false,
  });

  const [logoFile, setLogoFile] = useState(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState(settings.logoUrl || '');
  const [removeLogo, setRemoveLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (settings) {
      setFormData({
        systemName: settings.systemName || 'Team Manager',
        companyName: settings.companyName || 'Team Manager',
        accentColor: settings.accentColor || 'indigo',
        showEmojis: settings.showEmojis || false,
      });
      setCurrentLogoUrl(settings.logoUrl || '');
    }
  }, [settings]);

  const cardBg = darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const innerBg = darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200';
  const textTitle = darkMode ? 'text-white' : 'text-slate-900';
  const textSub = darkMode ? 'text-slate-400' : 'text-slate-500';
  const inputBg = darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    try {
      const data = new FormData();
      data.append('systemName', formData.systemName);
      data.append('companyName', formData.companyName);
      data.append('accentColor', formData.accentColor);
      data.append('showEmojis', formData.showEmojis);
      if (removeLogo) {
        data.append('removeLogo', 'true');
      }
      if (logoFile) {
        data.append('logo', logoFile);
      }

      const res = await axios.post('/api/settings', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('System settings and logo updated successfully!');
      setCurrentLogoUrl(res.data.logoUrl || '');
      setRemoveLogo(false);
      setLogoFile(null);
      if (onSaveSettings) onSaveSettings(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className={`flex items-center justify-between gap-4 ${cardBg} p-6 rounded-2xl border`}>
        <div>
          <h2 className={`text-xl font-bold ${textTitle} flex items-center gap-2`}>
            <SettingsIcon className="w-6 h-6 text-indigo-500" />
            <span>System Customization & Custom Logo</span>
          </h2>
          <p className={`${textSub} text-sm mt-1`}>
            Upload a custom brand logo image, change system name, and adjust branding options.
          </p>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-500 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`${cardBg} rounded-2xl border p-6 space-y-6 text-sm`}>
        {/* Custom Logo Upload Section */}
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-3">
          <label className={`block ${textTitle} font-bold text-xs flex items-center gap-1.5`}>
            <ImageIcon className="w-4 h-4 text-indigo-500" />
            <span>Upload Custom System Logo Image</span>
          </label>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow">
              {currentLogoUrl && !removeLogo ? (
                <img src={currentLogoUrl} alt="System Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <Shield className="w-10 h-10 text-indigo-500" />
              )}
            </div>

            <div className="space-y-2 flex-1 w-full">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setLogoFile(e.target.files[0]);
                    setRemoveLogo(false);
                  }
                }}
                className={`w-full text-xs ${textSub} file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer`}
              />
              <p className={`${textSub} text-[10px]`}>
                Recommended: PNG, JPG, or SVG image (transparent background looks best).
              </p>

              {currentLogoUrl && !removeLogo && (
                <button
                  type="button"
                  onClick={() => setRemoveLogo(true)}
                  className="text-[11px] text-rose-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3 h-3" /> Remove Custom Logo
                </button>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className={`block ${textTitle} font-bold text-xs mb-1 flex items-center gap-1.5`}>
            <Type className="w-4 h-4 text-indigo-500" />
            <span>System Branding Title *</span>
          </label>
          <input
            type="text"
            required
            value={formData.systemName}
            onChange={(e) => setFormData({ ...formData, systemName: e.target.value })}
            placeholder="e.g. Team Manager"
            className={`w-full px-3.5 py-2.5 ${inputBg} rounded-xl focus:outline-none focus:border-indigo-500 font-semibold`}
          />
          <p className={`${textSub} text-[10px] mt-1`}>
            This title will be displayed across the sidebar, header, and login screen.
          </p>
        </div>

        <div>
          <label className={`block ${textTitle} font-bold text-xs mb-1`}>Company / Organization Name</label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            placeholder="e.g. Team Manager Solutions"
            className={`w-full px-3.5 py-2.5 ${inputBg} rounded-xl focus:outline-none focus:border-indigo-500`}
          />
        </div>

        {/* Emojis Preference */}
        <div className="p-4 bg-slate-500/5 rounded-xl border border-slate-700/40 space-y-1">
          <label className={`flex items-center space-x-3 cursor-pointer ${textTitle} font-bold text-xs`}>
            <input
              type="checkbox"
              checked={formData.showEmojis}
              onChange={(e) => setFormData({ ...formData, showEmojis: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-0 cursor-pointer w-4 h-4"
            />
            <span>Show Emojis in Interface</span>
          </label>
          <p className={`${textSub} text-[10px] pl-7`}>
            Uncheck to keep a clean, corporate interface without emojis across buttons and headers.
          </p>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-700/60">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
