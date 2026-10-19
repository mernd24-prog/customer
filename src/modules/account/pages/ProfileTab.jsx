
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Camera,
  Mail,
  Phone,
  UserRound,
  Pencil,
} from "lucide-react";

import FormField from "../../../components/ui/FormField";
import Button from "../../../components/ui/buttons/Button";
import { useToastThunk } from "../../../hooks/useToastThunk";
import { fetchMe, updateMe } from "../../../features/user/userSlice";
import { apiRequest } from "../../../api/client";
import { endpoints, FILE_UPLOAD_MODULES } from "../../../api/endpoints";
import { profileSchema } from "../../../validations/validationSchemas";

const FALLBACK_AVATAR = "/image/png/person.png";

const getUploadedFileUrl = (result) => {
  const data = result?.data || result || {};

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

const getAvatar = (user) =>
  user?.profile?.avatarUrl ||
  user?.profile?.avatar ||
  FALLBACK_AVATAR;

export default function ProfileTab({ user }) {
  const dispatch = useDispatch();
  const run = useToastThunk();
  const { loading } = useSelector((state) => state.user);

  const fileInputRef = useRef(null);
  const previewUrlRef = useRef("");

  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(() =>
    getAvatar(user),
  );
  const [avatarError, setAvatarError] = useState("");
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);

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
    reset({
      firstName: user?.profile?.firstName || "",
      lastName: user?.profile?.lastName || "",
    });

    setAvatarPreview(getAvatar(user));
    setAvatarError("");
  }, [user, reset]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleEdit = () => {
    reset({
      firstName: user?.profile?.firstName || "",
      lastName: user?.profile?.lastName || "",
    });

    setAvatarError("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    reset({
      firstName: user?.profile?.firstName || "",
      lastName: user?.profile?.lastName || "",
    });

    setAvatarError("");
    setIsEditing(false);
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Profile image must be 2 MB or smaller.");
      return;
    }

    setAvatarError("");

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const localPreview = URL.createObjectURL(file);
    previewUrlRef.current = localPreview;
    setAvatarPreview(localPreview);

    try {
      setIsAvatarUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("module", FILE_UPLOAD_MODULES.profiles);

      const result = await apiRequest({
        method: "post",
        url: endpoints.fileUploader.upload,
        data: formData,
      });

      const uploadedUrl = getUploadedFileUrl(result);

      if (!uploadedUrl) {
        throw new Error(
          "The server did not return the uploaded image URL.",
        );
      }

      await dispatch(
        updateMe({
          profile: {
            ...(user?.profile || {}),
            avatarUrl: uploadedUrl,
          },
        }),
      ).unwrap();

      await dispatch(fetchMe()).unwrap();

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = "";
      }

      setAvatarPreview(uploadedUrl);
    } catch (error) {
      console.error("Profile image upload failed:", error);

      setAvatarError(
        error?.message || "Failed to upload profile image.",
      );

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = "";
      }

      setAvatarPreview(getAvatar(user));
    } finally {
      setIsAvatarUploading(false);
    }
  };

  const submit = async (values) => {
    if (!isEditing) return;

    const profile = {
      ...(user?.profile || {}),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
    };

    try {
      await run(
        dispatch,
        updateMe({ profile }),
        "Profile updated",
      );

      await dispatch(fetchMe()).unwrap();

      setIsEditing(false);
    } catch (error) {
      console.error("Profile update failed:", error);
    }
  };

  const fullName =
    [
      user?.profile?.firstName,
      user?.profile?.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    user?.name ||
    "Your account";

  const readonlyFieldClass = "grid min-w-0 gap-1.5";

  const readonlyLabelClass =
    "text-sm font-semibold text-[#1B1D60]";

  const readonlyValueClass =
    "flex min-h-11 min-w-0 items-center gap-2 rounded-lg bg-[#F7F7F9] px-3 py-2 text-sm text-[#4B5265] sm:text-base";

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      className="grid w-full min-w-0 gap-3"
    >
      {/* Profile heading and edit action */}
      <header className="flex flex-col gap-3 border-b border-[#E7D9B8] pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#F5E9C9] text-[#1B1D60]">
            <UserRound size={21} />
          </span>

          <div className="min-w-0">
            <h2 className="text-lg font-bold leading-6 text-[#1B1D60] sm:text-xl">
              My Profile
            </h2>

            <p className="mt-1 text-sm leading-5 text-[#64708A]">
              Manage your personal details and profile photo.
            </p>
          </div>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleEdit}
            className="inline-flex min-h-10 w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-gold bg-gold px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 sm:w-auto"
          >
            <Pencil size={15} />
            Edit Profile
          </button>
        )}
      </header>

      {/* Profile photo and account identity */}
      <section className="flex min-w-0 items-center gap-4 rounded-xl bg-[#FAFAFC]">
        <div className="relative shrink-0">
          <img
            src={avatarPreview}
            alt="Profile"
            width="80"
            height="80"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = FALLBACK_AVATAR;
            }}
            className="size-[68px] rounded-full border border-[#E6E8F0] bg-white object-cover sm:size-20"
          />

          {isEditing && (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAvatarUploading || loading}
                aria-label="Change profile photo"
                className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full border-2 border-white bg-[#1B1D60] text-white transition hover:bg-[#343B91] disabled:opacity-60"
              >
                {isAvatarUploading ? (
                  <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Camera size={14} />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={isAvatarUploading || loading}
                className="hidden"
              />
            </>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-bold text-[#171A3A] sm:text-lg">
            {fullName}
          </h2>

          <p className="mt-1 text-xs text-[#697084] sm:text-sm">
            {user?.email || "No email available"}
          </p>

          {avatarError && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {avatarError}
            </p>
          )}
        </div>
      </section>

      {/* Name fields: read-only until Edit Profile is clicked */}
      <section className="grid min-w-0 gap-2 sm:grid-cols-2 sm:gap-3">
        <div className="min-w-0">
          <FormField
            id="firstName"
            label="First Name"
            registration={register("firstName")}
            error={isEditing ? errors.firstName : undefined}
            autoComplete="given-name"
            placeholder="Enter first name"
            disabled={loading || !isEditing}
          />
        </div>

        <div className="min-w-0">
          <FormField
            id="lastName"
            label="Last Name"
            registration={register("lastName")}
            error={isEditing ? errors.lastName : undefined}
            autoComplete="family-name"
            placeholder="Enter last name"
            disabled={loading || !isEditing}
          />
        </div>
      </section>

      {/* Read-only contact information */}
      <section className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4">
        <div className={readonlyFieldClass}>
          <label className={readonlyLabelClass}>Email</label>

          <div className={readonlyValueClass}>
            <Mail
              size={17}
              className="shrink-0 text-[#697084]"
            />

            <span className="min-w-0 break-all">
              {user?.email || "—"}
            </span>
          </div>
        </div>

        <div className={readonlyFieldClass}>
          <label className={readonlyLabelClass}>Phone</label>

          <div className={readonlyValueClass}>
            <Phone
              size={17}
              className="shrink-0 text-[#697084]"
            />

            <span className="min-w-0 break-words">
              {user?.phone || "—"}
            </span>
          </div>
        </div>
      </section>

      {/* Save and Cancel actions appear only in edit mode */}
      {isEditing && (
        <div className="flex flex-col-reverse justify-start gap-3 border-t border-[#E8EAF1] pt-3 sm:flex-row">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading || isAvatarUploading}
            className="min-h-10 w-full rounded-lg border border-[#D9DCE5] px-6 text-sm font-semibold text-[#1B1D60] transition hover:bg-[#F7F7F9] disabled:opacity-60 sm:w-auto"
          >
            Cancel
          </button>

          <Button
            type="submit"
            loading={loading}
            disabled={
              !isValid ||
              loading ||
              isAvatarUploading
            }
            className="w-full px-6 text-sm font-semibold text-white sm:w-auto sm:min-w-[150px]"
            size="lg"
          >
            Save Profile
          </Button>
        </div>
      )}
    </form>
  );
}
