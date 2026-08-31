"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/api.client";
import { deactivateEmployeeDocument } from "../api/deactivate-employee-document";
import type {
  EmployeeDocument,
  ManagedEmployeeDocument,
} from "../types/employee-document";
import {
  formatEmployeeDocumentDate,
  formatEmployeeDocumentEmployeeName,
  getEmployeeDocumentExpiration,
  type EmployeeDocumentExpirationTone,
} from "../utils/employee-document-formatters";

interface EmployeeDocumentsListProps {
  documents: Array<EmployeeDocument | ManagedEmployeeDocument>;
  referenceDate: string;
  canDeactivate?: boolean;
  showEmployee?: boolean;
}

type Feedback = {
  type: "success" | "error";
  message: string;
};

const expirationToneStyles: Record<EmployeeDocumentExpirationTone, string> = {
  current: "border-foreground/20 bg-foreground/5 text-foreground/70",
  warning: "border-foreground bg-foreground/10 text-foreground",
  expired: "border-foreground bg-foreground text-background",
  none: "border-foreground/15 text-foreground/50",
};

const isManagedEmployeeDocument = (
  document: EmployeeDocument | ManagedEmployeeDocument,
): document is ManagedEmployeeDocument => "employee" in document;

const ExpirationStatus = ({
  expiresAt,
  referenceDate,
}: {
  expiresAt: string | null;
  referenceDate: string;
}) => {
  const expiration = getEmployeeDocumentExpiration(expiresAt, referenceDate);

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${expirationToneStyles[expiration.tone]}`}
    >
      {expiration.label}
    </span>
  );
};

export const EmployeeDocumentsList = ({
  documents,
  referenceDate,
  canDeactivate = false,
  showEmployee = false,
}: EmployeeDocumentsListProps) => {
  const router = useRouter();
  const [pendingDocumentId, setPendingDocumentId] = useState<string | null>(
    null,
  );
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const handleDeactivate = async (document: EmployeeDocument) => {
    if (pendingDocumentId !== null) {
      return;
    }

    const confirmed = window.confirm(
      `Deactivate “${document.title}”? It will no longer appear in the employee's active documents.`,
    );

    if (!confirmed) {
      return;
    }

    setPendingDocumentId(document.id);
    setFeedback(null);

    try {
      const response = await deactivateEmployeeDocument(document.id);

      setFeedback({ type: "success", message: response.message });
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof ApiError
            ? error.message
            : "Unable to deactivate employee document.",
      });
    } finally {
      setPendingDocumentId(null);
    }
  };

  return (
    <div className="space-y-3">
      {feedback ? (
        <p
          role={feedback.type === "error" ? "alert" : "status"}
          className={`rounded-md border px-4 py-3 text-sm ${
            feedback.type === "error"
              ? "border-foreground bg-foreground text-background"
              : "border-foreground/20 text-foreground/70"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}

      {documents.length === 0 ? (
        <div className="rounded-xl border border-foreground/25 px-6 py-10 text-center">
          <p className="font-medium">No active documents found.</p>
          <p className="mt-1 text-sm text-foreground/55">
            Uploaded documents will appear here while they are active.
          </p>
        </div>
      ) : (
        <section
          aria-label="Active employee documents"
          className="overflow-hidden rounded-xl border border-foreground/25"
        >
          <div
            className={`hidden gap-4 border-b border-foreground/20 bg-foreground/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-foreground/55 xl:grid ${
              showEmployee
                ? "xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)_minmax(0,0.6fr)_minmax(0,0.65fr)_minmax(0,0.85fr)_minmax(0,0.7fr)_minmax(0,0.95fr)]"
                : "xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.7fr)_minmax(0,0.75fr)_minmax(0,0.95fr)_minmax(0,0.8fr)_minmax(0,1fr)]"
            }`}
          >
            {showEmployee ? <span>Employee</span> : null}
            <span>Document</span>
            <span>Type</span>
            <span>Issued</span>
            <span>Expiration</span>
            <span>Uploaded</span>
            <span>Actions</span>
          </div>

          <ul className="divide-y divide-foreground/15">
            {documents.map((document) => {
              const managedDocument = isManagedEmployeeDocument(document)
                ? document
                : null;
              const documentId = managedDocument?.documentId ?? document.id;

              return (
                <li key={documentId} className="px-4 py-4">
                  <div className="xl:hidden">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{document.title}</p>
                        <p className="mt-0.5 text-sm text-foreground/55">
                          {document.type}
                        </p>
                        {showEmployee && managedDocument ? (
                          <Link
                            href={`/employees/${encodeURIComponent(managedDocument.employeeId)}`}
                            className="mt-2 block text-sm font-medium underline-offset-4 hover:underline"
                          >
                            {formatEmployeeDocumentEmployeeName(
                              managedDocument.employee,
                            )}
                            <span className="ml-2 font-normal text-foreground/50">
                              {managedDocument.employee.employeeNumber}
                            </span>
                          </Link>
                        ) : null}
                      </div>
                      <ExpirationStatus
                        expiresAt={document.expiresAt}
                        referenceDate={referenceDate}
                      />
                    </div>

                    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
                      <div>
                        <dt className="text-xs text-foreground/50">Issued</dt>
                        <dd className="mt-0.5">
                          {formatEmployeeDocumentDate(document.issuedAt)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-foreground/50">
                          Expires
                        </dt>
                        <dd className="mt-0.5">
                          {formatEmployeeDocumentDate(document.expiresAt)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-foreground/50">
                          Uploaded
                        </dt>
                        <dd className="mt-0.5">
                          {formatEmployeeDocumentDate(document.createdAt)}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <DocumentActions
                        document={document}
                        downloadDocumentId={documentId}
                        canDeactivate={canDeactivate}
                        isDeactivating={pendingDocumentId === document.id}
                        actionsDisabled={pendingDocumentId !== null}
                        onDeactivate={handleDeactivate}
                      />
                    </div>
                  </div>

                  <div
                    className={`hidden items-center gap-4 text-sm xl:grid ${
                      showEmployee
                        ? "xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)_minmax(0,0.6fr)_minmax(0,0.65fr)_minmax(0,0.85fr)_minmax(0,0.7fr)_minmax(0,0.95fr)]"
                        : "xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.7fr)_minmax(0,0.75fr)_minmax(0,0.95fr)_minmax(0,0.8fr)_minmax(0,1fr)]"
                    }`}
                  >
                    {showEmployee ? (
                      managedDocument ? (
                        <div className="min-w-0">
                          <Link
                            href={`/employees/${encodeURIComponent(managedDocument.employeeId)}`}
                            className="block truncate font-medium underline-offset-4 hover:underline"
                          >
                            {formatEmployeeDocumentEmployeeName(
                              managedDocument.employee,
                            )}
                          </Link>
                          <p className="truncate text-xs text-foreground/50">
                            {managedDocument.employee.employeeNumber}
                          </p>
                        </div>
                      ) : (
                        <span>—</span>
                      )
                    ) : null}
                    <p className="min-w-0 truncate font-medium" title={document.title}>
                      {document.title}
                    </p>
                    <p className="min-w-0 truncate" title={document.type}>
                      {document.type}
                    </p>
                    <p>{formatEmployeeDocumentDate(document.issuedAt)}</p>
                    <div className="space-y-1">
                      <p>{formatEmployeeDocumentDate(document.expiresAt)}</p>
                      <ExpirationStatus
                        expiresAt={document.expiresAt}
                        referenceDate={referenceDate}
                      />
                    </div>
                    <p>{formatEmployeeDocumentDate(document.createdAt)}</p>
                    <div className="flex flex-wrap gap-2">
                      <DocumentActions
                        document={document}
                        downloadDocumentId={documentId}
                        canDeactivate={canDeactivate}
                        isDeactivating={pendingDocumentId === document.id}
                        actionsDisabled={pendingDocumentId !== null}
                        onDeactivate={handleDeactivate}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
};

const DocumentActions = ({
  document,
  downloadDocumentId,
  canDeactivate,
  isDeactivating,
  actionsDisabled,
  onDeactivate,
}: {
  document: EmployeeDocument;
  downloadDocumentId: string;
  canDeactivate: boolean;
  isDeactivating: boolean;
  actionsDisabled: boolean;
  onDeactivate: (document: EmployeeDocument) => void;
}) => (
  <>
    <a
      href={`/api/employee-documents/${encodeURIComponent(downloadDocumentId)}/download`}
      download
      className="rounded-md border border-foreground/25 px-3 py-1.5 font-medium hover:bg-foreground/5"
    >
      Download
    </a>
    {canDeactivate ? (
      <button
        type="button"
        onClick={() => onDeactivate(document)}
        disabled={actionsDisabled}
        className="rounded-md border border-foreground/25 px-3 py-1.5 font-medium text-foreground/70 hover:bg-foreground/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isDeactivating ? "Deactivating..." : "Deactivate"}
      </button>
    ) : null}
  </>
);
