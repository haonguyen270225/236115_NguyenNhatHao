
function StatusMessage({
  type = "info",
  message,
  onClose,
}) {
  if (!message) return null;

  const configurations = {
    loading: {
      className: "alert-info",
      role: "status",
      icon: null,
    },
    success: {
      className: "alert-success",
      role: "status",
      icon: "✓",
    },
    error: {
      className: "alert-danger",
      role: "alert",
      icon: "!",
    },
    warning: {
      className: "alert-warning",
      role: "status",
      icon: "⚠",
    },
    info: {
      className: "alert-info",
      role: "status",
      icon: "ℹ",
    },
  };

  const config = configurations[type] || configurations.info;

  return (
    <div
      className={`alert ${config.className} d-flex align-items-center justify-content-between gap-3`}
      role={config.role}
      aria-live={type === "error" ? "assertive" : "polite"}
    >
      <div className="d-flex align-items-center gap-2">
        {type === "loading" ? (
          <span
            className="spinner-border spinner-border-sm"
            aria-hidden="true"
          />
        ) : (
          <span aria-hidden="true">{config.icon}</span>
        )}

        <span>{message}</span>
      </div>

      {onClose && (
        <button
          type="button"
          className="btn-close"
          aria-label="Đóng thông báo"
          onClick={onClose}
        />
      )}
    </div>
  );
}

export default StatusMessage;
