import { data } from "react-router";
import { userContext } from "~/context";
import {
  completeHistoryImport,
  getHistoryImport,
  importHistoryBatch,
} from "~/lib.server/services/history-import";
import type { Route } from "./+types/history-import";

const headers = { "Cache-Control": "private, no-store" };
export async function loader({ context }: Route.LoaderArgs) {
  const userId = context.get(userContext);
  if (!userId)
    return data({ error: "Sign in to continue." }, { status: 401, headers });
  return data(
    { import: await getHistoryImport(userId), error: null },
    { headers },
  );
}

export async function action({ context, request }: Route.ActionArgs) {
  const userId = context.get(userContext);
  if (!userId)
    return data({ error: "Sign in to continue." }, { status: 401, headers });
  if (request.method !== "POST")
    return data({ error: "Invalid method." }, { status: 405, headers });
  if (request.headers.get("Origin") !== new URL(request.url).origin)
    return data({ error: "Invalid request." }, { status: 403, headers });
  if (!request.headers.get("Content-Type")?.includes("application/json"))
    return data({ error: "Expected JSON." }, { status: 415, headers });
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new Error("Empty request.");
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 1048576) {
        await reader.cancel();
        throw new Error("Batch too large.");
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const body = JSON.parse(new TextDecoder().decode(bytes));
    if (
      !body ||
      typeof body.jobId !== "string" ||
      !/^[\w-]{1,100}$/.test(body.jobId)
    )
      throw new Error("Invalid import ID.");
    if (body.action === "complete")
      return data(
        {
          import: await completeHistoryImport(userId, body.jobId),
          error: null,
        },
        { headers },
      );
    if (
      body.action !== "batch" ||
      typeof body.batchId !== "string" ||
      !/^[\w-]{1,100}$/.test(body.batchId) ||
      !Array.isArray(body.rows) ||
      body.rows.length < 1 ||
      body.rows.length > 100
    )
      throw new Error("Invalid batch.");
    const result = await importHistoryBatch(
      userId,
      body.jobId,
      body.batchId,
      body.rows,
    );
    return data({ ...result, error: null }, { headers });
  } catch (error) {
    const message =
      error instanceof SyntaxError
        ? "Invalid JSON."
        : error instanceof Error &&
            /^(Invalid|Batch too|Empty|Listening record)/.test(error.message)
          ? error.message
          : "Import failed. Retry this batch.";
    return data(
      { error: message },
      { status: message.startsWith("Import failed") ? 503 : 400, headers },
    );
  }
}
