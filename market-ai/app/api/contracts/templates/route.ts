import { NextResponse } from "next/server";
import { BUILT_IN_TEMPLATES } from "@/lib/contracts/templates";
import { CLAUSES } from "@/lib/contracts/clauses";

export async function GET() {
  return NextResponse.json({
    templates: BUILT_IN_TEMPLATES,
    clauses: Object.values(CLAUSES),
  });
}
