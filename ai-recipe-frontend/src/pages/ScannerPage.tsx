import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  History,
  Flashlight,
  ZoomIn,
  ScanLine,
  Plus,
  Loader2,
  Barcode,
  Keyboard,
  Search,
  Package
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import AmbientBackground from "@/components/AmbientBackground";
import { BrowserMultiFormatReader } from '@zxing/browser';

const ScannerPage = () => {
  const navigate = useNavigate();
  const { state, addMeal, addRecentScan } = useApp();
  const [activeTab, setActiveTab] = useState<"scan" | "manual" | "search">("scan");
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showManualFallback, setShowManualFallback] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const scanProduct = async (barcode: string) => {
    setLoading(true);
    setScanning(false);
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await res.json();

      if (data.status === 1) {
        const product = data.product;
        const resultData = {
          id: barcode,
          name: product.product_name || "Unknown Product",
          brand: product.brands || "Unknown Brand",
          emoji: "📦",
          servingSize: product.serving_size || "100g",
          kcal: Math.round(product.nutriments?.["energy-kcal_100g"] || 0),
          macros: {
            protein: Math.round(product.nutriments?.proteins_100g || 0),
            carbs: Math.round(product.nutriments?.carbohydrates_100g || 0),
            fats: Math.round(product.nutriments?.fat_100g || 0),
          },
          details: {
            sugar: product.nutriments?.sugars_100g,
            fiber: product.nutriments?.fiber_100g,
            sodium: product.nutriments?.sodium_100g,
          }
        };
        setResult(resultData);
      } else {
        alert("Product not found!");
        setScanning(true);
      }
    } catch (error) {
      console.error("Scan failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'scan') return;

    let stream: MediaStream | null = null;
    const codeReader = new BrowserMultiFormatReader();
    let controls: any = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Start decoding from the video element
          controls = await codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
            if (result) {
              const barcode = result.getText();
              scanProduct(barcode);
            }
          });
        }
      } catch (err) {
        console.error("Camera access denied:", err);
        setShowManualFallback(true);
        setActiveTab("manual");
      }
    };

    if (scanning && !result) {
      startCamera();
    }

    return () => {
      if (controls) controls.stop();
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [activeTab, scanning, result]);

  const handleAddToToday = () => {
    if (!result) return;
    addMeal({
      id: `scan-${Date.now()}`,
      name: result.name,
      kcal: result.kcal,
      protein: result.macros.protein,
      carbs: result.macros.carbs,
      fats: result.macros.fats,
      emoji: "🥗",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    addRecentScan(result);
    setResult(null);
    setScanning(true);
  };

  const handleSave = () => {
    if (!result) return;
    addRecentScan(result);
    setResult(null);
    setScanning(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 relative overflow-hidden">
      <AmbientBackground />

      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold font-syne">Barcode Scanner</h1>
        </div>
        <button className="p-2 hover:bg-muted rounded-full transition-colors text-primary">
          <History size={20} />
        </button>
      </header>

      <main className="container max-w-lg mx-auto pt-24 px-6 space-y-6 relative z-10">
        <div className="relative aspect-[4/5] bg-black rounded-[40px] border-4 border-muted-foreground/20 overflow-hidden group shadow-2xl">
          {activeTab === "scan" && scanning && !result && (
            <div className="absolute inset-0">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ borderRadius: '24px' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64 border-2 border-white/20 rounded-3xl">
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />

                  <motion.div
                    animate={{ top: ["10%", "90%", "10%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute left-4 right-4 h-0.5 bg-primary shadow-[0_0_15px_rgba(var(--primary),0.8)] z-10"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
                </div>
              </div>

              <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6">
                <button className="p-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white hover:bg-white/20 transition-all">
                  <Flashlight size={24} />
                </button>
                <button className="p-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white hover:bg-white/20 transition-all">
                  <ZoomIn size={24} />
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-50">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-sm font-bold font-syne animate-pulse uppercase tracking-widest text-white">Fetching product details...</p>
            </div>
          )}

          {activeTab === "manual" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-muted/20">
              <Barcode className="w-16 h-16 text-muted-foreground mb-6" />
              <input
                type="text"
                placeholder="Enter Barcode Number"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="w-full bg-card border border-border rounded-2xl p-4 text-center font-black tracking-widest text-lg focus:outline-none focus:border-primary transition-all"
              />
              <Button
                onClick={() => scanProduct(barcodeInput)}
                className="w-full mt-4 h-14 rounded-2xl bg-primary font-black uppercase"
              >
                Find Product
              </Button>
            </div>
          )}

          {activeTab === "search" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-muted/20">
              <Search className="w-16 h-16 text-muted-foreground mb-6" />
              <input
                type="text"
                placeholder="Search food name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-card border border-border rounded-2xl p-4 text-center font-bold text-lg focus:outline-none focus:border-primary transition-all"
              />
              <Button
                className="w-full mt-4 h-14 rounded-2xl bg-primary font-black uppercase"
              >
                Search Database
              </Button>
            </div>
          )}
        </div>

        <div className="flex p-1 bg-muted rounded-2xl">
          {[
            { id: "scan", label: "Scan", icon: <Barcode size={14} /> },
            { id: "manual", label: "Manual", icon: <Keyboard size={14} /> },
            { id: "search", label: "Search", icon: <Search size={14} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setScanning(tab.id === 'scan');
                setResult(null);
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all",
                activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-card border border-border rounded-[32px] p-6 space-y-6 shadow-2xl relative z-20"
            >
              <div className="flex gap-4 items-start">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-3xl">
                  {result.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-black font-syne">{result.name}</h3>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{result.brand}</p>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-none rounded-lg text-lg px-2 h-auto py-1 font-black">
                      {result.kcal} <span className="text-[10px] uppercase ml-1">kcal</span>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-muted-foreground uppercase">
                    <Package size={10} />
                    Serving: {result.servingSize}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Protein", value: result.macros.protein, unit: "g", color: "bg-blue-500" },
                  { label: "Carbs", value: result.macros.carbs, unit: "g", color: "bg-yellow-500" },
                  { label: "Fats", value: result.macros.fats, unit: "g", color: "bg-rose-500" }
                ].map((macro) => (
                  <div key={macro.label} className="bg-muted/50 rounded-2xl p-3 flex flex-col items-center gap-1 border border-border/50">
                    <div className="flex items-center gap-1.5">
                      <div className={cn("w-1.5 h-1.5 rounded-full", macro.color)} />
                      <span className="text-[10px] font-black uppercase text-muted-foreground">{macro.label}</span>
                    </div>
                    <span className="text-sm font-black font-syne">{macro.value}{macro.unit}</span>
                  </div>
                ))}
              </div>

              <div className="bg-muted/30 rounded-2xl p-4 grid grid-cols-2 gap-x-6 gap-y-3">
                {[
                  { label: "Sugar", value: result.details.sugar, unit: "g" },
                  { label: "Fiber", value: result.details.fiber, unit: "g" },
                  { label: "Sodium", value: result.details.sodium, unit: "mg" },
                  { label: "Calcium", value: "85", unit: "mg" }
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-bold">{item.label}</span>
                    <span className="font-black font-syne">{item.value || 0}{item.unit}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAddToToday}
                  className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase"
                >
                  Add to Today
                </Button>
                <Button
                  onClick={handleSave}
                  variant="outline"
                  className="h-14 rounded-2xl border-border font-black text-xs uppercase px-8"
                >
                  Save
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!result && state.recentScans.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-2">Recent Scans</h3>
            <div className="space-y-3">
              {state.recentScans.map((scan, i) => (
                <div key={i} className="glass-card p-4 flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
                    {scan.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold truncate">{scan.name}</h4>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{scan.brand}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] font-black text-primary">{scan.kcal} kcal</span>
                      <span className="text-[10px] text-muted-foreground font-medium">• 2h ago</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      addMeal({
                        id: `recent-${Date.now()}`,
                        name: scan.name,
                        kcal: scan.kcal,
                        protein: scan.macros.protein,
                        carbs: scan.macros.carbs,
                        fats: scan.macros.fats,
                        emoji: "🥗",
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      });
                    }}
                    className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
        <div className="h-20" />
      </main>
    </div>
  );
};

export default ScannerPage;
