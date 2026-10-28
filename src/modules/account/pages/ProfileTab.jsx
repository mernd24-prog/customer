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

import Button from "../../../components/ui/buttons/Button";
import OtpInput from "../../../components/ui/OtpInput";
import { useToastThunk } from "../../../hooks/useToastThunk";
import { fetchMe, updateMe } from "../../../features/user/userSlice";
import { apiRequest } from "../../../api/client";
import { endpoints, FILE_UPLOAD_MODULES } from "../../../api/endpoints";
import { profileSchema } from "../../../validations/validationSchemas";
import { sendProfileEmailOtp, verifyProfileEmailOtp } from "../../auth/slices/authSlice";
import { notify } from "../../../utils/notify";
import { useProfileImageState, invalidateProfileImageCache } from "../../../hooks/useProfileImage";

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

const ensureAbsoluteUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  if (/^https?:\/\//i.test(url)) return url;
  const apiBase =
    import.meta.env.VITE_API_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${apiBase.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`;
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
  const { src: profileAvatar, isLoading: isAvatarFetching } = useProfileImageState(
    getAvatar(user),
    user?.updatedAt
  );
  const [localPreview, setLocalPreview] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [email, setEmail] = useState(user?.email || "");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailError, setEmailError] = useState("");

  const displayAvatar = localPreview || profileAvatar;
  const isAvatarLoading = isAvatarFetching || isAvatarUploading;

  const {
    register,
    handleSubmit,
    reset,
    trigger,
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

    setAvatarError("");
    setEmail(user?.email || "");
    setEmailOtp("");
    setEmailOtpSent(false);
    setEmailError("");
  }, [user, reset]);

  const getRequestError = (error, fallback) => {
    const rawMessage =
      (typeof error === "string" ? error : "") ||
      error?.response?.data?.message ||
      error?.response?.data?.error?.message ||
      error?.data?.message ||
      error?.data?.error?.message ||
      error?.error?.message ||
      error?.message ||
      fallback;
    const message = String(rawMessage || fallback);

    if (/already (in use|exists)/i.test(message)) {
      return "This email belongs to another account. Please use a different email address.";
    }
    if (/verified email.*cannot be changed|cannot change.*verified email/i.test(message)) {
      return "Your email is already verified and cannot be changed.";
    }
    if (/invalid or expired otp|otp is invalid or has expired/i.test(message)) {
      return "This OTP is incorrect or has expired. Request a new email OTP and try again.";
    }
    if (/too many|daily.*limit|rate limit/i.test(message)) {
      return "Too many OTP requests or attempts. Please wait before trying again.";
    }
    if (/disabled|not configured/i.test(message)) {
      return "Email OTP delivery is currently unavailable. Please try again later or contact support.";
    }

    return message;
  };

  const handleSendEmailOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailBusy(true);
    setEmailError("");
    try {
      await dispatch(sendProfileEmailOtp({ email: normalizedEmail })).unwrap();
      setEmail(normalizedEmail);
      setEmailOtp("");
      setEmailOtpSent(true);
      notify.success(`A 6-digit OTP was sent to email ${normalizedEmail}.`);
    } catch (error) {
      setEmailError(getRequestError(error, "Unable to send email OTP."));
    } finally {
      setEmailBusy(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!/^\d{6}$/.test(emailOtp)) {
      setEmailError("Enter the complete 6-digit OTP sent to your email.");
      return;
    }
    setEmailBusy(true);
    setEmailError("");
    try {
      await dispatch(verifyProfileEmailOtp({ email, otp: emailOtp })).unwrap();
      await dispatch(fetchMe()).unwrap();
      setEmailOtpSent(false);
      notify.success("Email verified. It is now secured and cannot be edited.");
    } catch (error) {
      setEmailError(getRequestError(error, "The email OTP is invalid or expired."));
    } finally {
      setEmailBusy(false);
    }
  };

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

    // Phone-only accounts intentionally start without names. Surface those
    // required-field errors as soon as profile editing begins instead of
    // leaving a disabled Save button with no explanation.
    window.setTimeout(() => {
      void trigger(["firstName", "lastName"]);
    }, 0);
  };

  const handleCancel = () => {
    reset({
      firstName: user?.profile?.firstName || "",
      lastName: user?.profile?.lastName || "",
    });

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }
    setLocalPreview("");
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

    const localUrl = URL.createObjectURL(file);
    previewUrlRef.current = localUrl;
    setLocalPreview(localUrl);

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

      const absoluteUploadedUrl = ensureAbsoluteUrl(uploadedUrl);

      const { avatarUrl: _oldAvatar, ...restProfileOnUpload } = user?.profile || {};
      const profilePayload = {
        ...restProfileOnUpload,
        firstName: (user?.profile?.firstName || "").trim(),
        lastName: (user?.profile?.lastName || "").trim(),
      };

      if (absoluteUploadedUrl && /^https?:\/\//i.test(absoluteUploadedUrl)) {
        profilePayload.avatarUrl = absoluteUploadedUrl;
      }

      await dispatch(
        updateMe({
          profile: profilePayload,
        }),
      ).unwrap();

      invalidateProfileImageCache();
      await dispatch(fetchMe()).unwrap();

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = "";
      }
      setLocalPreview("");
    } catch (error) {
      console.error("Profile image upload failed:", error);

      setAvatarError(
        error?.message || "Failed to upload profile image.",
      );

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = "";
      }
      setLocalPreview("");
    } finally {
      setIsAvatarUploading(false);
    }
  };

  const submit = async (values) => {
    if (!isEditing) return;

    const { avatarUrl, ...restProfile } = user?.profile || {};
    const profile = {
      ...restProfile,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
    };
    if (avatarUrl && /^https?:\/\//i.test(avatarUrl)) {
      profile.avatarUrl = avatarUrl;
    }

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

  const fieldLabelClass = "text-xs sm:text-sm font-semibold text-[#171A3A]";
  const readonlyBoxClass =
    "flex h-11 min-h-[44px] min-w-0 items-center gap-2.5 rounded-lg border border-[#E7D9B8]/70 bg-[#FAFAFC] px-3.5 text-sm sm:text-base font-normal text-[#171A3A]";
  const inputClass =
    "h-11 min-h-[44px] w-full rounded-lg border border-[#04258633] bg-white px-3.5 text-sm sm:text-base font-normal text-[#171A3A] outline-none transition-colors focus:border-gold";

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      className="grid w-full min-w-0 gap-5"
    >
      {/* Avatar + User Header Card */}
      <section className="flex min-w-0 w-full flex-col gap-3 rounded-lg border border-[#E7D9B8]/70 bg-[#FFFDF8] p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
        <div className="flex min-w-0 items-center gap-3.5 sm:gap-4">
          <div className="relative shrink-0">
            {isAvatarLoading ? (
              <div
                role="status"
                aria-label="Loading profile photo"
                className="flex size-16 items-center justify-center rounded-full border border-[#E6E8F0] bg-[#F2F4F8] sm:size-20"
              >
                <span className="size-5 animate-spin rounded-full border-2 border-gold border-t-transparent sm:size-6" />
              </div>
            ) : (
              <img
                src={displayAvatar}
                alt="Profile"
                width="80"
                height="80"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = FALLBACK_AVATAR;
                }}
                className="size-16 rounded-full border-2 border-white bg-white object-cover shadow-xs sm:size-20"
              />
            )}
            {isEditing && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAvatarUploading || isAvatarFetching || loading}
                  aria-label="Change profile photo"
                  className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full border-2 border-white bg-[#1B1D60] text-white transition hover:bg-[#343B91] disabled:opacity-60"
                >
                  <Camera size={14} />
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
            <h2 className="truncate text-base font-bold text-[#171A3A] sm:text-lg lg:text-xl">
              {fullName}
            </h2>

            <p className="mt-0.5 truncate text-xs sm:text-sm font-normal text-[#64708A]">
              {user?.email || "No email available"}
            </p>

            {avatarError && (
              <p role="alert" className="mt-1 text-xs font-normal text-red-600">
                {avatarError}
              </p>
            )}
          </div>
        </div>

        {/* Edit Profile button */}
        {!isEditing && (
          <button
            type="button"
            onClick={handleEdit}
            className="inline-flex min-h-10 w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-gold-dark focus-visible:outline-none"
          >
            <Pencil size={15} />
            <span>Edit Profile</span>
          </button>
        )}
      </section>

      {/* Row 1: First Name & Last Name */}
      <section className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <div className="grid min-w-0 gap-1.5">
          <label htmlFor="firstName" className={fieldLabelClass}>
            First Name
          </label>

          {isEditing ? (
            <div>
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Enter first name"
                disabled={loading}
                className={inputClass}
                {...register("firstName")}
              />
              {errors.firstName?.message && (
                <p className="mt-1 text-xs font-normal text-red-600">
                  {errors.firstName.message}
                </p>
              )}
            </div>
          ) : (
            <div className={readonlyBoxClass}>
              <UserRound size={17} className="shrink-0 text-[#8D92A3]" />
              <span className="min-w-0 truncate">
                {user?.profile?.firstName || "—"}
              </span>
            </div>
          )}
        </div>

        <div className="grid min-w-0 gap-1.5">
          <label htmlFor="lastName" className={fieldLabelClass}>
            Last Name
          </label>

          {isEditing ? (
            <div>
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Enter last name"
                disabled={loading}
                className={inputClass}
                {...register("lastName")}
              />
              {errors.lastName?.message && (
                <p className="mt-1 text-xs font-normal text-red-600">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          ) : (
            <div className={readonlyBoxClass}>
              <UserRound size={17} className="shrink-0 text-[#8D92A3]" />
              <span className="min-w-0 truncate">
                {user?.profile?.lastName || "—"}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Row 2: Email & Phone */}
      <section className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <div className="grid min-w-0 gap-1.5">
          <label htmlFor="profile-email" className={fieldLabelClass}>
            Email {user?.emailVerified && <span className="text-xs font-semibold text-emerald-700">(Verified)</span>}
          </label>

          {user?.emailVerified || !isEditing ? (
            <div className={readonlyBoxClass}>
              <Mail size={17} className="shrink-0 text-[#8D92A3]" />
              <span className="min-w-0 break-all">
                {user?.email || "—"}
              </span>
            </div>
          ) : (
            <div className="grid gap-2">
              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <Mail size={17} className="absolute left-3 top-3 text-[#8D92A3]" />
                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setEmailOtpSent(false);
                      setEmailOtp("");
                      setEmailError("");
                    }}
                    disabled={emailBusy}
                    placeholder="Add your email address"
                    className="h-11 min-h-[44px] w-full rounded-lg border border-[#04258633] bg-white py-2 pl-10 pr-3 text-sm sm:text-base font-normal text-[#171A3A] outline-none transition-colors focus:border-gold"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendEmailOtp}
                  disabled={emailBusy || !email.trim()}
                  className="min-h-11 shrink-0 rounded-lg bg-[#1B1D60] px-3.5 text-xs font-semibold text-white transition hover:bg-[#2C3080] disabled:opacity-50"
                >
                  {emailOtpSent ? "Resend OTP" : "Verify email"}
                </button>
              </div>

              {emailOtpSent && (
                <div className="grid gap-2 rounded-lg border border-gold/40 bg-[#FFFDF8] p-3">
                  <p className="text-xs font-normal text-[#64708A]">
                    Enter the OTP sent to email <strong>{email}</strong>.
                  </p>
                  <OtpInput
                    value={emailOtp}
                    length={6}
                    onChange={(value) =>
                      setEmailOtp(String(value || "").replace(/\D/g, "").slice(0, 6))
                    }
                    error=""
                  />
                  <button
                    type="button"
                    onClick={handleVerifyEmailOtp}
                    disabled={emailBusy || emailOtp.length !== 6}
                    className="min-h-10 rounded-lg bg-gold px-4 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-gold-dark disabled:opacity-50"
                  >
                    {emailBusy ? "Verifying..." : "Verify email OTP"}
                  </button>
                </div>
              )}

              {emailError && (
                <p role="alert" className="text-xs font-normal text-red-600">
                  {emailError}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="grid min-w-0 gap-1.5">
          <label className={fieldLabelClass}>Phone</label>

          <div className={readonlyBoxClass}>
            <Phone size={17} className="shrink-0 text-[#8D92A3]" />
            <span className="min-w-0 truncate">
              {user?.phone || "—"}
            </span>
          </div>
        </div>
      </section>

      {/* Editing Action Buttons */}
      {isEditing && (
        <div className="flex flex-col-reverse justify-end gap-3 border-t border-[#E7D9B8]/60 pt-4 sm:flex-row">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading || isAvatarUploading}
            className="min-h-10 w-full sm:w-auto rounded-lg border border-[#D9DCE5] px-5 text-xs sm:text-sm font-semibold text-[#171A3A] transition hover:bg-[#F7F7F9] disabled:opacity-60"
          >
            Cancel
          </button>

          <Button
            type="submit"
            loading={loading}
            disabled={!isValid || loading || isAvatarUploading}
            className="w-full sm:w-auto px-6 text-xs sm:text-sm font-semibold text-white min-w-0 sm:min-w-[130px]"
            size="md"
          >
            Save Profile
          </Button>
        </div>
      )}
    </form>
  );
}
