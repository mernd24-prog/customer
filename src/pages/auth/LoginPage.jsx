import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import { toast } from "react-toastify";
import AuthCard from "../../components/ui/AuthCard";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import Seo from "../../components/common/Seo";
import { AUTH_ROUTES } from "../../features/auth/authRoutes";
import { loginUser, socialLogin, clearError } from "../../features/auth/authSlice";
import { useToastThunk } from "../../hooks/useToastThunk";
import { useEffect } from "react";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const run = useToastThunk();
  const { loading, error } = useSelector((s) => s.auth);
  const from = location.state?.from || AUTH_ROUTES.home;

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: location.state?.email || "", password: "" },
  });

  const submit = async (values) => {
    await run(dispatch, loginUser({ email: values.email, password: values.password }), "Welcome back!");
    navigate(from, { replace: true });
  };

  const handleGoogleLogin = () => {
    toast.info("Google sign-in requires a provider ID token. Integrate Firebase Auth to get one.");
  };

  return (
    <>
      <Seo title="Login | Sam Global" description="Sign in to your Sam Global account to shop, track orders, and manage your profile." />
      <AuthCard
        eyebrow="Welcome back"
        title="Sign in to Sam Global"
        subtitle="Access your orders, wallet, loyalty rewards, and personalized deals — all in one place."
      >
        <form className="grid gap-5" onSubmit={handleSubmit(submit)} noValidate>
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Login to your account</h2>
            <p className="mt-1 text-sm text-slate-500">Enter your credentials to continue shopping.</p>
          </div>

          <FormField
            id="email"
            label="Email address"
            type="email"
            registration={register("email")}
            error={errors.email}
            autoComplete="email"
            placeholder="you@example.com"
          />

          <div className="grid gap-1.5">
            <FormField
              id="password"
              label="Password"
              type="password"
              registration={register("password")}
              error={errors.password}
              autoComplete="current-password"
              placeholder="••••••••"
            />
            <div className="flex justify-end">
              <Link
                to={AUTH_ROUTES.forgotPassword}
                className="text-xs font-medium text-slate-600 underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full">
            <LogIn size={18} /> Sign in
          </Button>

          <div className="relative flex items-center gap-3">
            <hr className="flex-1 border-stone-200" />
            <span className="text-xs text-slate-400">or</span>
            <hr className="flex-1 border-stone-200" />
          </div>

          <Button type="button" variant="secondary" className="w-full" onClick={handleGoogleLogin}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="h-4 w-4" />
            Continue with Google
          </Button>

          <p className="text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link to={AUTH_ROUTES.register} className="font-semibold text-slate-950 underline-offset-4 hover:underline">
              Create account
            </Link>
          </p>
          <p className="text-center text-sm text-slate-600">
            Prefer OTP login?{" "}
            <Link to={AUTH_ROUTES.verifyOtp} className="font-semibold text-slate-950 underline-offset-4 hover:underline">
              Login with OTP
            </Link>
          </p>
        </form>
      </AuthCard>
    </>
  );
}
