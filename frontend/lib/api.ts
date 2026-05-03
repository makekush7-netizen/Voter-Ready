/**
 * lib/api.ts — All fetch calls to the FastAPI backend.
 * Change NEXT_PUBLIC_API_BASE_URL in .env.local to point to production.
 */

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export interface EligibilityInput {
  age: number;
  isCitizen: boolean;
  state: string;
  residenceDuration: "<1month" | "1-6months" | "6months+";
  hasVoterId: boolean;
}

export interface EligibilityResult {
  eligible: boolean;
  summary: string;
  form_needed: string | null;
  documents_needed: string[];
  next_steps: string[];
  caveat: string;
}

export interface JourneyStep {
  step_id: number;
  title: string;
  plain_english: string;
  how_to: string[];
  common_mistakes: string[];
  official_link: string;
}

export async function checkEligibility(data: EligibilityInput): Promise<EligibilityResult> {
  const res = await fetch(`${BASE}/api/eligibility/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getJourneyStep(stepId: number, state: string): Promise<JourneyStep> {
  const res = await fetch(`${BASE}/api/journey/step/${stepId}?state=${encodeURIComponent(state)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export async function chatWithAI(message: string, imageBase64?: string): Promise<string> {
  const payload: any = { message };
  if (imageBase64) payload.image_base64 = imageBase64;
  
  const res = await fetch(`${BASE}/api/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.reply;
}
