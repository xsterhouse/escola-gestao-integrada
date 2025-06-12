
import { DualLoginForm } from "@/components/auth/DualLoginForm";

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background with sidebar color tone and uploaded image pattern */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300"
        style={{
          backgroundImage: `url('/lovable-uploads/756d7b92-caaf-43fd-bdac-b90c14f5bb98.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Enhanced overlay with specified background color for better visibility */}
        <div 
          className="absolute inset-0 backdrop-blur-[2px]"
          style={{
            backgroundColor: '#012340',
            opacity: 0.7
          }}
        ></div>
      </div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-16 h-16 bg-slate-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-12 h-12 bg-slate-500 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-32 left-40 w-20 h-20 bg-slate-300 rounded-full animate-pulse delay-500"></div>
        
        {/* Bar chart elements */}
        <div className="absolute top-1/4 left-1/4 flex gap-2">
          <div className="w-4 h-16 bg-slate-400 rounded animate-pulse"></div>
          <div className="w-4 h-12 bg-slate-500 rounded animate-pulse delay-200"></div>
          <div className="w-4 h-20 bg-slate-400 rounded animate-pulse delay-400"></div>
          <div className="w-4 h-8 bg-slate-500 rounded animate-pulse delay-600"></div>
        </div>
        
        {/* Pie chart element */}
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 border-8 border-slate-400 border-t-slate-600 rounded-full animate-spin"></div>
        
        {/* Line graph elements */}
        <div className="absolute top-1/2 right-1/3">
          <svg width="100" height="60" className="text-slate-400">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              points="0,50 20,30 40,40 60,10 80,20 100,5"
              className="animate-pulse"
            />
          </svg>
        </div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-md px-4">
        <DualLoginForm />
        
        <div className="mt-6 text-center text-sm text-slate-100/90 backdrop-blur-sm bg-white/25 rounded-lg p-3 border border-white/20">
          <p>&copy; {new Date().getFullYear()} SIGRE - Sistema Integrado de Gestão de Recursos Escolares</p>
          <p className="text-xs mt-1 text-slate-200/70">Versão Multi-Tenant</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
