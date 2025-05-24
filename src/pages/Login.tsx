
import { LoginForm } from "@/components/auth/LoginForm";

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background with gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100"></div>
      
      {/* Animated background elements inspired by the uploaded image */}
      <div className="absolute inset-0 opacity-10">
        {/* Charts and graphs elements */}
        <div className="absolute top-20 left-20 w-16 h-16 bg-blue-300 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-12 h-12 bg-blue-400 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-32 left-40 w-20 h-20 bg-blue-200 rounded-full animate-pulse delay-500"></div>
        
        {/* Bar chart elements */}
        <div className="absolute top-1/4 left-1/4 flex gap-2">
          <div className="w-4 h-16 bg-blue-300 rounded animate-pulse"></div>
          <div className="w-4 h-12 bg-blue-400 rounded animate-pulse delay-200"></div>
          <div className="w-4 h-20 bg-blue-300 rounded animate-pulse delay-400"></div>
          <div className="w-4 h-8 bg-blue-400 rounded animate-pulse delay-600"></div>
        </div>
        
        {/* Pie chart element */}
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 border-8 border-blue-300 border-t-blue-500 rounded-full animate-spin"></div>
        
        {/* Line graph elements */}
        <div className="absolute top-1/2 right-1/3">
          <svg width="100" height="60" className="text-blue-300">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              points="0,50 20,30 40,40 60,10 80,20 100,5"
              className="animate-pulse"
            />
          </svg>
        </div>
        
        {/* Document/book element (central theme from image) */}
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2">
          <div className="w-32 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-lg transform rotate-12 animate-pulse">
            <div className="w-full h-2 bg-white/30 mt-4 rounded"></div>
            <div className="w-3/4 h-2 bg-white/30 mt-2 ml-2 rounded"></div>
            <div className="w-5/6 h-2 bg-white/30 mt-2 ml-2 rounded"></div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl p-8 border border-white/20">
          {/* Logo or system name */}
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-3 rounded-full inline-block mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              SIGRE
            </h1>
            <p className="text-gray-600 text-sm mt-1">Sistema Integrado de Gestão Escolar</p>
          </div>
          
          <LoginForm />
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500/80 backdrop-blur-sm bg-white/30 rounded-lg p-3">
          <p>&copy; {new Date().getFullYear()} SIGRE - Sistema Integrado de Gestão de Recursos Escolares</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
