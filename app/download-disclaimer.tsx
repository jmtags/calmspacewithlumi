"use client";

import { MouseEvent, useEffect, useState } from "react";

const apkPath = "/CalmSpace.apk";

export function DownloadDisclaimer() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleDownloadClick = (event: globalThis.MouseEvent) => {
      const target = event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>(`a[href="${apkPath}"]`)
        : null;

      if (!target || target.dataset.downloadConfirmed === "true") return;

      event.preventDefault();
      event.stopPropagation();
      setIsOpen(true);
    };

    document.addEventListener("click", handleDownloadClick, true);
    return () => document.removeEventListener("click", handleDownloadClick, true);
  }, []);

  function closeDialog() {
    setIsOpen(false);
  }

  function confirmDownload(event: MouseEvent<HTMLAnchorElement>) {
    event.currentTarget.dataset.downloadConfirmed = "true";
    setIsOpen(false);
  }

  if (!isOpen) return null;

  return (
    <div className="download-modal-backdrop" role="presentation">
      <section
        className="download-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-modal-title"
      >
        <span className="kicker">Before you download</span>
        <h2 id="download-modal-title">CalmSpace is currently in testing.</h2>
        <p>
          You are about to download an Android APK. Because this app is still
          being tested, Android may ask you to allow installation from your
          browser or file manager before you can install it.
        </p>
        <p>
          Only continue if you are comfortable installing a testing version of
          CalmSpace on your device.
        </p>
        <div className="download-modal-actions">
          <button className="modal-cancel" type="button" onClick={closeDialog}>
            Cancel
          </button>
          <a
            className="button"
            href={apkPath}
            download
            data-download-confirmed="true"
            onClick={confirmDownload}
          >
            Continue download <span>↓</span>
          </a>
        </div>
      </section>
    </div>
  );
}
