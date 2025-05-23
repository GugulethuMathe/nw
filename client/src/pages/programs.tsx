import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Program } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DownloadCloud } from "lucide-react";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import * as XLSX from "xlsx";

const ITEMS_PER_PAGE = 10;

const Programs: React.FC = () => {
  const { data: programs, isLoading } = useQuery<Program[]>({
    queryKey: ['/api/programs'],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Get unique categories from programs
  const categories = programs 
    ? Array.from(new Set(programs.map(program => program.category)))
    : [];
  
  // Filter programs based on search, category, and status
  const filteredPrograms = programs?.filter(program => {
    const matchesSearch = searchTerm === "" || 
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.programId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (program.description && program.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesCategory = categoryFilter === "all" || program.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || program.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate pagination
  const totalPages = filteredPrograms ? Math.ceil(filteredPrograms.length / ITEMS_PER_PAGE) : 0;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPrograms = filteredPrograms?.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-success-light";
      case "Inactive":
        return "bg-neutral-500";
      case "Planned":
        return "bg-warning-light";
      default:
        return "bg-neutral-500";
    }
  };

  // Calculate stats
  const totalPrograms = programs?.length || 0;
  const activePrograms = programs?.filter(prog => prog.status === "Active").length || 0;
  const inactivePrograms = programs?.filter(prog => prog.status === "Inactive").length || 0;
  const plannedPrograms = programs?.filter(prog => prog.status === "Planned").length || 0;
  
  // Calculate total enrollment
  const totalEnrollment = programs?.reduce((total, program) => {
    return total + (program.enrollmentCount || 0);
  }, 0) || 0;

  const handleExportExcel = () => {
    if (!programs || programs.length === 0) return;
    
    const workbook = XLSX.utils.book_new();
    
    const exportData = programs.map(program => ({
      'Program ID': program.programId,
      'Name': program.name,
      'Category': program.category,
      'Status': program.status,
      'Enrollment': program.enrollmentCount || 'Not recorded',
      'Start Date': program.startDate || 'Not specified',
      'End Date': program.endDate || 'Not specified',
      'Description': program.description || 'No description'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Programs');
    
    // Auto-size columns
    const cols = Object.keys(exportData[0]).map(() => ({ wch: 15 }));
    worksheet['!cols'] = cols;

    XLSX.writeFile(workbook, `programs-export-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Programs Management</h1>
          <p className="text-neutral-500">
            Manage educational programs across all centers
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <DownloadCloud className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button asChild>
            <Link href="/programs/add">
              <a>
                <i className="fas fa-plus mr-2"></i>
                Add New Program
              </a>
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPrograms}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success-light">{activePrograms}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-neutral-500">{inactivePrograms}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Planned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning-light">{plannedPrograms}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Enrollment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-500">{totalEnrollment}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Input
            placeholder="Search programs..."
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Planned">Planned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Programs List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
          ) : paginatedPrograms && paginatedPrograms.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Program</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enrollment</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPrograms.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell>
                        <div className="font-medium">{program.name}</div>
                        <div className="text-sm text-neutral-500">{program.programId}</div>
                      </TableCell>
                      <TableCell>{program.category}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeClass(program.status)}>
                          {program.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{program.enrollmentCount || "Not recorded"}</TableCell>
                      <TableCell>
                        {program.startDate && program.endDate 
                          ? `${program.startDate} - ${program.endDate}`
                          : program.startDate || "Not specified"}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/programs/${program.id}`}>
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

              {/* Pagination */}
              <div className="p-4 border-t">
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
                    
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNumber = i + 1;
                      
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
                  Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredPrograms?.length || 0)} of {filteredPrograms?.length || 0} programs
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl text-neutral-300 mb-3">
                <i className="fas fa-book"></i>
              </div>
              <h3 className="text-lg font-medium text-neutral-700 mb-1">No Programs Found</h3>
              <p className="text-neutral-500 mb-4">No programs match your current filters.</p>
              <Button onClick={() => {
                setSearchTerm("");
                setCategoryFilter("all");
                setStatusFilter("all");
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

export default Programs;
