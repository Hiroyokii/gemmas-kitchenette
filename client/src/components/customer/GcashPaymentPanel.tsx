import { useEffect, useState, type ChangeEvent } from "react";
import { GCASH_PAYMENT_DETAILS } from "../../config/gcash";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type GcashPaymentPanelProps = {
  amount: number;
  screenshot: File | null;
  fileError: string;
  onScreenshotChange: (file: File | null, error: string) => void;
};

export default function GcashPaymentPanel({
  amount,
  screenshot,
  fileError,
  onScreenshotChange,
}: GcashPaymentPanelProps) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!screenshot) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(typeof reader.result === "string" ? reader.result : "");
    };
    reader.readAsDataURL(screenshot);
    return () => reader.abort();
  }, [screenshot]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      onScreenshotChange(null, "Choose a JPG, JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      onScreenshotChange(null, "The payment screenshot must be 2 MB or smaller.");
      return;
    }

    onScreenshotChange(file, "");
  }

  return (
    <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-4 md:p-5">
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-[#007DFE] px-2 py-1 text-xs font-bold text-white">GCash</span>
        <h4 className="font-semibold text-stone-900">Pay via GCash</h4>
      </div>

      {GCASH_PAYMENT_DETAILS.qrImagePath ? (
        <img
          src={GCASH_PAYMENT_DETAILS.qrImagePath}
          alt="Gemma’s Kitchenette GCash QR code"
          className="mx-auto my-4 w-full max-w-[18rem] rounded-xl border border-stone-200 object-contain"
        />
      ) : (
        <div className="my-4 flex min-h-28 items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 text-center text-sm text-stone-500">
          GCash QR code has not been configured yet. Please confirm the payment details with the store before paying.
        </div>
      )}

      <dl className="space-y-1.5 text-sm">
        <div className="flex flex-wrap justify-between gap-x-3">
          <dt className="text-stone-500">GCash account</dt>
          <dd className="font-medium text-stone-800">{GCASH_PAYMENT_DETAILS.accountName || "Not configured"}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-x-3">
          <dt className="text-stone-500">GCash number</dt>
          <dd className="font-medium text-stone-800">{GCASH_PAYMENT_DETAILS.accountNumber || "Not configured"}</dd>
        </div>
        <div className="flex justify-between gap-3 border-t border-stone-100 pt-2">
          <dt className="font-semibold text-stone-700">Amount to pay</dt>
          <dd className="font-mono font-bold text-stone-900">₱{amount.toFixed(2)}</dd>
        </div>
      </dl>

      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-5 text-stone-600">
        <li>Scan the QR code using your GCash app.</li>
        <li>Pay the amount shown above.</li>
        <li>Take a screenshot of the successful payment.</li>
        <li>Upload a screenshot of the successful payment below.</li>
      </ol>

      <label htmlFor="drawer-gcash-screenshot" className="mb-1.5 mt-4 block text-sm font-semibold text-stone-800">
        Payment Screenshot
      </label>
      <input
        id="drawer-gcash-screenshot"
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#FFB800]/20 file:px-3 file:py-2 file:font-semibold file:text-stone-800 hover:file:bg-[#FFB800]/30"
      />
      <p className="mt-1 text-xs text-stone-500">JPG, JPEG, PNG, or WebP · Maximum 2 MB</p>
      {fileError && <p role="alert" className="mt-2 text-sm text-red-600">{fileError}</p>}
      {screenshot && (
        <div className="mt-3 flex items-start gap-3 rounded-xl bg-stone-50 p-3">
          {previewUrl && <img src={previewUrl} alt="Selected payment proof preview" className="h-16 w-16 shrink-0 rounded-lg object-cover" />}
          <div className="min-w-0">
            <p className="break-all text-sm font-medium text-stone-800">{screenshot.name}</p>
            <p className="mt-1 text-xs text-stone-500">Select another file to replace this screenshot.</p>
          </div>
        </div>
      )}
    </div>
  );
}
