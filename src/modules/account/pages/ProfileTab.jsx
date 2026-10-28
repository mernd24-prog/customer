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

  const readonlyFieldClass = "grid min-w-0 gap-1.5";

  const readonlyLabelClass =
    "text-sm font-semibold text-navy";

  const readonlyValueClass =
    "flex min-h-11 min-w-0 items-center gap-2 rounded-lg bg-[#F7F7F9] px-3 py-2 text-sm text-[#4B5265] sm:text-base";

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      className="grid w-full min-w-0 gap-3"
    >

      <section className="flex min-w-0 items-center justify-between gap-4 rounded-xl bg-[#FAFAFC]">
        {/* Avatar + Name */}
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative shrink-0">
            {isAvatarLoading ? (
              <div
                role="status"
                aria-label="Loading profile photo"
                className="flex size-[68px] items-center justify-center rounded-full border border-[#E6E8F0] bg-[#F2F4F8] sm:size-20"
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
                className="size-[68px] rounded-full border border-[#E6E8F0] bg-white object-cover sm:size-20"
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

          <div className="min-w-0">
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
        </div>

        {/* Edit Profile button — right side */}
        {!isEditing && (
          <Button
            type="button"
            onClick={handleEdit}
            variant="primary"
            size="md"
            icon={<Pencil size={15} />}
            className="shrink-0 px-4"
          >
            Edit Profile
          </Button>
        )}
      </section>

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
      <section className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4">
        <div className={readonlyFieldClass}>
          <label htmlFor="profile-email" className={readonlyLabelClass}>
            Email {user?.emailVerified && <span className="text-xs text-green-700">(Verified)</span>}
          </label>

          {user?.emailVerified ? (
            <div className={readonlyValueClass}>
              <Mail size={17} className="shrink-0 text-[#697084]" />
              <span className="min-w-0 break-all">{user.email}</span>
            </div>
          ) : (
            <div className="grid gap-2">
              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <Mail size={17} className="absolute left-3 top-3 text-[#697084]" />
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
                    disabled={!isEditing || emailBusy}
                    placeholder="Add your email address"
                    className="min-h-11 w-full rounded-lg border border-[#D9DCE5] bg-white py-2 pl-10 pr-3 text-sm disabled:bg-[#F7F7F9]"
                  />
                </div>
                {isEditing && (
                  <button type="button" onClick={handleSendEmailOtp} disabled={emailBusy || !email.trim()} className="rounded-lg bg-[#1B1D60] px-3 text-xs font-semibold text-white disabled:opacity-50">
                    {emailOtpSent ? "Resend OTP" : "Verify email"}
                  </button>
                )}
              </div>
              {emailOtpSent && (
                <div className="grid gap-2 rounded-lg border border-gold/30 bg-gold/5 p-3">
                  <p className="text-xs text-[#4B5265]">Enter the OTP sent to email <strong>{email}</strong>.</p>
                  <OtpInput value={emailOtp} length={6} onChange={(value) => setEmailOtp(String(value || "").replace(/\D/g, "").slice(0, 6))} error="" />
                  <button type="button" onClick={handleVerifyEmailOtp} disabled={emailBusy || emailOtp.length !== 6} className="min-h-10 rounded-lg bg-gold px-4 text-sm font-semibold text-white disabled:opacity-50">
                    {emailBusy ? "Verifying..." : "Verify email OTP"}
                  </button>
                </div>
              )}
              {!user?.email && !isEditing && <p className="text-xs text-amber-700">Add and verify an email by selecting Edit Profile.</p>}
              {emailError && <p role="alert" className="text-xs font-semibold text-red-600">{emailError}</p>}
            </div>
          )}
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
      {isEditing && (
        <div className="flex flex-col-reverse justify-start gap-3 border-t border-[#E8EAF1] pt-3 sm:flex-row">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading || isAvatarUploading}
            className="min-h-10 w-full rounded-lg border border-[#D9DCE5] px-6 text-sm font-semibold text-navy transition hover:bg-[#F7F7F9] disabled:opacity-60 sm:w-auto"
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
