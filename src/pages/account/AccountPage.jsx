import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import {
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Home,
  KeyRound,
  MapPin,
  Pencil,
  Shield,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import ApiState from "../../components/common/ApiState";
import Seo from "../../components/common/Seo";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import { useToastThunk } from "../../hooks/useToastThunk";
import {
  fetchMe,
  updateMe,
  addAddress,
  updateAddress,
  deleteAddress,
  submitUserKyc,
  uploadKycDocuments,
} from "../../features/user/userSlice";
import { changePassword } from "../../features/auth/authSlice";
import { profileSchema, addressSchema, securitySchema, kycSchema } from "../../validations/validationSchemas";

// ─── Tab nav ──────────────────────────────────────────────────────────────────

const TABS = [
  { id: "profile", label: "Profile", icon: User, path: "/account/profile" },
  { id: "addresses", label: "Addresses", icon: MapPin, path: "/account/addresses" },
  { id: "security", label: "Security", icon: KeyRound, path: "/account/security" },
  { id: "kyc", label: "KYC", icon: Shield, path: "/account/kyc" },
];

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab({ user }) {
  const dispatch = useDispatch();
  const run = useToastThunk();
  const { loading } = useSelector((s) => s.user);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.profile?.firstName || "",
      lastName: user?.profile?.lastName || "",
      avatarUrl: user?.profile?.avatarUrl || "",
    },
  });

  const submit = (values) =>
    run(dispatch, updateMe({ profile: { firstName: values.firstName, lastName: values.lastName, avatarUrl: values.avatarUrl || undefined } }), "Profile updated");

  return (
    <form className="grid gap-5" onSubmit={handleSubmit(submit)} noValidate>
      <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div className="flex h-20 w-20 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full bg-[#F5ECDD] text-[#CE9F2D]">
          {user?.profile?.avatarUrl ? (
            <img src={user.profile.avatarUrl} alt="Avatar" className="h-full w-full rounded-full object-cover" />
          ) : (
            <User size={32} className="sm:h-7 sm:w-7 h-8 w-8" />
          )}
        </div>
        <div className="w-full sm:w-auto">
          <p className="font-montserrat text-lg sm:text-base font-semibold text-[#2E2E2E]">
            {user?.profile?.firstName} {user?.profile?.lastName}
          </p>
          <p className="font-montserrat text-sm text-[#787878] break-all">{user?.email}</p>
        </div>
      </div>

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

      <FormField
        id="avatarUrl"
        label="Avatar URL"
        registration={register("avatarUrl")}
        error={errors.avatarUrl}
        placeholder="https://example.com/avatar.jpg"
        type="url"
      />

      <div className="rounded-[8px] border border-[#e7dfd1] bg-[#FAF6EE] px-4 py-3 font-montserrat text-sm text-[#787878] break-words">
        <p className="flex flex-col sm:flex-row sm:gap-2"><span className="font-semibold text-[#2E2E2E]">Email:</span> <span className="break-all">{user?.email}</span></p>
        <p className="mt-2 sm:mt-1 flex flex-col sm:flex-row sm:gap-2"><span className="font-semibold text-[#2E2E2E]">Phone:</span> <span>{user?.phone || "Not set"}</span></p>
        <p className="mt-2 sm:mt-1 flex flex-col sm:flex-row sm:gap-2"><span className="font-semibold text-[#2E2E2E]">Role:</span> <span className="capitalize">{user?.role || "buyer"}</span></p>
      </div>

      <Button type="submit" loading={loading} className="w-full sm:w-auto">
        Save profile
      </Button>
    </form>
  );
}

// ─── Address Tab ──────────────────────────────────────────────────────────────

function AddressTab({ user }) {
  const dispatch = useDispatch();
  const run = useToastThunk();
  const { loading } = useSelector((s) => s.user);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const addresses = user?.addresses || [];

  const addForm = useForm({ resolver: zodResolver(addressSchema), defaultValues: { country: "India", isDefault: false } });
  const editForm = useForm({ resolver: zodResolver(addressSchema) });

  const startEdit = (addr) => {
    setEditingId(addr._id || addr.id);
    editForm.reset({ ...addr, isDefault: Boolean(addr.isDefault) });
  };

  const cancelEdit = () => {
    setEditingId(null);
    editForm.reset();
  };

  const handleAdd = async (values) => {
    await run(dispatch, addAddress({ ...values, isDefault: Boolean(values.isDefault) }), "Address added");
    addForm.reset({ country: "India", isDefault: false });
    setShowAddForm(false);
    dispatch(fetchMe());
  };

  const handleUpdate = async (values) => {
    await run(dispatch, updateAddress({ addressId: editingId, ...values, isDefault: Boolean(values.isDefault) }), "Address updated");
    setEditingId(null);
    dispatch(fetchMe());
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm("Delete this address?")) return;
    await run(dispatch, deleteAddress({ addressId }), "Address deleted");
    dispatch(fetchMe());
  };

  return (
    <div className="grid gap-6">
      {/* Existing addresses */}
      {addresses.length > 0 ? (
        <div className="grid gap-4">
          {addresses.map((addr) => {
            const addrId = addr._id || addr.id;
            const isEditing = editingId === addrId;
            return (
              <div key={addrId} className="rounded-[10px] border border-[#e7dfd1] bg-white p-4">
                {isEditing ? (
                  <form className="grid gap-4" onSubmit={editForm.handleSubmit(handleUpdate)} noValidate>
                    <p className="text-sm font-medium text-[#787878]">Edit address</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField id={`edit-label-${addrId}`} label="Label" registration={editForm.register("label")} error={editForm.formState.errors.label} placeholder="Home, Work…" />
                      <FormField id={`edit-fullName-${addrId}`} label="Full name" registration={editForm.register("fullName")} error={editForm.formState.errors.fullName} autoComplete="name" />
                    </div>
                    <FormField id={`edit-phone-${addrId}`} label="Phone" type="tel" registration={editForm.register("phone")} error={editForm.formState.errors.phone} autoComplete="tel" />
                    <FormField id={`edit-line1-${addrId}`} label="Address line 1" registration={editForm.register("line1")} error={editForm.formState.errors.line1} autoComplete="address-line1" />
                    <FormField id={`edit-line2-${addrId}`} label="Address line 2" registration={editForm.register("line2")} error={editForm.formState.errors.line2} autoComplete="address-line2" />
                    <div className="grid gap-4 sm:grid-cols-3">
                      <FormField id={`edit-city-${addrId}`} label="City" registration={editForm.register("city")} error={editForm.formState.errors.city} autoComplete="address-level2" />
                      <FormField id={`edit-state-${addrId}`} label="State" registration={editForm.register("state")} error={editForm.formState.errors.state} autoComplete="address-level1" />
                      <FormField id={`edit-postalCode-${addrId}`} label="Postal code" registration={editForm.register("postalCode")} error={editForm.formState.errors.postalCode} autoComplete="postal-code" />
                    </div>
                    <FormField id={`edit-country-${addrId}`} label="Country" registration={editForm.register("country")} error={editForm.formState.errors.country} autoComplete="country-name" />
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-[#787878]">
                      <input type="checkbox" {...editForm.register("isDefault")} className="h-4 w-4 rounded border-[#cfc6b8]" />
                      Set as default address
                    </label>
                    <div className="flex gap-3">
                      <Button type="submit" loading={loading}>Save changes</Button>
                      <Button type="button" variant="secondary" onClick={cancelEdit}>Cancel</Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Home size={14} className="text-[#A6A6A6]" />
                        <span className="text-sm font-semibold text-[#2E2E2E]">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Default</span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-[#787878]">{addr.fullName} · {addr.phone}</p>
                      <p className="text-sm text-[#787878]">
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} {addr.postalCode}, {addr.country}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(addr)}
                        className="rounded p-1.5 text-[#A6A6A6] hover:bg-[#FAF6EE] hover:text-[#2E2E2E] transition"
                        aria-label="Edit address"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(addrId)}
                        className="rounded p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                        aria-label="Delete address"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[10px] border border-dashed border-[#cfc6b8] bg-[#FAF6EE] p-8 text-center">
          <MapPin size={24} className="mx-auto mb-2 text-[#A6A6A6]" />
          <p className="font-montserrat text-sm text-[#787878]">No addresses saved yet.</p>
        </div>
      )}

      {/* Add address toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowAddForm((v) => !v)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#2E2E2E] underline-offset-4 hover:underline"
        >
          {showAddForm ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {showAddForm ? "Cancel" : "Add new address"}
        </button>

        {showAddForm && (
          <form className="mt-4 grid gap-4 rounded-[10px] border border-[#e7dfd1] bg-white p-4" onSubmit={addForm.handleSubmit(handleAdd)} noValidate>
            <p className="text-sm font-medium text-[#787878]">New address</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="add-label" label="Label" registration={addForm.register("label")} error={addForm.formState.errors.label} placeholder="Home, Work…" />
              <FormField id="add-fullName" label="Full name" registration={addForm.register("fullName")} error={addForm.formState.errors.fullName} autoComplete="name" />
            </div>
            <FormField id="add-phone" label="Phone" type="tel" registration={addForm.register("phone")} error={addForm.formState.errors.phone} autoComplete="tel" />
            <FormField id="add-line1" label="Address line 1" registration={addForm.register("line1")} error={addForm.formState.errors.line1} autoComplete="address-line1" />
            <FormField id="add-line2" label="Address line 2 (optional)" registration={addForm.register("line2")} error={addForm.formState.errors.line2} autoComplete="address-line2" />
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField id="add-city" label="City" registration={addForm.register("city")} error={addForm.formState.errors.city} autoComplete="address-level2" />
              <FormField id="add-state" label="State" registration={addForm.register("state")} error={addForm.formState.errors.state} autoComplete="address-level1" />
              <FormField id="add-postalCode" label="Postal code" registration={addForm.register("postalCode")} error={addForm.formState.errors.postalCode} autoComplete="postal-code" />
            </div>
            <FormField id="add-country" label="Country" registration={addForm.register("country")} error={addForm.formState.errors.country} autoComplete="country-name" />
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[#787878]">
              <input type="checkbox" {...addForm.register("isDefault")} className="h-4 w-4 rounded border-[#cfc6b8]" />
              Set as default address
            </label>
            <Button type="submit" loading={loading} className="w-full sm:w-auto">
              Save address
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
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
    await run(dispatch, changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword }), "Password changed successfully");
    reset();
  };

  return (
    <form className="mx-auto grid max-w-md gap-5" onSubmit={handleSubmit(submit)} noValidate>
      <div className="rounded-[8px] border border-[#F5ECDD] bg-[#FFF8EC] px-4 py-3 font-montserrat text-sm text-[#A26D27]">
        Choose a strong password with at least 8 characters, including numbers and symbols.
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

// ─── KYC Tab ──────────────────────────────────────────────────────────────────

const KYC_DOCS = [
  { key: "panDocumentUrl", label: "PAN card" },
  { key: "gstCertificateUrl", label: "GST certificate (optional)" },
  { key: "aadhaarFrontUrl", label: "Aadhaar front" },
  { key: "aadhaarBackUrl", label: "Aadhaar back" },
  { key: "addressProofUrl", label: "Address proof" },
];

function KycTab({ user }) {
  const dispatch = useDispatch();
  const run = useToastThunk();
  const { loading } = useSelector((s) => s.user);
  const [docUrls, setDocUrls] = useState({});
  const kyc = user?.kyc;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      legalName: kyc?.legalName || user?.profile?.firstName || "",
      panNumber: kyc?.panNumber || "",
      aadhaarNumber: kyc?.aadhaarNumber || "",
    },
  });

  const handleDocUpload = async (docKey, url) => {
    if (!url) return;
    setDocUrls((prev) => ({ ...prev, [docKey]: url }));
  };

  const submit = async (values) => {
    if (Object.keys(docUrls).length > 0) {
      await run(dispatch, uploadKycDocuments({ documents: docUrls }), "Documents saved");
    }
    await run(
      dispatch,
      submitUserKyc({
        legalName: values.legalName,
        panNumber: values.panNumber,
        aadhaarNumber: values.aadhaarNumber,
        documents: docUrls,
      }),
      "KYC submitted for review",
    );
  };

  const statusColor = {
    verified: "text-emerald-700 bg-emerald-100",
    under_review: "text-amber-700 bg-amber-100",
    rejected: "text-red-700 bg-red-100",
    submitted: "text-blue-700 bg-blue-100",
  }[kyc?.status] || "text-[#787878] bg-[#FAF6EE]";

  return (
    <form className="grid gap-6" onSubmit={handleSubmit(submit)} noValidate>
      {kyc?.status && (
        <div className="flex items-center gap-3">
          <BadgeCheck size={20} className="shrink-0 text-[#787878]" />
          <div>
            <p className="text-sm text-[#A6A6A6]">KYC status</p>
            <span className={`mt-0.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusColor}`}>
              {kyc.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      )}

      {kyc?.status === "verified" ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Your KYC is verified. No action needed.
        </div>
      ) : (
        <>
          <div className="grid gap-5 max-w-md">
            <FormField
              id="legalName"
              label="Legal name (as on PAN)"
              registration={register("legalName")}
              error={errors.legalName}
              placeholder="As it appears on your PAN card"
            />
            <FormField
              id="panNumber"
              label="PAN number"
              registration={register("panNumber")}
              error={errors.panNumber}
              placeholder="ABCDE1234F"
              className="uppercase"
            />
            <FormField
              id="aadhaarNumber"
              label="Aadhaar number"
              registration={register("aadhaarNumber")}
              error={errors.aadhaarNumber}
              placeholder="12-digit Aadhaar"
              inputMode="numeric"
            />
          </div>

          {/* Document URLs */}
          <div>
            <p className="mb-3 text-sm font-medium text-[#2E2E2E]">Document URLs</p>
            <p className="mb-4 text-xs text-[#A6A6A6]">Upload each document to a file hosting service and paste the URL here.</p>
            <div className="grid gap-3">
              {KYC_DOCS.map(({ key, label }) => (
                <label key={key} className="grid gap-1.5 text-sm font-medium text-[#2E2E2E]">
                  <span className="flex items-center gap-1.5">
                    <Upload size={13} /> {label}
                  </span>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={docUrls[key] || ""}
                    onChange={(e) => handleDocUpload(key, e.target.value)}
                    className="min-h-10 rounded-md border border-[#cfc6b8] bg-white px-3 py-2 text-[#2E2E2E] outline-none transition placeholder:text-[#A6A6A6] focus:border-[#CE9F2D] focus:ring-2 focus:ring-[#CE9F2D]/20"
                  />
                </label>
              ))}
            </div>
          </div>

          {kyc?.rejectionReason && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <strong>Rejection reason:</strong> {kyc.rejectionReason}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full sm:w-auto">
            <Shield size={16} /> Submit KYC
          </Button>
        </>
      )}
    </form>
  );
}

// ─── Main AccountPage ─────────────────────────────────────────────────────────

export default function AccountPage({ tab = "profile" }) {
  const dispatch = useDispatch();
  const userState = useSelector((s) => s.user);
  const user = userState.current;

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <>
      <Seo title={`Account — ${tab.charAt(0).toUpperCase() + tab.slice(1)} | Sam Global`} />

      <div className="w-container py-8 sm:py-10">
        <h1 className="mb-6 font-montserrat text-2xl font-bold text-[#2E2E2E] sm:text-3xl">My Account</h1>

        {/* Tab navigation */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-[10px] border border-[#e7dfd1] bg-[#FAF6EE] p-1">
          {TABS.map(({ id, label, icon: Icon, path }) => (
            <Link
              key={id}
              to={path}
              className={`flex min-w-max items-center gap-2 rounded-[8px] px-4 py-2 font-montserrat text-sm font-medium transition ${tab === id
                ? "bg-white text-[#CE9F2D] shadow-sm"
                : "text-[#787878] hover:text-[#2E2E2E]"
                }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>

        {/* Tab content */}
        <div className="rounded-[12px] border border-[#e7dfd1] bg-white p-6 sm:p-8">
          <ApiState
            loading={userState.loading && !user}
            error={userState.error}
            empty={false}
            onRetry={() => dispatch(fetchMe())}
          >
            {tab === "profile" && <ProfileTab user={user} />}
            {tab === "addresses" && <AddressTab user={user} />}
            {tab === "security" && <SecurityTab />}
            {tab === "kyc" && <KycTab user={user} />}
          </ApiState>
        </div>
      </div>
    </>
  );
}
