import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Site } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DownloadCloud, Grid, List, FileSpreadsheet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import * as XLSX from 'xlsx';

const ITEMS_PER_PAGE = 10;

const SiteList: React.FC = () => {
  const { data: sites, isLoading } = useQuery<Site[]>({
    queryKey: ['/api/sites'],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [currentPage, setCurrentPage] = useState(1);

  // List of districts in North West Province
  const districts = [
    "Bojanala",
    "Dr Kenneth Kaunda",
    "Dr Ruth Segomotsi Mompati",
    "Ngaka Modiri Molema"
  ];

  // Filter the sites based on search term and filters
  const filteredSites = sites?.filter(site => {
    const matchesSearch = searchTerm === "" || 
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.siteId.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesType = typeFilter === "all" || site.type === typeFilter;
    const matchesDistrict = districtFilter === "all" || site.district === districtFilter;
    const matchesStatus = statusFilter === "all" || site.operationalStatus === statusFilter;
    
    return matchesSearch && matchesType && matchesDistrict && matchesStatus;
  });

  // Calculate pagination
  const totalPages = filteredSites ? Math.ceil(filteredSites.length / ITEMS_PER_PAGE) : 0;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSites = filteredSites?.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-success-light text-white";
      case "Inactive":
        return "bg-neutral-500 text-white";
      case "Planned":
        return "bg-warning-light text-white";
      default:
        return "bg-neutral-500 text-white";
    }
  };

  const getAssessmentStatusColor = (status: string) => {
    switch (status) {
      case "ToVisit":
        return "bg-warning-light text-white";
      case "Visited":
        return "bg-primary-500 text-white";
      case "DataVerified":
        return "bg-success-light text-white";
      default:
        return "bg-neutral-500 text-white";
    }
  };

  const exportToExcel = () => {
    if (!filteredSites) return;

    const exportData = filteredSites.map(site => ({
      'Site ID': site.siteId,
      'Name': site.name,
      'Location': `${site.gpsLat || ''}, ${site.gpsLng || ''}`,
      'District': site.district,
      'Status': site.operationalStatus,
      'Assessment': site.assessmentStatus,
      'Contact Person': site.contactPerson || 'N/A',
      'Contact Phone': site.contactPhone || 'N/A',
      'Address': site.physicalAddress || 'N/A',
      'Description': site.notes || '',
      'Building Condition': site.buildingCondition || 'Not assessed',
      'Last Visit Date': site.lastVisitDate ? new Date(site.lastVisitDate).toLocaleDateString() : 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sites");

    // Style the worksheet
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1";
      if (!ws[address]) continue;
      ws[address].s = {
        fill: { fgColor: { rgb: "2980B9" } },
        font: { color: { rgb: "FFFFFF" }, bold: true }
      };
    }

    XLSX.writeFile(wb, `sites-export-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToCSV = () => {
    if (!filteredSites) return;

    const exportFields = [
      'Site ID',
      'Name',
      'Location',
      'District',
      'Status',
      'Assessment',
      'Contact Person',
      'Contact Phone',
      'Address',
      'Description',
      'Building Condition',
      'Last Visit Date'
    ];

    const csvData = [
      // Header row
      exportFields.join(','),
      // Data rows
      ...filteredSites.map(site => [
        site.siteId,
        `"${site.name}"`,
        `"${site.gpsLat || ''}, ${site.gpsLng || ''}"`,
        `"${site.district}"`,
        `"${site.operationalStatus}"`,
        `"${site.assessmentStatus}"`,
        `"${site.contactPerson || ''}"`,
        `"${site.contactPhone || ''}"`,
        `"${site.physicalAddress || ''}"`,
        `"${(site.notes || '').replace(/"/g, '""')}"`,
        `"${site.buildingCondition || 'Not assessed'}"`,
        `"${site.lastVisitDate ? new Date(site.lastVisitDate).toLocaleDateString() : 'N/A'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sites-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExportExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    const exportData = sites?.map(site => ({
      'Site ID': site.siteId,
      'Name': site.name,
      'Type': site.type,
      'District': site.district,
      'Status': site.operationalStatus,
      'Assessment': site.assessmentStatus,
      'Contact Person': site.contactPerson || 'N/A',
      'Contact Phone': site.contactPhone || 'N/A',
      'Address': site.physicalAddress || 'N/A',
      'Total Area (m²)': site.totalArea || 'N/A',
      'Classrooms': site.classrooms || 'N/A',
      'Computer Labs': site.computerLabs || 'N/A',
      'Has Library': site.hasLibrary ? 'Yes' : 'No',
      'Building Condition': site.buildingCondition || 'Not assessed',
      'Last Visit Date': site.lastVisitDate ? new Date(site.lastVisitDate).toLocaleDateString() : 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData || []);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sites');
    
    // Auto-size columns
    const cols = Object.keys(exportData?.[0] || {}).map(() => ({ wch: 15 }));
    worksheet['!cols'] = cols;

    XLSX.writeFile(workbook, 'sites-report.xlsx');
  };

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <Input
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="CLC">CLC</SelectItem>
              <SelectItem value="Satellite">Satellite</SelectItem>
              <SelectItem value="Operational">Operational</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={districtFilter} onValueChange={setDistrictFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by district" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {districts.map(district => (
                <SelectItem key={district} value={district}>{district}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-neutral-500">Status:</span>
          <Button 
            variant={statusFilter === "all" ? "secondary" : "outline"} 
            size="sm" 
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          <Button 
            variant={statusFilter === "Active" ? "secondary" : "outline"} 
            size="sm" 
            onClick={() => setStatusFilter("Active")}
            className="text-success-light"
          >
            Active
          </Button>
          <Button 
            variant={statusFilter === "Inactive" ? "secondary" : "outline"} 
            size="sm" 
            onClick={() => setStatusFilter("Inactive")}
          >
            Inactive
          </Button>
          <Button 
            variant={statusFilter === "Planned" ? "secondary" : "outline"} 
            size="sm" 
            onClick={() => setStatusFilter("Planned")}
            className="text-warning-light"
          >
            Planned
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")}
          >
            {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <DownloadCloud className="h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportExcel}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/sites/add">
            <Button>
              <i className="fas fa-plus mr-2"></i>
              Add New Site
            </Button>
          </Link>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-neutral-500">Loading sites...</p>
        </div>
      ) : paginatedSites && paginatedSites.length > 0 ? (
        <>
          {viewMode === "grid" ? (
            <div className="space-y-4">
              {paginatedSites.map((site) => (
                <Link key={site.id} href={`/sites/${site.id}`}>
                  <Card className="cursor-pointer hover:border-primary-200 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-500 flex items-center justify-center mr-4 mt-1">
                            <i className={`fas ${site.type === "CLC" ? "fa-building" : site.type === "Satellite" ? "fa-satellite" : "fa-broadcast-tower"}`}></i>
                          </div>
                          <div>
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-neutral-800">{site.name}</h3>
                              <span className="text-sm text-neutral-500 ml-2">({site.siteId})</span>
                            </div>
                            <p className="text-neutral-500">{site.type} - {site.district}</p>
                            <p className="text-sm text-neutral-600 mt-1">
                              {site.physicalAddress ? (
                                <span><i className="fas fa-map-marker-alt mr-1"></i> {site.physicalAddress}</span>
                              ) : (
                                <span className="text-neutral-400 italic">No address recorded</span>
                              )}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                          <Badge className={getStatusColor(site.operationalStatus)}>
                            {site.operationalStatus}
                          </Badge>
                          <Badge className={getAssessmentStatusColor(site.assessmentStatus)}>
                            {site.assessmentStatus}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Site ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assessment</TableHead>
                      <TableHead>Contact Person</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSites.map((site) => (
                      <TableRow key={site.id} className="cursor-pointer hover:bg-neutral-50" onClick={() => window.location.href = `/sites/${site.id}`}>
                        <TableCell className="font-medium">{site.siteId}</TableCell>
                        <TableCell>{site.name}</TableCell>
                        <TableCell>{site.type}</TableCell>
                        <TableCell>{site.district}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(site.operationalStatus)}>
                            {site.operationalStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getAssessmentStatusColor(site.assessmentStatus)}>
                            {site.assessmentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>{site.contactPerson || "Not specified"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {paginatedSites && paginatedSites.length > 0 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(p => Math.max(1, p - 1));
                      }}
                      aria-disabled={currentPage === 1}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => {
                    const pageNumber = i + 1;
                    
                    // Show first page, last page, and pages around current page
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(pageNumber);
                            }}
                            isActive={currentPage === pageNumber}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    
                    // Show ellipsis for gaps
                    if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    
                    return null;
                  })}
                  
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(p => Math.min(totalPages, p + 1));
                      }}
                      aria-disabled={currentPage === totalPages}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              <div className="text-center mt-2 text-sm text-neutral-500">
                Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredSites?.length || 0)} of {filteredSites?.length || 0} sites
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-neutral-200">
          <div className="text-5xl text-neutral-300 mb-3">
            <i className="fas fa-building"></i>
          </div>
          <h3 className="text-lg font-medium text-neutral-700 mb-1">No Sites Found</h3>
          <p className="text-neutral-500 mb-4">No sites match your current filters.</p>
          <Button onClick={() => {
            setSearchTerm("");
            setTypeFilter("all");
            setDistrictFilter("all");
            setStatusFilter("all");
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default SiteList;
