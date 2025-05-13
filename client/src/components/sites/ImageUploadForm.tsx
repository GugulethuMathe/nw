import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type Site } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { X, Upload, Image } from "lucide-react";

interface ImageUploadFormProps {
  site: Site;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ImageUploadForm({ site, onSuccess, onCancel }: ImageUploadFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
      
      // Generate previews
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      setIsUploading(true);
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      try {
        const response = await fetch(`/api/sites/${site.id}/images`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server response:", errorText);
          throw new Error(`Failed to upload images: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return response.json();
        } else {
          const text = await response.text();
          console.error("Unexpected response format:", text);
          throw new Error("Server returned non-JSON response");
        }
      } catch (error) {
        console.error("Upload error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate site detail query to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/sites/${site.id}`] });
      
      toast({
        title: "Images uploaded successfully",
        description: `${selectedFiles.length} image(s) have been uploaded for ${site.name}.`,
      });
      
      // Reset form
      setSelectedFiles([]);
      setPreviews([]);
      
      // Call the onSuccess prop (which should handle closing the dialog)
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to upload images: ${error.message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one image to upload.",
        variant: "destructive",
      });
      return;
    }
    uploadMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="images">Select Images</Label>
          <div className="flex items-center gap-2">
            <Input
              id="images"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" /> Browse Files
            </Button>
            <span className="text-sm text-neutral-500">
              {selectedFiles.length > 0 
                ? `${selectedFiles.length} file(s) selected` 
                : "No files selected"}
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            Supported formats: JPG, PNG, WEBP, GIF. Maximum file size: 5MB.
          </p>
        </div>

        {/* Preview selected images */}
        {previews.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Images</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {previews.map((preview, index) => (
                <Card key={index} className="relative overflow-hidden aspect-square">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {selectedFiles.length === 0 && (
          <div className="border-2 border-dashed border-neutral-200 rounded-lg p-8 text-center">
            <Image className="h-12 w-12 mx-auto text-neutral-300" />
            <h3 className="mt-2 text-sm font-medium text-neutral-700">No images selected</h3>
            <p className="mt-1 text-xs text-neutral-500">
              Click the Browse Files button to select images to upload
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => fileInputRef.current?.click()}
            >
              Select Images
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isUploading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={selectedFiles.length === 0 || isUploading}
          className="flex items-center gap-2"
        >
          {isUploading ? (
            <>
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" /> Upload Images
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
