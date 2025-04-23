import { pgTable, text, serial, integer, boolean, timestamp, json, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // Admin, Project Manager, Data Analyst, Field Assessor, Viewer
  email: text("email"),
  phone: text("phone"),
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true 
});

// Site model
export const sites = pgTable("sites", {
  id: serial("id").primaryKey(),
  siteId: text("site_id").notNull().unique(), // Custom ID (e.g., CLC-001)
  name: text("name").notNull(),
  type: text("type").notNull(), // CLC, Satellite, Operational
  district: text("district").notNull(),
  physicalAddress: text("physical_address"),
  gpsLat: real("gps_lat"),
  gpsLng: real("gps_lng"),
  hostDepartment: text("host_department"),
  agreementType: text("agreement_type"), // Owned, Rented, Partnership
  agreementDetails: text("agreement_details"),
  contractNumber: text("contract_number"),
  contractTerm: text("contract_term"),
  renewalDate: text("renewal_date"),
  contactPerson: text("contact_person"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  establishmentDate: text("establishment_date"),
  operationalStatus: text("operational_status").notNull(), // Active, Inactive, Planned
  assessmentStatus: text("assessment_status").notNull(), // To Visit, Visited, Data Verified
  
  // Infrastructure details
  totalArea: integer("total_area"), // square meters
  classrooms: integer("classrooms"),
  offices: integer("offices"),
  computerLabs: integer("computer_labs"),
  workshops: integer("workshops"),
  hasLibrary: boolean("has_library"),
  hasStudentCommonAreas: boolean("has_student_common_areas"),
  hasStaffFacilities: boolean("has_staff_facilities"),
  accessibilityFeatures: text("accessibility_features"),
  internetConnectivity: text("internet_connectivity"),
  securityFeatures: text("security_features"),
  
  // Condition assessment
  buildingCondition: text("building_condition"), // Good, Fair, Poor, Critical
  electricalCondition: text("electrical_condition"),
  plumbingCondition: text("plumbing_condition"),
  interiorCondition: text("interior_condition"),
  exteriorCondition: text("exterior_condition"),
  lastRenovationDate: text("last_renovation_date"),
  
  notes: text("notes"),
  images: json("images").$type<string[]>(),
  createdBy: integer("created_by").references(() => users.id),
  lastVisitedBy: integer("last_visited_by").references(() => users.id),
  lastVisitDate: timestamp("last_visit_date"),
});

export const insertSiteSchema = createInsertSchema(sites).omit({ 
  id: true,
  createdBy: true, 
  lastVisitedBy: true,
  lastVisitDate: true
});

// Staff model
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  staffId: text("staff_id").notNull().unique(), // Custom ID (e.g., STAFF-001)
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  position: text("position"),
  email: text("email"),
  phone: text("phone"),
  verified: boolean("verified").default(false),
  qualifications: json("qualifications").$type<string[]>(),
  skills: json("skills").$type<string[]>(),
  workload: integer("workload"), // Hours per week
  siteId: integer("site_id").references(() => sites.id),
});

export const insertStaffSchema = createInsertSchema(staff).omit({ 
  id: true 
});

// Asset model
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  assetId: text("asset_id").notNull().unique(), // Custom ID (e.g., ASSET-001)
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  condition: text("condition").notNull(), // Good, Fair, Poor, Critical
  acquisitionDate: text("acquisition_date"),
  lastServiceDate: text("last_service_date"),
  notes: text("notes"),
  images: json("images").$type<string[]>(),
  siteId: integer("site_id").references(() => sites.id),
});

export const insertAssetSchema = createInsertSchema(assets).omit({ 
  id: true 
});

// Program model
export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  programId: text("program_id").notNull().unique(), // Custom ID (e.g., PROG-001)
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  enrollmentCount: integer("enrollment_count"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  status: text("status").notNull(), // Active, Inactive, Planned
  notes: text("notes"),
  siteId: integer("site_id").references(() => sites.id),
});

export const insertProgramSchema = createInsertSchema(programs).omit({ 
  id: true 
});

// Activity model - for tracking recent activities
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // site_visit, data_verification, photo_upload, etc.
  description: text("description").notNull(),
  relatedEntityId: integer("related_entity_id"), // Site ID, Staff ID, etc.
  relatedEntityType: text("related_entity_type"), // site, staff, asset, program
  performedBy: integer("performed_by").references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activities).omit({ 
  id: true,
  timestamp: true
});

// Define export types for all schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSite = z.infer<typeof insertSiteSchema>;
export type Site = typeof sites.$inferSelect;

export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Staff = typeof staff.$inferSelect;

export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Asset = typeof assets.$inferSelect;

export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type Program = typeof programs.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
