import { NextResponse } from "next/server";

interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  private: boolean;
  updated_at: string;
  description: string | null;
  language: string | null;
}

export async function GET() {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return NextResponse.json(
      { success: false, error: "GitHub token não configurado" },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(
      "https://api.github.com/user/repos?per_page=100&sort=updated&direction=desc&type=all",
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 300 }, // 5 minutes cache
      }
    );

    if (!res.ok) {
      if (res.status === 401) {
        return NextResponse.json(
          { success: false, error: "Token GitHub inválido" },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { success: false, error: `GitHub API error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    const repos: GithubRepo[] = data.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (r: any) => ({
        id: r.id,
        name: r.name,
        full_name: r.full_name,
        url: r.html_url,
        private: r.private,
        updated_at: r.updated_at,
        description: r.description,
        language: r.language,
      })
    );

    return NextResponse.json({ success: true, repos });
  } catch (error) {
    console.error("GitHub repos error:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar repositórios" },
      { status: 500 }
    );
  }
}
