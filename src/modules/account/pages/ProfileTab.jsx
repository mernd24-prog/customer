import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import FormField from "../../../components/ui/FormField";
import Button from "../../../components/ui/buttons/Button";
import { useToastThunk } from "../../../hooks/useToastThunk";
import {
  fetchMe,
  updateMe,
  uploadProfileImage,
} from "../../../features/user/userSlice";
import { profileSchema } from "../../../validations/validationSchemas";

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
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    reValidateMode: "onChange",
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

  const readonlyFieldClass = "grid min-w-0 gap-1.5";

  const readonlyLabelClass =
    "text-xs font-medium text-ink sm:text-sm lg:text-base";

  const readonlyValueClass =
    "flex min-h-10 min-w-0 w-full items-center overflow-hidden rounded-[8px] border border-border bg-surface-soft px-2.5 py-2 text-sm leading-tight text-muted break-words sm:min-h-11 sm:px-3 sm:text-base";

  return (
    <form
      className="
        grid
        min-w-0
        w-full
        max-w-full
        gap-3
        overflow-hidden
      "
      onSubmit={handleSubmit(submit)}
      noValidate
    >
      {/* Name Fields */}
      <div className="grid min-w-0 w-full gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="min-w-0 w-full">
          <FormField
            id="firstName"
            label="First Name"
            registration={register("firstName")}
            error={errors.firstName}
            autoComplete="given-name"
            placeholder="Enter First Name"
            disabled={loading}
          />
        </div>

        <div className="min-w-0 w-full">
          <FormField
            id="lastName"
            label="Last Name"
            registration={register("lastName")}
            error={errors.lastName}
            autoComplete="family-name"
            placeholder="Enter Last Name"
            disabled={loading}
          />
        </div>
      </div>

      {/* Contact Fields */}
      <div className="grid min-w-0 w-full gap-3 sm:grid-cols-2 sm:gap-4">
        <div className={readonlyFieldClass}>
          <label className={readonlyLabelClass}>Email</label>

          <div
            className={readonlyValueClass}
            title={user?.email || "—"}
          >
            <span className="min-w-0 max-w-full break-all">
              {user?.email || "—"}
            </span>
          </div>
        </div>

        <div className={readonlyFieldClass}>
          <label className={readonlyLabelClass}>Phone</label>

          <div className={readonlyValueClass}>
            <span className="min-w-0 max-w-full break-words">
              {user?.phone || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        loading={loading}
        disabled={!isValid || loading}
        className="
          w-full
          min-w-0
          text-sm
          font-semibold
          text-white
          sm:w-auto
        "
        size="xl"
      >
        Save Profile
      </Button>
    </form>
  );
}