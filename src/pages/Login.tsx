import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/api";
import { Lock, User, KeyRound, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { TextScramble } from "@/components/ui/text-scramble";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

  // TEMPORARY BYPASS: Accept any credentials for testing
  //   setTimeout(() => {
  //     login("mock_test_token_12345");
  //     navigate("/");
  //     setLoading(false);
  //   }, 500);

    // Original Live API Logic:
    try {
      const response = await api.post("/api/auth/login", { email, password });
      if (response.data.token) {
        login(response.data.token);
        navigate("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="min-h-screen text-foreground font-sans flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10 font-sans"
      >
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        <div className="bg-glass border border-glass-border rounded-[2.5rem] p-8 md:p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div className="p-8 pb-6 text-center border-b border-glass-border">
            <span className="block font-bold text-4xl tracking-tight text-foreground leading-none mb-1">IETECH</span>
            <span className="font-medium text-xs tracking-widest text-primary uppercase">Secure Access</span>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5 ml-1">Email / Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-foreground/40" />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none transition-all"
                    placeholder="admin@gdgiet.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5 ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-foreground/40" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-medium rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-primary/20"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <span>Authenticate</span>
              )}
            </button>
          </form>

        </div>
      </motion.div>
    </div>
  );
};
