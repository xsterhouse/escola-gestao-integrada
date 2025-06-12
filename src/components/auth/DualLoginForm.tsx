
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, IdCard, Lock, Eye, EyeOff } from "lucide-react";

export function DualLoginForm() {
  const [activeTab, setActiveTab] = useState("email");
  const [email, setEmail] = useState("");
  const [matricula, setMatricula] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ 
    email: "", 
    matricula: "", 
    password: "" 
  });
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const validateEmailForm = () => {
    const newErrors = { email: "", matricula: "", password: "" };
    
    if (!email) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email inválido";
    }
    
    if (!password) {
      newErrors.password = "Senha é obrigatória";
    } else if (password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }
    
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const validateMatriculaForm = () => {
    const newErrors = { email: "", matricula: "", password: "" };
    
    if (!matricula) {
      newErrors.matricula = "Número de matrícula é obrigatório";
    } else if (matricula.length < 3) {
      newErrors.matricula = "Matrícula deve ter pelo menos 3 caracteres";
    }
    
    if (!password) {
      newErrors.password = "Senha é obrigatória";
    } else if (password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }
    
    setErrors(newErrors);
    return !newErrors.matricula && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = activeTab === "email" ? validateEmailForm() : validateMatriculaForm();
    
    if (!isValid) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os campos inválidos.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const loginCredential = activeTab === "email" ? email : matricula;
      const success = await login(loginCredential, password);
      
      if (success) {
        if (remember) {
          localStorage.setItem("rememberLogin", "true");
          localStorage.setItem("lastLoginType", activeTab);
          localStorage.setItem("lastLoginCredential", loginCredential);
        }
        
        navigate("/dashboard");
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao sistema SIGRE!",
        });
      } else {
        toast({
          title: "Falha no login",
          description: activeTab === "email" 
            ? "Email ou senha incorretos." 
            : "Matrícula ou senha incorretos.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Falha no login",
        description: "Credenciais incorretas ou erro no sistema.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearErrors = (field: string) => {
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  return (
    <Card className="w-full max-w-md bg-white/15 backdrop-blur-xl border border-white/30">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-white">
          Entrar no SIGRE
        </CardTitle>
        <CardDescription className="text-white/80">
          Sistema Integrado de Gestão de Recursos Escolares
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/10">
            <TabsTrigger 
              value="email" 
              className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
            <TabsTrigger 
              value="matricula"
              className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              <IdCard className="w-4 h-4" />
              Matrícula
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-6">
            <TabsContent value="email" className="space-y-4 m-0">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearErrors("email");
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
            </TabsContent>

            <TabsContent value="matricula" className="space-y-4 m-0">
              <div className="space-y-2">
                <Label htmlFor="matricula" className="text-white font-medium">
                  Número de Matrícula
                </Label>
                <Input
                  id="matricula"
                  type="text"
                  placeholder="Digite sua matrícula"
                  value={matricula}
                  onChange={(e) => {
                    setMatricula(e.target.value);
                    clearErrors("matricula");
                  }}
                  className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40 transition-all duration-300 hover:bg-white/15 ${
                    errors.matricula ? "border-red-400 focus:border-red-400" : ""
                  }`}
                  autoComplete="username"
                />
                {errors.matricula && (
                  <p className="text-red-300 text-sm font-medium">{errors.matricula}</p>
                )}
              </div>
            </TabsContent>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white font-medium">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearErrors("password");
                  }}
                  className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40 transition-all duration-300 hover:bg-white/15 pr-10 ${
                    errors.password ? "border-red-400 focus:border-red-400" : ""
                  }`}
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-white/60" />
                  ) : (
                    <Eye className="h-4 w-4 text-white/60" />
                  )}
                </Button>
              </div>
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

            <Button 
              type="submit" 
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  Entrando...
                </div>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
