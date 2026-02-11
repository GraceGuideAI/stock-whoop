import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      message:
        "Live ingest is disabled in this deployment. Data is bundled from the latest WHOOP full dump at build time."
    },
    { status: 501 }
  );
}
