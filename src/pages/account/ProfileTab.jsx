import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import FormField from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import { useToastThunk } from "../../hooks/useToastThunk";
import { updateMe, uploadProfileImage } from "../../features/user/userSlice";
import { profileSchema } from "../../validations/validationSchemas";

const fallbackAvatar = "/image/png/person.png";
const isBase64Avatar = (avatarUrl) =>
  typeof avatarUrl === "string" && avatarUrl.startsWith("data:image/");
const normalizeAvatarPreview = (avatarUrl) =>
  typeof avatarUrl === "string" && avatarUrl && !isBase64Avatar(avatarUrl)
    ? avatarUrl
    : fallbackAvatar;
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

export default function ProfileTab({ user }) {
  const dispatch = useDispatch();
  const run = useToastThunk();
  const { loading } = useSelector((s) => s.user);
  const fileInputRef = useRef(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(fallbackAvatar);
  const [avatarError, setAvatarError] = useState("");

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
    },
  });

  useEffect(() => {
    if (user) {
      setAvatarPreview(
        normalizeAvatarPreview(
          user?.profile?.avatarUrl || user?.profile?.avatar,
        ),
      );
      reset({
        firstName: user.profile?.firstName || "",
        lastName: user.profile?.lastName || "",
      });
      setAvatarFile(null);
      setAvatarError("");
    }
  }, [user, reset]);

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith("blob:")) {
        globalThis.URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleFileChange = (event) => {
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
    setAvatarFile(file);
    setAvatarPreview(globalThis.URL.createObjectURL(file));
  };

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

    return run(dispatch, updateMe({ profile }), "Profile updated");
  };

  return (
    <form className="grid gap-3 " onSubmit={handleSubmit(submit)} noValidate>
      {/* Profile Header */}
      <div className="flex gap-3 items-center lg:items-start flex-row lg:flex-col ">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="group relative h-16 w-16">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative h-full w-full cursor-pointer overflow-hidden rounded-full border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B1D60]/40"
            aria-label="Edit profile image"
          >
            <img
              src={avatarPreview}
              alt="Profile avatar"
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = fallbackAvatar;
              }}
            />

            {!avatarFile && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <Pencil size={16} className="text-white" />
              </div>
            )}
          </button>
        </div>

        <div className=" my-4">
          <p className=" text-lg font-semibold text-ink md:text-2xl">
            {watch("firstName")} {watch("lastName")}
          </p>

          <p className="break-all font-medium text-sm md:text-lg  text-[#182D50B2]">
            {user?.email}
          </p>
        </div>
      </div>

      {avatarError && (
        <p className="text-xs font-medium text-red-500">{avatarError}</p>
      )}

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
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-ink">Email</label>
          <div className="flex min-h-11 items-center rounded-[8px] border border-border bg-surface-soft px-3 py-2 text-sm text-muted">
            {user?.email || "—"}
          </div>
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-ink">Phone</label>
          <div className="flex min-h-11 items-center rounded-[8px] border border-border bg-surface-soft px-3 py-2 text-sm text-muted">
            {user?.phone || "—"}
          </div>
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
        size="lg"
      >
        Save profile
      </Button>
    </form>
  );
}
