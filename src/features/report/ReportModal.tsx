type ReportModalProps = {
  details: string;
  onClose: () => void;
  onDetailsChange: (details: string) => void;
  onReasonChange: (reason: string) => void;
  onSubmit: () => void;
  reason: string;
};

function ReportModal({
  details,
  onClose,
  onDetailsChange,
  onReasonChange,
  onSubmit,
  reason,
}: ReportModalProps) {
  return (
    <div className="fixed inset-0 z-20 grid place-items-center p-6 bg-[#0e0e12]/78 backdrop-blur-[12px]">
      <div className="relative w-[min(100%,28rem)] rounded-3xl border border-outline bg-[#1f1f23]/88 p-6 shadow-main">
        <div className="mb-[1.25rem] flex items-center justify-between">
          <h3 className="m-0 font-jakarta font-extrabold tracking-tight">Report user</h3>
          <button
            className="inline-grid h-12 w-12 place-items-center rounded-full border-0 bg-surface-highest/28 text-text-muted cursor-pointer transition-all duration-160 hover:-translate-y-px active:scale-[0.98]"
            onClick={onClose}
            type="button"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <label className="flex flex-col gap-[0.55rem]">
            <span className="text-[0.72rem] font-bold tracking-[0.16em] uppercase text-text-muted">Select Reason</span>
            <select
              className="w-full min-h-[3.5rem] rounded-2xl border border-transparent bg-surface-lowest px-4 py-[0.9rem] text-text outline-none transition-all duration-200 focus:border-primary/36 focus:shadow-[0_0_0_3px_rgba(221,184,255,0.12)]"
              onChange={(event) => onReasonChange(event.target.value)}
              value={reason}
            >
              <option value="spam">Spam</option>
              <option value="harassment">Harassment</option>
              <option value="inappropriate">Inappropriate content</option>
            </select>
          </label>

          <label className="flex flex-col gap-[0.55rem]">
            <span className="text-[0.72rem] font-bold tracking-[0.16em] uppercase text-text-muted">Additional details</span>
            <textarea
              className="w-full min-h-[3.5rem] rounded-2xl border border-transparent bg-surface-lowest px-4 py-[0.9rem] text-text outline-none transition-all duration-200 focus:border-primary/36 focus:shadow-[0_0_0_3px_rgba(221,184,255,0.12)] resize-none"
              onChange={(event) => onDetailsChange(event.target.value)}
              placeholder="Provide more context (optional)..."
              rows={4}
              value={details}
            />
          </label>

          <div className="flex flex-col gap-4">
            <button
              className="inline-flex min-h-[3.5rem] items-center justify-center gap-[0.6rem] rounded-2xl bg-gradient-to-br from-primary to-primary-strong px-[1.2rem] py-[0.95rem] font-extrabold text-[#2c0051] shadow-[0_14px_32px_rgba(127,44,203,0.24)] transition-all duration-160 hover:-translate-y-px active:scale-[0.98]"
              type="submit"
            >
              Submit Report
            </button>
            <button
              className="inline-flex min-h-[3.5rem] items-center justify-center gap-[0.6rem] rounded-2xl border border-outline/18 bg-[#1b1b1f]/92 px-[1.2rem] py-[0.95rem] font-extrabold text-text transition-all duration-160 hover:-translate-y-px active:scale-[0.98]"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-[0.72rem] uppercase tracking-[0.16em] text-text-muted/70">
          Your report is anonymous. We take community safety seriously.
        </p>
      </div>
    </div>
  );
}

export default ReportModal;
