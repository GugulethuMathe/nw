import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Site } from "@shared/schema";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";

const SiteTypeChart: React.FC = () => {
  const { data: sites, isLoading } = useQuery<Site[]>({
    queryKey: ['/api/sites'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sites by Type</CardTitle>
          <CardDescription>Distribution of center types</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <div className="h-full w-full flex items-center justify-center">
            <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sitesByType = [
    { name: "CLC", value: sites?.filter(site => site.type === "CLC").length || 0 },
    { name: "Satellite", value: sites?.filter(site => site.type === "Satellite").length || 0 },
    { name: "Operational", value: sites?.filter(site => site.type === "Operational").length || 0 },
  ];

  const COLORS = ['#1976D2', '#4CAF50', '#FF9800'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sites by Type</CardTitle>
        <CardDescription>Distribution of center types</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sitesByType}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {sitesByType.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SiteTypeChart;
