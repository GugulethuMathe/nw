import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSiteSchema, insertStaffSchema, insertAssetSchema, insertProgramSchema, insertActivitySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  
  // Sites endpoints
  app.get("/api/sites", async (req, res) => {
    try {
      const sites = await storage.getAllSites();
      res.json(sites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sites", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/sites/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const site = await storage.getSite(id);
      
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      res.json(site);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch site", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/sites", async (req, res) => {
    try {
      const validatedData = insertSiteSchema.parse(req.body);
      const newSite = await storage.createSite(validatedData);
      
      // Create activity log for the new site
      await storage.createActivity({
        type: "site_creation",
        description: `Created new site: ${newSite.name}`,
        relatedEntityId: newSite.id,
        relatedEntityType: "site",
        performedBy: req.body.createdBy || 1, // Default to user 1 if not specified
      });
      
      res.status(201).json(newSite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create site", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.patch("/api/sites/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingSite = await storage.getSite(id);
      
      if (!existingSite) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      const validatedData = insertSiteSchema.partial().parse(req.body);
      const updatedSite = await storage.updateSite(id, validatedData);
      
      // Create activity log for the update
      await storage.createActivity({
        type: "site_update",
        description: `Updated site: ${updatedSite.name}`,
        relatedEntityId: updatedSite.id,
        relatedEntityType: "site",
        performedBy: req.body.lastVisitedBy || 1, // Default to user 1 if not specified
      });
      
      res.json(updatedSite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update site", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Staff endpoints
  app.get("/api/staff", async (req, res) => {
    try {
      const staff = await storage.getAllStaff();
      res.json(staff);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch staff", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/sites/:siteId/staff", async (req, res) => {
    try {
      const siteId = parseInt(req.params.siteId);
      const staff = await storage.getStaffBySite(siteId);
      res.json(staff);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch staff for site", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/staff/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const staffMember = await storage.getStaff(id);
      
      if (!staffMember) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      res.json(staffMember);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch staff member", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/staff", async (req, res) => {
    try {
      const validatedData = insertStaffSchema.parse(req.body);
      const newStaff = await storage.createStaff(validatedData);
      
      // Create activity log
      await storage.createActivity({
        type: "staff_creation",
        description: `Added new staff member: ${newStaff.firstName} ${newStaff.lastName}`,
        relatedEntityId: newStaff.id,
        relatedEntityType: "staff",
        performedBy: 1, // Default to user 1
      });
      
      res.status(201).json(newStaff);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create staff member", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Asset endpoints
  app.get("/api/assets", async (req, res) => {
    try {
      const assets = await storage.getAllAssets();
      res.json(assets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assets", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/sites/:siteId/assets", async (req, res) => {
    try {
      const siteId = parseInt(req.params.siteId);
      const assets = await storage.getAssetsBySite(siteId);
      res.json(assets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assets for site", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/assets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const asset = await storage.getAsset(id);
      
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      
      res.json(asset);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch asset", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/assets", async (req, res) => {
    try {
      const validatedData = insertAssetSchema.parse(req.body);
      const newAsset = await storage.createAsset(validatedData);
      
      // Create activity log
      await storage.createActivity({
        type: "asset_creation",
        description: `Added new asset: ${newAsset.name}`,
        relatedEntityId: newAsset.id,
        relatedEntityType: "asset",
        performedBy: 1, // Default to user 1
      });
      
      res.status(201).json(newAsset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create asset", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Program endpoints
  app.get("/api/programs", async (req, res) => {
    try {
      const programs = await storage.getAllPrograms();
      res.json(programs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch programs", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/sites/:siteId/programs", async (req, res) => {
    try {
      const siteId = parseInt(req.params.siteId);
      const programs = await storage.getProgramsBySite(siteId);
      res.json(programs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch programs for site", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/programs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const program = await storage.getProgram(id);
      
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }
      
      res.json(program);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch program", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/programs", async (req, res) => {
    try {
      const validatedData = insertProgramSchema.parse(req.body);
      const newProgram = await storage.createProgram(validatedData);
      
      // Create activity log
      await storage.createActivity({
        type: "program_creation",
        description: `Added new program: ${newProgram.name}`,
        relatedEntityId: newProgram.id,
        relatedEntityType: "program",
        performedBy: 1, // Default to user 1
      });
      
      res.status(201).json(newProgram);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create program", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Activity endpoints
  app.get("/api/activities", async (req, res) => {
    try {
      const activities = await storage.getAllActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const validatedData = insertActivitySchema.parse(req.body);
      const newActivity = await storage.createActivity(validatedData);
      res.status(201).json(newActivity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create activity", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  
  // Upload images endpoint (for sites, assets, etc.)
  app.post("/api/upload", (req, res) => {
    // In a real implementation, this would handle file uploads
    // For this MVP, we'll just simulate successful upload of image URLs
    res.status(201).json({ 
      message: "Upload successful", 
      urls: [`https://example.com/images/uploaded-${Date.now()}.jpg`] 
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
