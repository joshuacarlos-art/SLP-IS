"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, Heart, Weight, Plus, Eye } from "lucide-react";
import PigIcon from "@/components/ui/pig-icon";
import { logSuccess, logWarning } from "@/lib/activity/activity-logger";
import { Button } from "@/components/ui/button";

const pigData = [
  { breed: "Large White", count: 89, status: "Healthy", color: "bg-green-100 text-green-800" },
  { breed: "Landrace", count: 67, status: "Healthy", color: "bg-green-100 text-green-800" },
  { breed: "Duroc", count: 45, status: "Growing", color: "bg-blue-100 text-blue-800" },
  { breed: "Native", count: 46, status: "Breeding", color: "bg-orange-100 text-orange-800" },
];

const healthMetrics = [
  { icon: Utensils, label: "Feed Consumption", value: "95%", status: "good" },
  { icon: Heart, label: "Health Rate", value: "92%", status: "good" },
  { icon: Weight, label: "Avg Weight Gain", value: "1.2kg/wk", status: "excellent" },
];

export default function PigsOverview() {
  const handleAddPig = async () => {
    try {
      await logSuccess(
        'Dashboard',
        'INITIATE_ADD_PIG',
        'Started process to add new pig from dashboard overview'
      );
      // Your add pig logic here
      console.log("Add pig clicked");
    } catch (error) {
      console.error('Failed to log add pig:', error);
    }
  };

  const handleViewPigs = async () => {
    try {
      await logSuccess(
        'Dashboard',
        'VIEW_PIGS_OVERVIEW',
        'Navigated to detailed pigs overview from dashboard'
      );
      // Your view pigs logic here
      console.log("View pigs clicked");
    } catch (error) {
      console.error('Failed to log view pigs:', error);
    }
  };

  const handleBreedClick = async (breed: string, count: number) => {
    try {
      await logSuccess(
        'Dashboard',
        'VIEW_BREED_DETAILS',
        `Clicked on ${breed} breed with ${count} pigs`,
        undefined,
        { breed, count }
      );
    } catch (error) {
      console.error('Failed to log breed click:', error);
    }
  };

  const handleMetricClick = async (metric: string, value: string) => {
    try {
      await logSuccess(
        'Dashboard',
        'VIEW_HEALTH_METRIC',
        `Clicked on ${metric} health metric: ${value}`,
        undefined,
        { metric, value }
      );
    } catch (error) {
      console.error('Failed to log metric click:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PigIcon className="h-5 w-5" />
          Pigs Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">By Breed</h4>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleAddPig}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleViewPigs}
                className="h-8"
              >
                <Eye className="h-4 w-4 mr-1" />
                View All
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            {pigData.map((pig, index) => (
              <div 
                key={index} 
                className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleBreedClick(pig.breed, pig.count)}
              >
                <span className="text-sm">{pig.breed}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{pig.count} pigs</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${pig.color}`}>
                    {pig.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Health Metrics</h4>
          <div className="grid grid-cols-3 gap-2">
            {healthMetrics.map((metric, index) => (
              <div 
                key={index} 
                className="text-center p-2 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => handleMetricClick(metric.label, metric.value)}
              >
                <metric.icon className={`h-6 w-6 mx-auto mb-1 ${
                  metric.status === 'good' ? 'text-green-600' : 
                  metric.status === 'excellent' ? 'text-blue-600' : 'text-orange-600'
                }`} />
                <div className="text-xs text-muted-foreground">{metric.label}</div>
                <div className="text-sm font-bold">{metric.value}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}