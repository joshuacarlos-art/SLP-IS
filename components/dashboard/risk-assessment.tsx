"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid 
} from 'recharts';
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface RiskAssessmentProps {
  isLoading: boolean;
}

export default function RiskAssessment({ isLoading }: RiskAssessmentProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment</CardTitle>
          <CardDescription>Loading risk analysis...</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Assessing risks...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mock risk data
  const riskData = [
    { name: 'Low Risk', value: 45, color: '#10b981' },
    { name: 'Medium Risk', value: 30, color: '#f59e0b' },
    { name: 'High Risk', value: 15, color: '#ef4444' },
    { name: 'Critical', value: 10, color: '#7c2d12' },
  ];

  const riskFactors = [
    { factor: 'Financial Stability', risk: 25, trend: 'improving' },
    { factor: 'Member Engagement', risk: 40, trend: 'stable' },
    { factor: 'Market Conditions', risk: 60, trend: 'worsening' },
    { factor: 'Operational Efficiency', risk: 35, trend: 'improving' },
    { factor: 'Compliance Issues', risk: 20, trend: 'stable' },
  ];

  const mitigationActions = [
    { action: 'Budget Review', priority: 'High', status: 'Pending' },
    { action: 'Member Training', priority: 'Medium', status: 'In Progress' },
    { action: 'Market Analysis', priority: 'High', status: 'Completed' },
    { action: 'Process Optimization', priority: 'Medium', status: 'Pending' },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p>{`Risk Level: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Risk Assessment
        </CardTitle>
        <CardDescription>
          Program risk analysis and mitigation strategies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Distribution Pie Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Factors Bar Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskFactors}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="factor" angle={-45} textAnchor="end" height={60} />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, 'Risk Level']} />
              <Bar dataKey="risk" fill="#f59e0b" name="Risk Level" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mitigation Actions */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Mitigation Actions</h4>
          {mitigationActions.map((action, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">{action.action}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  action.priority === 'High' 
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {action.priority}
                </span>
                <span className={`text-xs flex items-center gap-1 ${
                  action.status === 'Completed' 
                    ? 'text-green-600'
                    : action.status === 'In Progress'
                    ? 'text-blue-600'
                    : 'text-gray-600'
                }`}>
                  {action.status === 'Completed' && <CheckCircle className="h-3 w-3" />}
                  {action.status === 'In Progress' && <Clock className="h-3 w-3" />}
                  {action.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}