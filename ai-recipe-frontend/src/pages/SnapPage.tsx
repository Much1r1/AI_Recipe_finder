import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Zap, Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import AmbientBackground from "@/components/AmbientBackground";

const SnapPage = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isScanning && !hasPhoto) {
      startCamera();
    }
    return () => stopCamera();
  }, [isScanning, hasPhoto]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const takePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg");

    setIsAnalyzing(true);
    stopCamera();

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "https://ai-recipe-finder-gfdv.onrender.com";
      const res = await fetch(`${apiUrl}/api/v1/tracker/calories/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_data: imageData })
      });

      if (!res.ok) throw new Error("Analysis failed");

      const data = await res.json();
      setAnalysisResult(data.analysis);
      setHasPhoto(true);
    } catch (err) {
      console.error("Analysis error:", err);
      setAnalysisResult("Sorry, I couldn't analyze the image. Please try again.");
      setHasPhoto(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <AmbientBackground />

      {/* Header */}
      <header className="relative z-20 p-6 flex items-center justify-between bg-gradient-to-b from-background/80 to-transparent">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/10 backdrop-blur-md">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">AI Vision</span>
          <h1 className="text-lg font-bold font-syne">Snap & Track</h1>
        </div>
        <div className="w-10" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        {!isScanning ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8"
          >
            <div className="w-32 h-32 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(200,245,96,0.2)]">
              <Camera className="w-12 h-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-syne">Ready to track?</h2>
              <p className="text-muted-foreground max-w-xs mx-auto">
                Point your camera at your meal. Our AI will identify the ingredients and estimate calories.
              </p>
            </div>
            <Button
              onClick={() => setIsScanning(true)}
              className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-bold text-lg"
            >
              Open Scanner
            </Button>
          </motion.div>
        ) : (
          <div className="w-full max-w-md aspect-[3/4] rounded-3xl overflow-hidden relative border-2 border-white/20">
            {isAnalyzing ? (
              <div className="absolute inset-0 bg-background/40 backdrop-blur-sm z-30 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="font-bold font-syne animate-pulse text-primary uppercase tracking-widest">Analyzing Meal...</p>
              </div>
            ) : hasPhoto ? (
              <div className="absolute inset-0 bg-card flex flex-col items-center justify-center p-8 space-y-6 overflow-y-auto">
                <Sparkles className="w-16 h-16 text-primary" />
                <div className="text-center space-y-2 w-full">
                  <h3 className="text-2xl font-bold font-syne text-card-foreground">AI Analysis</h3>
                  <div className="p-4 bg-muted/50 rounded-2xl border border-border space-y-2">
                    <p className="text-sm text-left whitespace-pre-wrap text-foreground font-medium leading-relaxed">
                      {analysisResult}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold shrink-0"
                >
                  Log to Dashboard
                </Button>
                <button onClick={() => { setHasPhoto(false); setIsScanning(true); setAnalysisResult(null); }} className="text-muted-foreground font-bold shrink-0">
                  Retake
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                {/* Scanner Overlay */}
                <div className="absolute inset-0 z-20 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-primary rounded-3xl opacity-50 shadow-[0_0_20px_rgba(200,245,96,0.3)]" />
                  <motion.div
                    animate={{ top: ["25%", "75%", "25%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-1/2 -translate-x-1/2 w-64 h-0.5 bg-primary shadow-[0_0_10px_rgba(200,245,96,1)]"
                  />
                </div>

                <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center px-8 gap-4">
                  <button
                    onClick={() => setIsScanning(false)}
                    className="p-4 rounded-2xl bg-white/10 backdrop-blur-md"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={takePhoto}
                    className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2"
                  >
                    <Zap className="w-5 h-5 fill-current" />
                    Snap Meal
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Background Decor */}
      <div className="fixed bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none -z-10" />
    </div>
  );
};

export default SnapPage;
