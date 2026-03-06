import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const deletedBy = body.deleted_by || "unknown";

    const supabase = getServiceSupabase();

    // Get analysis info before soft-deleting
    const { data: analysis, error: fetchError } = await supabase
      .from("analyses")
      .select("project_name, score")
      .eq("id", id)
      .single();

    if (fetchError || !analysis) {
      return NextResponse.json(
        { success: false, error: "Análise não encontrada" },
        { status: 404 }
      );
    }

    // Soft delete: set deleted_at
    const { error: updateError } = await supabase
      .from("analyses")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (updateError) {
      console.error("Soft delete error:", updateError);
      return NextResponse.json(
        { success: false, error: "Erro ao apagar análise" },
        { status: 500 }
      );
    }

    // Log deletion
    const { error: logError } = await supabase
      .from("deletion_logs")
      .insert({
        analysis_id: id,
        project_name: analysis.project_name,
        deleted_by: deletedBy,
        score: analysis.score,
      });

    if (logError) {
      console.error("Deletion log error:", logError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    const message =
      error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
