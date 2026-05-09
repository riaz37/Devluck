"use client";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock, Download, DownloadCloud, ExternalLink, FilePlus, FileUp, Link, Link2, Loader2, UploadCloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link as LinkIcon, Trash2, Upload, FileText } from "lucide-react";
import {
  FileImage,
  FileCode,
  File,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";


/* ================= TYPES ================= */
type FileItem = {
  id?: string;
  name: string;
  type?: string;
  url: string;
  file?: File;
  size?: number;
};

type LinkItem = {
  id?: string;
  title: string;
  url: string;
};

type ProgressHistoryItem = {
  id: string;
  report: string;
  links?: { title: string; url: string }[] | null;
  files?: { fileName: string; fileUrl: string; mimeType?: string | null }[] | null;
  createdAt: string;
};

interface ContractReportCardProps {
  onSubmit: (payload: { report: string; links: { title: string; url: string }[]; files: File[] }) => Promise<void>;
  submitting?: boolean;
  history?: ProgressHistoryItem[];
  maxFileSize?: number; // MB
  allowedFileTypes?: string[];
}

export default function ContractReportCard({ 
  onSubmit, 
  submitting = false, 
  history = [],
  maxFileSize = 10,
  allowedFileTypes = [
    "image/*",  // All images
    "application/pdf",  // PDF documents
    "application/zip",  // Zip archives
    "application/x-rar-compressed", // RAR archives
    "application/x-tar",  // TAR archives
    "application/javascript", // JavaScript files
    "application/typescript", // TypeScript files
    "text/plain", // Plain text (for code)
    "text/x-python", // Python files
    "text/x-java-source", // Java files
    "text/x-c++src", // C++ files
    "text/x-csrc", // C files
    "text/x-go", // Go files
    "text/x-ruby", // Ruby files 
    "*", // (BEST OPTION if you want EVERYTHING)
    "text/x-php" // PHP files
  ]
}: ContractReportCardProps) {
  const [progressNote, setProgressNote] = useState("");
  const [links, setLinks] = useState<LinkItem[]>([]);
  
  // Link Dialog State
  const [openLinkModal, setOpenLinkModal] = useState(false);
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkErrors, setLinkErrors] = useState<{ title?: string; url?: string }>({});
  
  const [files, setFiles] = useState<FileItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<ProgressHistoryItem | null>(null);
  // Validation Functions
  const validateUrl = (url: string): boolean => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const validateLinkTitle = (title: string): boolean => title.trim().length >= 3 && title.trim().length <= 100;

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!file) return { valid: false, error: "No file selected" };

    // size check
    if (file.size > maxFileSize * 1024 * 1024) {
      return { valid: false, error: `File too large. Max ${maxFileSize}MB` };
    }

    const fileName = file.name.toLowerCase();
    const mime = file.type?.toLowerCase() || "";

    const isAllowed = allowedFileTypes.some((type) => {
      if (type === "*") return true;

      // 1. EXTENSIONS (.js, .ts, .cpp etc) ← MOST IMPORTANT FIX
      if (type.startsWith(".")) {
        return fileName.endsWith(type);
      }

      // 2. WILDCARD MIME (image/*, text/*)
      if (type.endsWith("/*")) {
        const base = type.replace("/*", "/");
        return mime.startsWith(base);
      }

      // 3. NORMAL MIME TYPES
      return mime === type;
    });

    if (!isAllowed) {
      return {
        valid: false,
        error: "File type not allowed",
      };
    }

    return { valid: true };
  };

  const validateLinksForm = useCallback(() => {
    const errors: { title?: string; url?: string } = {};
    
    if (!linkName.trim()) {
      errors.title = "Title is required";
    } else if (!validateLinkTitle(linkName)) {
      errors.title = "Title must be 3-100 characters";
    }
    
    if (!linkUrl.trim()) {
      errors.url = "URL is required";
    } else if (!validateUrl(linkUrl)) {
      errors.url = "Enter a valid URL (https://...)";
    }
    
    setLinkErrors(errors);
    return Object.keys(errors).length === 0;
  }, [linkName, linkUrl]);

  const handleUpload = (file?: File | null) => {
    if (!file) return;
    
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid file");
      return;
    }

    const newFile: FileItem = {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
      file,
      size: file.size,
    };
    setFiles((prev) => [newFile, ...prev]);
    toast.success(`"${file.name}" added successfully`);
  };

  const addLink = () => {
    if (!validateLinksForm()) {
      toast.error("Please fix the errors above");
      return;
    }

    const newLink: LinkItem = {
      id: crypto.randomUUID(),
      title: linkName.trim(),
      url: linkUrl.trim().startsWith('http') ? linkUrl.trim() : `https://${linkUrl.trim()}`,
    };

    setLinks((prev) => [newLink, ...prev]);
    setLinkName("");
    setLinkUrl("");
    setLinkErrors({});
    setOpenLinkModal(false);
    toast.success("Link added successfully");
  };

  const removeLink = (id: string) => {
    setLinks((prev) => prev.filter((item) => item.id !== id));
    toast.success("Link removed");
  };

  const removeFile = (id?: string) => {
    if (!id) return;

    setFiles((prev) => prev.filter((item) => item.id !== id));
    toast.success("File removed");
  };

  const submitUpdate = async () => {
    if (!progressNote.trim()) {
      toast.error("Progress report is required");
      return;
    }

    if (progressNote.trim().length < 10) {
      toast.error("Report must be at least 10 characters");
      return;
    }

    try {
      await onSubmit({
        report: progressNote.trim(),
        links: links.map((link) => ({ title: link.title, url: link.url })),
        files: files.map((file) => file.file!).filter(Boolean) as File[],
      });
      setProgressNote("");
      setLinks([]);
      setFiles([]);
      toast.success("Progress update sent successfully!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to send progress update");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileMeta = (file: FileItem) => {
    const name = file.name.toLowerCase();
    const type = file.type?.toLowerCase() || "";

    /* ================= IMAGES ================= */
    if (type.startsWith("image/")) {
      return {
        label: "Image",
        icon: FileImage,
        iconClass: "text-blue-500",
      };
    }

    /* ================= PDF ================= */
    if (type === "application/pdf") {
      return {
        label: "PDF",
        icon: FileText,
        iconClass: "text-red-500",
      };
    }

    /* ================= ARCHIVES ================= */
    if (
      name.endsWith(".zip") ||
      name.endsWith(".rar") ||
      name.endsWith(".7z") ||
      name.endsWith(".tar") ||
      name.endsWith(".gz")
    ) {
      return {
        label: "Archive",
        icon: DownloadCloud,
        iconClass: "text-purple-500",
      };
    }

    /* ================= CODE FILES ================= */
    const codeExtensions = [
      // Web
      ".js", ".jsx", ".ts", ".tsx", ".html", ".css", ".scss",

      // Backend
      ".py", ".java", ".go", ".rb", ".php", ".cs",

      // Systems
      ".c", ".cpp", ".h", ".rs",

      // Config / Data
      ".json", ".yaml", ".yml", ".toml", ".env",

      // Scripts
      ".sh", ".bash",

      // Docs (code-like)
      ".md", ".txt"
    ];

    if (codeExtensions.some(ext => name.endsWith(ext))) {
      return {
        label: "Code",
        icon: FileCode,
        iconClass: "text-yellow-500",
      };
    }

    /* ================= TEXT FALLBACK ================= */
    if (type.startsWith("text/")) {
      return {
        label: "Text",
        icon: FileText,
        iconClass: "text-slate-500",
      };
    }

    /* ================= DEFAULT ================= */
    return {
      label: "File",
      icon: File,
      iconClass: "text-muted-foreground",
    };
  };

  return (
    <Card className="rounded-2xl shadow-sm border flex flex-col h-full">
      <CardHeader className="pb-5">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-start justify-between gap-4"
        >
          {/* LEFT */}
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold tracking-tight">
              Contract Activity
            </CardTitle>

            <CardDescription className="text-sm text-muted-foreground leading-relaxed">
              Track progress updates, shared links, and uploaded files in real time
            </CardDescription>
          </div>

          {/* RIGHT */}
          <Badge
            variant="secondary"
            className="text-xs px-2.5 py-1 rounded-full font-medium shrink-0"
          >
            {links.length + files.length} items
          </Badge>
        </motion.div>
      </CardHeader>

      <CardContent className="space-y-6 flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          {/* LABEL */}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground">
              Progress update <span className="text-destructive">*</span>
            </Label>

            <span className="text-xs text-muted-foreground">
              {progressNote.length}/500
            </span>
          </div>

          {/* TEXTAREA */}
          <Textarea
            placeholder="Write what has been completed, blocked, or changed..."
            value={progressNote}
            onChange={(e) => setProgressNote(e.target.value)}
            rows={4}
          />

          {/* VALIDATION TEXT */}
          <div className="flex items-center justify-between">
            <p
              className={`text-xs transition-colors ${
                progressNote.length < 10
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {progressNote.length < 10
                ? "Minimum 10 characters required"
                : "Looking good"}
            </p>

            <span className="text-xs text-muted-foreground">
              Min: 10 chars
            </span>
          </div>
        </motion.div>

        {/* Links Section */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-3"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <LinkIcon className="w-4 h-4 text-muted-foreground" />
            Shared links
            <span className="text-muted-foreground">({links.length})</span>
          </div>

          <Dialog open={openLinkModal} onOpenChange={setOpenLinkModal}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-lg">
                + Add link
              </Button>
            </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-base">Add external link</DialogTitle>
                  <DialogDescription>
                    Attach resources like GitHub, Figma, Notion, or documentation.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  
                  {/* TITLE */}
                  <div className="space-y-2">
                    <Label htmlFor="link-title">Title</Label>
                    <Input
                      id="link-title"
                      placeholder="e.g. Figma design"
                      value={linkName}
                      onChange={(e) => {
                        setLinkName(e.target.value);
                        if (linkErrors.title) setLinkErrors(prev => ({ ...prev, title: undefined }));
                      }}
                      className={linkErrors.title ? "border-destructive" : ""}
                    />
                    {linkErrors.title && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {linkErrors.title}
                      </p>
                    )}
                  </div>

                  {/* URL */}
                  <div className="space-y-2">
                    <Label htmlFor="link-url">URL</Label>
                    <Input
                      id="link-url"
                      placeholder="https://..."
                      value={linkUrl}
                      onChange={(e) => {
                        setLinkUrl(e.target.value);
                        if (linkErrors.url) setLinkErrors(prev => ({ ...prev, url: undefined }));
                      }}
                      className={linkErrors.url ? "border-destructive" : ""}
                    />
                    {linkErrors.url && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {linkErrors.url}
                      </p>
                    )}
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setOpenLinkModal(false);
                      setLinkErrors({});
                    }}
                  >
                    Cancel
                  </Button>

                  <Button onClick={addLink} disabled={submitting}>
                    Add link
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <ScrollArea className="h-28 pr-2">
            <div className="space-y-2">
              {links.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-xl border bg-muted/20 py-8 text-center space-y-1"
                >
                  <p className="text-sm font-medium text-muted-foreground">
                    No links added yet
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Add GitHub, Figma, Drive, or documentation links
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {links.map((l) => (
                    <motion.div
                      key={l.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="group flex items-start justify-between gap-3 rounded-xl border bg-background px-3 py-3 hover:bg-muted/40 hover:border-primary/20 transition-all"
                    >
                      {/* LEFT */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-sm font-medium truncate">
                          {l.title}
                        </p>

                        <a
                          href={l.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary transition-colors line-clamp-1 break-all"
                        >
                          {l.url}
                        </a>
                      </div>

                      {/* ACTION */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeLink(l.id!)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </ScrollArea>
        </motion.div>

        {/* Files Section */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Files
              <span className="text-muted-foreground">({files.length})</span>
            </div>

            <Badge variant="secondary" className="text-xs rounded-full">
              Max {maxFileSize}MB
            </Badge>
          </div>

          {/* DROPZONE */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
            className={`
              relative cursor-pointer rounded-2xl border-2 border-dashed
              bg-muted/20 p-8 text-center transition-all duration-200
              ${
                dragActive
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md"
                  : "border-muted hover:border-primary/40 hover:bg-muted/30"
              }
            `}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);

              const droppedFiles = Array.from(e.dataTransfer.files);
              droppedFiles.forEach(handleUpload);
            }}
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <div className="space-y-3 relative z-10">

              {/* ICON */}
              <motion.div
                animate={{ y: dragActive ? -3 : 0 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
              {dragActive ? (
                <FileUp className="w-10 h-10 mx-auto text-primary" />
              ) : (
                <File className="w-10 h-10 mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
              )}
              </motion.div>

              {/* TITLE */}
              <p className="text-base font-semibold">
                {dragActive ? "Drop files to upload" : "Upload files"}
              </p>

              {/* DESCRIPTION */}
              <p className="text-sm text-muted-foreground">
                Drag & drop or click to upload PDFs, images, or documents
              </p>

              {/* LIMIT */}
              <p className="text-xs text-muted-foreground">
                Maximum file size: {maxFileSize}MB
              </p>

              {/* INPUT */}
              <Input
                id="fileInput"
                type="file"
                className="hidden"
                multiple
                accept={allowedFileTypes.join(",")}
                onChange={(e) => {
                  const droppedFiles = Array.from(e.target.files || []);
                  droppedFiles.forEach(handleUpload);
                }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Files List */}
        <ScrollArea className="h-28 pr-2">
          <div className="space-y-2">

            {/* EMPTY STATE */}
            {files.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border bg-muted/20 py-8 text-center space-y-1"
              >
                <p className="text-sm font-medium text-muted-foreground">
                  No files uploaded yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Upload PDFs, images, or documents to attach them to this report
                </p>
              </motion.div>

            ) : (
              <AnimatePresence>
                {files.map((f) => {
                  const meta = getFileMeta(f);
                  const Icon = meta.icon;

                  return (
                    <motion.div
                      key={f.id}
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="
                        group flex items-center justify-between gap-3
                        rounded-xl border bg-background px-3 py-3
                        hover:bg-muted/40 hover:border-primary/20
                        transition-all
                      "
                    >

                      {/* LEFT SIDE */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">

                        {/* FILE ICON (more grounded, no “UI noise”) */}
                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Icon className={`w-5 h-5 ${meta.iconClass}`} />
                        </div>

                        {/* FILE INFO */}
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <p className="text-sm font-medium truncate">
                            {f.name.length > 35 ? f.name.slice(0, 35) + "..." : f.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {meta.label} • {formatFileSize(f.size!)}
                          </p>
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">

                        {/* VIEW */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => window.open(f.url, "_blank")}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>

                        {/* DELETE */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeFile(f.id!)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>

                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}

          </div>
        </ScrollArea>

        {/* Submit Button */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Button
            disabled={
              submitting ||
              !progressNote.trim() ||
              progressNote.trim().length < 10
            }
            onClick={submitUpdate}
            className="
              w-full h-12 text-sm font-medium rounded-xl
              transition-all duration-200
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending update...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Send Progress Update
                <FileText className="w-4 h-4 opacity-80" />
              </div>
            )}
          </Button>
        </motion.div>

      {/* History Section - 100% WORKING */}
      {history.length > 0 && (
        <>
          <div className="space-y-4 pt-6 border-t">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent updates ({history.length})
              </h3>
              {/* ✅ ALWAYS RENDER DIALOG - Control with condition INSIDE */}
                  <Dialog open={openHistoryDialog} onOpenChange={setOpenHistoryDialog}>
                    <DialogContent className="w-[calc(100%-24px)] max-w-[640px] h-[90vh] flex flex-col p-0 overflow-hidden">

                      {selectedHistory && (
                        <div className="flex flex-col h-full min-h-0">

                          {/* HEADER */}
                          <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/10">

                            <div className="space-y-2 w-full min-w-0">

                              {/* TITLE */}
                              <DialogTitle className="text-base font-semibold flex items-center gap-2">
                                <Clock className="w-4 h-4 shrink-0 text-muted-foreground" />
                                Progress Update
                              </DialogTitle>

                              {/* META ROW */}
                              <div className="flex items-center justify-between gap-2 flex-wrap">

                                <DialogDescription className="text-xs text-muted-foreground">
                                  {new Date(selectedHistory.createdAt).toLocaleString()}
                                </DialogDescription>

                                <Badge
                                  variant="secondary"
                                  className="text-xs px-2 py-0.5 rounded-md"
                                >
                                  {(selectedHistory.links?.length || 0) +
                                    (selectedHistory.files?.length || 0)}{" "}
                                  items
                                </Badge>

                              </div>

                            </div>

                          </DialogHeader>

                          {/* BODY */}
                           <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

                              {/* REPORT */}
                              <div className="space-y-3">

                                {/* HEADER */}
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                  <FileText className="w-4 h-4" />
                                  Report
                                </h4>

                                {/* CONTENT */}
                                {selectedHistory.report?.trim() ? (
                                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                                    {selectedHistory.report}
                                  </p>
                                ) : (
                                  <div className="rounded-xl border bg-muted/20 p-4 text-center">
                                    <p className="text-sm text-muted-foreground">
                                      No report provided
                                    </p>
                                  </div>
                                )}

                              </div>

                              {/* LINKS */}
                              {selectedHistory.links?.length ? (
                                <div className="space-y-3">

                                  {/* HEADER */}
                                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                      <Link2 className="w-4 h-4" />
                                      Links
                                    </span>

                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                                      {selectedHistory.links.length}
                                    </span>
                                  </h4>

                                  {/* LIST */}
                                  <div className="space-y-2 max-h-48 overflow-y-auto px-1.5">
                                    {selectedHistory.links.map((link, i) => (
                                      <a
                                        key={i}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="
                                          group relative flex items-center gap-3
                                          p-3 rounded-xl border bg-card
                                          hover:bg-muted/40 hover:shadow-sm
                                          transition-all duration-200
                                        "
                                      >

                                        {/* ICON */}
                                        <div className="
                                          h-9 w-9 rounded-lg bg-muted
                                          flex items-center justify-center
                                          shrink-0
                                        ">
                                          <Link className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>

                                        {/* CONTENT */}
                                        <div className="min-w-0 flex-1">
                                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                            {link.title}
                                          </p>

                                          <p className="text-xs text-muted-foreground truncate">
                                            {link.url.replace(/^https?:\/\//, "")}
                                          </p>
                                        </div>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              ) : null}

                            {/* FILES - NOW FULLY WORKING */}
                            {selectedHistory.files?.length ? (
                              <div className="space-y-3">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                                  <span className="flex items-center gap-1.5">
                                    <FileText className="w-4 h-4" />
                                    Files
                                  </span>

                                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                                    {selectedHistory.files.length}
                                  </span>
                                </h4>
                                
                                <div className="space-y-2 max-h-48 overflow-y-auto px-1.5">
                                  {selectedHistory.files.map((file, i) => {
                                    const meta = getFileMeta({
                                      name: file.fileName,
                                      type: file.mimeType || "",
                                      size: 1024 * 1024,
                                    } as any);

                                    const Icon = meta.icon;

                                    return (
                                      <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="
                                          group relative flex items-center justify-between
                                          p-3 rounded-xl border bg-card
                                          hover:bg-muted/40 hover:shadow-sm
                                          transition-all duration-200
                                        "
                                      >
                                        {/* LEFT */}
                                        <div className="flex items-center gap-3 min-w-0 flex-1">

                                          {/* ICON BADGE */}
                                          <div className="
                                            h-10 w-10 rounded-lg bg-muted
                                            flex items-center justify-center
                                            shrink-0
                                          ">
                                            <Icon className={`w-5 h-5 ${meta.iconClass}`} />
                                          </div>

                                          {/* TEXT */}
                                          <div className="min-w-0 flex flex-col">
                                            <p className="text-sm font-medium truncate max-w-[220px]">
                                              {file.fileName}
                                            </p>

                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                              <span>{meta.label}</span>
                                              <span>•</span>
                                              <span>{file.mimeType || "Unknown type"}</span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* ACTIONS */}
                                        <div className="
                                          flex items-center gap-1
                                          opacity-0 group-hover:opacity-100
                                          transition-all duration-200
                                        ">
                                          {/* VIEW */}
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  e.preventDefault();

                                                  const lowerName = file.fileName.toLowerCase();
                                                  const lowerUrl = file.fileUrl.toLowerCase();
                                                  const isPdf =
                                                    file.mimeType === "application/pdf" ||
                                                    lowerName.endsWith(".pdf") ||
                                                    lowerUrl.includes(".pdf");

                                                  if (isPdf) {
                                                    window.open(
                                                      `https://docs.google.com/viewer?url=${encodeURIComponent(file.fileUrl)}&embedded=true`,
                                                      "_blank",
                                                      "noopener,noreferrer,width=800,height=600"
                                                    );
                                                  } else {
                                                    window.open(file.fileUrl, "_blank", "noopener,noreferrer");
                                                  }
                                                }}
                                              >
                                                <LinkIcon className="w-4 h-4" />
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>View</TooltipContent>
                                          </Tooltip>

                                          {/* DOWNLOAD */}
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                onClick={async (e) => {
                                                  e.stopPropagation();
                                                  e.preventDefault();

                                                  try {
                                                    const response = await fetch(file.fileUrl);
                                                    if (!response.ok) throw new Error();

                                                    const blob = await response.blob();
                                                    const url = URL.createObjectURL(blob);

                                                    const a = document.createElement("a");
                                                    a.href = url;
                                                    a.download = file.fileName;
                                                    document.body.appendChild(a);
                                                    a.click();
                                                    document.body.removeChild(a);

                                                    URL.revokeObjectURL(url);
                                                    toast.success(`Downloaded ${file.fileName}`);
                                                  } catch {
                                                    window.open(file.fileUrl, "_blank");
                                                  }
                                                }}
                                              >
                                                <Download className="w-4 h-4" />
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Download</TooltipContent>
                                          </Tooltip>
                                        </div>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : null}
               
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
            </div>

            {/* Recent Updates Preview */}
              <ScrollArea className="h-28 pr-2">
                <div className="space-y-2">

                  {history.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedHistory(item);
                        setOpenHistoryDialog(true);
                      }}
                      className="group cursor-pointer rounded-lg border bg-background p-3 transition-colors hover:bg-muted/50 hover:border-primary/40"
                    >
                      
                      {/* TOP ROW */}
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>

                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {item.links?.length ? (
                            <span className="flex items-center gap-1">
                              <Link2 className="w-3 h-3" />
                              {item.links.length}
                            </span>
                          ) : null}

                          {item.files?.length ? (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {item.files.length}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* REPORT */}
                      <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                        {item.report}
                      </p>

                    </div>
                  ))}

                </div>
              </ScrollArea>
          </div>
        </>
      )}
      </CardContent>
    </Card>
  );
}