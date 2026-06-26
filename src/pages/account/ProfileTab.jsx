import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormField from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import { useToastThunk } from "../../hooks/useToastThunk";
import {
  fetchMe,
  updateMe,
  uploadProfileImage,
} from "../../features/user/userSlice";
import { profileSchema } from "../../validations/validationSchemas";

const getUploadedFileUrl = (uploadResult) => {
  const data = uploadResult?.data || uploadResult;
  const file =
    data?.file ||
    data?.uploadedFile ||
    data?.attachment ||
    data?.files?.[0] ||
    data?.items?.[0] ||
    data?.[0];

  return (
    data?.url ||
    data?.imageURL ||
    data?.fileUrl ||
    data?.fileURL ||
    data?.path ||
    data?.location ||
    data?.secureUrl ||
    file?.url ||
    file?.imageURL ||
    file?.fileUrl ||
    file?.fileURL ||
    file?.path ||
    file?.location ||
    file?.secureUrl ||
    ""
  );
};

export default function ProfileTab({ user, avatarFile }) {
  const dispatch = useDispatch();
  const run = useToastThunk();
  const { loading } = useSelector((s) => s.user);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.profile?.firstName || "",
      lastName: user?.profile?.lastName || "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.profile?.firstName || "",
        lastName: user.profile?.lastName || "",
      });
    }
  }, [user, reset]);

  const submit = async (values) => {
    const profile = {
      firstName: values.firstName,
      lastName: values.lastName,
    };

    if (avatarFile) {
      const uploadResult = await run(
        dispatch,
        uploadProfileImage({ file: avatarFile }),
      );
      const avatarUrl = getUploadedFileUrl(uploadResult);

      if (!avatarUrl) {
        throw new Error("Profile image upload did not return a file URL.");
      }

      profile.avatarUrl = avatarUrl;
    }

    const updatedProfile = await run(
      dispatch,
      updateMe({ profile }),
      "Profile updated",
    );
    await dispatch(fetchMe()).unwrap();
    return updatedProfile;
  };

  const readonlyFieldClass = "grid gap-1.5";
  const readonlyLabelClass = "text-lg font-medium text-ink";
  const readonlyValueClass =
    "flex min-h-11 items-center rounded-[8px] border border-border bg-surface-soft px-3 py-2 text-lg text-muted";

  return (
    <form className="grid gap-3 " onSubmit={handleSubmit(submit)} noValidate>
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

      {/* Contact Fields — read-only; email/phone are changed via account settings */}
      <div className="grid  gap-4 sm:grid-cols-2">
        <div className={readonlyFieldClass}>
          <label className={readonlyLabelClass}>Email</label>
          <div className={readonlyValueClass}>{user?.email || "—"}</div>
        </div>

        <div className={readonlyFieldClass}>
          <label className={readonlyLabelClass}>Phone</label>
          <div className={readonlyValueClass}>{user?.phone || "—"}</div>
        </div>
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
        size="xl"
      >
        Save profile
      </Button>
    </form>
  );
}
