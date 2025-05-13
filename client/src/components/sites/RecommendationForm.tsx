import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Site } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface RecommendationFormProps {
  site: Site;
  onSuccess: () => void;
  onCancel: () => void;
}

const RecommendationForm: React.FC<RecommendationFormProps> = ({
  site,
  onSuccess,
  onCancel,
}) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    category: "Infrastructure",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create a recommendation activity
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "recommendation",
          description: `${formData.title}: ${formData.description}`,
          relatedEntityId: site.id,
          relatedEntityType: "site",
          performedBy: 1, // Default to user 1 for now
          metadata: {
            priority: formData.priority,
            category: formData.category,
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit recommendation");
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/sites/${site.id}/activities`] });
      
      toast({
        title: "Recommendation Added",
        description: "Your recommendation has been successfully added.",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error submitting recommendation:", error);
      toast({
        title: "Error",
        description: "Failed to add recommendation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Enter recommendation title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          placeholder="Provide detailed recommendation"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => handleSelectChange("priority", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleSelectChange("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Infrastructure">Infrastructure</SelectItem>
              <SelectItem value="Equipment">Equipment</SelectItem>
              <SelectItem value="Staffing">Staffing</SelectItem>
              <SelectItem value="Programs">Programs</SelectItem>
              <SelectItem value="Safety">Safety</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Recommendation"}
        </Button>
      </div>
    </form>
  );
};

export default RecommendationForm;
