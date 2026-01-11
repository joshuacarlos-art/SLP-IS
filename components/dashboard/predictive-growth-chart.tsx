"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp } from "lucide-react";

interface PredictiveData {
  period: string;
  actual: number | null;
  predicted: number;
  confidence: number;
}

interface PredictiveGrowthChartProps {
  data: PredictiveData[];
  isLoading: boolean;
}

export default function PredictiveGrowthChart({ data, isLoading }: PredictiveGrowthChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading growth predictions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{data.period}</p>
          {data.actual && <p className="text-blue-600">Actual: {data.actual}</p>}
          <p className="text-green-600">Predicted: {data.predicted}</p>
          <p className="text-sm text-gray-600">Confidence: {(data.confidence * 100).toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Predictive Growth Analysis
        </CardTitle>
        <CardDescription>
          Historical data and AI-powered growth predictions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="actual" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.3}
                name="Actual Growth"
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="predicted" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.3}
                name="Predicted Growth"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}