import { 
  users, 
  sites,
  staff,
  assets,
  programs,
  activities,
  type User, 
  type InsertUser,
  type Site,
  type InsertSite,
  type Staff,
  type InsertStaff,
  type Asset,
  type InsertAsset,
  type Program,
  type InsertProgram,
  type Activity,
  type InsertActivity
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Site management
  getAllSites(): Promise<Site[]>;
  getSite(id: number): Promise<Site | undefined>;
  createSite(site: InsertSite): Promise<Site>;
  updateSite(id: number, site: Partial<InsertSite>): Promise<Site>;
  deleteSite(id: number): Promise<boolean>;
  
  // Staff management
  getAllStaff(): Promise<Staff[]>;
  getStaff(id: number): Promise<Staff | undefined>;
  getStaffBySite(siteId: number): Promise<Staff[]>;
  createStaff(staffMember: InsertStaff): Promise<Staff>;
  updateStaff(id: number, staffMember: Partial<InsertStaff>): Promise<Staff>;
  deleteStaff(id: number): Promise<boolean>;
  
  // Asset management
  getAllAssets(): Promise<Asset[]>;
  getAsset(id: number): Promise<Asset | undefined>;
  getAssetsBySite(siteId: number): Promise<Asset[]>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: number, asset: Partial<InsertAsset>): Promise<Asset>;
  deleteAsset(id: number): Promise<boolean>;
  
  // Program management
  getAllPrograms(): Promise<Program[]>;
  getProgram(id: number): Promise<Program | undefined>;
  getProgramsBySite(siteId: number): Promise<Program[]>;
  createProgram(program: InsertProgram): Promise<Program>;
  updateProgram(id: number, program: Partial<InsertProgram>): Promise<Program>;
  deleteProgram(id: number): Promise<boolean>;
  
  // Activity tracking
  getAllActivities(): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sites: Map<number, Site>;
  private staffMembers: Map<number, Staff>;
  private assets: Map<number, Asset>;
  private programs: Map<number, Program>;
  private activityLogs: Map<number, Activity>;
  
  private userIdCounter: number;
  private siteIdCounter: number;
  private staffIdCounter: number;
  private assetIdCounter: number;
  private programIdCounter: number;
  private activityIdCounter: number;

  constructor() {
    this.users = new Map();
    this.sites = new Map();
    this.staffMembers = new Map();
    this.assets = new Map();
    this.programs = new Map();
    this.activityLogs = new Map();
    
    this.userIdCounter = 1;
    this.siteIdCounter = 1;
    this.staffIdCounter = 1;
    this.assetIdCounter = 1;
    this.programIdCounter = 1;
    this.activityIdCounter = 1;
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Site methods
  async getAllSites(): Promise<Site[]> {
    return Array.from(this.sites.values());
  }
  
  async getSite(id: number): Promise<Site | undefined> {
    return this.sites.get(id);
  }
  
  async createSite(insertSite: InsertSite): Promise<Site> {
    const id = this.siteIdCounter++;
    const site: Site = { ...insertSite, id };
    this.sites.set(id, site);
    return site;
  }
  
  async updateSite(id: number, updateData: Partial<InsertSite>): Promise<Site> {
    const existingSite = this.sites.get(id);
    if (!existingSite) {
      throw new Error(`Site with ID ${id} not found`);
    }
    
    const updatedSite: Site = { ...existingSite, ...updateData, id };
    this.sites.set(id, updatedSite);
    return updatedSite;
  }
  
  async deleteSite(id: number): Promise<boolean> {
    return this.sites.delete(id);
  }
  
  // Staff methods
  async getAllStaff(): Promise<Staff[]> {
    return Array.from(this.staffMembers.values());
  }
  
  async getStaff(id: number): Promise<Staff | undefined> {
    return this.staffMembers.get(id);
  }
  
  async getStaffBySite(siteId: number): Promise<Staff[]> {
    return Array.from(this.staffMembers.values()).filter(
      (staff) => staff.siteId === siteId
    );
  }
  
  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const id = this.staffIdCounter++;
    const staffMember: Staff = { ...insertStaff, id };
    this.staffMembers.set(id, staffMember);
    return staffMember;
  }
  
  async updateStaff(id: number, updateData: Partial<InsertStaff>): Promise<Staff> {
    const existingStaff = this.staffMembers.get(id);
    if (!existingStaff) {
      throw new Error(`Staff member with ID ${id} not found`);
    }
    
    const updatedStaff: Staff = { ...existingStaff, ...updateData, id };
    this.staffMembers.set(id, updatedStaff);
    return updatedStaff;
  }
  
  async deleteStaff(id: number): Promise<boolean> {
    return this.staffMembers.delete(id);
  }
  
  // Asset methods
  async getAllAssets(): Promise<Asset[]> {
    return Array.from(this.assets.values());
  }
  
  async getAsset(id: number): Promise<Asset | undefined> {
    return this.assets.get(id);
  }
  
  async getAssetsBySite(siteId: number): Promise<Asset[]> {
    return Array.from(this.assets.values()).filter(
      (asset) => asset.siteId === siteId
    );
  }
  
  async createAsset(insertAsset: InsertAsset): Promise<Asset> {
    const id = this.assetIdCounter++;
    const asset: Asset = { ...insertAsset, id };
    this.assets.set(id, asset);
    return asset;
  }
  
  async updateAsset(id: number, updateData: Partial<InsertAsset>): Promise<Asset> {
    const existingAsset = this.assets.get(id);
    if (!existingAsset) {
      throw new Error(`Asset with ID ${id} not found`);
    }
    
    const updatedAsset: Asset = { ...existingAsset, ...updateData, id };
    this.assets.set(id, updatedAsset);
    return updatedAsset;
  }
  
  async deleteAsset(id: number): Promise<boolean> {
    return this.assets.delete(id);
  }
  
  // Program methods
  async getAllPrograms(): Promise<Program[]> {
    return Array.from(this.programs.values());
  }
  
  async getProgram(id: number): Promise<Program | undefined> {
    return this.programs.get(id);
  }
  
  async getProgramsBySite(siteId: number): Promise<Program[]> {
    return Array.from(this.programs.values()).filter(
      (program) => program.siteId === siteId
    );
  }
  
  async createProgram(insertProgram: InsertProgram): Promise<Program> {
    const id = this.programIdCounter++;
    const program: Program = { ...insertProgram, id };
    this.programs.set(id, program);
    return program;
  }
  
  async updateProgram(id: number, updateData: Partial<InsertProgram>): Promise<Program> {
    const existingProgram = this.programs.get(id);
    if (!existingProgram) {
      throw new Error(`Program with ID ${id} not found`);
    }
    
    const updatedProgram: Program = { ...existingProgram, ...updateData, id };
    this.programs.set(id, updatedProgram);
    return updatedProgram;
  }
  
  async deleteProgram(id: number): Promise<boolean> {
    return this.programs.delete(id);
  }
  
  // Activity methods
  async getAllActivities(): Promise<Activity[]> {
    return Array.from(this.activityLogs.values());
  }
  
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activityLogs.get(id);
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const timestamp = new Date();
    const activity: Activity = { ...insertActivity, id, timestamp };
    this.activityLogs.set(id, activity);
    return activity;
  }
  
  // Helper to initialize sample data
  private initializeSampleData() {
    // Create admin user
    this.createUser({
      username: "admin",
      password: "admin123",  // In a real app, this would be hashed
      name: "System Admin",
      role: "Admin",
      email: "admin@nwcetc.edu.za",
      phone: "+27123456789"
    });
    
    // Create field assessor user
    this.createUser({
      username: "field",
      password: "field123",  // In a real app, this would be hashed
      name: "John Doe",
      role: "Field Assessor",
      email: "john.doe@nwcetc.edu.za",
      phone: "+27123456790"
    });
    
    // Create some sites
    const klerksdorpCLC = this.createSite({
      siteId: "CLC-001",
      name: "Klerksdorp CLC",
      type: "CLC",
      district: "Dr Kenneth Kaunda",
      physicalAddress: "123 Anderson Street, Klerksdorp, 2571",
      gpsLat: -26.8521,
      gpsLng: 26.6693,
      hostDepartment: "Department of Public Works",
      agreementType: "Rented",
      agreementDetails: "5-year lease agreement",
      contractNumber: "NWPW-2015-0342",
      contractTerm: "5 Years (Renewable)",
      renewalDate: "2025-03-11",
      contactPerson: "Ms. T. Naidoo",
      contactEmail: "tnaidoo@nwcetc.edu.za",
      contactPhone: "018 462 5438",
      establishmentDate: "2015-03-12",
      operationalStatus: "Active",
      assessmentStatus: "Data Verified",
      totalArea: 1200,
      classrooms: 8,
      offices: 4,
      computerLabs: 1,
      workshops: 2,
      hasLibrary: true,
      hasStudentCommonAreas: true,
      hasStaffFacilities: true,
      accessibilityFeatures: "Ramps, elevator",
      internetConnectivity: "Fiber, 100Mbps",
      securityFeatures: "Security guards, CCTV",
      buildingCondition: "Good",
      electricalCondition: "Good",
      plumbingCondition: "Fair",
      interiorCondition: "Good",
      exteriorCondition: "Good",
      lastRenovationDate: "2018-06-15",
      notes: "Main CLC for the Dr Kenneth Kaunda district",
      images: ["https://example.com/images/klerksdorp1.jpg", "https://example.com/images/klerksdorp2.jpg"],
      createdBy: 1,
      lastVisitedBy: 2,
      lastVisitDate: new Date("2024-01-15")
    });
    
    this.createSite({
      siteId: "CLC-002",
      name: "Potchefstroom CLC",
      type: "CLC",
      district: "Dr Kenneth Kaunda",
      physicalAddress: "45 Meyer Street, Potchefstroom, 2520",
      gpsLat: -26.7145,
      gpsLng: 27.0970,
      hostDepartment: "Department of Education",
      agreementType: "Owned",
      contactPerson: "Mr. P. Molefe",
      contactEmail: "pmolefe@nwcetc.edu.za",
      contactPhone: "018 293 1234",
      establishmentDate: "2016-01-20",
      operationalStatus: "Active",
      assessmentStatus: "Visited",
      classrooms: 6,
      offices: 3,
      computerLabs: 1,
      hasLibrary: false,
      hasStudentCommonAreas: true,
      hasStaffFacilities: true,
      buildingCondition: "Good",
      electricalCondition: "Fair",
      plumbingCondition: "Fair",
      interiorCondition: "Good",
      exteriorCondition: "Fair",
      images: ["https://example.com/images/potch1.jpg"],
      createdBy: 1,
      lastVisitedBy: 2,
      lastVisitDate: new Date("2024-01-16")
    });
    
    this.createSite({
      siteId: "SAT-001",
      name: "Jouberton Satellite",
      type: "Satellite",
      district: "Dr Kenneth Kaunda",
      physicalAddress: "Jouberton Community Hall, Jouberton, Klerksdorp",
      gpsLat: -26.8678,
      gpsLng: 26.6322,
      hostDepartment: "Department of Social Development",
      agreementType: "Partnership",
      contactPerson: "Mrs. N. Khumalo",
      contactEmail: "nkhumalo@nwcetc.edu.za",
      contactPhone: "018 462 9876",
      establishmentDate: "2017-02-10",
      operationalStatus: "Active",
      assessmentStatus: "To Visit",
      classrooms: 3,
      hasLibrary: false,
      hasStudentCommonAreas: false,
      hasStaffFacilities: false,
      buildingCondition: "Fair",
      electricalCondition: "Poor",
      plumbingCondition: "Poor",
      interiorCondition: "Fair",
      exteriorCondition: "Fair",
      createdBy: 1
    });
    
    this.createSite({
      siteId: "CLC-003",
      name: "Mahikeng CLC",
      type: "CLC",
      district: "Ngaka Modiri Molema",
      physicalAddress: "18 University Drive, Mahikeng, 2745",
      gpsLat: -25.8560,
      gpsLng: 25.6440,
      hostDepartment: "Department of Education",
      agreementType: "Owned",
      contactPerson: "Dr. B. Matlou",
      contactEmail: "bmatlou@nwcetc.edu.za",
      contactPhone: "018 384 5678",
      establishmentDate: "2014-09-01",
      operationalStatus: "Active",
      assessmentStatus: "To Visit",
      classrooms: 10,
      offices: 5,
      computerLabs: 2,
      workshops: 1,
      hasLibrary: true,
      hasStudentCommonAreas: true,
      hasStaffFacilities: true,
      buildingCondition: "Good",
      electricalCondition: "Good",
      plumbingCondition: "Good",
      interiorCondition: "Good",
      exteriorCondition: "Good",
      images: ["https://example.com/images/mahikeng1.jpg", "https://example.com/images/mahikeng2.jpg"],
      createdBy: 1
    });
    
    this.createSite({
      siteId: "CLC-004",
      name: "Rustenburg CLC",
      type: "CLC",
      district: "Bojanala",
      physicalAddress: "56 Klopper Street, Rustenburg, 0299",
      gpsLat: -25.6667,
      gpsLng: 27.2424,
      hostDepartment: "Department of Public Works",
      agreementType: "Rented",
      contractNumber: "NWPW-2016-0123",
      contractTerm: "10 Years",
      renewalDate: "2026-05-20",
      contactPerson: "Ms. L. Motsepe",
      contactEmail: "lmotsepe@nwcetc.edu.za",
      contactPhone: "014 592 3456",
      establishmentDate: "2016-05-20",
      operationalStatus: "Active",
      assessmentStatus: "Data Verified",
      totalArea: 1500,
      classrooms: 12,
      offices: 6,
      computerLabs: 2,
      workshops: 3,
      hasLibrary: true,
      hasStudentCommonAreas: true,
      hasStaffFacilities: true,
      buildingCondition: "Good",
      electricalCondition: "Good",
      plumbingCondition: "Good",
      interiorCondition: "Good",
      exteriorCondition: "Good",
      lastRenovationDate: "2020-01-10",
      images: ["https://example.com/images/rustenburg1.jpg"],
      createdBy: 1,
      lastVisitedBy: 2,
      lastVisitDate: new Date("2023-11-25")
    });
    
    this.createSite({
      siteId: "SAT-015",
      name: "Vryburg Satellite",
      type: "Satellite",
      district: "Dr Ruth Segomotsi Mompati",
      physicalAddress: "25 Market Street, Vryburg, 8601",
      gpsLat: -27.0144,
      gpsLng: 24.7282,
      hostDepartment: "Department of Education",
      agreementType: "Partnership",
      contactPerson: "Mr. T. Plaatje",
      contactEmail: "tplaatje@nwcetc.edu.za",
      contactPhone: "053 927 1234",
      establishmentDate: "2018-03-15",
      operationalStatus: "Active",
      assessmentStatus: "Data Verified",
      classrooms: 4,
      offices: 1,
      hasLibrary: false,
      hasStudentCommonAreas: false,
      hasStaffFacilities: true,
      buildingCondition: "Fair",
      electricalCondition: "Fair",
      plumbingCondition: "Fair",
      interiorCondition: "Fair",
      exteriorCondition: "Good",
      createdBy: 1,
      lastVisitedBy: 2,
      lastVisitDate: new Date("2024-01-10")
    });
    
    // Create some staff members
    this.createStaff({
      staffId: "STAFF-001",
      firstName: "Thabo",
      lastName: "Mokoena",
      position: "Center Manager",
      email: "tmokoena@nwcetc.edu.za",
      phone: "018 462 5440",
      verified: true,
      qualifications: ["M.Ed. Adult Education", "B.Ed. (Hons)"],
      skills: ["Management", "Curriculum Development", "Staff Leadership"],
      workload: 40,
      siteId: 1 // Klerksdorp CLC
    });
    
    this.createStaff({
      staffId: "STAFF-002",
      firstName: "Sarah",
      lastName: "Smith",
      position: "Lecturer - Mathematics",
      email: "ssmith@nwcetc.edu.za",
      phone: "018 462 5441",
      verified: true,
      qualifications: ["B.Sc. Mathematics", "PGCE"],
      skills: ["Mathematics", "Adult Numeracy", "Assessment"],
      workload: 32,
      siteId: 1 // Klerksdorp CLC
    });
    
    this.createStaff({
      staffId: "STAFF-003",
      firstName: "John",
      lastName: "Ndlovu",
      position: "Lecturer - Computer Skills",
      email: "jndlovu@nwcetc.edu.za",
      phone: "018 462 5442",
      verified: true,
      qualifications: ["Diploma in IT", "N6 Computer Studies"],
      skills: ["Computer Literacy", "Office Applications", "Basic Programming"],
      workload: 36,
      siteId: 1 // Klerksdorp CLC
    });
    
    this.createStaff({
      staffId: "STAFF-004",
      firstName: "Rachel",
      lastName: "Mtsweni",
      position: "Center Manager",
      email: "rmtsweni@nwcetc.edu.za",
      phone: "018 293 1235",
      verified: false,
      qualifications: ["B.Ed. Management", "Diploma in Adult Education"],
      skills: ["Leadership", "Administration", "Community Engagement"],
      workload: 40,
      siteId: 2 // Potchefstroom CLC
    });
    
    this.createStaff({
      staffId: "STAFF-005",
      firstName: "Precious",
      lastName: "Moloi",
      position: "Administrator",
      email: "pmoloi@nwcetc.edu.za",
      phone: "018 293 1236",
      verified: false,
      qualifications: ["Diploma in Office Administration"],
      skills: ["Administration", "Record Keeping", "Customer Service"],
      workload: 40,
      siteId: 2 // Potchefstroom CLC
    });
    
    // Create some assets
    this.createAsset({
      assetId: "ASSET-001",
      name: "Computer Lab Desktop PC",
      category: "IT Equipment",
      description: "Dell OptiPlex 3080 Desktop Computers",
      condition: "Good",
      acquisitionDate: "2021-02-15",
      lastServiceDate: "2023-10-10",
      notes: "20 units in computer lab",
      images: ["https://example.com/images/dell-pc.jpg"],
      siteId: 1 // Klerksdorp CLC
    });
    
    this.createAsset({
      assetId: "ASSET-002",
      name: "Smart Board",
      category: "Teaching Equipment",
      description: "SMART Board MX Pro Series Interactive Display",
      condition: "Good",
      acquisitionDate: "2022-05-20",
      lastServiceDate: "2023-11-15",
      notes: "Installed in main classroom",
      images: ["https://example.com/images/smartboard.jpg"],
      siteId: 1 // Klerksdorp CLC
    });
    
    this.createAsset({
      assetId: "ASSET-003",
      name: "Classroom Furniture Set",
      category: "Furniture",
      description: "30 student desks and chairs",
      condition: "Fair",
      acquisitionDate: "2018-01-10",
      notes: "Some chairs need repair",
      siteId: 2 // Potchefstroom CLC
    });
    
    this.createAsset({
      assetId: "ASSET-004",
      name: "Printer/Copier",
      category: "Office Equipment",
      description: "Xerox WorkCentre 6515 Multifunction Printer",
      condition: "Poor",
      acquisitionDate: "2019-03-25",
      lastServiceDate: "2022-06-30",
      notes: "Frequent paper jams, needs replacement",
      siteId: 2 // Potchefstroom CLC
    });
    
    // Create some programs
    this.createProgram({
      programId: "PROG-001",
      name: "Adult Basic Education and Training (ABET) Level 4",
      category: "Basic Education",
      description: "Equivalent to Grade 9, providing foundational literacy and numeracy",
      enrollmentCount: 45,
      startDate: "2023-01-15",
      endDate: "2023-11-30",
      status: "Active",
      notes: "Evening classes available",
      siteId: 1 // Klerksdorp CLC
    });
    
    this.createProgram({
      programId: "PROG-002",
      name: "National Certificate: Small Business Financial Management",
      category: "Vocational",
      description: "NQF Level 4 qualification for small business owners",
      enrollmentCount: 32,
      startDate: "2023-02-01",
      endDate: "2023-10-31",
      status: "Active",
      notes: "Weekend classes available",
      siteId: 1 // Klerksdorp CLC
    });
    
    this.createProgram({
      programId: "PROG-003",
      name: "National Certificate: Information Technology",
      category: "Vocational",
      description: "NQF Level 4 qualification in basic IT skills",
      enrollmentCount: 28,
      startDate: "2023-03-01",
      endDate: "2023-11-30",
      status: "Active",
      siteId: 2 // Potchefstroom CLC
    });
    
    this.createProgram({
      programId: "PROG-004",
      name: "Early Childhood Development",
      category: "Community Development",
      description: "Certificate course for ECD practitioners",
      enrollmentCount: 18,
      startDate: "2023-05-15",
      endDate: "2023-09-30",
      status: "Inactive",
      notes: "To be restarted in January 2024",
      siteId: 2 // Potchefstroom CLC
    });
    
    this.createProgram({
      programId: "PROG-005",
      name: "Plumbing Skills Program",
      category: "Artisan Development",
      description: "Basic plumbing skills training",
      status: "Planned",
      notes: "Pending funding approval",
      siteId: 1 // Klerksdorp CLC
    });
    
    // Create some activities
    this.createActivity({
      type: "site_visit",
      description: "Completed site visit to Klerksdorp CLC",
      relatedEntityId: 1,
      relatedEntityType: "site",
      performedBy: 2,
    });
    
    this.createActivity({
      type: "data_verification",
      description: "Verified data for Klerksdorp CLC",
      relatedEntityId: 1,
      relatedEntityType: "site",
      performedBy: 1,
    });
    
    this.createActivity({
      type: "site_visit",
      description: "Completed site visit to Potchefstroom CLC",
      relatedEntityId: 2,
      relatedEntityType: "site",
      performedBy: 2,
    });
    
    this.createActivity({
      type: "photo_upload",
      description: "Added 5 new photos for Mahikeng CLC",
      relatedEntityId: 4,
      relatedEntityType: "site",
      performedBy: 2,
    });
    
    this.createActivity({
      type: "staff_update",
      description: "Updated 8 staff records at Vryburg Satellite",
      relatedEntityId: 6,
      relatedEntityType: "site",
      performedBy: 1,
    });
  }
}

export const storage = new MemStorage();
