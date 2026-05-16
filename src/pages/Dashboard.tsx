import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  FileText, 
  Database, 
  MoreVertical, 
  CheckCircle2, 
  Zap,
  TrendingUp,
  Files,
  Diamond,
  Loader2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../components/AuthProvider';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';

interface Document {
  id: string;
  filename: string;
  status: string;
  progress: number;
  userId: string;
  createdAt: any;
  updatedAt: any;
  pageCount?: number;
}

export function Dashboard() {
  const { t } = useTranslation();
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!user) {
      setDocuments([]);
      setLoadingHistory(false);
      return;
    }

    const q = query(
      collection(db, 'documents'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Document[];
      setDocuments(docs);
      setLoadingHistory(false);
    }, (error) => {
      console.error("History fetch error:", error);
      setLoadingHistory(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleUploadClick = async () => {
    if (!user) {
      await login();
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', user.uid);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
          throw new Error(errorData.error || 'Upload failed');
        } else {
          const errorText = await response.text();
          console.error('Non-JSON error response:', errorText.substring(0, 500));
          throw new Error(`Server returned an error (${response.status}). Please check server logs.`);
        }
      }

      const { jobId } = await response.json();
      navigate(`/processing?jobId=${jobId}`);
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload PDF. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-12">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="sr-only" 
        accept=".pdf"
        onChange={handleFileChange}
      />

      {/* Quick Actions / Hero */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 relative overflow-hidden group glass-panel rounded-3xl p-10 flex flex-col justify-center min-h-[240px]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
          <div className="relative z-10">
            <h1 className="font-headline text-3xl text-white mb-2">{t('dashboard.hero')}</h1>
            <p className="text-on-surface-variant max-w-md mb-8">{t('dashboard.heroDesc')}</p>
            <div className="flex gap-4">
              <Button 
                onClick={handleUploadClick} 
                className="gap-2 h-12"
                disabled={isUploading}
              >
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                {isUploading ? t('dashboard.uploading') : t('dashboard.createNew')}
              </Button>
            </div>
          </div>
          <div className="absolute right-[-40px] bottom-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Files className="w-52 h-52 text-primary" />
          </div>
        </div>

        {/* Drop Zone */}
        <div 
          onClick={handleUploadClick}
          className="glass-panel bg-surface-container-low/30 backdrop-blur-md rounded-3xl border-dashed border-2 border-primary/20 flex flex-col items-center justify-center p-8 group hover:border-primary/50 transition-all cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm font-semibold text-on-surface text-center">{t('dashboard.dropZone')}</p>
          <p className="text-xs text-on-surface-variant text-center mt-1">{t('dashboard.dropZoneDesc')}</p>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Feed */}
        <div className="flex-grow space-y-8">
          <div className="flex justify-between items-end">
            <h2 className="font-headline text-2xl text-white">Recently Uploaded</h2>
            <button className="text-primary text-sm font-semibold hover:underline">View All</button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingHistory ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass-panel p-3 rounded-2xl animate-pulse">
                  <div className="aspect-[4/3] bg-white/5 rounded-xl mb-4" />
                  <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              ))
            ) : documents.length === 0 ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-on-surface-variant">
                <Files className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm">No documents yet. Start by uploading one!</p>
              </div>
            ) : (
              documents.map((doc) => (
                <Link 
                  key={doc.id} 
                  to={doc.status === 'completed' ? `/reader?jobId=${doc.id}` : `/processing?jobId=${doc.id}`}
                  className="glass-panel p-3 rounded-2xl hover:bg-white/10 transition-all group"
                >
                  <div className="relative rounded-xl overflow-hidden aspect-[4/3] mb-4 bg-surface-container-low/40 flex items-center justify-center">
                    {doc.status === 'completed' ? (
                      <img 
                        className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" 
                        src={`https://picsum.photos/seed/${doc.id}/400/300`}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        {doc.status === 'failed' ? (
                          <AlertCircle className="w-8 h-8 text-red-400" />
                        ) : (
                          <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{doc.status}</span>
                      </div>
                    )}
                    
                    <div className={cn(
                      "absolute top-2 right-2 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border",
                      doc.status === 'completed' ? "bg-secondary/20 text-secondary border-secondary/20 glow-cyan" : 
                      doc.status === 'failed' ? "bg-red-500/20 text-red-400 border-red-500/20" :
                      "bg-primary/20 text-primary border-primary/20"
                    )}>
                      {doc.status === 'completed' && <CheckCircle2 className="w-3 h-3 fill-current" />}
                      {doc.status === 'completed' ? 'Ready' : doc.status}
                    </div>
                  </div>
                  <div className="px-2">
                    <p className="text-sm font-semibold text-on-surface truncate">{doc.filename}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-on-surface-variant flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(doc.createdAt)}
                      </p>
                      <MoreVertical className="w-4 h-4 text-on-surface-variant hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Analytics - Dynamic */}
        <aside className="w-full lg:w-80 space-y-6">
          <div className="glass-panel rounded-3xl p-8">
            <h3 className="font-headline text-lg text-white mb-6">Analytics Hub</h3>
            <div className="space-y-4">
              <div className="bg-surface/40 p-4 rounded-2xl flex items-center justify-between border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xs text-on-surface-variant">Total Docs</p>
                </div>
                <p className="font-headline text-lg text-white">{documents.length}</p>
              </div>
              <div className="bg-surface/40 p-4 rounded-2xl flex items-center justify-between border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Database className="w-4 h-4 text-secondary" />
                  </div>
                  <p className="text-xs text-on-surface-variant">Storage</p>
                </div>
                <p className="font-headline text-lg text-white">{(documents.length * 0.5).toFixed(1)}MB</p>
              </div>
            </div>

            <div className="mt-10">
              <p className="text-xs font-bold text-primary mb-4 uppercase tracking-widest">Recent Activity</p>
              <div className="space-y-4">
                {documents.slice(0, 2).map((doc, i) => (
                  <div key={i} className="flex gap-4">
                    <div className={cn("w-1.5 h-10 rounded-full", i === 0 ? "bg-secondary" : "bg-primary/30")} />
                    <div>
                      <p className="text-sm font-semibold text-on-surface truncate max-w-[150px]">{doc.filename}</p>
                      <p className="text-[10px] text-on-surface-variant">{doc.status} • {formatTime(doc.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="glass" className="w-full mt-10 h-12 text-on-surface-variant">
              Export Summary Report
            </Button>
          </div>

          {/* Promo Card */}
          <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-[#1a1a2e] to-surface-container-lowest glass-panel">
            <div className="absolute -right-4 -bottom-4">
              <Diamond className="w-32 h-32 text-primary/5" />
            </div>
            <h4 className="font-headline text-lg text-white mb-2">Upgrade to Ultra</h4>
            <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">Unlimited PDF processing and advanced semantic search capabilities.</p>
            <Button className="w-full">Go Pro</Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
