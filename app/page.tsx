"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type EstimateRow = {
  model: string;
  tokens: number;
  costUSD: number;
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [rows, setRows] = useState<EstimateRow[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    if (!prompt.trim()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to estimate costs");
      }

      const data = (await response.json()) as EstimateRow[];
      setRows(data);
    } catch (error) {
      console.error(error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  const cheapestRow = rows.reduce<EstimateRow | null>((best, row) => {
    if (!best || row.costUSD < best.costUSD) return row;
    return best;
  }, null);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Card className="border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <CardHeader className="gap-2">
            <CardTitle className="text-2xl font-semibold">
              Tokenomics Explorer
            </CardTitle>
            <CardDescription className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
              Paste a prompt, analyze it across the supported models, and
              compare the estimated token usage and cost.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Enter a prompt to estimate token usage and cost..."
              className="min-h-36 resize-y rounded-xl border-zinc-300 bg-white px-4 py-3 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {rows.length > 0
                  ? `Showing ${rows.length} model estimates`
                  : "No analysis run yet"}
              </p>
              <Button
                onClick={handleAnalyze}
                disabled={loading || !prompt.trim()}
              >
                {loading ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Model estimates
            </CardTitle>
            <CardDescription className="text-sm text-zinc-600 dark:text-zinc-400">
              Costs are estimated from input token counts and the pricing table.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Estimated cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="h-24 text-center text-zinc-500"
                    >
                      Enter a prompt and click Analyze to see model estimates.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => {
                    const isCheapest = cheapestRow?.model === row.model;

                    return (
                      <TableRow key={row.model}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span>{row.model}</span>
                            {isCheapest ? (
                              <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                                Cheapest
                              </Badge>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>{row.tokens}</TableCell>
                        <TableCell>${row.costUSD.toFixed(6)}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
