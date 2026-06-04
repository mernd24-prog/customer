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
    <form className="grid gap-3 " onSubmit={handleSubmit(submit)} noValidate>
      {/* Profile Header */}
      <div className="flex gap-3 items-center lg:items-start flex-row lg:flex-col ">
        <div className="w-16 h-16 ">
          <img
            src="/image/png/person.png"
            alt="Icon"
            className="h-full w-full object-cover"
          />
        </div>

        <div className=" my-4">
          <p className=" text-lg font-semibold text-ink md:text-2xl">
            {watch("firstName")} {watch("lastName")}
          </p>

          <p className="break-all font-medium text-sm md:text-lg  text-[#182D50B2]">
            {watch("email")}
          </p>
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
      <Button
        type="submit"
        loading={loading}
        className="w-full text-white sm:w-auto font-semibold "
        size="lg"
      >
        Save profile
      </Button>
    </form>
  );
}
