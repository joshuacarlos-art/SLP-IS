"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { TrendingUp, Users, Target } from "lucide-react";

interface AssociationPerformancePredictorProps {
  isLoading: boolean;
}

export default function AssociationPerformancePredictor({ isLoading }: AssociationPerformancePredictorProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Association Performance Predictor</CardTitle>
          <CardDescription>Loading performance predictions...</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Analyzing performance data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const performanceData = [
    { name: 'Association A', current: 75, predicted: 82, growth: 9.3 },
    { name: 'Association B', current: 60, predicted: 68, growth: 13.3 },
    { name: 'Association C', current: 85, predicted: 88, growth: 3.5 },
    { name: 'Association D', current: 45, predicted: 55, growth: 22.2 },
    { name: 'Association E', current: 90, predicted: 92, growth: 2.2 },
    { name: 'Association F', current: 70, predicted: 78, growth: 11.4 },
  ];

  const trendData = [
    { month: 'Jan', performance: 65 },
    { month: 'Feb', performance: 68 },
    { month: 'Mar', performance: 72 },
    { month: 'Apr', performance: 75 },
    { month: 'May', performance: 78 },
    { month: 'Jun', performance: 82 },
    { month: 'Jul', performance: 85 },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{payload[0].payload.name}</p>
          <p className="text-sm">{`Current: ${payload[0].payload.current}%`}</p>
          <p className="text-sm">{`Predicted: ${payload[0].payload.predicted}%`}</p>
          <p className="text-sm text-green-600">{`Growth: +${payload[0].payload.growth}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Association Performance Predictor
        </CardTitle>
        <CardDescription>
          Current performance vs. AI-predicted future performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Comparison Bar Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="current" fill="#8884d8" name="Current Performance" />
              <Bar dataKey="predicted" fill="#82ca9d" name="Predicted Performance" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Trend Line Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="performance" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Overall Performance Trend"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <div>
              <p className="font-semibold text-blue-900">Average Growth</p>
              <p className="text-2xl font-bold text-blue-700">+10.3%</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <Users className="h-8 w-8 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">Top Performer</p>
              <p className="text-2xl font-bold text-green-700">Association E</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
            <Target className="h-8 w-8 text-orange-600" />
            <div>
              <p className="font-semibold text-orange-900">Most Improved</p>
              <p className="text-2xl font-bold text-orange-700">Association D</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}