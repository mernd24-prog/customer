import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import FormField from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import { useToastThunk } from "../../hooks/useToastThunk";
import { changePassword } from "../../features/auth/authSlice";
import { securitySchema } from "../../validations/validationSchemas";

export default function SecurityTab() {
  const dispatch = useDispatch();
  const run = useToastThunk();
  const { loading } = useSelector((s) => s.auth);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(securitySchema) });

  const submit = async (values) => {
    await run(
      dispatch,
      changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
      "Password changed successfully",
    );
    reset();
  };

  return (
    <form
      className="mx-auto grid max-w-md gap-5"
      onSubmit={handleSubmit(submit)}
      noValidate
    >
      <div className="rounded-[8px] border border-gold-soft bg-gold-soft px-4 py-3  text-sm text-gold-dark">
        Choose a strong password with at least 8 characters, including numbers
        and symbols.
      </div>

      <FormField
        id="currentPassword"
        label="Current password"
        type="password"
        registration={register("currentPassword")}
        error={errors.currentPassword}
        autoComplete="current-password"
        placeholder="••••••••"
      />

      <FormField
        id="newPassword"
        label="New password"
        type="password"
        registration={register("newPassword")}
        error={errors.newPassword}
        autoComplete="new-password"
        placeholder="••••••••"
      />

      <FormField
        id="confirmPassword"
        label="Confirm new password"
        type="password"
        registration={register("confirmPassword")}
        error={errors.confirmPassword}
        autoComplete="new-password"
        placeholder="••••••••"
      />

      <Button type="submit" loading={loading} className="w-full sm:w-auto">
        <KeyRound size={16} /> Change password
      </Button>
    </form>
  );
}
