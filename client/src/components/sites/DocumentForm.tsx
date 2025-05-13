import React, { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Site } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { FileText, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentFormProps {
  site: Site;
  onSuccess: () => void;
  onCancel: () => void;
}

const DocumentForm: React.FC<DocumentFormProps> = ({ site, onSuccess, onCancel }) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!files || files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one document to upload.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      setUploadProgress(30);

      const uploadResponse = await fetch(`/api/sites/${site.id}/documents`, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("Upload error response:", errorText);
        throw new Error("Failed to upload documents");
      }

      setUploadProgress(70);
      const result = await uploadResponse.json();

      if (!result || !result.urls) {
        throw new Error("Invalid response format from server");
      }

      setUploadProgress(100);
      queryClient.invalidateQueries({ queryKey: [`/api/sites/${site.id}`] });
      
      toast({
        title: "Success",
        description: "Documents uploaded successfully",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error uploading documents:", error);
      toast({
        title: "Error",
        description: "Failed to upload documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Validate file types
      const validFiles = Array.from(e.target.files).every(file => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        return ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv', 'ppt', 'pptx'].includes(ext || '');
      });

      if (!validFiles) {
        toast({
          title: "Invalid file type",
          description: "Please upload only document files (PDF, Word, Excel, PowerPoint, Text, CSV)",
          variant: "destructive"
        });
        e.target.value = '';
        return;
      }

      setFiles(e.target.files);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="documents">Upload Documents</Label>
          <div className="mt-2">
            <Input 
              id="documents" 
              type="file" 
              onChange={handleFileChange} 
              multiple 
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.ppt,.pptx"
              disabled={uploading}
              ref={fileInputRef}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Supported formats: PDF, Word, Excel, PowerPoint, Text, CSV
            </p>
          </div>
        </div>

        {files && files.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Selected Documents:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {Array.from(files).map((file, index) => (
                <Card key={index} className="p-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-primary-500" />
                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({(file.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {uploading && (
          <div className="mt-4">
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin text-primary-500" />
              <span className="text-sm">Uploading documents... {uploadProgress}%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={uploading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!files || files.length === 0 || uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Upload Documents"
          )}
        </Button>
      </div>
    </form>
  );
};

export default DocumentForm;
