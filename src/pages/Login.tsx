
import { LoginForm } from "@/components/auth/LoginForm";

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg p-6 sm:p-8">
          <LoginForm />
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} SIGRE - Sistema Integrado de Gestão de Recursos Escolares</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
