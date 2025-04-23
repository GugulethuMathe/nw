import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Site } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const SiteDistrictChart: React.FC = () => {
  const { data: sites, isLoading } = useQuery<Site[]>({
    queryKey: ['/api/sites'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sites by District</CardTitle>
          <CardDescription>Distribution across districts</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <div className="h-full w-full flex items-center justify-center">
            <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sitesByDistrict = [
    { name: "Bojanala", sites: sites?.filter(site => site.district === "Bojanala").length || 0 },
    { name: "Dr Kenneth Kaunda", sites: sites?.filter(site => site.district === "Dr Kenneth Kaunda").length || 0 },
    { name: "Dr Ruth S. Mompati", sites: sites?.filter(site => site.district === "Dr Ruth Segomotsi Mompati").length || 0 },
    { name: "Ngaka Modiri Molema", sites: sites?.filter(site => site.district === "Ngaka Modiri Molema").length || 0 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sites by District</CardTitle>
        <CardDescription>Distribution across districts</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sitesByDistrict}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sites" fill="#1976D2" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SiteDistrictChart;
