
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    
    if (!email) {
      newErrors.email = "E-mail é obrigatório";
    } else if (!validateEmail(email)) {
      newErrors.email = "E-mail inválido";
    }
    
    if (!password) {
      newErrors.password = "Senha é obrigatória";
    } else if (password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }
    
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os campos inválidos.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(email, password, remember);
      navigate("/dashboard");
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao sistema SIGRE!",
      });
    } catch (error) {
      toast({
        title: "Falha no login",
        description: "E-mail ou senha incorretos.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">      
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white font-medium">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu.email@exemplo.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40 transition-all duration-300 hover:bg-white/15 ${
                errors.email ? "border-red-400 focus:border-red-400" : ""
              }`}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-red-300 text-sm font-medium">{errors.email}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white font-medium">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: "" });
              }}
              className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40 transition-all duration-300 hover:bg-white/15 ${
                errors.password ? "border-red-400 focus:border-red-400" : ""
              }`}
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="text-red-300 text-sm font-medium">{errors.password}</p>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(checked) => setRemember(!!checked)}
                className="border-white/30 data-[state=checked]:bg-white/20 data-[state=checked]:border-white/40"
              />
              <Label htmlFor="remember" className="text-sm cursor-pointer text-white/90 hover:text-white transition-colors">
                Lembrar de mim
              </Label>
            </div>
            
            <a href="#" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
              Esqueceu a senha?
            </a>
          </div>
        </div>
        
        <div>
          <Button 
            type="submit" 
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
