"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart as RechartsBarChart, CartesianGrid, Line, LineChart as RechartsLineChart, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
import { Presentation } from "lucide-react";

type ChartData = {
  date: string;
  "Study Time": number;
  "Accuracy": number;
}[];

const chartConfig = {
  "Study Time": {
    label: "Study Time (mins)",
    color: "hsl(var(--primary))",
  },
  "Accuracy": {
    label: "Accuracy (%)",
    color: "hsl(var(--accent))",
  },
};

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-[300px] text-center text-muted-foreground">
        <Presentation className="h-12 w-12 mb-4" />
        <h3 className="text-lg font-semibold">No Data Yet</h3>
        <p className="text-sm">Your progress charts will appear here once you start learning.</p>
    </div>
);

export function DashboardCharts({ data }: { data: ChartData }) {
  if (data.length === 0) {
      return (
          <div className="grid gap-4 md:grid-cols-2">
              <Card>
                  <CardHeader>
                      <CardTitle>Study Time Trend</CardTitle>
                      <CardDescription>Your study time over the last 7 days.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <EmptyState />
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader>
                      <CardTitle>Accuracy Improvement</CardTitle>
                      <CardDescription>Your quiz accuracy over the last 7 days.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <EmptyState />
                  </CardContent>
              </Card>
          </div>
      );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
          <CardHeader>
              <CardTitle>Study Time Trend</CardTitle>
              <CardDescription>Your study time over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <RechartsBarChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                      <YAxis unit="m" />
                      <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                      <Bar dataKey="Study Time" fill="var(--color-Study Time)" radius={8} />
                  </RechartsBarChart>
              </ChartContainer>
          </CardContent>
      </Card>
      <Card>
          <CardHeader>
              <CardTitle>Accuracy Improvement</CardTitle>
              <CardDescription>Your quiz accuracy over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <RechartsLineChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                      <YAxis unit="%" />
                      <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                      <Line type="monotone" dataKey="Accuracy" stroke="var(--color-Accuracy)" strokeWidth={2} dot={{r: 4, fill: "var(--color-Accuracy)"}} />
                  </RechartsLineChart>
              </ChartContainer>
          </CardContent>
      </Card>
    </div>
  )
}
