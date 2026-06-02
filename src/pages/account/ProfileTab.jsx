import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "lucide-react";
import FormField from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import { useToastThunk } from "../../hooks/useToastThunk";
import { updateMe } from "../../features/user/userSlice";
import { profileSchema } from "../../validations/validationSchemas";

export default function ProfileTab({ user }) {
  const dispatch = useDispatch();
  const run = useToastThunk();
  const { loading } = useSelector((s) => s.user);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.profile?.firstName || "",
      lastName: user?.profile?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.profile?.firstName || "",
        lastName: user.profile?.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user, reset]);

  const submit = (values) =>
    run(
      dispatch,
      updateMe({
        email: values.email,
        phone: values.phone,
        profile: {
          firstName: values.firstName,
          lastName: values.lastName,
        },
      }),
      "Profile updated",
    );

  return (
    <form className="grid gap-5" onSubmit={handleSubmit(submit)} noValidate>
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold sm:h-16 sm:w-16">
          <User size={32} className="h-8 w-8 sm:h-7 sm:w-7" />
        </div>

        <div className="w-full sm:w-auto">
          <p className=" text-lg font-semibold text-ink sm:text-base">
            {watch("firstName")} {watch("lastName")}
          </p>

          <p className="break-all  text-sm text-muted">{watch("email")}</p>
        </div>
      </div>

      {/* Name Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="firstName"
          label="First name"
          registration={register("firstName")}
          error={errors.firstName}
          autoComplete="given-name"
        />

        <FormField
          id="lastName"
          label="Last name"
          registration={register("lastName")}
          error={errors.lastName}
          autoComplete="family-name"
        />
      </div>

      {/* Contact Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="email"
          label="Email"
          registration={register("email")}
          error={errors.email}
          type="email"
          autoComplete="email"
        />

        <FormField
          id="phone"
          label="Phone"
          registration={register("phone")}
          error={errors.phone}
          type="tel"
          autoComplete="tel"
          inputMode="numeric"
          placeholder="Enter phone number"
        />
      </div>

      {/* Role */}
      <FormField
        id="role"
        label="Role"
        value={user?.role || "buyer"}
        disabled
        readOnly
      />

      {/* Submit Button */}
      <Button type="submit" loading={loading} className="w-full sm:w-auto">
        Save profile
      </Button>
    </form>
  );
}
