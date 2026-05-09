"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContractDescription } from "@/types/contract-s";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils";
import { Activity, AlertTriangle, CheckCircle2 } from "lucide-react";

type ContractDescriptionProps = {
  contract: ContractDescription;
};

export function ContractDescriptionComponent({
  contract,
}: ContractDescriptionProps) {
  const companyLocation =
    contract.company?.location || contract.company?.address || "Not provided";
  const companyPhone =
    contract.company?.phone || contract.company?.phoneNumber || "Not provided";

  const renderText = (value?: string | number, max = 30) => {
    if (!value)
      return <span className="text-sm text-muted-foreground">Not provided</span>;

    if (typeof value === "string") {
      const text =
        value.length > max ? value.slice(0, max) + "..." : value;

      return <span className="text-muted-foreground">{text}</span>;
    }

    return <span className="text-muted-foreground" >{value}</span>;
  };

  const getStatusStyles = () => {
    switch (contract.status) {
      case "Running":
        return "bg-green-100 text-green-600 border-green-200";
      case "Completed":
        return "bg-blue-100 text-blue-600 border-blue-200";
      case "Disputed":
        return "bg-yellow-100 text-yellow-600 border-yellow-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Running":
        return <Activity className="h-3 w-3" />;
      case "Completed":
        return <CheckCircle2 className="h-3 w-3" />;
      case "Disputed":
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ================= CONTRACT INFO ================= */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Contract Information</CardTitle>
          <CardDescription>
            Overview of the contract details and terms
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-[var(--color-text-primary)]">

          <div className="grid gap-3 text-sm">

            <div className="flex justify-between">
              <span className="font-medium">Contract Title</span>
              {renderText(contract.contractTitle, 50)}
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Contract Number</span>
              {renderText(contract.inContractNumber, 50)}
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Status</span>

              <Badge
                variant="outline"
                className={cn(
                  "flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide",
                  getStatusStyles()
                )}
              >
                {getStatusIcon(contract.status)}
                {contract.status || "N/A"}
              </Badge>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Created</span>
              {contract.createdDate ? (
                <span className="text-muted-foreground">
                  {new Date(contract.createdDate).toLocaleDateString()}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Not provided
                </span>
              )}
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Duration</span>
              <span className="text-muted-foreground">
                {contract.duration} month{contract.duration > 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Salary</span>
              {contract.salary ? (
                <span className="text-muted-foreground">
                  {contract.currency || "USD"}{" "}
                  {contract.salary.toLocaleString()}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Not provided
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Work Progress</span>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {contract.workProgress ?? 0}%
                </span>

                <Progress value={contract.workProgress ?? 0} className="w-24 h-2" />
              </div>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Note</span>
              {renderText(contract.note, 300)}
            </div>

          </div>
        </CardContent>
      </Card>

      {/* ================= COMPANY INFO ================= */}
     {contract.company && (
        <Card>
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-3">

              {/* AVATAR (ShadCN STYLE) */}
              <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm bg-primary/10 shrink-0">
                <AvatarImage
                  src={contract.company.logo}
                  alt={contract.company.name}
                />

                <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                  {contract.company.name?.charAt(0)?.toUpperCase() || "C"}
                </AvatarFallback>
              </Avatar>

              {/* NAME */}
              <div>
                <CardTitle className="text-base font-semibold leading-tight">
                  {contract.company.name}
                </CardTitle>
              </div>

            </div>
          </CardHeader>

          <CardContent className="space-y-4 text-sm">

            {/* DESCRIPTION */}
            {contract.company.description && (
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                {contract.company.description}
              </p>
            )}

            <div className="grid gap-3">

              {/* LOCATION */}
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Location</span>
                <span className="text-foreground">
                  {companyLocation}
                </span>
              </div>

              {/* PHONE */}
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Phone</span>
                <span className="text-foreground">
                  {companyPhone}
                </span>
              </div>

            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}