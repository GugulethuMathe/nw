import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Asset } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Assets: React.FC = () => {
  const { data: assets, isLoading } = useQuery<Asset[]>({
    queryKey: ['/api/assets'],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  
  // Get unique categories from assets
  const categories = assets 
    ? [...new Set(assets.map(asset => asset.category))]
    : [];
  
  // Filter assets based on search, category, and condition
  const filteredAssets = assets?.filter(asset => {
    const matchesSearch = searchTerm === "" || 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.description && asset.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter;
    const matchesCondition = conditionFilter === "all" || asset.condition === conditionFilter;
    
    return matchesSearch && matchesCategory && matchesCondition;
  });

  const getConditionBadgeClass = (condition: string) => {
    switch (condition) {
      case "Good":
        return "bg-success-light";
      case "Fair":
        return "bg-warning-light";
      case "Poor":
        return "bg-error-light";
      case "Critical":
        return "bg-error-dark";
      default:
        return "bg-neutral-500";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Asset Management</h1>
          <p className="text-neutral-500">
            Track and manage all assets across college centers
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button>
            <i className="fas fa-plus mr-2"></i>
            Add New Asset
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Input
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={conditionFilter} onValueChange={setConditionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              <SelectItem value="Good">Good</SelectItem>
              <SelectItem value="Fair">Fair</SelectItem>
              <SelectItem value="Poor">Poor</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Assets List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
          ) : filteredAssets && filteredAssets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Acquisition Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <div className="font-medium">{asset.name}</div>
                      <div className="text-sm text-neutral-500">{asset.assetId}</div>
                    </TableCell>
                    <TableCell>{asset.category}</TableCell>
                    <TableCell>
                      <Badge className={getConditionBadgeClass(asset.condition)}>
                        {asset.condition}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {asset.siteId ? (
                        <Link href={`/sites/${asset.siteId}`}>
                          <a className="text-primary-500 hover:underline">View Site</a>
                        </Link>
                      ) : (
                        "Not assigned"
                      )}
                    </TableCell>
                    <TableCell>{asset.acquisitionDate || "Not recorded"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/assets/${asset.id}`}>
                            <a>View</a>
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          <i className="fas fa-edit"></i>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl text-neutral-300 mb-3">
                <i className="fas fa-clipboard-list"></i>
              </div>
              <h3 className="text-lg font-medium text-neutral-700 mb-1">No Assets Found</h3>
              <p className="text-neutral-500 mb-4">No assets match your current filters.</p>
              <Button onClick={() => {
                setSearchTerm("");
                setCategoryFilter("all");
                setConditionFilter("all");
              }}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Assets;
