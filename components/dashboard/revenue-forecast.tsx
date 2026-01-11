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
  Line,
  ComposedChart
} from 'recharts';
import { DollarSign, TrendingUp } from "lucide-react";

interface ForecastData {
  month: string;
  projectedRevenue: number;
  projectedExpenses: number;
  projectedProfit: number;
  growthRate: number;
}

interface RevenueForecastProps {
  data: ForecastData[];
  isLoading: boolean;
}

export default function RevenueForecast({ data, isLoading }: RevenueForecastProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading revenue forecast...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{data.month}</p>
          <p className="text-green-600">Revenue: {formatCurrency(data.projectedRevenue)}</p>
          <p className="text-red-600">Expenses: {formatCurrency(data.projectedExpenses)}</p>
          <p className="text-blue-600">Profit: {formatCurrency(data.projectedProfit)}</p>
          <p className="text-purple-600">Growth: +{data.growthRate}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Revenue Forecast
        </CardTitle>
        <CardDescription>
          Projected revenue, expenses, and profit margins
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                yAxisId="left"
                dataKey="projectedRevenue" 
                fill="#10b981" 
                name="Projected Revenue"
              />
              <Bar 
                yAxisId="left"
                dataKey="projectedExpenses" 
                fill="#ef4444" 
                name="Projected Expenses"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="growthRate" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="Growth Rate %"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}