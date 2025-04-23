import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Site } from "@shared/schema";

const DashboardStats: React.FC = () => {
  const { data: sites, isLoading } = useQuery<Site[]>({
    queryKey: ['/api/sites'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(4).fill(null).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-5">
              <div className="h-20 animate-pulse bg-neutral-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = {
    totalSites: sites?.length || 0,
    visitedSites: sites?.filter(site => site.assessmentStatus === "Visited" || site.assessmentStatus === "Data Verified").length || 0,
    verifiedSites: sites?.filter(site => site.assessmentStatus === "Data Verified").length || 0,
    pendingSites: sites?.filter(site => site.assessmentStatus === "To Visit").length || 0,
  };

  const completionPercentage = Math.round((stats.verifiedSites / (stats.totalSites || 1)) * 100);
  const visitedPercentage = Math.round((stats.visitedSites / (stats.totalSites || 1)) * 100);
  const pendingPercentage = Math.round((stats.pendingSites / (stats.totalSites || 1)) * 100);

  const statCards = [
    {
      title: "Total Sites",
      description: "All centers and satellites",
      value: stats.totalSites,
      percentage: completionPercentage,
      percentageLabel: "verified",
      icon: "fa-building",
      iconClass: "bg-primary-100 text-primary-500",
    },
    {
      title: "Sites Visited",
      description: "Field assessment completed",
      value: stats.visitedSites,
      percentage: visitedPercentage,
      percentageLabel: "of total",
      icon: "fa-check-circle",
      iconClass: "bg-success-light bg-opacity-20 text-success-light",
    },
    {
      title: "Data Verified",
      description: "Full verification completed",
      value: stats.verifiedSites,
      percentage: completionPercentage,
      percentageLabel: "of total",
      icon: "fa-clipboard-check",
      iconClass: "bg-primary-500 bg-opacity-20 text-primary-500",
    },
    {
      title: "Pending Visits",
      description: "Sites awaiting assessment",
      value: stats.pendingSites,
      percentage: pendingPercentage,
      percentageLabel: "of total",
      icon: "fa-clock",
      iconClass: "bg-warning-light bg-opacity-20 text-warning-light",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => (
        <Card key={index}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-medium text-neutral-800">{card.title}</h3>
                <p className="text-neutral-500 text-sm">{card.description}</p>
              </div>
              <div className={`p-2 rounded-full ${card.iconClass}`}>
                <i className={`fas ${card.icon} text-xl`}></i>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-3xl font-bold text-neutral-800">{card.value}</p>
              <div className="mt-2 flex items-center text-sm">
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div className={`${index === 0 ? 'bg-primary-500' : index === 1 ? 'bg-success-light' : index === 2 ? 'bg-primary-500' : 'bg-warning-light'} h-2 rounded-full`} style={{ width: `${card.percentage}%` }}></div>
                </div>
                <span className="ml-2 text-neutral-500">{card.percentage}% {card.percentageLabel}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
