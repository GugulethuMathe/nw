import React from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Site } from "@shared/schema";
import SiteDetail from "@/components/sites/SiteDetail";

const SiteDetailPage: React.FC = () => {
  const { id } = useParams();
  
  if (!id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Error: No site ID provided.</p>
        </div>
      </div>
    );
  }

  return <SiteDetail siteId={id} />;
};

export default SiteDetailPage;
