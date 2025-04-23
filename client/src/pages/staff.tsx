import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Staff as StaffType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const StaffComponent: React.FC = () => {
  const { data: staff, isLoading } = useQuery<StaffType[]>({
    queryKey: ['/api/staff'],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  
  // Filter staff based on search and verification status
  const filteredStaff = staff?.filter(member => {
    const matchesSearch = searchTerm === "" || 
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.position && member.position.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesVerification = verificationFilter === "all" || 
      (verificationFilter === "verified" && member.verified) ||
      (verificationFilter === "unverified" && !member.verified);
    
    return matchesSearch && matchesVerification;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Staff Management</h1>
          <p className="text-neutral-500">
            Manage and verify staff records for all centers
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button>
            <i className="fas fa-plus mr-2"></i>
            Add Staff Member
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{staff?.length || 0}</div>
            <p className="text-sm text-neutral-500">Across all sites</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success-light">
              {staff?.filter(member => member.verified).length || 0}
            </div>
            <p className="text-sm text-neutral-500">Staff records verified</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning-light">
              {staff?.filter(member => !member.verified).length || 0}
            </div>
            <p className="text-sm text-neutral-500">Need verification</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Input
            placeholder="Search by name, ID, or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div>
          <Select value={verificationFilter} onValueChange={setVerificationFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Verification status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              <SelectItem value="verified">Verified Only</SelectItem>
              <SelectItem value="unverified">Unverified Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Staff List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
          ) : filteredStaff && filteredStaff.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="font-medium">{member.firstName} {member.lastName}</div>
                      <div className="text-sm text-neutral-500">{member.staffId}</div>
                    </TableCell>
                    <TableCell>{member.position || "Not specified"}</TableCell>
                    <TableCell>
                      <div>{member.email || "No email"}</div>
                      <div className="text-sm text-neutral-500">{member.phone || "No phone"}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={member.verified ? "bg-success-light" : "bg-warning-light"}>
                        {member.verified ? "Verified" : "Unverified"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/staff/${member.id}`}>
                            <span>View</span>
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
                <i className="fas fa-users"></i>
              </div>
              <h3 className="text-lg font-medium text-neutral-700 mb-1">No Staff Found</h3>
              <p className="text-neutral-500 mb-4">No staff members match your current filters.</p>
              <Button onClick={() => {
                setSearchTerm("");
                setVerificationFilter("all");
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

const Staff = StaffComponent;
export default Staff;
