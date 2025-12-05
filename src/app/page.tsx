
"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Sigma, TrendingUp, Presentation } from "lucide-react";
import { DashboardCharts } from "@/components/dashboard-charts";
import { useAuth } from "@/hooks/use-auth-provider";

export default function DashboardPage() {
  const { user } = useAuth();
  
  // For a real app, this data would be fetched from a database.
  // For now, we'll keep it empty to represent a new user.
  const learningData = {
    studyTime: "0h 0m",
    accuracy: "0%",
    flashcards: 0,
    weakestTopic: "N/A",
    chartData: []
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight font-headline">
              {user ? `Welcome, ${user.email}!` : "Student Dashboard"}
            </h1>
            <p className="text-muted-foreground">
              {learningData.chartData.length > 0 
                ? "Here's an overview of your learning progress."
                : "Your dashboard is ready! Start a lesson to see your progress."
              }
            </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{learningData.studyTime}</div>
                    <p className="text-xs text-muted-foreground">Start studying to see your time.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{learningData.accuracy}</div>
                    <p className="text-xs text-muted-foreground">Take a quiz to see your accuracy.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Flashcards Created</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{learningData.flashcards}</div>
                    <p className="text-xs text-muted-foreground">Generate flashcards to start.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Weakest Topic</CardTitle>
                    <Sigma className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{learningData.weakestTopic}</div>
                    <p className="text-xs text-muted-foreground">Your progress will reveal this.</p>
                </CardContent>
            </Card>
        </div>

        <DashboardCharts data={learningData.chartData} />
      </div>
    </AppLayout>
  );
}
