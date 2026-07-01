import { ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { endpoints } from "../../api/endpoints";
import { apiRequest } from "../../api/client";
import { notify } from "../../utils/notify";

const MAX_REVIEW_IMAGES = 5;
const MAX_REVIEW_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const getUploadUrl = (response) => {
  const data = response?.data || response || {};
  return (
    data.imageURL ||
    data.url ||
    data.image?.imageURL ||
    data.image?.url ||
    ""
  );
};

async function uploadReviewImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("module", "REVIEWS");
  formData.append("imageType", "review");

  const response = await apiRequest({
    method: "post",
    url: endpoints.fileUploader.upload,
    data: formData,
  });

  const url = getUploadUrl(response);
  if (!url) throw new Error("Upload response did not include an image URL");
  return url;
}

export default function ReviewImageUploader({
  value = [],
  onChange,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const previewUrlsRef = useRef(new Set());
  const [uploading, setUploading] = useState(false);

  useEffect(
    () => () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current.clear();
    },
    [],
  );

  const removeImage = (index) => {
    const image = value[index];
    if (image?.previewUrl) {
      URL.revokeObjectURL(image.previewUrl);
      previewUrlsRef.current.delete(image.previewUrl);
    }
    onChange(value.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleFiles = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";
    if (!selectedFiles.length) return;

    const remainingSlots = MAX_REVIEW_IMAGES - value.length;
    if (remainingSlots <= 0) {
      notify.warning(`You can upload up to ${MAX_REVIEW_IMAGES} images only.`);
      return;
    }

    const acceptedFiles = selectedFiles
      .filter((file) => {
        if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
          notify.warning(`${file.name} is not a supported image.`);
          return false;
        }
        if (file.size > MAX_REVIEW_IMAGE_BYTES) {
          notify.warning(`${file.name} must be 10 MB or smaller.`);
          return false;
        }
        return true;
      })
      .slice(0, remainingSlots);

    if (selectedFiles.length > remainingSlots) {
      notify.warning(
        `Only ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"} can be added.`,
      );
    }
    if (!acceptedFiles.length) return;

    const pendingItems = acceptedFiles.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.add(previewUrl);
      return {
        id: `${file.name}-${file.lastModified}-${previewUrl}`,
        name: file.name,
        previewUrl,
        status: "uploading",
      };
    });

    const baseValue = [...value, ...pendingItems];
    onChange(baseValue);
    setUploading(true);

    try {
      const uploadedItems = await Promise.all(
        pendingItems.map(async (item, index) => ({
          ...item,
          url: await uploadReviewImage(acceptedFiles[index]),
          status: "uploaded",
        })),
      );

      const uploadedById = new Map(
        uploadedItems.map((item) => [item.id, item]),
      );
      onChange(
        baseValue.map((item) =>
          uploadedById.has(item.id) ? uploadedById.get(item.id) : item,
        ),
      );
    } catch (error) {
      pendingItems.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
        previewUrlsRef.current.delete(item.previewUrl);
      });
      onChange(value);
      notify.error(error?.message || "Failed to upload review images.");
    } finally {
      setUploading(false);
    }
  };

  const uploadDisabled =
    disabled || uploading || value.length >= MAX_REVIEW_IMAGES;

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-[#2E2E2E]">Product Images</span>
        <span className="text-xs font-semibold text-[#777890]">
          {value.length}/{MAX_REVIEW_IMAGES}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {value.map((image, index) => (
          <div
            key={image.id || image.url || image.previewUrl}
            className="relative aspect-square overflow-hidden rounded-[8px] border border-[#D7D7E0] bg-[#F7F7FA]"
          >
            <img
              src={image.previewUrl || image.url}
              alt={image.name || `Review image ${index + 1}`}
              className="h-full w-full object-cover"
            />
            {image.status === "uploading" && (
              <span className="absolute inset-0 grid place-items-center bg-black/35 text-white">
                <Loader2 size={18} className="animate-spin" />
              </span>
            )}
            <button
              type="button"
              className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-white text-[#1B1D60] shadow-sm disabled:opacity-60"
              onClick={() => removeImage(index)}
              disabled={disabled || uploading}
              aria-label="Remove image"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {value.length < MAX_REVIEW_IMAGES && (
          <button
            type="button"
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-[8px] border border-dashed border-[#CE9F2D] bg-[#CE9F2D0D] text-[#1B1D60] transition hover:bg-[#CE9F2D1A] disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => inputRef.current?.click()}
            disabled={uploadDisabled}
            aria-label="Upload review images"
          >
            {uploading ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              <ImagePlus size={22} />
            )}
            <span className="text-[11px] font-bold">
              {uploading ? "Uploading" : "Add"}
            </span>
          </button>
        )}
      </div>

      <p className="text-xs font-medium text-[#777890]">
        Add up to 5 clear product photos. JPG, PNG, WEBP or GIF, max 10 MB each.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleFiles}
        disabled={uploadDisabled}
      />
    </div>
  );
}

export { MAX_REVIEW_IMAGES };
