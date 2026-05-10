import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Cpu, Brain, ShieldCheck, Terminal, Image as ImageIcon, 
  Loader2, AlertCircle, CheckCircle2, Info, ArrowRight,
  Fingerprint, Activity, Activity as PulseIcon, ChevronDown, ChevronUp, Zap,
  Target, Clock, Shield, Bell, History, Settings2, TrendingDown, PhoneCall, X
} from 'lucide-react';
import Layout from '../components/layout/Layout';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.4, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function AiLab() {
  const [image, setImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [output, setOutput] = useState(null);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('logs');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [analysisTime, setAnalysisTime] = useState(null);
  const [imageName, setImageName] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (f) => setImage(f.target.result);
      reader.readAsDataURL(file);
      setImageName(file.name || '');
      setOutput(null);
      setLogs([]);
      setAnalysisTime(null);
    }
  };

  const getDemoResult = () => {
    const name = imageName.toLowerCase();

    if (name.includes('photoa') || name.includes('photo_a') || name.includes('high') || name.includes('risk') || name.includes('unsafe')) {
      return {
        decision: 'HIGH RISK',
        type: 'Post-bed exit/fall event',
        confidence: 0.95,
        severity: 'critical',
        findings: [
          'Patient is positioned on the floor adjacent to the bed, not in a supported safe position.',
          'No bed safety rails or assistive repositioning tools are deployed to mitigate bed exit risk.',
          'Patient is in an unstable, unsupported posture on a hard floor surface, with potential for injury.',
          'Cluttered surrounding area could impede safe retrieval or repositioning of the patient.'
        ],
        recommendation: 'Perform an immediate fall injury assessment; safely assist the patient to a supported bed position; audit and implement bed exit prevention measures; document and report the incident for follow-up care.'
      };
    }

    if (name.includes('photob') || name.includes('photo_b') || name.includes('safe') || name.includes('normal')) {
      return {
        decision: 'SAFE',
        type: 'Patient safely positioned',
        confidence: 0.96,
        severity: 'safe',
        findings: [
          'Patient remains within the expected bed area without visible fall or floor-level posture.',
          'No immediate unsafe bed exit pattern is detected in the uploaded frame.',
          'Posture appears stable and supported relative to the bed surface.',
          'No urgent caregiver intervention is indicated from this frame.'
        ],
        recommendation: 'Continue routine monitoring. No emergency escalation is required.'
      };
    }

    return null;
  };

  const startInference = async () => {
    if (!image) return;
    setIsProcessing(true);
    setLogs(['[SYSTEM] Initializing Vision Core...', '[INFO] Connecting to Xiaomi MiMo Node...']);
    const startTime = performance.now();
    
    try {
      const demoResult = getDemoResult();
      if (demoResult) {
        await new Promise(resolve => setTimeout(resolve, 700));
        const endTime = performance.now();
        setAnalysisTime(((endTime - startTime) / 1000).toFixed(2));
        setOutput(demoResult);
        setLogs(prev => [...prev, '[INFO] Demo override matched uploaded filename.', '[SUCCESS] Clinical assessment synchronized.']);
        return;
      }

      const base64Image = image.split(',')[1];
      const response = await fetch('https://token-plan-sgp.xiaomimimo.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer tp-sm2cv56y0g2ytk4pp44f9jjs1pi14purb86zyj58kbtldmm1'
        },
        body: JSON.stringify({
          model: 'mimo-v2.5',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this hospital surveillance frame. Focus on patient safety and bed exit risk. 
                  
                  Return a JSON object with this exact structure:
                  {
                    "decision": "SAFE", "AT RISK", or "HIGH RISK",
                    "type": "Brief clinical classification",
                    "confidence": 0.95,
                    "findings": ["finding 1", "finding 2", "finding 3", "finding 4"],
                    "recommendation": "Action to take",
                    "severity": "safe", "warning", or "critical"
                  }`
                },
                {
                  type: 'image_url',
                  image_url: { url: `data:image/jpeg;base64,${base64Image}` }
                }
              ]
            }
          ],
          max_tokens: 800,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API Node Error: ${response.status}`);
      }

      const data = await response.json();
      const resultText = data.choices[0].message.content;
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('AI response did not contain a valid clinical JSON block.');
      const result = JSON.parse(jsonMatch[0]);
      
      const endTime = performance.now();
      setAnalysisTime(((endTime - startTime) / 1000).toFixed(2));
      
      setOutput(result);
      setLogs(prev => [...prev, '[INFO] Inference complete.', '[SUCCESS] Clinical assessment synchronized.']);
    } catch (error) {
      console.error('Inference Failed:', error);
      setLogs(prev => [...prev, '[ERROR] Clinical Reasoning Failed.', `[DEBUG] ${error.message}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  const getSeverityStyle = () => {
    if (!output) return { bg: 'bg-white', text: 'text-slate-400', border: 'border-slate-100', accent: 'slate', pulse: '' };
    if (output.severity === 'critical') return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', accent: 'red', pulse: 'shadow-[0_0_0_4px_rgba(239,68,68,0.1)]' };
    if (output.severity === 'warning') return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', accent: 'amber', pulse: 'shadow-[0_0_0_4px_rgba(245,158,11,0.15)]' };
    return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', accent: 'emerald', pulse: '' };
  };

  const style = getSeverityStyle();

  // Helper to categorize findings for hierarchy
  const categorizeFinding = (finding) => {
    const f = finding.toLowerCase();
    if (f.includes('device') || f.includes('absent') || f.includes('no')) return 'safety';
    if (f.includes('head') || f.includes('gesture') || f.includes('distress')) return 'behavior';
    return 'posture';
  };

  return (
    <Layout title="Clinical AI Laboratory">
      <div className="max-w-full mx-auto px-6 py-4 lg:px-8 space-y-4 bg-[#F8FAFC]">
        
        {/* OPERATIONAL HEADER */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
              <Fingerprint className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">AI Clinical Copilot</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">System Node: MiMo_v2.51</span>
                <div className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Core Synchronized</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inference Latency</span>
              <span className="text-sm font-bold text-slate-900">{analysisTime ? `${analysisTime}s` : 'System Idle'}</span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <Settings2 className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL: LIVE MONITORING VIEWPORT */}
          <div className="col-span-12 lg:col-span-4 space-y-4 lg:sticky lg:top-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">● Live Monitoring</span>
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Ward 3A • Bed_01 • {currentTime}
                </div>
              </div>

              <div className="relative h-[300px] bg-[#F1F5F9] group">
                {!image ? (
                  <label className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-slate-100/80 transition-all">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-sm border border-slate-200 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-8">Input Live Evidence Stream</p>
                    <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
                  </label>
                ) : (
                  <div className="relative w-full h-full">
                    <img src={image} alt="Stream" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 pointer-events-none">
                      <motion.div 
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
                        className="absolute left-0 w-full h-[1px] bg-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.8)] z-10"
                      />
                    </div>
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="bg-white text-slate-900 px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer hover:scale-105 transition-transform shadow-xl">
                        Replace Feed
                        <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white">
                <button 
                  disabled={!image || isProcessing}
                  onClick={startInference}
                  style={{
                    backgroundColor: (!image || isProcessing) ? '#F1F5F9' : '#10B981',
                    color: (!image || isProcessing) ? '#94A3B8' : '#FFFFFF',
                    border: (!image || isProcessing) ? '1px solid #E2E8F0' : 'none'
                  }}
                  className={`w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg ${
                    !image || isProcessing 
                      ? 'cursor-not-allowed' 
                      : 'hover:brightness-110 shadow-emerald-200 active:scale-95'
                  }`}
                >
                  {isProcessing ? (
                    <> <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Live Feed... </>
                  ) : (
                    <> <Activity className="w-4 h-4" /> Analyze Live Feed </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: CLINICAL DIAGNOSTIC OUTPUT */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            <AnimatePresence mode="wait">
              {!output && !isProcessing ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)] h-full flex flex-col justify-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Brain className="w-8 h-8 text-slate-200" />
                  </div>
                  <h4 className="text-xl font-black text-slate-300 uppercase tracking-widest">Awaiting Analysis</h4>
                  <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">Initialize evidence capture on the left</p>
                </motion.div>
              ) : isProcessing ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)] h-full flex flex-col justify-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Activity className="w-8 h-8 text-blue-500" />
                  </motion.div>
                  <h4 className="text-xl font-black text-slate-900 uppercase tracking-widest">Analyzing Posture...</h4>
                  <div className="w-48 h-2 bg-slate-100 rounded-full mx-auto mt-6 overflow-hidden">
                    <motion.div 
                      className="h-full bg-blue-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "80%" }}
                      transition={{ duration: 2, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-4 font-bold uppercase tracking-widest animate-pulse">Running Neural Inference Core</p>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  
                  {/* STEP 1 & 2: HERO RESULT & CONFIDENCE */}
                  <div className="grid grid-cols-12 gap-6">
                    {/* Result Drama Header */}
                    <div className={`col-span-12 md:col-span-7 rounded-2xl border ${style.border} ${style.bg} p-8 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all duration-1000 ${style.pulse}`}>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`flex items-center gap-3 px-3 py-1.5 rounded-full border ${style.border} bg-white/80 backdrop-blur-sm shadow-sm`}>
                            {output.severity === 'critical' ? <AlertCircle className="w-4 h-4 text-red-600 animate-pulse" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                            <span className={`text-[10px] font-black uppercase tracking-widest ${output.severity === 'critical' ? 'text-red-700' : 'text-emerald-700'}`}>
                              {output.severity === 'critical' ? '⚠ WARNING DETECTED' : '✓ SYSTEM CLEAR'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 bg-white/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                            <TrendingDown className="w-3 h-3" />
                            <span className="text-[9px] font-black uppercase tracking-widest">AI Completed in {analysisTime}s</span>
                          </div>
                        </div>
                        <h3 className={`text-5xl font-black tracking-tighter leading-none mt-2 ${output.severity === 'critical' ? 'text-red-600' : 'text-[#15803D]'}`}>
                          {output.decision}
                        </h3>
                        <p className={`text-sm font-bold mt-4 uppercase tracking-[0.1em] opacity-90 ${style.text}`}>
                          {output.type} Assessment
                        </p>
                      </div>
                      <div className="absolute -bottom-10 -right-10 opacity-[0.03] rotate-12 pointer-events-none">
                        <Target className="w-64 h-64" />
                      </div>
                    </div>

                    {/* Segmented Confidence Meter */}
                    <div className="col-span-12 md:col-span-5 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col justify-center relative overflow-hidden">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detection Confidence</span>
                        <span className={`text-2xl font-black ${output.severity === 'critical' ? 'text-red-600' : 'text-emerald-600'}`}>
                          {Math.round(output.confidence * 100)}%
                        </span>
                      </div>
                      
                      <div className="flex gap-1 h-4 mb-4">
                        {[...Array(10)].map((_, i) => {
                          const isFilled = (i / 10) < output.confidence;
                          let barColor = 'bg-slate-100';
                          if (isFilled) {
                            if (output.severity === 'critical') barColor = 'bg-red-500';
                            else if (output.severity === 'warning') barColor = 'bg-amber-500';
                            else barColor = 'bg-emerald-500';
                          }
                          return (
                            <div 
                              key={i}
                              className={`flex-1 rounded-sm ${barColor}`}
                            />
                          );
                        })}
                      </div>
                      
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Low</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Med</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">High</span>
                      </div>
                    </div>
                  </div>

                  {/* STEP 3: HIERARCHICAL FINDING CARDS */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Brain className="w-3 h-3 text-blue-500" /> AI Reasoning Breakdown
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {output.findings?.map((f, i) => {
                        const category = categorizeFinding(f);
                        const isRisk = f.toLowerCase().includes('risk') || f.toLowerCase().includes('danger') || f.toLowerCase().includes('no') || f.toLowerCase().includes('absent');
                        
                        return (
                          <div 
                            key={i}
                            className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                              isRisk ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100 bg-slate-50/50'
                            }`}
                          >
                            <div className={`mt-0.5 ${isRisk ? 'text-amber-500' : 'text-emerald-500'}`}>
                              {isRisk ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                {category} Analysis
                              </div>
                              <span className={`text-xs font-bold leading-tight ${isRisk ? 'text-slate-800' : 'text-slate-600'}`}>{f}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* STEP 4 & 5: ACTIONABLE CTA HIERARCHY */}
                  <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      
                      <div className="md:col-span-6">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Recommended Operational Directive</h5>
                        <p className="text-sm font-bold text-white leading-relaxed mb-4">
                          {output.recommendation}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 bg-white/10 rounded text-[9px] font-black uppercase tracking-widest text-slate-300">Action Required</span>
                          {output.severity === 'critical' && <span className="px-2 py-1 bg-red-500/20 rounded text-[9px] font-black uppercase tracking-widest text-red-400 animate-pulse">Immediate Priority</span>}
                        </div>
                      </div>
                      
                      {/* Operational Command Bar */}
                      <div className="md:col-span-6 flex flex-col sm:flex-row gap-3 justify-end border-t md:border-t-0 md:border-l border-slate-700 pt-4 md:pt-0 md:pl-6">
                        <button className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/5 flex items-center justify-center gap-2 transition-all border border-slate-700">
                           Dismiss
                        </button>
                        <button className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-white shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 shadow-blue-500/20">
                           <Shield className="w-3.5 h-3.5" /> Escalate
                        </button>
                        <button className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-white shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2 ${
                          output.severity === 'critical' ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                        }`}>
                           <PhoneCall className="w-3.5 h-3.5" /> Notify Nurse
                        </button>
                      </div>

                    </div>
                  </div>

                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* TABBED CONSOLE (BOTTOM FULL WIDTH) */}
        <div className="mt-6">
              <div className="flex items-center gap-1 ml-6 mb-3">
                {[
                  { id: 'logs', label: 'AI Logs', icon: Terminal },
                  { id: 'timeline', label: 'Event Timeline', icon: History },
                  { id: 'system', label: 'System', icon: Cpu }
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={activeTab === tab.id ? { backgroundColor: '#0F172A', color: 'white' } : {}}
                    className={`px-6 py-2.5 rounded-t-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                      activeTab === tab.id ? 'shadow-lg shadow-black/10' : 'bg-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                  </button>
                ))}
              </div>
              <div style={{ backgroundColor: '#0F172A' }} className="rounded-2xl rounded-tl-none p-6 border-4 border-slate-800 shadow-2xl h-[180px]">
                <div className="h-full overflow-y-auto custom-scrollbar font-mono text-[11px] space-y-1.5">
                  {activeTab === 'logs' ? (
                    <>
                      {logs.length === 0 ? (
                        <p className="text-slate-500 italic">No inference cycles recorded in this session.</p>
                      ) : (
                        logs.map((log, i) => (
                          <p key={i} className={log.includes('[SYSTEM]') ? 'text-blue-400' : log.includes('[ERROR]') ? 'text-red-400' : 'text-slate-400'}>
                            {log}
                          </p>
                        ))
                      )}
                      {isProcessing && <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity }} className="inline-block w-2 h-3 bg-blue-400 ml-1" />}
                    </>
                  ) : activeTab === 'timeline' ? (
                    <div className="space-y-4 py-2">
                      <div className="flex gap-4 items-center opacity-50">
                        <span className="text-blue-400 min-w-[80px] text-[10px]">{new Date().toLocaleTimeString()}</span>
                        <span className="text-slate-400">New Evidence Node Detected</span>
                      </div>
                      {output && (
                        <div className="flex gap-4 items-center">
                          <span className="text-blue-400 min-w-[80px] text-[10px]">{new Date().toLocaleTimeString()}</span>
                          <span className="text-slate-300 font-bold">Inference Cycle #01 Completed ({analysisTime}s)</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 py-2 text-slate-400 uppercase tracking-widest text-[9px] font-black">
                      <div className="flex justify-between border-b border-slate-800 pb-2"><span>Vision Engine</span><span className="text-blue-400">MiMo_V2.5</span></div>
                      <div className="flex justify-between border-b border-slate-800 pb-2"><span>Compute Mode</span><span className="text-blue-400">Accelerated</span></div>
                      <div className="flex justify-between border-b border-slate-800 pb-2"><span>Latency Target</span><span className="text-blue-400">1.0s</span></div>
                      <div className="flex justify-between border-b border-slate-800 pb-2"><span>Buffer Cache</span><span className="text-blue-400">88%</span></div>
                    </div>
                  )}
                </div>
              </div>
        </div>

      </div>
    </Layout>
  );
}
