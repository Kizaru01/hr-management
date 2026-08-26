"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/api.client";
import { deactivateEmployeeDocument } from "../api/deactivate-employee-document";
import type { EmployeeDocument } from "../types/employee-document";
import { formatEmployeeDocumentDate } from "../utils/employee-document-formatters";

interface EmployeeDocumentsListProps {
  documents: EmployeeDocument[];
  canDeactivate?: boolean;
}

type Feedback = {
  type: "success" | "error";
  message: string;
};

export const EmployeeDocumentsList = ({
  documents,
  canDeactivate = false,
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
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}

      {documents.length === 0 ? (
        <div className="rounded-xl border px-6 py-8 text-center text-sm text-muted-foreground">
          No documents available.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-left">
                  Title
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left">
                  Document Type
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left">
                  Issued Date
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left">
                  Expiration Date
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left">
                  Uploaded Date
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document.id} className="border-b last:border-0">
                  <td className="min-w-48 px-4 py-4 font-medium">
                    {document.title}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    {document.type}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    {formatEmployeeDocumentDate(document.issuedAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    {formatEmployeeDocumentDate(document.expiresAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    {formatEmployeeDocumentDate(document.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <div className="flex gap-2">
                      <a
                        href={`/api/employee-documents/${encodeURIComponent(document.id)}/download`}
                        download
                        className="rounded-md border px-3 py-1.5 font-medium hover:bg-muted"
                      >
                        Download
                      </a>
                      {canDeactivate ? (
                        <button
                          type="button"
                          onClick={() => handleDeactivate(document)}
                          disabled={pendingDocumentId !== null}
                          className="rounded-md border border-red-300 px-3 py-1.5 font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {pendingDocumentId === document.id
                            ? "Deactivating..."
                            : "Deactivate"}
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
