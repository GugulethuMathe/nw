import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Staff as StaffType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { DownloadCloud, FileSpreadsheet, Grid, List } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import * as XLSX from 'xlsx';

const ITEMS_PER_PAGE = 10;

const StaffComponent: React.FC = () => {
  const { data: staff, isLoading } = useQuery<StaffType[]>({
    queryKey: ['/api/staff'],
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<{ id: number; name: string } | null>(null);

  // Filter staff based on search and filters
  const filteredStaff = staff?.filter(member => {
    const matchesSearch = searchTerm === "" || 
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.position && member.position.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesVerification = verificationFilter === "all" || 
      (verificationFilter === "verified" && member.verified) ||
      (verificationFilter === "unverified" && !member.verified);

    const matchesPosition = positionFilter === "all" ||
      member.position === positionFilter;
    
    return matchesSearch && matchesVerification && matchesPosition;
  });

  // Get unique positions for filter
  const positions = Array.from(new Set(staff?.map(member => member.position || '').filter(Boolean)));

  // Pagination
  const totalItems = filteredStaff?.length || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedStaff = filteredStaff?.slice(startIndex, endIndex);

  const handleExportExcel = () => {
    if (!staff || staff.length === 0) return;
    
    const workbook = XLSX.utils.book_new();
    
    const exportData = staff.map(member => ({
      'Staff ID': member.staffId,
      'Name': `${member.firstName} ${member.lastName}`,
      'Position': member.position || 'Not specified',
      'Email': member.email,
      'Phone': member.phone || 'Not specified',
      'Status': member.verified ? 'Verified' : 'Unverified'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff');
    
    // Auto-size columns
    const cols = Object.keys(exportData[0]).map(() => ({ wch: 15 }));
    worksheet['!cols'] = cols;

    XLSX.writeFile(workbook, `staff-export-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const deleteMutation = useMutation({
    mutationFn: async (staffId: number) => {
      const response = await apiRequest("DELETE", `/api/staff/${staffId}`);
      if (!response.ok) {
        throw new Error('Failed to delete staff member');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff'] });
      toast({
        title: "Staff member deleted",
        description: "The staff member has been successfully deleted.",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete staff member. " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (staffId: number, staffName: string) => {
    setStaffToDelete({ id: staffId, name: staffName });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (staffToDelete) {
      deleteMutation.mutate(staffToDelete.id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Staff Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {staffToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Staff Management</h1>
          <p className="text-neutral-500">Manage staff members across all centers</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <DownloadCloud className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportExcel}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export to Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode("table")}
              className={viewMode === "table" ? "bg-neutral-100" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-neutral-100" : ""}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
          
          <Button asChild>
            <Link href="/staff/add">
              <a>Add New Staff</a>
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Search staff..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        
        <Select value={positionFilter} onValueChange={setPositionFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Positions</SelectItem>
            {positions.map(position => (
              <SelectItem key={position} value={position}>{position}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={verificationFilter} onValueChange={setVerificationFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by verification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Staff</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Staff List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
          ) : paginatedStaff && paginatedStaff.length > 0 ? (
            <>
              {viewMode === "table" ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedStaff.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="font-medium">
                            {member.firstName} {member.lastName}
                          </div>
                          <div className="text-sm text-neutral-500">{member.staffId}</div>
                        </TableCell>
                        <TableCell>{member.position || "Not specified"}</TableCell>
                        <TableCell>
                          <div>{member.email}</div>
                          <div className="text-sm text-neutral-500">{member.phone || "No phone"}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={member.verified ? "default" : "secondary"}>
                            {member.verified ? "Verified" : "Unverified"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/staff/${member.id}`}>View</Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/staff/${member.id}/edit`}>Edit</Link>
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => {
                                setStaffToDelete({ id: member.id, name: `${member.firstName} ${member.lastName}` });
                                setDeleteDialogOpen(true);
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {paginatedStaff.map((member) => (
                    <Card key={member.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">
                              {member.firstName} {member.lastName}
                            </h3>
                            <p className="text-sm text-neutral-500">{member.staffId}</p>
                          </div>
                          <Badge variant={member.verified ? "default" : "secondary"}>
                            {member.verified ? "Verified" : "Unverified"}
                          </Badge>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm">{member.position || "Position not specified"}</p>
                          <p className="text-sm text-neutral-500">{member.email}</p>
                          <p className="text-sm text-neutral-500">{member.phone || "No phone"}</p>
                        </div>
                        <div className="mt-4 space-y-2">
                          <Button variant="outline" size="sm" className="w-full" asChild>
                            <Link href={`/staff/${member.id}`}>View Details</Link>
                          </Button>
                          <Button variant="outline" size="sm" className="w-full" asChild>
                            <Link href={`/staff/${member.id}/edit`}>Edit Staff</Link>
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="w-full"
                            onClick={() => {
                              setStaffToDelete({ id: member.id, name: `${member.firstName} ${member.lastName}` });
                              setDeleteDialogOpen(true);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

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
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredStaff?.length || 0)} of {filteredStaff?.length || 0} staff members
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl text-neutral-300 mb-3">
                <i className="fas fa-users"></i>
              </div>
              <h3 className="text-lg font-medium text-neutral-700 mb-1">No Staff Found</h3>
              <p className="text-neutral-500 mb-4">No staff members match your current filters.</p>
              <Button onClick={() => {
                setSearchTerm("");
                setVerificationFilter("all");
                setPositionFilter("all");
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

export default StaffComponent;
